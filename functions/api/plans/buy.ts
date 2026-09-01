// Cloudflare Pages Function: /api/plans/buy
// Atomically purchases an investment tier, validates user balance,
// updates user active plan, and records ledger transaction.

interface Env {
  DB?: any;
}

const jsonHeaders = {
  "content-type": "application/json;charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const body = await request.json() as { userId: string; planId: string };
    const { userId, planId } = body;

    if (!userId || !planId) {
      return new Response(JSON.stringify({ error: "User ID and Plan ID are required" }), { status: 400, headers: jsonHeaders });
    }

    const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: jsonHeaders });
    }

    const plan = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(planId).first();
    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan tier not found" }), { status: 404, headers: jsonHeaders });
    }

    const price = Number(plan.price);
    const userBalance = Number(user.balance || 0);

    if (userBalance < price) {
      return new Response(
        JSON.stringify({
          error: `Insufficient balance ($${userBalance.toFixed(2)}). You need $${price.toFixed(2)} to activate ${plan.name}. Please deposit funds first.`,
        }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Execute atomic purchase
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET balance = balance - ?, active_plan_id = ? WHERE id = ?").bind(price, planId, userId),
      env.DB.prepare(`
        INSERT INTO transactions (id, user_id, user_name, type, amount, method, date, status, user_details)
        VALUES (?, ?, ?, 'plan_purchase', ?, 'Wallet Balance', ?, 'approved', ?)
      `).bind(txId, userId, user.name, price, dateStr, `Activated ${plan.name} (${plan.duration_days} Days)`),
      env.DB.prepare(`
        INSERT INTO notifications (id, user_id, title, message, date, type)
        VALUES (?, ?, 'Plan Activated! 🚀', ?, ?, 'system')
      `).bind(`notif_${Date.now()}`, userId, `Congratulations! You have successfully subscribed to ${plan.name}. Your new daily limit is $${Number(plan.daily_earning_limit).toFixed(2)}.`, dateStr)
    ]);

    const updatedUser = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Congratulations! ${plan.name} has been activated successfully.`,
        newBalance: Number(updatedUser.balance),
        activePlanId: planId,
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to purchase plan" }), { status: 500, headers: jsonHeaders });
  }
}
