// Cloudflare Pages Function: /api/settings
// Manages system settings, payment gateways, and banners in Cloudflare D1

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

// GET /api/settings
export async function onRequestGet(context: { env: Env }) {
  const { env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: "D1 database missing" }), { status: 503, headers: jsonHeaders });

  try {
    // 1. Fetch Key-Value App Settings
    const settingsRows = await env.DB.prepare("SELECT * FROM app_settings").all();
    const settingsMap: Record<string, any> = {};
    (settingsRows.results || []).forEach((row: any) => {
      try {
        settingsMap[row.setting_key] = JSON.parse(row.setting_value);
      } catch (_) {
        settingsMap[row.setting_key] = row.setting_value;
      }
    });

    // 2. Fetch Payment Gateways
    const gatewaysResult = await env.DB.prepare("SELECT * FROM gateways ORDER BY created_at ASC").all();
    const gateways = (gatewaysResult.results || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      details: g.details,
      isActive: Boolean(g.is_active),
    }));

    // 3. Fetch Giveaway Banners
    const bannersResult = await env.DB.prepare("SELECT * FROM giveaway_banners ORDER BY created_at DESC").all();
    const giveawayBanners = (bannersResult.results || []).map((b: any) => ({
      id: b.id,
      imageUrl: b.image_url,
      isActive: Boolean(b.is_active),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        siteSettings: settingsMap.site_settings || {
          siteName: "MicroJob Pro",
          siteDescription: "Earn real rewards and invest smartly through daily microtasks.",
          logoUrl: "",
          faviconUrl: "",
          supportEmail: "support@microjobpro.com",
          supportPhone: "+880 1800-000000",
          facebookUrl: "https://facebook.com",
          telegramUrl: "https://t.me/microjobpro",
          whatsappUrl: "https://wa.me/8801800000000",
          primaryColor: "#4f46e5",
        },
        referralSettings: settingsMap.referral_settings || {
          referrerBonusAmount: 1.0,
          newUserBonusAmount: 0.5,
          depositBonusPercent: 5.0,
          taskEarningBonusPercentByPlan: {},
          signupBonusAmount: 0.5,
        },
        dailyRewardSettings: settingsMap.daily_reward_settings || {
          isActive: true,
          baseAmount: 0.05,
          streakBonus: 0.02,
          maxStreak: 7,
        },
        gateways,
        giveawayBanners,
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch settings" }), { status: 500, headers: jsonHeaders });
  }
}

// POST or PUT /api/settings (Update Settings, Gateways, or Banners)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return new Response(JSON.stringify({ error: "D1 database missing" }), { status: 503, headers: jsonHeaders });

  try {
    const body = await request.json() as any;
    const { type, payload } = body;

    if (type === 'site_settings' || type === 'referral_settings' || type === 'daily_reward_settings') {
      await env.DB.prepare(`
        INSERT INTO app_settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(setting_key) DO UPDATE SET
          setting_value = excluded.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `).bind(type, JSON.stringify(payload)).run();

      return new Response(JSON.stringify({ success: true, message: `${type} updated successfully` }), { status: 200, headers: jsonHeaders });
    }

    if (type === 'save_gateway') {
      const { id, name, details, isActive } = payload;
      const gwId = id || `gw_${Date.now()}`;
      await env.DB.prepare(`
        INSERT INTO gateways (id, name, details, is_active)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          details = excluded.details,
          is_active = excluded.is_active
      `).bind(gwId, name, details, isActive ? 1 : 0).run();

      return new Response(JSON.stringify({ success: true, message: "Gateway saved" }), { status: 200, headers: jsonHeaders });
    }

    if (type === 'save_banner') {
      const { id, imageUrl, isActive } = payload;
      const bannerId = id || `banner_${Date.now()}`;
      await env.DB.prepare(`
        INSERT INTO giveaway_banners (id, image_url, is_active)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          image_url = excluded.image_url,
          is_active = excluded.is_active
      `).bind(bannerId, imageUrl, isActive ? 1 : 0).run();

      return new Response(JSON.stringify({ success: true, message: "Banner saved" }), { status: 200, headers: jsonHeaders });
    }

    if (type === 'delete_banner') {
      const { id } = payload;
      await env.DB.prepare("DELETE FROM giveaway_banners WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true, message: "Banner deleted" }), { status: 200, headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ error: "Invalid settings update type" }), { status: 400, headers: jsonHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to update settings" }), { status: 500, headers: jsonHeaders });
  }
}
