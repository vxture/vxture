# 部署检查清单

> 更新：2026-05-15
> 依赖文档：[`00-overview.md`](00-overview.md) · [`04-services.md`](04-services.md) · [`01-environments.md`](01-environments.md)

---

## 一、部署前检查

### 1.1 代码与构建

- [ ] `main` 分支已合并所有计划变更，无未审核 PR
- [ ] `pnpm type-check`（各包）无类型错误
- [ ] `pnpm lint`（根目录递归）无 lint 错误
- [ ] `pnpm build`（受影响的包）本地构建成功

### 1.2 数据库

- [ ] 所有 Prisma migration 脚本已提交（`prisma migrate diff` 无未提交变更）
- [ ] 迁移在 staging / 开发环境验证通过
- [ ] 若有破坏性变更（删列/重命名），已准备数据回填脚本
- [ ] 已对 `vx-platform-pg` 做快照（阿里云云盘 → 手动快照）

### 1.3 环境变量

- [ ] worker-01 `.env.production` 中以下必填变量均已设置：
  - `JWT_SECRET`（≥32 位）
  - `DATABASE_URL`（指向 `vx-platform-pg`）
  - `REDIS_URL`（指向 `vx-platform-redis`）
  - `AUTH_INTERNAL_TOKEN`
  - `SMTP_PASS`
  - `AUTH_COOKIE_DOMAIN=.vxture.com`
- [ ] worker-02 `.env.production` 中 AI/Agent 相关变量均已设置：
  - `DOUBAO_API_KEY` 或其他 LLM provider key
  - `VELA_PLATFORM_LLM_TENANT_ID`
- [ ] 新增变量已同步到 `.env.example`

### 1.4 DNS / Nginx

- [ ] Cloudflare DNS 记录正确（参考 [`subdomain-dns.md`](subdomain-dns.md)）
- [ ] Nginx 配置语法检查：`nginx -t`
- [ ] SSL 证书有效期 > 30 天（Let's Encrypt 自动续期或手动确认）

---

## 二、部署步骤（按顺序执行）

### worker-01（平台控制面）

```bash
cd deploy/worker-01

# 1. 拉取最新镜像
docker compose -f compose.platform.yml pull

# 2. 运行数据库迁移（若有 schema 变更）
pnpm --filter @vxture/core-database migrate:deploy
# 首次上线（历史库标记 baseline）：
# npx prisma migrate resolve --applied "0001_schema_migration" --schema=packages/core/database/prisma/schema.prisma

# 3. 滚动重启平台服务（逐个，避免全量停机）
docker compose -f compose.platform.yml up -d --no-deps auth-bff
docker compose -f compose.platform.yml up -d --no-deps website-bff
docker compose -f compose.platform.yml up -d --no-deps console-bff
docker compose -f compose.platform.yml up -d --no-deps admin-bff
docker compose -f compose.platform.yml up -d --no-deps website
docker compose -f compose.platform.yml up -d --no-deps console
docker compose -f compose.platform.yml up -d --no-deps admin

# 4. 重载 Nginx（仅在配置有变更时）
docker exec vx-nginx nginx -s reload
```

### worker-02（业务执行面）

```bash
# 通过 Tailscale SSH 连接 worker-02
ssh vxture-worker-02

cd deploy/worker-02

# Vela 相关
docker compose -f compose.vela.prod.yml up -d --no-deps vela-bff
docker compose -f compose.vela.prod.yml up -d --no-deps vela-server

# Ruyin 相关（如有更新）
docker compose -f compose.ruyin.prod.yml up -d --no-deps ruyin-bff
docker compose -f compose.ruyin.prod.yml up -d --no-deps ruyin-server
```

---

## 三、部署后验证

### 3.1 健康检查

- [ ] `GET https://vxture.com/` → HTTP 200
- [ ] `GET https://console.vxture.com/` → 重定向到登录页
- [ ] `GET https://admin.vxture.com/` → 重定向到登录页
- [ ] `GET https://vxture.com/api/health` → `{ status: 'ok' }`（gateway-bff）
- [ ] `POST https://api.vxture.com/auth-api/auth/signin` → 正常响应（不报 500）

### 3.2 核心流程验证

- [ ] 用户注册流程：发送验证码 → 收到邮件 → 注册成功
- [ ] 用户登录：正常登录，JWT Cookie 设置正确
- [ ] Console 首页加载：无接口 500 错误
- [ ] Admin 登录：operator 账号可正常登录

### 3.3 Vela 流式接口（worker-02）

- [ ] `GET https://vela.vxture.com/vela/chat`（SSE）→ 有流式响应
- [ ] admin 侧边栏 Vela 面板可正常发起对话

### 3.4 日志检查

```bash
# 检查各服务最新日志，关注 ERROR 级别
docker logs vx-website-bff --tail 100 | grep -i error
docker logs vx-auth-bff --tail 100 | grep -i error
docker logs vx-vela-server-prod --tail 100 | grep -i error
```

---

## 四、回滚预案

### 快速回滚（镜像级别）

```bash
# 回滚到上一个镜像版本（worker-01）
docker compose -f docker-compose.worker01.yml up -d --no-deps vx-website-bff:<previous-tag>
# 其他服务同理，替换服务名和 tag
```

### 数据库回滚

- 若 migration 有破坏性变更，需预先准备 down migration 脚本
- 从阿里云云盘快照恢复 `vx-platform-pg`：
  1. 停止所有连接 `vx-platform-pg` 的服务
  2. 阿里云控制台 → 云盘 → 快照 → 回滚
  3. 重启数据库容器
  4. 重启依赖服务

### 回滚后验证

- [ ] 重跑三、健康检查部分
- [ ] 确认报警静默（若有 Sentry / 监控）

---

## 五、上线后持续监控（24h）

| 项目 | 检查方式 |
|------|---------|
| 错误率 | `docker logs` / Sentry DSN |
| 邮件发送 | 测试注册/密码重置流程 |
| Redis 可用 | `docker exec vx-platform-redis redis-cli ping` |
| DB 连接池 | 检查 BFF 日志中 pg-pool 警告 |
| SSE 连接 | Vela 面板持续对话 5 分钟无断连 |
