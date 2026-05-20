const RAILWAY_API = "https://cookeduproject-production.up.railway.app";

/**
 * Cloudflare Pages Function: proxy /api/* → Railway Laravel.
 * Eliminates browser CORS — requests stay same-origin on workers.dev.
 */
export async function onRequest(context) {
  const { request, params } = context;
  const pathSegments = params.path ?? [];
  const subPath = pathSegments.length ? `/${pathSegments.join("/")}` : "";
  const url = new URL(request.url);
  const target = `${RAILWAY_API}/api${subPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  try {
    const response = await fetch(target, init);
    const outHeaders = new Headers(response.headers);
    outHeaders.set("Access-Control-Allow-Origin", url.origin);
    outHeaders.set("Access-Control-Allow-Credentials", "true");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outHeaders,
    });
  } catch (err) {
    return Response.json(
      {
        success: false,
        message: "Backend API tidak merespons. Periksa status Railway (/up).",
        error: String(err?.message ?? err),
      },
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
