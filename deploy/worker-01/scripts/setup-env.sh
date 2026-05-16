#!/bin/bash
# setup-env.sh — 在 worker-01 上初始化平台 BFF env 文件
# 运行一次即可，支持幂等重运行（已有密钥不覆盖）
set -euo pipefail

PLATFORM_DIR=/srv/vxture/repo/deploy/worker-01
ENV_FILE="$PLATFORM_DIR/.env"

echo "=== Vxture Platform BFF Env Setup ==="

# ── 1. Redis 密码 ────────────────────────────────────────────────────────────
CURRENT_REDIS=$(grep "^PLATFORM_REDIS_PASSWORD=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || echo "")
if [ -z "$CURRENT_REDIS" ] || [ "$CURRENT_REDIS" = "CHANGEME" ]; then
  NEW_REDIS=$(openssl rand -hex 24)
  if grep -q "^PLATFORM_REDIS_PASSWORD=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^PLATFORM_REDIS_PASSWORD=.*|PLATFORM_REDIS_PASSWORD=$NEW_REDIS|" "$ENV_FILE"
  else
    echo "PLATFORM_REDIS_PASSWORD=$NEW_REDIS" >> "$ENV_FILE"
  fi
  echo "[OK] Redis password generated and written to .env"
else
  echo "[OK] Redis password already set"
fi
REDIS_PASS=$(grep "^PLATFORM_REDIS_PASSWORD=" "$ENV_FILE" | cut -d= -f2-)

# ── 2. Postgres 密码（从 secrets 文件读取）───────────────────────────────────
PG_PASS=$(cat "$PLATFORM_DIR/secrets/platform_pg_password.txt" | tr -d '[:space:]')
if [ -z "$PG_PASS" ]; then
  echo "[ERROR] platform_pg_password.txt is empty"
  exit 1
fi
echo "[OK] Postgres password read (${#PG_PASS} chars)"

# ── 3. 共享密钥：JWT_SECRET（所有 BFF 共用同一签名密钥）────────────────────
SHARED_SECRETS_FILE="$PLATFORM_DIR/secrets/shared_secrets.env"
if [ ! -f "$SHARED_SECRETS_FILE" ]; then
  touch "$SHARED_SECRETS_FILE"
  chmod 600 "$SHARED_SECRETS_FILE"
fi

get_or_generate() {
  local key="$1"
  local len="${2:-32}"
  local existing
  existing=$(grep "^${key}=" "$SHARED_SECRETS_FILE" 2>/dev/null | cut -d= -f2- || true)
  if [ -z "$existing" ]; then
    existing=$(openssl rand -hex "$len")
    echo "${key}=${existing}" >> "$SHARED_SECRETS_FILE"
    echo "[OK] Generated new $key" >&2
  else
    echo "[OK] $key already exists" >&2
  fi
  printf '%s' "$existing"
}

JWT_SECRET=$(get_or_generate "JWT_SECRET" 32)
AUTH_INTERNAL_TOKEN=$(get_or_generate "AUTH_INTERNAL_TOKEN" 24)

# ── 4. 写入各 BFF env 文件（仅首次；已存在的文件不覆盖，保留人工补充的密钥）──────
write_env() {
  local file="$1"
  local content="$2"
  if [ -f "$file" ] && [ -s "$file" ]; then
    echo "[SKIP] Already exists: $file (delete it manually to regenerate)"
    return
  fi
  printf '%s\n' "$content" > "$file"
  chmod 600 "$file"
  echo "[OK] Written: $file"
}

# ─ auth-bff ─────────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.auth-bff" "NODE_ENV=production
AUTH_BFF_PORT=3090
DB_HOST=vx-platform-pg
DB_PORT=5432
DB_NAME=platform_main
DB_USER=vxture
DB_PASSWORD=${PG_PASS}
REDIS_HOST=vx-platform-redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASS}
JWT_SECRET=${JWT_SECRET}
AUTH_INTERNAL_TOKEN=${AUTH_INTERNAL_TOKEN}
COOKIE_DOMAIN_PLATFORM=.vxture.com
WEBSITE_BASE_URL=https://vxture.com
CONSOLE_BASE_URL=https://console.vxture.com"

# ─ website-bff ──────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.website-bff" "NODE_ENV=production
WEBSITE_BFF_PORT=3011
DB_HOST=vx-platform-pg
DB_PORT=5432
DB_NAME=platform_main
DB_USER=vxture
DB_PASSWORD=${PG_PASS}
REDIS_HOST=vx-platform-redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASS}
JWT_SECRET=${JWT_SECRET}
AUTH_BFF_URL=http://vx-auth-bff:3090
ALLOWED_ORIGIN=https://vxture.com"

# ─ console-bff ──────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.console-bff" "NODE_ENV=production
CONSOLE_BFF_PORT=3021
DB_HOST=vx-platform-pg
DB_PORT=5432
DB_NAME=platform_main
DB_USER=vxture
DB_PASSWORD=${PG_PASS}
REDIS_HOST=vx-platform-redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASS}
JWT_SECRET=${JWT_SECRET}
AUTH_BFF_URL=http://vx-auth-bff:3090
ALLOWED_ORIGIN=https://console.vxture.com
AI_GATEWAY_URL=http://vx-ai-gateway:3100"

# ─ admin-bff ────────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.admin-bff" "NODE_ENV=production
ADMIN_BFF_PORT=3031
DB_HOST=vx-platform-pg
DB_PORT=5432
DB_NAME=platform_main
DB_USER=vxture
DB_PASSWORD=${PG_PASS}
REDIS_HOST=vx-platform-redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASS}
JWT_SECRET=${JWT_SECRET}
AUTH_INTERNAL_TOKEN=${AUTH_INTERNAL_TOKEN}
AUTH_BFF_URL=http://vx-auth-bff:3090
ALLOWED_ORIGIN=https://admin.vxture.com"

# ─ ai-gateway ───────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.ai-gateway" "NODE_ENV=production
AI_GATEWAY_PORT=3100
DATABASE_URL=postgresql://vxture:${PG_PASS}@vx-platform-pg:5432/platform_main"

# ─ gateway-bff ──────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.gateway-bff" "NODE_ENV=production
GATEWAY_PORT=8000
WEBSITE_BFF_ORIGIN=http://vx-website-bff:3011
CONSOLE_BFF_ORIGIN=http://vx-console-bff:3021
ADMIN_BFF_ORIGIN=http://vx-admin-bff:3031
AUTH_BFF_ORIGIN=http://vx-auth-bff:3090
GATEWAY_ALLOWED_ORIGINS=https://vxture.com,https://console.vxture.com,https://admin.vxture.com"

echo ""
echo "=== Done. Files created: ==="
ls -la "$PLATFORM_DIR"/.env*
echo ""
echo "Shared secrets saved to: $SHARED_SECRETS_FILE"
echo "(Back this file up securely if you need to recreate env files later)"
