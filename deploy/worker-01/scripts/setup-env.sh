#!/bin/bash
# setup-env.sh — 在 worker-01 上初始化平台密钥与 env 文件
# 运行一次即可，支持幂等重运行（已存在的文件不覆盖）
set -euo pipefail

PLATFORM_DIR=/srv/vxture/repo/deploy/worker-01
SECRETS_DIR="$PLATFORM_DIR/secrets"
PLATFORM_ENV="$SECRETS_DIR/platform.env"
PG_PASSWORD_FILE="$SECRETS_DIR/pg-password"

echo "=== Vxture Platform Env Setup ==="

mkdir -p "$SECRETS_DIR"

# ── 工具函数 ─────────────────────────────────────────────────────────────────

# 从文件读取或生成随机值，结果写入文件，返回纯净值（无额外输出）
file_get_or_generate() {
  local file="$1"
  local len="${2:-32}"
  if [ -f "$file" ] && [ -s "$file" ]; then
    cat "$file"
  else
    local val
    val=$(openssl rand -hex "$len")
    printf '%s' "$val" > "$file"
    chmod 600 "$file"
    echo "[OK] Generated: $file" >&2
    printf '%s' "$val"
  fi
}

# 从 platform.env 读取或生成密钥，追加到文件
env_get_or_generate() {
  local key="$1"
  local len="${2:-32}"
  local existing
  existing=$(grep "^${key}=" "$PLATFORM_ENV" 2>/dev/null | cut -d= -f2- || true)
  if [ -z "$existing" ]; then
    existing=$(openssl rand -hex "$len")
    echo "${key}=${existing}" >> "$PLATFORM_ENV"
    echo "[OK] Generated $key" >&2
  fi
  printf '%s' "$existing"
}

write_env() {
  local file="$1"
  local content="$2"
  if [ -f "$file" ] && [ -s "$file" ]; then
    echo "[SKIP] Already exists: $file" >&2
    return
  fi
  printf '%s\n' "$content" > "$file"
  chmod 600 "$file"
  echo "[OK] Written: $file" >&2
}

# ── 1. Postgres 密码 ─────────────────────────────────────────────────────────
PG_PASS=$(file_get_or_generate "$PG_PASSWORD_FILE" 20)
echo "[OK] Postgres password ready (${#PG_PASS} chars)"

# ── 2. Redis 密码（写入 .env 供 compose YAML 插值，同时写入 platform.env）────
REDIS_PASS=$(env_get_or_generate "REDIS_PASSWORD" 24)
write_env "$PLATFORM_DIR/.env" "# compose.platform.yml 中 redis service 命令插值用
REDIS_PASSWORD=${REDIS_PASS}"
echo "[OK] Redis password ready"

# ── 3. 平台共享密钥 ──────────────────────────────────────────────────────────
JWT_SECRET=$(env_get_or_generate "JWT_SECRET" 32)
AUTH_INTERNAL_TOKEN=$(env_get_or_generate "AUTH_INTERNAL_TOKEN" 24)

# 补充 platform.env 中的 composite URL（幂等：已存在则跳过）
if ! grep -q "^DATABASE_URL=" "$PLATFORM_ENV" 2>/dev/null; then
  echo "DATABASE_URL=postgresql://vxture:${PG_PASS}@vx-platform-pg:5432/platform_main" >> "$PLATFORM_ENV"
  echo "[OK] DATABASE_URL written to platform.env" >&2
fi
if ! grep -q "^REDIS_URL=" "$PLATFORM_ENV" 2>/dev/null; then
  echo "REDIS_URL=redis://:${REDIS_PASS}@vx-platform-redis:6379" >> "$PLATFORM_ENV"
  echo "[OK] REDIS_URL written to platform.env" >&2
fi
chmod 600 "$PLATFORM_ENV"
echo "[OK] secrets/platform.env ready"

# ── 4. 各 BFF 服务 env 文件（仅服务专属配置，平台密钥由 platform.env 注入）───

# ─ auth-bff ──────────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.auth-bff" "NODE_ENV=production
AUTH_BFF_PORT=3090
DB_POOL_MAX=10
JWT_ACCESS_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d
AUTH_COOKIE_DOMAIN=.vxture.com
WEBSITE_BASE_URL=https://vxture.com
CONSOLE_BASE_URL=https://console.vxture.com
ADMIN_BASE_URL=https://admin.vxture.com
# ── Cloudflare Turnstile ──────────────────────────────────────────────────────
CF_TURNSTILE_ENABLED=true
CF_TURNSTILE_TENANT_SECRET_KEY=CHANGE_ME
CF_TURNSTILE_TENANT_ALLOWED_HOSTNAMES=vxture.com,ruyin.ai
CF_TURNSTILE_ADMIN_SECRET_KEY=CHANGE_ME
CF_TURNSTILE_ADMIN_ALLOWED_HOSTNAMES=admin.vxture.com
# ── 邮件 ──────────────────────────────────────────────────────────────────────
SMTP_HOST=smtpdm.aliyun.com
SMTP_PORT=465
SMTP_USER=no-reply@mail.vxture.com
SMTP_PASS=CHANGE_ME
SMTP_FROM=Vxture Studio <no-reply@mail.vxture.com>
# ── OAuth — 钉钉 ──────────────────────────────────────────────────────────────
DINGTALK_APP_KEY=CHANGE_ME
DINGTALK_APP_SECRET=CHANGE_ME
DINGTALK_CALLBACK_TOKEN=CHANGE_ME
DINGTALK_CALLBACK_AES_KEY=CHANGE_ME
DINGTALK_REDIRECT_URI=https://api.vxture.com/auth-api/auth/oauth/dingtalk/callback
# ── OAuth — 飞书 ──────────────────────────────────────────────────────────────
FEISHU_APP_ID=CHANGE_ME
FEISHU_APP_SECRET=CHANGE_ME
FEISHU_REDIRECT_URI=https://api.vxture.com/auth-api/auth/oauth/feishu/callback"

# ─ website-bff ───────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.website-bff" "NODE_ENV=production
WEBSITE_BFF_PORT=3011
DB_POOL_MAX=10
JWT_ACCESS_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d
AUTH_COOKIE_DOMAIN=.vxture.com
AUTH_BFF_URL=http://vx-auth-bff:3090
WEBSITE_BASE_URL=https://vxture.com
CONSOLE_BASE_URL=https://console.vxture.com
# ── Cloudflare Turnstile ──────────────────────────────────────────────────────
CF_TURNSTILE_ENABLED=true
CF_TURNSTILE_TENANT_SECRET_KEY=CHANGE_ME
CF_TURNSTILE_TENANT_ALLOWED_HOSTNAMES=vxture.com,ruyin.ai
# ── 邮件 ──────────────────────────────────────────────────────────────────────
SMTP_HOST=smtpdm.aliyun.com
SMTP_PORT=465
SMTP_USER=no-reply@mail.vxture.com
SMTP_PASS=CHANGE_ME
SMTP_FROM=Vxture Studio <no-reply@mail.vxture.com>
# ── OAuth — 钉钉 ──────────────────────────────────────────────────────────────
DINGTALK_APP_KEY=CHANGE_ME
DINGTALK_APP_SECRET=CHANGE_ME
DINGTALK_CALLBACK_TOKEN=CHANGE_ME
DINGTALK_CALLBACK_AES_KEY=CHANGE_ME
DINGTALK_REDIRECT_URI=https://api.vxture.com/auth-api/auth/oauth/dingtalk/callback
# ── OAuth — 飞书 ──────────────────────────────────────────────────────────────
FEISHU_APP_ID=CHANGE_ME
FEISHU_APP_SECRET=CHANGE_ME
FEISHU_REDIRECT_URI=https://api.vxture.com/auth-api/auth/oauth/feishu/callback"

# ─ console-bff ───────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.console-bff" "NODE_ENV=production
CONSOLE_BFF_PORT=3021
DB_POOL_MAX=10
JWT_ACCESS_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d
AUTH_COOKIE_DOMAIN=.vxture.com
AUTH_BFF_URL=http://vx-auth-bff:3090
AI_GATEWAY_URL=http://vx-ai-gateway:3100
# ── 邮件（订阅变更通知）──────────────────────────────────────────────────────
SMTP_HOST=smtpdm.aliyun.com
SMTP_PORT=465
SMTP_USER=no-reply@mail.vxture.com
SMTP_PASS=CHANGE_ME
SMTP_FROM=Vxture Studio <no-reply@mail.vxture.com>"

# ─ admin-bff ─────────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.admin-bff" "NODE_ENV=production
ADMIN_BFF_PORT=3031
DB_POOL_MAX=10
JWT_ACCESS_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d
AUTH_COOKIE_DOMAIN=.vxture.com
AUTH_BFF_URL=http://vx-auth-bff:3090
# ── 邮件（付款核销/驳回通知）─────────────────────────────────────────────────
SMTP_HOST=smtpdm.aliyun.com
SMTP_PORT=465
SMTP_USER=no-reply@mail.vxture.com
SMTP_PASS=CHANGE_ME
SMTP_FROM=Vxture Studio <no-reply@mail.vxture.com>"

# ─ ai-gateway ────────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.ai-gateway" "NODE_ENV=production
AI_GATEWAY_PORT=3100
# Provider API Keys（按实际接入的模型填写）
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# DOUBAO_API_KEY=..."

# ─ gateway-bff ───────────────────────────────────────────────────────────────
write_env "$PLATFORM_DIR/.env.gateway-bff" "NODE_ENV=production
GATEWAY_PORT=8000
WEBSITE_BFF_ORIGIN=http://vx-website-bff:3011
CONSOLE_BFF_ORIGIN=http://vx-console-bff:3021
ADMIN_BFF_ORIGIN=http://vx-admin-bff:3031
AUTH_BFF_ORIGIN=http://vx-auth-bff:3090
GATEWAY_ALLOWED_ORIGINS=https://vxture.com,https://www.vxture.com,https://console.vxture.com,https://admin.vxture.com"

echo ""
echo "=== Done ==="
echo ""
echo "secrets/pg-password      — Postgres 密码（Docker secrets 挂载）"
echo "secrets/platform.env     — 平台共享密钥（DATABASE_URL / REDIS_URL / JWT / AUTH_TOKEN）"
echo ".env                     — Redis 密码（compose YAML 插值用）"
echo ".env.*                   — 各服务配置（CHANGE_ME 字段需手动填写）"
echo ""
echo "下一步：grep -r CHANGE_ME $PLATFORM_DIR/.env.*"
