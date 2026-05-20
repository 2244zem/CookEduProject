# CookEdu Production Deployment

## Cloudflare (frontend)

1. **Root directory:** `frontend`
2. **Build command:** `npm ci && npm run build`
3. **Output directory:** `dist`
4. **Environment variable:**
   - `VITE_API_URL` = `https://cookeduproject-production.up.railway.app/api`

After deploy, if PWA icon warnings persist: **DevTools → Application → Clear site data** and unregister the service worker (old cache may have stored HTML instead of PNG).

## Railway (backend)

1. **Root directory:** `backend` (not repo root)
2. **Required variables:**
   - `APP_KEY` — run `php artisan key:generate --show` locally and paste
   - `APP_ENV` = `production`
   - `APP_DEBUG` = `false`
   - `APP_URL` = `https://cookeduproject-production.up.railway.app`
   - PostgreSQL vars from Railway plugin (`DATABASE_URL` or `PGHOST`, etc.)
   - `CORS_ALLOWED_ORIGINS` = `http://localhost:5173,https://cook-edu.fiksfaa.workers.dev`

3. **Verify health:** open `https://cookeduproject-production.up.railway.app/up` — must return **200**, not 502.

## Why register shows "CORS error"

Browsers report *"No Access-Control-Allow-Origin"* when the API **does not respond** (502/timeout). That is not a missing CORS config in code — **Railway Laravel must be running first**.

Check Railway → your service → **Deployments** → logs for crash reasons (missing `APP_KEY`, DB connection, wrong root path).

## Quick tests

```powershell
# PWA icon (expect 200 + image/png)
Invoke-WebRequest -Uri "https://cook-edu.fiksfaa.workers.dev/pwa-192x192.png" -Method Head

# API health (expect 200)
Invoke-WebRequest -Uri "https://cookeduproject-production.up.railway.app/up"
```
