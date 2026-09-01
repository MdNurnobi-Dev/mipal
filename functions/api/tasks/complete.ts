// Cloudflare Pages Function: /api/tasks/complete
// Processes task completion, checks daily earning caps based on user plan,
// logs completion to task_completions, and credits user balance in D1 atomically.

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
    return new Response(JSON.stringify({ error: "D1 Database binding missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const body = await request.json() as {
      userId: string;
      taskId?: string;
      taskTitle?: string;
      amount?: number;
    };

    const { userId, taskId } = body;
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400, headers: jsonHeaders });
    }

    // 1. Fetch user
    const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: jsonHeaders });
    }

    // 2. Fetch task
    let task = null;
    if (taskId) {
      task = await env.DB.prepare("SELECT * FROM tasks WHERE id = ?").bind(taskId).first();
    }

    const rewardAmount = task ? Number(task.reward) : (Number(body.amount) || 0.1);
    const title = task?.title || body.taskTitle || "MicroTask Reward";

    // 3. Check active plan & daily limits
    const today = new Date().toISOString().split('T')[0];
    let dailyLimit = 0.50; // Default free limit

    if (user.active_plan_id) {
      const plan = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(user.active_plan_id).first();
      if (plan) {
        dailyLimit = Number(plan.daily_earning_limit);
      }
    }

    const isSameDay = user.last_earned_date === today;
    const currentDailyEarned = isSameDay ? Number(user.daily_earned || 0) : 0;

    if (currentDailyEarned + rewardAmount > dailyLimit) {
      return new Response(
        JSON.stringify({
          error: `Daily earning limit reached for your active plan ($${dailyLimit.toFixed(2)}/day). Upgrade your plan to earn more!`,
          dailyLimit,
          currentDailyEarned,
        }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const newDailyEarned = currentDailyEarned + rewardAmount;
    const completionId = `tc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 4. Atomic D1 Batch: Update user balance & dailyEarned, log completion, and create transaction
    const statements = [
      env.DB.prepare(`
        UPDATE users SET
          balance = balance + ?,
          daily_earned = ?,
          last_earned_date = ?
        WHERE id = ?
      `).bind(rewardAmount, newDailyEarned, today, userId),

      env.DB.prepare(`
        INSERT INTO transactions (id, user_id, user_name, type, amount, method, date, status, user_details)
        VALUES (?, ?, ?, 'task_earning', ?, 'Task Completed', ?, 'approved', ?)
      `).bind(txId, userId, user.name, rewardAmount, today, `Earned from ${title}`)
    ];

    if (taskId) {
      statements.push(
        env.DB.prepare(`
          INSERT INTO task_completions (id, user_id, task_id, reward)
          VALUES (?, ?, ?, ?)
        `).bind(completionId, userId, taskId, rewardAmount)
      );
    }

    await env.DB.batch(statements);

    const updatedUser = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Task completed! $${rewardAmount.toFixed(2)} added to your balance.`,
        reward: rewardAmount,
        newBalance: Number(updatedUser.balance),
        dailyEarned: newDailyEarned,
        dailyLimit,
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to complete task" }), { status: 500, headers: jsonHeaders });
  }
}
