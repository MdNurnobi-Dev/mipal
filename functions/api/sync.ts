// Cloudflare Pages Function: /api/sync
// Full Database Synchronizer, Backup Exporter, and Initial Seeder

interface Env {
  DB?: any;
}

const jsonHeaders = {
  "content-type": "application/json;charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

// GET /api/sync (Export complete D1 database state)
export async function onRequestGet(context: { env: Env }) {
  const { env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: "D1 database missing" }), { status: 503, headers: jsonHeaders });

  try {
    const [users, tasks, transactions, plans, posts, postComments, gateways, banners, settings] = await Promise.all([
      env.DB.prepare("SELECT * FROM users").all(),
      env.DB.prepare("SELECT * FROM tasks").all(),
      env.DB.prepare("SELECT * FROM transactions").all(),
      env.DB.prepare("SELECT * FROM plans").all(),
      env.DB.prepare("SELECT * FROM posts").all(),
      env.DB.prepare("SELECT * FROM post_comments").all(),
      env.DB.prepare("SELECT * FROM gateways").all(),
      env.DB.prepare("SELECT * FROM giveaway_banners").all(),
      env.DB.prepare("SELECT * FROM app_settings").all(),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        exportedAt: new Date().toISOString(),
        data: {
          users: users.results || [],
          tasks: tasks.results || [],
          transactions: transactions.results || [],
          plans: plans.results || [],
          posts: posts.results || [],
          postComments: postComments.results || [],
          gateways: gateways.results || [],
          giveawayBanners: banners.results || [],
          appSettings: settings.results || [],
        },
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to export data" }), { status: 500, headers: jsonHeaders });
  }
}

// POST /api/sync (Seed or import state into D1)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: "D1 database missing" }), { status: 503, headers: jsonHeaders });

  try {
    const body = await request.json() as any;
    const { users, tasks, plans, gateways, settings } = body;

    const statements: any[] = [];

    if (Array.isArray(users)) {
      for (const u of users) {
        statements.push(
          env.DB.prepare(`
            INSERT INTO users (id, name, email, phone, bio, avatar, balance, referral_code, active_plan_id, status, joined)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              balance = excluded.balance,
              avatar = excluded.avatar
          `).bind(
            u.id, u.name, u.email || null, u.phone || null, u.bio || null, u.avatar || null,
            Number(u.balance || 0), u.referralCode || null, u.activePlanId || null, u.status || 'active', u.joined || null
          )
        );
      }
    }

    if (Array.isArray(tasks)) {
      for (const t of tasks) {
        statements.push(
          env.DB.prepare(`
            INSERT INTO tasks (id, title, type, reward, task_limit, status, description, action_url, duration, quiz_data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title,
              reward = excluded.reward
          `).bind(
            t.id, t.title, t.type || 'Quiz', Number(t.reward || 0.1), t.limit || 'Daily 1 time',
            t.status || 'Active', t.description || null, t.actionUrl || null, Number(t.duration || 30),
            t.quizData ? JSON.stringify(t.quizData) : null
          )
        );
      }
    }

    if (Array.isArray(plans)) {
      for (const p of plans) {
        statements.push(
          env.DB.prepare(`
            INSERT INTO plans (id, name, price, daily_earning_limit, duration_days)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              price = excluded.price,
              daily_earning_limit = excluded.daily_earning_limit
          `).bind(p.id, p.name, Number(p.price || 10), Number(p.dailyEarningLimit || 1.0), Number(p.durationDays || 30))
        );
      }
    }

    if (statements.length > 0) {
      // Execute in chunks of 50 to respect D1 batch limits
      for (let i = 0; i < statements.length; i += 50) {
        await env.DB.batch(statements.slice(i, i + 50));
      }
    }

    return new Response(JSON.stringify({ success: true, message: `Synced ${statements.length} items to D1` }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to sync state" }), { status: 500, headers: jsonHeaders });
  }
}
