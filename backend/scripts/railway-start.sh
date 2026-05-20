#!/usr/bin/env bash
set -e

echo "[CookEdu] Clearing cached config (runtime env must win on Railway)..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

echo "[CookEdu] Running migrations..."
php artisan migrate --force --no-interaction || echo "[CookEdu] Migration skipped or failed — check DATABASE_* vars"

PORT="${PORT:-8080}"
echo "[CookEdu] Starting Laravel on 0.0.0.0:${PORT}..."

# Built-in PHP server — reliable on Railway when bound to $PORT
exec php -S "0.0.0.0:${PORT}" -t public public/index.php
