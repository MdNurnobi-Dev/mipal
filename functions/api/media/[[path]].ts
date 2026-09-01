// Cloudflare Pages Function: /api/media/*
// Streams and serves objects stored in Cloudflare R2 Bucket with caching and correct MIME types

interface Env {
  BUCKET?: any;
  R2_BUCKET?: any;
}

export async function onRequestGet(context: { request: Request; params: { path?: string | string[] }; env: Env }) {
  const { params, env, request } = context;
  const bucket = env.BUCKET || env.R2_BUCKET;

  if (!bucket) {
    return new Response("R2 Storage not configured", { status: 503 });
  }

  // Derive object key from params or request URL
  let key = "";
  if (params.path) {
    key = Array.isArray(params.path) ? params.path.join("/") : params.path;
  } else {
    const url = new URL(request.url);
    key = url.pathname.replace(/^\/api\/media\//, "");
  }

  if (!key) {
    return new Response("Missing media key", { status: 400 });
  }

  try {
    const object = await bucket.get(key);

    if (!object) {
      return new Response("File not found in storage", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(object.body, {
      headers,
    });
  } catch (err: any) {
    return new Response(`Error retrieving file: ${err.message || err}`, { status: 500 });
  }
}
