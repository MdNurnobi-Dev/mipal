// Cloudflare Pages Function: /api/posts
// Social Community Feed, Comments, and Likes stored in Cloudflare D1

interface Env {
  DB?: any;
}

const jsonHeaders = {
  "content-type": "application/json;charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

// GET /api/posts?userId=...
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: "D1 database missing" }), { status: 503, headers: jsonHeaders });

  const url = new URL(request.url);
  const currentUserId = url.searchParams.get("userId") || "";

  try {
    const postsResult = await env.DB.prepare("SELECT * FROM posts ORDER BY created_at DESC LIMIT 50").all();
    const postsList = postsResult.results || [];

    if (postsList.length === 0) {
      return new Response(JSON.stringify({ success: true, posts: [] }), { status: 200, headers: jsonHeaders });
    }

    const postIds = postsList.map((p: any) => `'${p.id}'`).join(",");

    // Fetch all comments for these posts
    const commentsResult = await env.DB.prepare(`SELECT * FROM post_comments WHERE post_id IN (${postIds}) ORDER BY created_at ASC`).all();
    const allComments = commentsResult.results || [];

    // Fetch user liked post IDs
    let userLikedPostIds = new Set<string>();
    if (currentUserId) {
      const likesResult = await env.DB.prepare(`SELECT post_id FROM post_likes WHERE user_id = ?`).bind(currentUserId).all();
      (likesResult.results || []).forEach((r: any) => userLikedPostIds.add(r.post_id));
    }

    const posts = postsList.map((p: any) => {
      const commentsForPost = allComments
        .filter((c: any) => c.post_id === p.id)
        .map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          userName: c.user_name,
          userAvatar: c.user_avatar,
          content: c.content,
          createdAt: c.created_at,
        }));

      return {
        id: p.id,
        userId: p.user_id,
        userName: p.user_name,
        userAvatar: p.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.user_name)}`,
        content: p.content,
        likes: Number(p.likes || 0),
        comments: commentsForPost.length || Number(p.comments || 0),
        shares: Number(p.shares || 0),
        createdAt: p.created_at,
        status: p.status || 'approved',
        isLiked: userLikedPostIds.has(p.id),
        commentsList: commentsForPost,
      };
    });

    return new Response(JSON.stringify({ success: true, posts }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch posts" }), { status: 500, headers: jsonHeaders });
  }
}

// POST /api/posts (Create Post, Like Post, or Add Comment)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: "D1 database missing" }), { status: 503, headers: jsonHeaders });

  try {
    const body = await request.json() as any;
    const action = body.action || 'create_post';

    if (action === 'create_post') {
      const { userId, userName, userAvatar, content } = body;
      if (!userId || !content?.trim()) {
        return new Response(JSON.stringify({ error: "Content and user ID required" }), { status: 400, headers: jsonHeaders });
      }

      const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const createdAt = new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO posts (id, user_id, user_name, user_avatar, content, likes, comments, shares, created_at, status)
        VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, 'approved')
      `).bind(postId, userId, userName || 'Member', userAvatar || null, content.trim(), createdAt).run();

      const created = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(postId).first();
      return new Response(JSON.stringify({
        success: true,
        post: {
          ...created,
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          commentsList: []
        }
      }), { status: 201, headers: jsonHeaders });
    }

    if (action === 'toggle_like') {
      const { postId, userId } = body;
      if (!postId || !userId) return new Response(JSON.stringify({ error: "postId and userId required" }), { status: 400, headers: jsonHeaders });

      const existing = await env.DB.prepare("SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?").bind(postId, userId).first();

      if (existing) {
        // Unlike
        await env.DB.batch([
          env.DB.prepare("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?").bind(postId, userId),
          env.DB.prepare("UPDATE posts SET likes = MAX(0, likes - 1) WHERE id = ?").bind(postId)
        ]);
        return new Response(JSON.stringify({ success: true, isLiked: false }), { status: 200, headers: jsonHeaders });
      } else {
        // Like
        await env.DB.batch([
          env.DB.prepare("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)").bind(postId, userId),
          env.DB.prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?").bind(postId)
        ]);
        return new Response(JSON.stringify({ success: true, isLiked: true }), { status: 200, headers: jsonHeaders });
      }
    }

    if (action === 'add_comment') {
      const { postId, userId, userName, userAvatar, content } = body;
      if (!postId || !userId || !content?.trim()) {
        return new Response(JSON.stringify({ error: "postId, userId, and content required" }), { status: 400, headers: jsonHeaders });
      }

      const commentId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const createdAt = new Date().toISOString();

      await env.DB.batch([
        env.DB.prepare(`
          INSERT INTO post_comments (id, post_id, user_id, user_name, user_avatar, content, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(commentId, postId, userId, userName || 'Member', userAvatar || null, content.trim(), createdAt),
        env.DB.prepare("UPDATE posts SET comments = comments + 1 WHERE id = ?").bind(postId)
      ]);

      return new Response(JSON.stringify({
        success: true,
        comment: {
          id: commentId,
          postId,
          userId,
          userName: userName || 'Member',
          userAvatar,
          content: content.trim(),
          createdAt
        }
      }), { status: 201, headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to execute post action" }), { status: 500, headers: jsonHeaders });
  }
}
