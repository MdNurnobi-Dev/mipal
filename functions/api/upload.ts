// Cloudflare Pages Function: /api/upload
// Handles direct image & file uploads to Cloudflare R2 Bucket

interface Env {
  BUCKET?: any;
  R2_BUCKET?: any;
  PUBLIC_R2_URL?: string;
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const bucket = env.BUCKET || env.R2_BUCKET;

  if (!bucket) {
    return new Response(
      JSON.stringify({
        error: "R2 Bucket binding is not configured. Please bind BUCKET in wrangler.toml or Cloudflare Dashboard.",
      }),
      { status: 503, headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let fileBuffer: ArrayBuffer | Uint8Array;
    let mimeType = "image/png";
    let fileName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.png`;
    let folder = "general";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      folder = (formData.get("folder") as string) || "general";

      if (!file) {
        return new Response(JSON.stringify({ error: "No file found in form data" }), {
          status: 400,
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      mimeType = file.type || "application/octet-stream";
      const ext = file.name.split(".").pop() || "png";
      fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      fileBuffer = await file.arrayBuffer();
    } else if (contentType.includes("application/json")) {
      const body = await request.json() as { data?: string; filename?: string; folder?: string };
      if (!body.data) {
        return new Response(JSON.stringify({ error: "Missing base64 data in payload" }), {
          status: 400,
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      folder = body.folder || "uploads";
      const base64Parts = body.data.split(",");
      const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];

      if (base64Parts.length > 1 && base64Parts[0].includes(":")) {
        const mimeMatch = base64Parts[0].match(/:(.*?);/);
        if (mimeMatch && mimeMatch[1]) mimeType = mimeMatch[1];
      }

      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      fileBuffer = bytes;

      const ext = mimeType.split("/")[1] || "png";
      fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    } else {
      return new Response(JSON.stringify({ error: "Unsupported content type. Use multipart/form-data or application/json" }), {
        status: 400,
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Save object to Cloudflare R2
    await bucket.put(fileName, fileBuffer, {
      httpMetadata: {
        contentType: mimeType,
      },
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    const publicUrl = env.PUBLIC_R2_URL 
      ? `${env.PUBLIC_R2_URL.replace(/\/$/, "")}/${fileName}`
      : `/api/media/${fileName}`;

    return new Response(
      JSON.stringify({
        success: true,
        key: fileName,
        url: publicUrl,
        mimeType,
        size: fileBuffer.byteLength,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to process and store file in R2" }),
      {
        status: 500,
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
