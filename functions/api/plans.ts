// Cloudflare Pages Function: /api/plans
// CRUD operations for investment tiers in Cloudflare D1

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

function formatPlan(row: any) {
  if (!row) return null;
  let features = [];
  try {
    if (row.features_json) features = JSON.parse(row.features_json);
  } catch (_) {}

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price || 0),
    dailyEarningLimit: Number(row.daily_earning_limit || 0),
    durationDays: Number(row.duration_days || 30),
    features: features.length > 0 ? features : undefined,
  };
}

// GET /api/plans
export async function onRequestGet(context: { env: Env }) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 database binding missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const result = await env.DB.prepare("SELECT * FROM plans ORDER BY price ASC").all();
    const plans = (result.results || []).map(formatPlan);
    return new Response(JSON.stringify({ success: true, plans }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch plans" }), { status: 500, headers: jsonHeaders });
  }
}

// POST /api/plans (Create Plan)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: "D1 database missing" }), { status: 503, headers: jsonHeaders });

  try {
    const body = await request.json() as any;
    const planId = body.id || `plan_${Date.now()}`;
    const name = body.name?.trim();
    if (!name) return new Response(JSON.stringify({ error: "Plan name is required" }), { status: 400, headers: jsonHeaders });

    await env.DB.prepare(`
      INSERT INTO plans (id, name, price, daily_earning_limit, duration_days, features_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      planId,
      name,
      Number(body.price || 10),
      Number(body.dailyEarningLimit || 1.0),
      Number(body.durationDays || 30),
      body.features ? JSON.stringify(body.features) : null
    ).run();

    const created = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(planId).first();
    return new Response(JSON.stringify({ success: true, plan: formatPlan(created) }), { status: 201, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to create plan" }), { status: 500, headers: jsonHeaders });
  }
}

// PUT /api/plans (Update Plan)
export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: "D1 database missing" }), { status: 503, headers: jsonHeaders });

  try {
    const body = await request.json() as any;
    const id = body.id;
    if (!id) return new Response(JSON.stringify({ error: "Plan ID is required" }), { status: 400, headers: jsonHeaders });

    await env.DB.prepare(`
      UPDATE plans SET
        name = COALESCE(?, name),
        price = COALESCE(?, price),
        daily_earning_limit = COALESCE(?, daily_earning_limit),
        duration_days = COALESCE(?, duration_days),
        features_json = COALESCE(?, features_json)
      WHERE id = ?
    `).bind(
      body.name || null,
      body.price !== undefined ? Number(body.price) : null,
      body.dailyEarningLimit !== undefined ? Number(body.dailyEarningLimit) : null,
      body.durationDays !== undefined ? Number(body.durationDays) : null,
      body.features ? JSON.stringify(body.features) : null,
      id
    ).run();

    const updated = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(id).first();
    return new Response(JSON.stringify({ success: true, plan: formatPlan(updated) }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to update plan" }), { status: 500, headers: jsonHeaders });
  }
}

// DELETE /api/plans?id=123
export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: "D1 database missing" }), { status: 503, headers: jsonHeaders });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response(JSON.stringify({ error: "Plan ID required" }), { status: 400, headers: jsonHeaders });

  try {
    await env.DB.prepare("DELETE FROM plans WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: "Plan deleted" }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to delete plan" }), { status: 500, headers: jsonHeaders });
  }
}
