// Cloudflare Pages Function: /api/users
// CRUD operations for users table in Cloudflare D1 Database

interface Env {
  DB?: any;
}

const jsonHeaders = {
  "content-type": "application/json;charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

// Helper to format user row from D1 SQLite
function formatUser(row: any) {
  if (!row) return null;
  let notifications = { email: true, push: true, promo: true };
  try {
    if (row.notifications_json) notifications = JSON.parse(row.notifications_json);
  } catch (_) {}

  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    bio: row.bio || '',
    avatar: row.avatar || '',
    balance: Number(row.balance || 0),
    referralCode: row.referral_code || '',
    referredBy: row.referred_by || undefined,
    referralEarnings: Number(row.referral_earnings || 0),
    activePlanId: row.active_plan_id || undefined,
    dailyEarned: Number(row.daily_earned || 0),
    lastEarnedDate: row.last_earned_date || undefined,
    checkInStreak: Number(row.check_in_streak || 0),
    lastCheckInDate: row.last_check_in_date || undefined,
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    language: row.language || 'en',
    theme: row.theme || 'light',
    status: row.status || 'active',
    joined: row.joined || row.created_at,
    notifications,
  };
}

// GET /api/users or /api/users?id=123 or /api/users?email=test@example.com
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database binding (DB) is missing." }), { status: 503, headers: jsonHeaders });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const email = url.searchParams.get("email");
  const referralCode = url.searchParams.get("referralCode");

  try {
    if (id) {
      const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
      if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: jsonHeaders });
      return new Response(JSON.stringify({ success: true, user: formatUser(user) }), { status: 200, headers: jsonHeaders });
    }

    if (email) {
      const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: jsonHeaders });
      return new Response(JSON.stringify({ success: true, user: formatUser(user) }), { status: 200, headers: jsonHeaders });
    }

    if (referralCode) {
      const user = await env.DB.prepare("SELECT * FROM users WHERE referral_code = ?").bind(referralCode).first();
      return new Response(JSON.stringify({ success: true, exists: !!user, user: formatUser(user) }), { status: 200, headers: jsonHeaders });
    }

    const result = await env.DB.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
    const users = (result.results || []).map(formatUser);
    return new Response(JSON.stringify({ success: true, users }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Database query error" }), { status: 500, headers: jsonHeaders });
  }
}

// POST /api/users (Create User / Register)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database binding missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const body = await request.json() as any;
    const name = body.name?.trim();
    const email = body.email?.trim() || `user_${Date.now()}@microjobpro.com`;
    const referralCodeInput = body.referralCode?.trim()?.toUpperCase();

    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), { status: 400, headers: jsonHeaders });
    }

    // Check if email already exists
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "An account with this email already exists." }), { status: 400, headers: jsonHeaders });
    }

    // Generate Unique IDs
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const myReferralCode = (name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'EARN') + Math.floor(1000 + Math.random() * 9000);
    const joinedDate = new Date().toISOString().split('T')[0];
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    // Read Referral Settings from D1
    let refSettings = { referrerBonusAmount: 1.0, newUserBonusAmount: 0.5 };
    const settingsRow = await env.DB.prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'referral_settings'").first();
    if (settingsRow?.setting_value) {
      try { refSettings = JSON.parse(settingsRow.setting_value); } catch (_) {}
    }

    let startingBalance = 0.0;
    let referredByUser: any = null;

    if (referralCodeInput) {
      referredByUser = await env.DB.prepare("SELECT * FROM users WHERE UPPER(referral_code) = ?").bind(referralCodeInput).first();
      if (referredByUser) {
        startingBalance = refSettings.newUserBonusAmount || 0.5;
      }
    }

    // Execute atomic batch in D1
    const statements = [
      // 1. Insert new user
      env.DB.prepare(`
        INSERT INTO users (
          id, name, email, phone, bio, avatar, balance, referral_code,
          referred_by, referral_earnings, status, joined, notifications_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId, name, email, body.phone || '', body.bio || '', body.avatar || defaultAvatar,
        startingBalance, myReferralCode, referredByUser ? referredByUser.id : null,
        0.0, 'active', joinedDate, JSON.stringify({ email: true, push: true, promo: true })
      ),
    ];

    // If referee got welcome bonus, insert transaction
    if (startingBalance > 0) {
      statements.push(
        env.DB.prepare(`
          INSERT INTO transactions (id, user_id, user_name, type, amount, method, date, status, user_details)
          VALUES (?, ?, ?, 'signup_bonus', ?, 'Referral Code Applied', ?, 'approved', ?)
        `).bind(
          `tx_${Date.now()}_1`, userId, name, startingBalance, joinedDate, `Bonus for using code ${referralCodeInput}`
        )
      );
    }

    // If valid referrer exists, credit them and log transaction + notification
    if (referredByUser) {
      const referrerBonus = refSettings.referrerBonusAmount || 1.0;
      statements.push(
        env.DB.prepare("UPDATE users SET balance = balance + ?, referral_earnings = referral_earnings + ? WHERE id = ?")
          .bind(referrerBonus, referrerBonus, referredByUser.id),
        env.DB.prepare(`
          INSERT INTO transactions (id, user_id, user_name, type, amount, method, date, status, user_details)
          VALUES (?, ?, ?, 'referral_bonus', ?, 'Direct Referral', ?, 'approved', ?)
        `).bind(
          `tx_${Date.now()}_2`, referredByUser.id, referredByUser.name, referrerBonus, joinedDate, `New user ${name} registered with your code`
        ),
        env.DB.prepare(`
          INSERT INTO notifications (id, user_id, title, message, date, type)
          VALUES (?, ?, 'Referral Bonus Earned! 🎉', ?, ?, 'system')
        `).bind(
          `notif_${Date.now()}`, referredByUser.id, `You earned $${referrerBonus.toFixed(2)} because ${name} registered using your referral code!`, joinedDate
        )
      );
    }

    await env.DB.batch(statements);

    const createdUser = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();

    return new Response(
      JSON.stringify({
        success: true,
        message: referredByUser ? `Registration successful! Welcome bonus of $${startingBalance.toFixed(2)} credited.` : "Registration successful!",
        user: formatUser(createdUser),
      }),
      { status: 201, headers: jsonHeaders }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to register user" }), { status: 500, headers: jsonHeaders });
  }
}

// PUT /api/users (Update user profile, balance, 2FA, avatar)
export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database binding missing" }), { status: 503, headers: jsonHeaders });
  }

  try {
    const body = await request.json() as any;
    const userId = body.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required for update" }), { status: 400, headers: jsonHeaders });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) { updates.push("name = ?"); values.push(body.name); }
    if (body.email !== undefined) { updates.push("email = ?"); values.push(body.email); }
    if (body.phone !== undefined) { updates.push("phone = ?"); values.push(body.phone); }
    if (body.bio !== undefined) { updates.push("bio = ?"); values.push(body.bio); }
    if (body.avatar !== undefined) { updates.push("avatar = ?"); values.push(body.avatar); }
    if (body.balance !== undefined) { updates.push("balance = ?"); values.push(Number(body.balance)); }
    if (body.twoFactorEnabled !== undefined) { updates.push("two_factor_enabled = ?"); values.push(body.twoFactorEnabled ? 1 : 0); }
    if (body.language !== undefined) { updates.push("language = ?"); values.push(body.language); }
    if (body.theme !== undefined) { updates.push("theme = ?"); values.push(body.theme); }
    if (body.activePlanId !== undefined) { updates.push("active_plan_id = ?"); values.push(body.activePlanId); }
    if (body.status !== undefined) { updates.push("status = ?"); values.push(body.status); }
    if (body.notifications !== undefined) { updates.push("notifications_json = ?"); values.push(JSON.stringify(body.notifications)); }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No update fields specified" }), { status: 400, headers: jsonHeaders });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await env.DB.prepare(sql).bind(...values).run();

    const updatedUser = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
    return new Response(JSON.stringify({ success: true, user: formatUser(updatedUser) }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to update user" }), { status: 500, headers: jsonHeaders });
  }
}
