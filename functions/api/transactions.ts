// Cloudflare Pages Function: /api/transactions
// Full transaction processing & financial ledger in Cloudflare D1

interface Env {
  DB?: any;
}

const jsonHeaders = {
  "content-type": "application/json;charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

function formatTx(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    type: row.type,
    amount: Number(row.amount || 0),
    method: row.method,
    txId: row.tx_id || undefined,
    proofImg: row.proof_img || undefined,
    date: row.date || row.created_at,
    status: row.status || 'pending',
    userDetails: row.user_details || undefined,
  };
}

// GET /api/transactions
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database missing" }), { status: 503, headers: jsonHeaders });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");

  try {
    let sql = "SELECT * FROM transactions WHERE 1=1";
    const params: any[] = [];

    if (userId) {
      sql += " AND user_id = ?";
      params.push(userId);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }

    sql += " ORDER BY created_at DESC LIMIT 200";

    const result = await env.DB.prepare(sql).bind(...params).all();
    const transactions = (result.results || []).map(formatTx);
    return new Response(JSON.stringify({ success: true, transactions }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch transactions" }), { status: 500, headers: jsonHeaders });
  }
}

// POST /api/transactions (Submit Deposit or Withdrawal Request)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const body = await request.json() as any;
    const { userId, type, amount, method, txId, proofImg, userDetails } = body;

    if (!userId || !type || !amount || !method) {
      return new Response(JSON.stringify({ error: "Missing required transaction fields" }), { status: 400, headers: jsonHeaders });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid transaction amount" }), { status: 400, headers: jsonHeaders });
    }

    const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: jsonHeaders });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const newTxId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Withdrawal validation: check sufficient balance and deduct immediately
    if (type === 'withdraw') {
      if (Number(user.balance) < numAmount) {
        return new Response(JSON.stringify({ error: "Insufficient account balance for withdrawal" }), { status: 400, headers: jsonHeaders });
      }

      await env.DB.batch([
        env.DB.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").bind(numAmount, userId),
        env.DB.prepare(`
          INSERT INTO transactions (id, user_id, user_name, type, amount, method, tx_id, proof_img, date, status, user_details)
          VALUES (?, ?, ?, 'withdraw', ?, ?, ?, ?, ?, 'pending', ?)
        `).bind(newTxId, userId, user.name, numAmount, method, txId || null, proofImg || null, dateStr, userDetails || null),
        env.DB.prepare(`
          INSERT INTO notifications (id, user_id, title, message, date, type)
          VALUES (?, ?, 'Withdrawal Request Submitted', ?, ?, 'withdraw')
        `).bind(`notif_${Date.now()}`, userId, `Your withdrawal request of $${numAmount.toFixed(2)} via ${method} is being reviewed.`, dateStr)
      ]);
    } else {
      // Deposit request (starts as pending, will credit upon admin approval)
      await env.DB.batch([
        env.DB.prepare(`
          INSERT INTO transactions (id, user_id, user_name, type, amount, method, tx_id, proof_img, date, status, user_details)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        `).bind(newTxId, userId, user.name, type, numAmount, method, txId || null, proofImg || null, dateStr, userDetails || null),
        env.DB.prepare(`
          INSERT INTO notifications (id, user_id, title, message, date, type)
          VALUES (?, ?, 'Deposit Request Received', ?, ?, 'deposit')
        `).bind(`notif_${Date.now()}`, userId, `Deposit of $${numAmount.toFixed(2)} submitted. We will verify and credit your balance shortly.`, dateStr)
      ]);
    }

    const created = await env.DB.prepare("SELECT * FROM transactions WHERE id = ?").bind(newTxId).first();
    const updatedUser = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();

    return new Response(
      JSON.stringify({
        success: true,
        message: type === 'withdraw' ? "Withdrawal submitted successfully!" : "Deposit submitted for verification!",
        transaction: formatTx(created),
        newBalance: Number(updatedUser.balance),
      }),
      { status: 201, headers: jsonHeaders }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to submit transaction" }), { status: 500, headers: jsonHeaders });
  }
}

// PUT /api/transactions (Admin Moderate: Approve or Reject)
export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const body = await request.json() as { id: string; action: 'approve' | 'reject' };
    const { id, action } = body;

    if (!id || !['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({ error: "Transaction ID and valid action (approve/reject) required" }), { status: 400, headers: jsonHeaders });
    }

    const tx = await env.DB.prepare("SELECT * FROM transactions WHERE id = ?").bind(id).first();
    if (!tx) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 404, headers: jsonHeaders });
    }

    if (tx.status !== 'pending') {
      return new Response(JSON.stringify({ error: `Transaction is already ${tx.status}` }), { status: 400, headers: jsonHeaders });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const amount = Number(tx.amount);
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const statements: any[] = [
      env.DB.prepare("UPDATE transactions SET status = ? WHERE id = ?").bind(newStatus, id),
    ];

    if (tx.type === 'deposit') {
      if (action === 'approve') {
        // Credit user's balance
        statements.push(
          env.DB.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").bind(amount, tx.user_id),
          env.DB.prepare(`
            INSERT INTO notifications (id, user_id, title, message, date, type)
            VALUES (?, ?, 'Deposit Approved! 💰', ?, ?, 'deposit')
          `).bind(`notif_${Date.now()}`, tx.user_id, `Your deposit of $${amount.toFixed(2)} has been verified and added to your balance!`, dateStr)
        );

        // Check if user has referrer and deposit bonus is enabled
        const user = await env.DB.prepare("SELECT referred_by FROM users WHERE id = ?").bind(tx.user_id).first();
        if (user?.referred_by) {
          const refSettingsRow = await env.DB.prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'referral_settings'").first();
          if (refSettingsRow?.setting_value) {
            try {
              const refConfig = JSON.parse(refSettingsRow.setting_value);
              const depositPercent = Number(refConfig.depositBonusPercent || 0);
              if (depositPercent > 0) {
                const bonusAmount = (amount * depositPercent) / 100;
                statements.push(
                  env.DB.prepare("UPDATE users SET balance = balance + ?, referral_earnings = referral_earnings + ? WHERE id = ?")
                    .bind(bonusAmount, bonusAmount, user.referred_by),
                  env.DB.prepare(`
                    INSERT INTO transactions (id, user_id, user_name, type, amount, method, date, status, user_details)
                    VALUES (?, ?, 'Referrer', 'referral_bonus', ?, 'Referee Deposit Commission', ?, 'approved', ?)
                  `).bind(`tx_${Date.now()}_ref`, user.referred_by, bonusAmount, dateStr, `${depositPercent}% bonus on referee deposit ($${amount})`)
                );
              }
            } catch (_) {}
          }
        }
      } else {
        // Deposit rejected notification
        statements.push(
          env.DB.prepare(`
            INSERT INTO notifications (id, user_id, title, message, date, type)
            VALUES (?, ?, 'Deposit Rejected ⚠️', ?, ?, 'deposit')
          `).bind(`notif_${Date.now()}`, tx.user_id, `Your deposit request of $${amount.toFixed(2)} could not be verified. Please check details and try again.`, dateStr)
        );
      }
    } else if (tx.type === 'withdraw') {
      if (action === 'approve') {
        statements.push(
          env.DB.prepare(`
            INSERT INTO notifications (id, user_id, title, message, date, type)
            VALUES (?, ?, 'Withdrawal Sent! ✅', ?, ?, 'withdraw')
          `).bind(`notif_${Date.now()}`, tx.user_id, `Your payout of $${amount.toFixed(2)} has been successfully sent to your ${tx.method} account.`, dateStr)
        );
      } else {
        // Refund balance if rejected
        statements.push(
          env.DB.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").bind(amount, tx.user_id),
          env.DB.prepare(`
            INSERT INTO notifications (id, user_id, title, message, date, type)
            VALUES (?, ?, 'Withdrawal Rejected (Refunded) ↩️', ?, ?, 'withdraw')
          `).bind(`notif_${Date.now()}`, tx.user_id, `Your withdrawal of $${amount.toFixed(2)} was declined. The funds have been refunded to your wallet.`, dateStr)
        );
      }
    }

    await env.DB.batch(statements);

    const updatedTx = await env.DB.prepare("SELECT * FROM transactions WHERE id = ?").bind(id).first();
    return new Response(JSON.stringify({ success: true, transaction: formatTx(updatedTx) }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to update transaction status" }), { status: 500, headers: jsonHeaders });
  }
}
