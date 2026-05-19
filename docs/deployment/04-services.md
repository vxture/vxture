# 服务部署

> Docker Compose 编排结构与服务分配
> 更新：2026-05-11

---

## Compose 文件布局

```
deploy/
├── worker-01/
│   └── compose.platform.yml      ← 全部平台服务（Nginx + 门户 + 平台 BFF + 平台数据库）
└── worker-02/
    ├── compose.ai-gateway.yml    ← AI 网关（所有业务共用）
    ├── compose.vela.prod.yml     ← Vela 生产（bff + server + postgres + redis）
    ├── compose.vela.beta.yml     ← Vela 灰度
    ├── compose.ruyin.prod.yml    ← Ruyin 生产（bff + server + postgres + redis）
    └── compose.ruyin.beta.yml    ← Ruyin 灰度
```

> **设计原则**：worker-01 单文件承载所有平台服务；worker-02 每个业务独立文件，prod / beta 完全物理隔离（独立网络、独立数据库实例）。

---

## worker-01：compose.platform.yml

所有服务共享 `vx-platform` 网络。`auth-bff` 额外绑定宿主端口，以允许 worker-02 各业务 BFF 通过 Tailscale 调用 JWT 验证（UFW 限制只允许 Tailscale 子网 `100.64.0.0/10` 访问）。

```yaml
# deploy/worker-01/compose.platform.yml
name: vx-platform

networks:
  vx-platform:
    name: vx-platform
    driver: bridge

services:
  # ── 数据层 ────────────────────────────────────────────────────────────────

  postgres:
    image: postgres:17-alpine
    container_name: vx-platform-pg
    restart: unless-stopped
    networks: [vx-platform]
    environment:
      POSTGRES_USER: vxture
      POSTGRES_DB: platform_main
      POSTGRES_PASSWORD_FILE: /run/secrets/platform_pg_password
    secrets: [platform_pg_password]
    volumes:
      - /data/platform/db/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vxture -d platform_main"]
      interval: 10s
      timeout: 5s
      retries: 5
    # 不暴露端口到宿主机，仅 vx-platform 网络内访问

  redis:
    image: redis:8-alpine
    container_name: vx-platform-redis
    restart: unless-stopped
    networks: [vx-platform]
    volumes:
      - /data/platform/db/redis:/data
    command: >
      redis-server --appendonly yes
      --requirepass "${PLATFORM_REDIS_PASSWORD}"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${PLATFORM_REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    # 不暴露端口到宿主机

  # ── 门户层 ────────────────────────────────────────────────────────────────

  website:
    image: ghcr.io/vxture/website:latest
    container_name: vx-website
    restart: unless-stopped
    networks: [vx-platform]
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: https://api.vxture.com
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3010/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    # 不暴露端口，nginx 通过容器网络访问

  console:
    image: ghcr.io/vxture/console:latest
    container_name: vx-console
    restart: unless-stopped
    networks: [vx-platform]
    environment:
      NODE_ENV: production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3020/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  admin:
    image: ghcr.io/vxture/admin:latest
    container_name: vx-admin
    restart: unless-stopped
    networks: [vx-platform]
    environment:
      NODE_ENV: production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3030/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  # ── 平台 BFF 层 ──────────────────────────────────────────────────────────

  auth-bff:
    image: ghcr.io/vxture/bff-auth:latest
    container_name: vx-auth-bff
    restart: unless-stopped
    networks: [vx-platform]
    ports:
      - "3090:3090" # UFW 限制仅 Tailscale 子网（100.64.0.0/10）可达
    env_file: .env.auth-bff
    depends_on:
      redis: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3090/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  gateway-bff:
    image: ghcr.io/vxture/bff-gateway:latest
    container_name: vx-gateway-bff
    restart: unless-stopped
    networks: [vx-platform]
    env_file: .env.gateway-bff
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    # 不暴露端口，nginx 通过容器网络访问

  website-bff:
    image: ghcr.io/vxture/bff-website:latest
    container_name: vx-website-bff
    restart: unless-stopped
    networks: [vx-platform]
    env_file: .env.website-bff
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
      auth-bff: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3011/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  console-bff:
    image: ghcr.io/vxture/bff-console:latest
    container_name: vx-console-bff
    restart: unless-stopped
    networks: [vx-platform]
    env_file: .env.console-bff
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
      auth-bff: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3021/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  admin-bff:
    image: ghcr.io/vxture/bff-admin:latest
    container_name: vx-admin-bff
    restart: unless-stopped
    networks: [vx-platform]
    env_file: .env.admin-bff
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
      auth-bff: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3031/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  # ── 接入层 ────────────────────────────────────────────────────────────────

  nginx:
    image: nginx:alpine
    container_name: vx-nginx
    restart: unless-stopped
    networks: [vx-platform]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /data/nginx/conf/nginx.conf:/etc/nginx/nginx.conf:ro
      - /data/nginx/conf/sites-enabled:/etc/nginx/sites-enabled:ro
      - /data/nginx/conf/snippets:/etc/nginx/snippets:ro
      - /data/nginx/ssl:/etc/nginx/ssl:ro
      - /data/nginx/logs:/var/log/nginx
    depends_on:
      - website
      - console
      - admin
      - gateway-bff
      - website-bff
      - console-bff
      - admin-bff

secrets:
  platform_pg_password:
    file: ./secrets/platform_pg_password.txt
```

---

## worker-02：compose.ai-gateway.yml

ai-gateway 对所有业务共用，先于业务服务启动。各业务 server 通过宿主机 `host.docker.internal:3100` 访问它。

```yaml
# deploy/worker-02/compose.ai-gateway.yml
name: vx-ai-gateway

networks:
  vx-ai-gateway:
    name: vx-ai-gateway
    driver: bridge

services:
  postgres:
    image: postgres:17-alpine
    container_name: vx-ai-gateway-pg
    restart: unless-stopped
    networks: [vx-ai-gateway]
    environment:
      POSTGRES_USER: aigateway
      POSTGRES_DB: ai_gateway
      POSTGRES_PASSWORD_FILE: /run/secrets/ai_gateway_pg_password
    secrets: [ai_gateway_pg_password]
    volumes:
      - /data/ai-gateway/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aigateway -d ai_gateway"]
      interval: 10s
      timeout: 5s
      retries: 5

  ai-gateway:
    image: ghcr.io/vxture/service-ai-gateway:latest
    container_name: vx-ai-gateway
    restart: unless-stopped
    networks: [vx-ai-gateway]
    ports:
      - "127.0.0.1:3100:3100" # 业务 server 通过 host.docker.internal:3100 访问
    env_file: .env.ai-gateway
    depends_on:
      postgres: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3100/health"]
      interval: 30s
      timeout: 5s
      retries: 3

secrets:
  ai_gateway_pg_password:
    file: ./secrets/ai_gateway_pg_password.txt
```

---

## worker-02：compose.vela.prod.yml（业务 Compose 模板）

以下以 Vela prod 为例，其他业务按相同结构创建独立文件，替换 `vela` / 端口号 / 数据目录。

```yaml
# deploy/worker-02/compose.vela.prod.yml
name: vx-vela-prod

networks:
  vx-vela-prod:
    name: vx-vela-prod
    driver: bridge

services:
  postgres:
    image: postgres:17-alpine
    container_name: vx-vela-pg-prod
    restart: unless-stopped
    networks: [vx-vela-prod]
    environment:
      POSTGRES_USER: vela
      POSTGRES_DB: vela_prod
      POSTGRES_PASSWORD_FILE: /run/secrets/vela_prod_pg_password
    secrets: [vela_prod_pg_password]
    volumes:
      - /data/vela/prod/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vela -d vela_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:8-alpine
    container_name: vx-vela-redis-prod
    restart: unless-stopped
    networks: [vx-vela-prod]
    volumes:
      - /data/vela/prod/redis:/data
    command: >
      redis-server --appendonly yes
      --requirepass "${VELA_PROD_REDIS_PASSWORD}"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${VELA_PROD_REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  vela-bff:
    image: ghcr.io/vxture/bff-vela:latest
    container_name: vx-vela-bff-prod
    restart: unless-stopped
    networks: [vx-vela-prod]
    ports:
      - "127.0.0.1:3121:3121"
    env_file: .env.vela.prod.bff
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3121/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  vela-server:
    image: ghcr.io/vxture/agent-vela:latest
    container_name: vx-vela-server-prod
    restart: unless-stopped
    networks: [vx-vela-prod]
    extra_hosts:
      - "host.docker.internal:host-gateway" # 访问宿主机 127.0.0.1:3100 (ai-gateway)
    ports:
      - "127.0.0.1:3122:3122"
    env_file: .env.vela.prod.server
    depends_on:
      postgres: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3122/health"]
      interval: 30s
      timeout: 5s
      retries: 3

secrets:
  vela_prod_pg_password:
    file: ./secrets/vela_prod_pg_password.txt
```

> **Beta 文件**（`compose.vela.beta.yml`）结构相同，调整：容器名加 `-beta` 后缀 / 数据目录改为 `/data/vela/beta/` / 环境变量文件改为 `.env.vela.beta.*`。Beta 服务不对外暴露，绑定 `127.0.0.1`，仅 Tailscale SSH 访问。

---

## worker-02：compose.ruyin.prod.yml

```yaml
# deploy/worker-02/compose.ruyin.prod.yml
name: vx-ruyin-prod

networks:
  vx-ruyin-prod:
    name: vx-ruyin-prod
    driver: bridge

services:
  postgres:
    image: postgres:17-alpine
    container_name: vx-ruyin-pg-prod
    restart: unless-stopped
    networks: [vx-ruyin-prod]
    environment:
      POSTGRES_USER: ruyin
      POSTGRES_DB: ruyin_prod
      POSTGRES_PASSWORD_FILE: /run/secrets/ruyin_prod_pg_password
    secrets: [ruyin_prod_pg_password]
    volumes:
      - /data/ruyin/prod/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ruyin -d ruyin_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:8-alpine
    container_name: vx-ruyin-redis-prod
    restart: unless-stopped
    networks: [vx-ruyin-prod]
    volumes:
      - /data/ruyin/prod/redis:/data
    command: >
      redis-server --appendonly yes
      --requirepass "${RUYIN_PROD_REDIS_PASSWORD}"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${RUYIN_PROD_REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  ruyin-bff:
    image: ghcr.io/vxture/bff-ruyin:latest
    container_name: vx-ruyin-bff-prod
    restart: unless-stopped
    networks: [vx-ruyin-prod]
    ports:
      - "0.0.0.0:3111:3111" # Cloudflare Tunnel 直连此端口（无 ICP 备案路径）
    env_file: .env.ruyin.prod.bff
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3111/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  ruyin-server:
    image: ghcr.io/vxture/agent-ruyin:latest
    container_name: vx-ruyin-server-prod
    restart: unless-stopped
    networks: [vx-ruyin-prod]
    extra_hosts:
      - "host.docker.internal:host-gateway"
    ports:
      - "127.0.0.1:3112:3112"
    env_file: .env.ruyin.prod.server
    depends_on:
      postgres: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3112/health"]
      interval: 30s
      timeout: 5s
      retries: 3

secrets:
  ruyin_prod_pg_password:
    file: ./secrets/ruyin_prod_pg_password.txt
```

---

## 启动顺序

### worker-01

```bash
# 首次：创建网络
docker network create vx-platform

# 启动全量平台服务
cd deploy/worker-01
docker compose -f compose.platform.yml up -d
```

### worker-02

```bash
# 首次：创建网络（每个业务独立）
docker network create vx-ai-gateway
docker network create vx-vela-prod
docker network create vx-vela-beta
docker network create vx-ruyin-prod
docker network create vx-ruyin-beta

cd deploy/worker-02

# 先启 ai-gateway（业务 server 依赖它）
docker compose -f compose.ai-gateway.yml up -d

# 再启各业务（可并行）
docker compose -f compose.vela.prod.yml up -d
docker compose -f compose.ruyin.prod.yml up -d
```

---

## 端口分配总表

| 服务           | 端口     | 节点      | 对外可达方式                      |
| -------------- | -------- | --------- | --------------------------------- |
| Nginx          | 80 / 443 | worker-01 | 公网（Cloudflare 代理）           |
| website-portal | 3010     | worker-01 | 容器网络（Nginx 代理）            |
| console-portal | 3020     | worker-01 | 容器网络（Nginx 代理）            |
| admin-portal   | 3030     | worker-01 | 容器网络（Nginx 代理）            |
| gateway-bff    | 8000     | worker-01 | 容器网络（Nginx 代理）            |
| auth-bff       | 3090     | worker-01 | 宿主机（UFW 限 Tailscale 子网）   |
| website-bff    | 3011     | worker-01 | 容器网络内部                      |
| console-bff    | 3021     | worker-01 | 容器网络内部                      |
| admin-bff      | 3031     | worker-01 | 容器网络内部                      |
| ai-gateway     | 3100     | worker-02 | 127.0.0.1（同宿主机 server 访问） |
| vela-bff       | 3121     | worker-02 | 127.0.0.1（Tailscale 访问）       |
| vela-server    | 3122     | worker-02 | 127.0.0.1（内部调用）             |
| ruyin-bff      | 3111     | worker-02 | 0.0.0.0（Cloudflare Tunnel 直连） |
| ruyin-server   | 3112     | worker-02 | 127.0.0.1（内部调用）             |

---

## 健康检查约定

所有 NestJS BFF / Server 服务需实现 `GET /health` 端点（返回 200）。
所有 Next.js 门户需实现 `GET /api/health` 端点。

---

## 参考文档

- `docs/deployment/02-infrastructure.md` — 数据目录与底层配置
- `docs/deployment/01-environments.md` — 环境变量矩阵
- `docs/ai/port-allocation.md` — 端口分配规范
