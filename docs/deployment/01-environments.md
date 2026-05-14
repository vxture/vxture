# 环境变量矩阵

> 所有服务的环境变量定义。符号说明：✅ 必填（缺失则启动失败）· ⚪ 可选（有默认值）· — 不需要
> 更新：2026-05-11

---

## 一、worker-01 — 平台层

### auth-bff（JWT 唯一签发源 + OAuth 回调处理）

| 变量 | 必填 | 说明 |
|------|------|------|
| `JWT_SECRET` | ✅ | JWT 签名密钥，≥ 32 位随机字符串，所有服务共享同一个值 |
| `JWT_ACCESS_EXPIRES_IN` | ⚪ | Access Token 过期时长（默认 15m） |
| `JWT_REFRESH_EXPIRES_IN` | ⚪ | Refresh Token 过期时长（默认 7d） |
| `SESSION_IDLE_TIMEOUT` | ⚪ | 空闲超时秒数（默认 14400，即 4h；0 表示禁用）|
| `REDIS_URL` | ✅ | 指向 vx-platform-redis（OAuth state 存储 + Token 黑名单） |
| `AUTH_BFF_PORT` | ⚪ | 默认 3090 |
| `AUTH_COOKIE_DOMAIN` | ✅ | `.vxture.com`（平台域）或 `.ruyin.ai`（业务域） |
| `AUTH_INTERNAL_TOKEN` | ✅ | 内部服务调用凭证（`x-vxture-internal-auth` 请求头值） |
| `DINGTALK_APP_KEY` | ✅ | 钉钉 OAuth 应用 Key |
| `DINGTALK_APP_SECRET` | ✅ | 钉钉 OAuth 密钥 |
| `DINGTALK_REDIRECT_URI` | ✅ | `https://api.vxture.com/auth-api/auth/oauth/dingtalk/callback` |
| `FEISHU_APP_ID` | ✅ | 飞书 OAuth 应用 ID |
| `FEISHU_APP_SECRET` | ✅ | 飞书 OAuth 密钥 |
| `FEISHU_REDIRECT_URI` | ✅ | `https://api.vxture.com/auth-api/auth/oauth/feishu/callback` |

### website-bff

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | `postgresql://vxture:***@vx-platform-pg:5432/platform_main?schema=account` |
| `REDIS_URL` | ✅ | 指向 vx-platform-redis |
| `AUTH_BFF_URL` | ✅ | `http://vx-auth-bff:3090`（同网络直连） |
| `WEBSITE_BFF_PORT` | ⚪ | 默认 3011 |
| `WEBSITE_BASE_URL` | ✅ | `https://vxture.com` |
| `CONSOLE_BASE_URL` | ✅ | `https://console.vxture.com` |
| `AUTH_COOKIE_DOMAIN` | ✅ | `.vxture.com` |
| `SMTP_HOST` | ✅ | 阿里云 SMTP（`smtpdm.aliyun.com`） |
| `SMTP_PORT` | ✅ | `465` |
| `SMTP_USER` | ✅ | 发件地址 |
| `SMTP_PASS` | ✅ | SMTP 密码 |
| `SMTP_FROM` | ⚪ | 发件人名称，默认同 SMTP_USER |

### console-bff

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | platform_main，schema=tenancy（含 commerce） |
| `REDIS_URL` | ✅ | 指向 vx-platform-redis |
| `AUTH_BFF_URL` | ✅ | `http://vx-auth-bff:3090` |
| `CONSOLE_BFF_PORT` | ⚪ | 默认 3021 |
| `AUTH_COOKIE_DOMAIN` | ✅ | `.vxture.com` |

### admin-bff

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | platform_main，schema=platform（含 product / commerce / support） |
| `AUTH_BFF_URL` | ✅ | `http://vx-auth-bff:3090` |
| `ADMIN_BFF_PORT` | ⚪ | 默认 3031 |
| `AUTH_COOKIE_DOMAIN` | ✅ | `.vxture.com` |

### gateway-bff

| 变量 | 必填 | 说明 |
|------|------|------|
| `GATEWAY_PORT` | ⚪ | 默认 8000 |
| `AUTH_BFF_ORIGIN` | ✅ | `http://vx-auth-bff:3090`（`/auth-api/*` 路由目标） |
| `WEBSITE_BFF_ORIGIN` | ✅ | `http://vx-website-bff:3011`（`/website-api/*` 路由目标） |
| `CONSOLE_BFF_ORIGIN` | ✅ | `http://vx-console-bff:3021`（`/console-api/*` 路由目标） |
| `ADMIN_BFF_ORIGIN` | ✅ | `http://vx-admin-bff:3031`（`/admin-api/*` 路由目标） |
| `GATEWAY_ALLOWED_ORIGINS` | ✅ | 逗号分隔的允许 Origin（`https://vxture.com,https://console.vxture.com,https://admin.vxture.com`） |

### Next.js 门户（website / console / admin）

| 变量 | 必填 | 说明 | 注入时机 |
|------|------|------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://api.vxture.com` | 构建时 |
| `NEXT_PUBLIC_APP_URL` | ✅ | 各自域名 | 构建时 |
| `NODE_ENV` | ✅ | `production` | 运行时 |

---

## 二、worker-02 — 业务层（Vela）

### vela-bff

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | `postgresql://vela:***@vx-vela-pg-prod:5432/vela_prod` |
| `REDIS_URL` | ✅ | 指向 vx-vela-redis-prod |
| `AUTH_BFF_URL` | ✅ | `http://100.100.197.42:3090`（Tailscale，跨节点） |
| `VELA_SERVER_INTERNAL_URL` | ✅ | `http://vx-vela-server:3122`（容器名，同网络） |
| `VELA_BFF_PORT` | ⚪ | 默认 3121 |
| `VELA_PLATFORM_LLM_TENANT_ID` | ✅ | 平台 AI 租户 ID（ai-gateway 鉴权用） |
| `VELA_DEFAULT_MODEL_CODE` | ✅ | 默认模型代码 |
| `AUTH_COOKIE_DOMAIN` | ✅ | `.vxture.com` |

### vela-server

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | 同 vela-bff（vela_prod） |
| `AI_GATEWAY_URL` | ✅ | `http://host.docker.internal:3100` |
| `VELA_SERVER_PORT` | ⚪ | 默认 3122 |
| `VELA_PLATFORM_LLM_TENANT_ID` | ✅ | |
| `VELA_DEFAULT_MODEL_CODE` | ✅ | |

---

## 三、worker-02 — 业务层（Ruyin）

### ruyin-bff

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | `postgresql://ruyin:***@vx-ruyin-pg-prod:5432/ruyin_prod` |
| `REDIS_URL` | ✅ | 指向 vx-ruyin-redis-prod |
| `AUTH_BFF_URL` | ✅ | `http://100.100.197.42:3090`（Tailscale） |
| `RUYINAGENT_BFF_PORT` | ⚪ | 默认 3111 |
| `AUTH_COOKIE_DOMAIN` | ✅ | `.ruyin.ai`（ruyin.ai 域）或 `.vxture.com` |

### ruyin-server

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | 同 ruyin-bff（ruyin_prod） |
| `REDIS_URL` | ✅ | 同 ruyin-bff（BullMQ 任务队列） |
| `AI_GATEWAY_URL` | ✅ | `http://host.docker.internal:3100` |
| `RUYINAGENT_SERVER_PORT` | ⚪ | 默认 3112 |

---

## 四、worker-02 — 共享基础设施

### ai-gateway

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | `postgresql://aigateway:***@vx-ai-gateway-pg:5432/ai_gateway` |
| `AI_GATEWAY_URL` | ⚪ | 自身端口（默认 3100） |
| `ARK_API_KEY` | ✅ | 字节跳动 ARK 推理平台密钥 |
| `DOUBAO_API_KEY` | ⚪ | Doubao 模型密钥（可选，按实际接入模型） |

---

## 五、Beta 环境变量差异

Beta 容器复用与 prod 相同的变量名，仅变量值不同（指向 beta 数据库/Redis）。

| 变量 | Prod 示例值 | Beta 示例值 |
|------|------------|------------|
| `DATABASE_URL` | `…/vela_prod` | `…/vela_beta` |
| `REDIS_URL` | `redis://:***@vx-vela-redis-prod:6379` | `redis://:***@vx-vela-redis-beta:6379` |
| `AUTH_COOKIE_DOMAIN` | `.vxture.com` | `.vxture.com`（beta 共享根域） |
| `NODE_ENV` | `production` | `production`（beta 也跑生产模式） |

---

## 六、Secrets 管理

生产环境通过 Docker Secrets 传入敏感值，不写入环境变量文件：

```bash
# 创建 secret（示例）
echo "my_password" | docker secret create platform_pg_password -

# Compose 中引用
secrets:
  platform_pg_password:
    external: true
```

本地开发使用 `.env.local`（已加入 `.gitignore`），复制 `.env.local.template` 后填入实际值。
