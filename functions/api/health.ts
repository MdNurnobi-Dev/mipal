// Cloudflare Pages Function: /api/health
// Verifies API, D1 Database connection, and R2 Storage bucket binding

interface Env {
  DB?: any;
  BUCKET?: any;
  R2_BUCKET?: any;
}

export async function onRequest(context: { env: Env }) {
  const env = context.env;
  let d1Status = "not_configured";
  let r2Status = "not_configured";
  let dbTablesCount = 0;

  // Test Cloudflare D1 Database Binding
  if (env.DB) {
    try {
      const res = await env.DB.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table'").first();
      d1Status = "connected";
      dbTablesCount = res?.count || 0;
    } catch (err: any) {
      d1Status = `error: ${err.message || err}`;
    }
  }

  // Test Cloudflare R2 Bucket Binding
  const bucket = env.BUCKET || env.R2_BUCKET;
  if (bucket) {
    try {
      // Just check if bucket interface exists
      r2Status = typeof bucket.put === 'function' ? "connected" : "invalid_binding";
    } catch (err: any) {
      r2Status = `error: ${err.message || err}`;
    }
  }

  return new Response(
    JSON.stringify({
      status: "ok",
      platform: "Cloudflare Pages & Workers",
      d1Database: {
        binding: "DB",
        status: d1Status,
        tablesCount: dbTablesCount
      },
      r2Storage: {
        binding: env.BUCKET ? "BUCKET" : (env.R2_BUCKET ? "R2_BUCKET" : "none"),
        status: r2Status
      },
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    }
  );
}
