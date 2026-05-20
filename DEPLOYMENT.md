# CookEdu Production Deployment (QA checklist)

## Root cause of register "CORS / Network Error"

| Symptom | Actual cause |
|---------|----------------|
| `No Access-Control-Allow-Origin` | Railway returns **502** — proxy error, not Laravel CORS |
| `AxiosError: Network Error` | Browser blocked failed cross-origin preflight |
| Same bundle `index-Dwgu_ZDx.js` | Old Cloudflare build until redeploy completes |

## Cloudflare (frontend)

1. **Root directory:** `frontend`
2. **Build:** `npm ci && npm run build`
3. **Output:** `dist`
4. **Env (recommended):** `VITE_API_URL=/api`  
   Uses same-origin proxy — **no browser CORS**.

### API proxy (required for `/api` on workers.dev)

**Cloudflare Pages:** deploy `functions/api/[[path]].js` (included in repo).

**Cloudflare Workers:** bind `worker.js` + static assets from `dist` via Wrangler.

After deploy, test:
```powershell
Invoke-WebRequest -Uri "https://cook-edu.fiksfaa.workers.dev/api/recipes" -UseBasicParsing
```

## Railway (backend)

1. **Root directory:** `backend` ← critical (not repo root)
2. **Start command:** `bash scripts/railway-start.sh` (auto via `railway.json`)
3. **Required variables:**

| Variable | Example |
|----------|---------|
| `APP_KEY` | output of `php artisan key:generate --show` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://cookeduproject-production.up.railway.app` |
| `DB_CONNECTION` | `pgsql` |
| `DATABASE_URL` | from Railway PostgreSQL plugin |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,https://cook-edu.fiksfaa.workers.dev` |

4. **Health gate:** `https://cookeduproject-production.up.railway.app/up` must return **200** before register works.

### Do NOT run `config:cache` at build time

Build-time env is empty on Railway. Cached config breaks runtime. `nixpacks.toml` now avoids this.

## QA smoke tests (run after both deploys)

```powershell
# 1. Railway alive
(Invoke-WebRequest "https://cookeduproject-production.up.railway.app/up" -UseBasicParsing).StatusCode

# 2. Cloudflare proxy
(Invoke-WebRequest "https://cook-edu.fiksfaa.workers.dev/api/recipes" -UseBasicParsing).StatusCode

# 3. Register preflight (same-origin via proxy — optional)
Invoke-WebRequest "https://cook-edu.fiksfaa.workers.dev/api/register" -Method Options -UseBasicParsing
```

All should be **200** or **204**, never **502**.

## PWA icon warning

Clear site data + unregister service worker once after deploy.
