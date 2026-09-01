// Cloudflare Pages Function: /api/tasks
// CRUD operations for microjob tasks & quizzes in Cloudflare D1

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

function formatTask(row: any) {
  if (!row) return null;
  let quizData = undefined;
  let actionUrls = undefined;

  try {
    if (row.quiz_data_json) quizData = JSON.parse(row.quiz_data_json);
    if (row.action_urls_json) actionUrls = JSON.parse(row.action_urls_json);
  } catch (_) {}

  return {
    id: row.id,
    title: row.title,
    type: row.type,
    reward: Number(row.reward || 0),
    limit: row.task_limit || 'Daily 1 time',
    status: row.status || 'Active',
    description: row.description || '',
    actionUrl: row.action_url || '',
    actionUrls: actionUrls,
    duration: Number(row.duration || 30),
    quizData: quizData,
  };
}

// GET /api/tasks
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 binding missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const result = await env.DB.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
    const tasks = (result.results || []).map(formatTask);
    return new Response(JSON.stringify({ success: true, tasks }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch tasks" }), { status: 500, headers: jsonHeaders });
  }
}

// POST /api/tasks (Create Task)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 binding missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const body = await request.json() as any;
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const title = body.title?.trim();
    if (!title) {
      return new Response(JSON.stringify({ error: "Task title is required" }), { status: 400, headers: jsonHeaders });
    }

    await env.DB.prepare(`
      INSERT INTO tasks (
        id, title, type, reward, task_limit, status, description,
        action_url, action_urls_json, duration, quiz_data_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      taskId,
      title,
      body.type || 'Quiz',
      Number(body.reward || 0.1),
      body.limit || 'Daily 1 time',
      body.status || 'Active',
      body.description || '',
      body.actionUrl || '',
      body.actionUrls ? JSON.stringify(body.actionUrls) : null,
      Number(body.duration || 30),
      body.quizData ? JSON.stringify(body.quizData) : null
    ).run();

    const created = await env.DB.prepare("SELECT * FROM tasks WHERE id = ?").bind(taskId).first();
    return new Response(JSON.stringify({ success: true, task: formatTask(created) }), { status: 201, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to create task" }), { status: 500, headers: jsonHeaders });
  }
}

// PUT /api/tasks (Update Task)
export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 binding missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const body = await request.json() as any;
    const id = body.id;
    if (!id) return new Response(JSON.stringify({ error: "Task id required" }), { status: 400, headers: jsonHeaders });

    await env.DB.prepare(`
      UPDATE tasks SET
        title = COALESCE(?, title),
        type = COALESCE(?, type),
        reward = COALESCE(?, reward),
        task_limit = COALESCE(?, task_limit),
        status = COALESCE(?, status),
        description = COALESCE(?, description),
        action_url = COALESCE(?, action_url),
        action_urls_json = COALESCE(?, action_urls_json),
        duration = COALESCE(?, duration),
        quiz_data_json = COALESCE(?, quiz_data_json)
      WHERE id = ?
    `).bind(
      body.title || null,
      body.type || null,
      body.reward !== undefined ? Number(body.reward) : null,
      body.limit || null,
      body.status || null,
      body.description !== undefined ? body.description : null,
      body.actionUrl !== undefined ? body.actionUrl : null,
      body.actionUrls ? JSON.stringify(body.actionUrls) : null,
      body.duration !== undefined ? Number(body.duration) : null,
      body.quizData ? JSON.stringify(body.quizData) : null,
      id
    ).run();

    const updated = await env.DB.prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first();
    return new Response(JSON.stringify({ success: true, task: formatTask(updated) }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to update task" }), { status: 500, headers: jsonHeaders });
  }
}

// DELETE /api/tasks?id=123
export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 binding missing" }), { status: 503, headers: jsonHeaders });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response(JSON.stringify({ error: "Task id required" }), { status: 400, headers: jsonHeaders });

  try {
    await env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: "Task deleted successfully" }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to delete task" }), { status: 500, headers: jsonHeaders });
  }
}
