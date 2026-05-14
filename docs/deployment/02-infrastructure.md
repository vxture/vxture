# 基础设施配置

> 运维操作参考：Nginx / PostgreSQL / Redis / Docker volume 映射
> 更新：2026-05-11

---

> 节点规格与 Tailscale IP 见 [`docs/deployment/00-overview.md` § 节点信息](00-overview.md)。

---

## Nginx（worker-01）

### 容器启动

```bash
docker run -d \
  --name vx-nginx \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /data/nginx/conf/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v /data/nginx/conf/sites-enabled:/etc/nginx/sites-enabled:ro \
  -v /data/nginx/conf/snippets:/etc/nginx/snippets:ro \
  -v /data/nginx/ssl:/etc/nginx/ssl:ro \
  -v /data/nginx/logs:/var/log/nginx \
  --network vx-platform \
  nginx:alpine
```

### 目录结构

```
/data/nginx/
├── conf/
│   ├── nginx.conf
│   ├── sites-enabled/
│   │   ├── vxture.com.conf       ← website portal (3010)
│   │   ├── console.conf          ← console portal (3020)
│   │   ├── admin.conf            ← admin portal (3030)
│   │   ├── api.conf              ← gateway-bff (8000)
│   │   └── ruyin.conf            ← proxy → worker-02:3111（Tailscale）
│   └── snippets/
│       ├── ssl-params.conf       ← TLS 版本、cipher suite
│       └── proxy-params.conf     ← proxy_set_header 公共参数
├── ssl/
│   ├── vxture.com.crt            ← 通配符证书
│   └── vxture.com.key            ← 私钥（chmod 600）
└── logs/

```

### Nginx 配置片段

```nginx
# /data/nginx/conf/sites-enabled/vxture.com.conf
server {
    listen 443 ssl;
    server_name vxture.com www.vxture.com;
    include snippets/ssl-params.conf;
    ssl_certificate     /etc/nginx/ssl/vxture.com.crt;
    ssl_certificate_key /etc/nginx/ssl/vxture.com.key;
    location / {
        include snippets/proxy-params.conf;
        proxy_pass http://vx-website:3010;
    }
}

# /data/nginx/conf/sites-enabled/api.conf
# api.vxture.com → gateway-bff（所有前端 API 统一入口）
server {
    listen 443 ssl;
    server_name api.vxture.com;
    include snippets/ssl-params.conf;
    ssl_certificate     /etc/nginx/ssl/vxture.com.crt;
    ssl_certificate_key /etc/nginx/ssl/vxture.com.key;
    location / {
        include snippets/proxy-params.conf;
        proxy_pass http://vx-gateway-bff:8000;
        # gateway-bff 按路径前缀转发到各 BFF
        # /website-api/* → vx-website-bff:3011
        # /console-api/* → vx-console-bff:3021
        # /admin-api/*   → vx-admin-bff:3031
        # /auth-api/*    → vx-auth-bff:3090
    }
}

# /data/nginx/conf/sites-enabled/ruyin.conf
# worker-01 → worker-02（Tailscale 内网，备用路径）
server {
    listen 443 ssl;
    server_name ruyin.vxture.com;
    include snippets/ssl-params.conf;
    ssl_certificate     /etc/nginx/ssl/vxture.com.crt;
    ssl_certificate_key /etc/nginx/ssl/vxture.com.key;
    location / {
        include snippets/proxy-params.conf;
        proxy_pass http://100.76.219.48:3111;  # ruyin-bff prod（Tailscale）
    }
}
```

> `ruyin.vxture.com` 主路径走 Cloudflare Tunnel 直连 worker-02，Nginx 配置作为备用通道。

**Cloudflare SSL 模式**：必须设置为 **Full (strict)**。

---

## 平台数据库（worker-01）

### PostgreSQL — platform_main

worker-01 运行**一个** PostgreSQL 实例，包含所有平台 schema，仅 prod，无 beta。

```bash
docker run -d \
  --name vx-platform-pg \
  --restart unless-stopped \
  --network vx-platform \
  -e POSTGRES_USER=vxture \
  -e POSTGRES_PASSWORD_FILE=/run/secrets/platform_pg_password \
  -e POSTGRES_DB=platform_main \
  -v /data/platform/db/postgres:/var/lib/postgresql/data \
  postgres:17-alpine
# 不对外暴露端口，仅 vx-platform Docker network 内访问
```

**Schema 分布：**

| Schema | 管理方 | 主要表 |
|--------|--------|--------|
| `account` | website-bff | users, credentials, oauth_connections |
| `tenancy` | website-bff / console-bff | tenants, tenant_members, roles |
| `product` | admin-bff | products, plans, capabilities |
| `platform` | admin-bff | platform_admins, configs, feature_flags |
| `commerce` | admin-bff / console-bff | orders, invoices, payments, subscriptions, usage |
| `support` | admin-bff | tickets, ticket_messages |

### Redis — platform

```bash
docker run -d \
  --name vx-platform-redis \
  --restart unless-stopped \
  --network vx-platform \
  -v /data/platform/db/redis:/data \
  redis:8-alpine \
  redis-server --appendonly yes --requirepass "${PLATFORM_REDIS_PASSWORD}"
# 不对外暴露端口
```

**Platform Redis 用途：**

| Key 前缀 | 用途 | 管理方 |
|---------|------|--------|
| `refresh:*` | JWT Refresh Token | auth-bff |
| `blacklist:*` | 已吊销 Access Token | auth-bff |
| `crossdomain:*` | 跨域一次性 SSO Token（TTL 30s） | auth-bff |
| `vc:*` | 邮件验证码 + 限流 | website-bff |
| `svc:*` | 短信验证码 + 限流 | website-bff |

---

## 数据目录初始化

### worker-01（首次部署）

```bash
sudo mkdir -p \
  /data/nginx/conf/sites-enabled \
  /data/nginx/conf/snippets \
  /data/nginx/ssl \
  /data/nginx/logs \
  /data/platform/db/postgres \
  /data/platform/db/redis \
  /data/platform/backups \
  /data/platform/logs

# PostgreSQL 权限（UID 999）
sudo chown -R 999:999 /data/platform/db/postgres
sudo chmod 700 /data/platform/db/postgres

# Redis 权限（UID 999）
sudo chown -R 999:999 /data/platform/db/redis

# SSL 私钥保护
sudo chmod 600 /data/nginx/ssl/*.key
```

### worker-02（首次部署，按业务初始化）

```bash
# 示例：为 vela 和 ruyin 初始化目录
for BIZ in vela ruyin; do
  for ENV in prod beta; do
    sudo mkdir -p /data/${BIZ}/${ENV}/postgres
    sudo mkdir -p /data/${BIZ}/${ENV}/redis
    sudo chown -R 999:999 /data/${BIZ}/${ENV}/postgres
    sudo chown -R 999:999 /data/${BIZ}/${ENV}/redis
    sudo chmod 700 /data/${BIZ}/${ENV}/postgres
  done
done

# ai-gateway 独立数据库
sudo mkdir -p /data/ai-gateway/postgres
sudo chown -R 999:999 /data/ai-gateway/postgres
sudo chmod 700 /data/ai-gateway/postgres

# 运维脚本目录
sudo mkdir -p /data/ops/scripts
```

### Docker 网络创建

```bash
# worker-01
docker network create vx-platform

# worker-02（每个业务独立网络）
docker network create vx-vela-prod
docker network create vx-vela-beta
docker network create vx-ruyin-prod
docker network create vx-ruyin-beta
docker network create vx-ai-gateway
```

---

## 业务数据库（worker-02）

每个业务独立 PostgreSQL 实例（prod + beta 各一个）：

```bash
# 示例：Vela prod
docker run -d \
  --name vx-vela-pg-prod \
  --restart unless-stopped \
  --network vx-vela-prod \
  -e POSTGRES_USER=vela \
  -e POSTGRES_DB=vela_prod \
  -e POSTGRES_PASSWORD_FILE=/run/secrets/vela_prod_pg_password \
  -v /data/vela/prod/postgres:/var/lib/postgresql/data \
  postgres:17-alpine

# 示例：Vela beta
docker run -d \
  --name vx-vela-pg-beta \
  --restart unless-stopped \
  --network vx-vela-beta \
  -e POSTGRES_USER=vela \
  -e POSTGRES_DB=vela_beta \
  -e POSTGRES_PASSWORD_FILE=/run/secrets/vela_beta_pg_password \
  -v /data/vela/beta/postgres:/var/lib/postgresql/data \
  postgres:17-alpine
```

**prod / beta 完全物理隔离**：独立 PostgreSQL 实例、独立 Redis 实例、独立 Docker network。

---

## 平台数据库备份（worker-01）

### 自动备份脚本

`/data/platform/backups/backup.sh`：

```bash
#!/bin/bash
set -euo pipefail
DATE=$(date +%Y%m%d_%H%M)
BACKUP_DIR=/data/platform/backups

# PostgreSQL full dump
docker exec vx-platform-pg pg_dump -U vxture platform_main \
  | gzip > "${BACKUP_DIR}/pg_${DATE}.sql.gz"

# Redis RDB snapshot
docker exec vx-platform-redis redis-cli -a "${PLATFORM_REDIS_PASSWORD}" BGSAVE
sleep 3
cp /data/platform/db/redis/dump.rdb "${BACKUP_DIR}/redis_${DATE}.rdb"

# 保留 7 天本地备份
find "${BACKUP_DIR}" -name "*.sql.gz" -o -name "*.rdb" | sort | head -n -14 | xargs -r rm

# 同步到阿里云 OSS（需配置 ossutil）
# ossutil cp -r ${BACKUP_DIR}/ oss://vxture-backups/platform/
```

```bash
# crontab -e（每天凌晨 2:00）
0 2 * * * /data/platform/backups/backup.sh >> /data/platform/backups/backup.log 2>&1
```

### 阿里云 ESSD 快照

在阿里云控制台为 `/data` 所在的 ESSD 设置自动快照策略：
- 频率：每日凌晨 3:00
- 保留：7 天
- 注意：快照与 pg_dump 互补（快照可快速回滚磁盘，pg_dump 可细粒度恢复数据）

---

## 内存优化建议（worker-01）

worker-01 内存 2G，运行约 11 个容器，建议：

```bash
# 开启 2G swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 减少 swap 激进性（推荐值 10，低内存时才用 swap）
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

各容器设置内存上限（`--memory`）防止单容器吃满内存导致 OOM：

| 容器 | 建议上限 |
|------|---------|
| platform-postgres | 400MB |
| platform-redis | 128MB |
| nginx | 64MB |
| website / console / admin | 各 256MB |
| website-bff / console-bff / admin-bff | 各 192MB |
| auth-bff | 128MB |
| gateway-bff | 64MB |

---

## 参考文档

- `docs/deployment/00-overview.md` — 架构总览（AI Coding 参考）
- `docs/deployment/04-services.md` — Docker Compose 编排
- `docs/deployment/05-ci-cd.md` — CI/CD 流水线
