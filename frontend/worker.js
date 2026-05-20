const RAILWAY_API = "https://cookeduproject-production.up.railway.app";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
      const apiPath = url.pathname.replace(/^\/api/, "/api");
      const target = `${RAILWAY_API}${apiPath}${url.search}`;
      const headers = new Headers(request.headers);
      headers.delete("host");

      try {
        return await fetch(target, {
          method: request.method,
          headers,
          body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
          redirect: "manual",
        });
      } catch (err) {
        return Response.json(
          { success: false, message: "Backend API tidak merespons.", error: String(err) },
          { status: 502 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
