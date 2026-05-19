# Vxture 基础设施概要

> 供 AI Coding 参考的基础设施现状与部署规划
> 更新：2026-05-15

---

## 一、整体架构

```
用户/浏览器
    ↓
Cloudflare（DNS + CDN + WAF + Tunnel）
    ↓
vxture-worker-01（阿里云 ECS，公网入口 39.103.62.17）
  ├── Nginx 反向代理（SSL 终止）
  ├── 平台门户（website / admin / console）
  ├── 平台 BFF（website-bff / console-bff / admin-bff / auth-bff / gateway-bff）
  └── 平台数据库（PostgreSQL platform_main + Redis）
       ↕ Tailscale 内网（100.x.x.x）
vxture-worker-02（私有服务器，业务执行层）
  ├── ai-gateway
  ├── Vela（prod + beta）：vela-bff / vela-server / PostgreSQL / Redis
  └── Ruyin（prod + beta）：ruyin-bff / ruyin-server / PostgreSQL / Redis
      └── …未来更多业务，每个业务独立双库
```

### 核心分层原则

| 分层           | 服务器    | 内容                             | 环境        | 备份                       |
| -------------- | --------- | -------------------------------- | ----------- | -------------------------- |
| **平台控制面** | worker-01 | 门户 + 平台 BFF + 平台数据库     | 仅 prod     | 阿里云 ESSD 快照 + pg_dump |
| **业务执行面** | worker-02 | 各业务 BFF + Server + 业务数据库 | prod + beta | RAID-1 保障，暂不全量备份  |

### 接入层说明

| 接入方式                 | 适用场景                                      | 状态                            |
| ------------------------ | --------------------------------------------- | ------------------------------- |
| Cloudflare Proxy + Nginx | 平台类域名（website / admin / console / api） | ✅ 生效                         |
| Cloudflare Tunnel        | `ruyin.vxture.com` — 无备案直穿 worker-02     | ✅ 已配置 (`vxture-worker-H01`) |
| Tailscale 内网           | worker 间服务调用、开发者 SSH 访问            | ✅ 已打通                       |

---

## 二、节点信息

| 节点             | 角色               | 系统         | 规格                | Tailscale IP   | 公网 IP      |
| ---------------- | ------------------ | ------------ | ------------------- | -------------- | ------------ |
| vxture-worker-01 | 平台控制面         | Ubuntu 24.04 | 2C 2G 40G+10G ESSD  | 100.100.197.42 | 39.103.62.17 |
| vxture-worker-02 | 业务执行面         | Ubuntu 26.04 | 8C 24G 200G+3T RAID | 100.76.219.48  | 无           |
| stone-work       | 办公电脑（开发）   | Windows 11   | —                   | 100.75.104.94  | —            |
| stone-mix14      | 个人笔记本（管理） | Windows 11   | —                   | 100.72.64.52   | —            |

**worker-01 存储**：40G 系统盘（OS + 容器镜像）+ 10G ESSD `/data`（平台数据库 + Nginx）
**worker-02 存储**：200G 系统盘（OS + 容器镜像）+ 3T RAID-1 `/data`（所有业务数据库）

---

## 三、层级分工

### worker-01 — 平台控制面（仅 prod，无 beta）

| 服务                  | 容器名              | 端口     | 说明                                   |
| --------------------- | ------------------- | -------- | -------------------------------------- |
| Nginx                 | `vx-nginx`          | 80 / 443 | SSL 终止、所有子域名反向代理           |
| website               | `vx-website`        | 3010     | Next.js，vxture.com 官网/注册/登录     |
| console               | `vx-console`        | 3020     | Next.js，console.vxture.com 租户工作台 |
| admin                 | `vx-admin`          | 3030     | Next.js，admin.vxture.com 运营后台     |
| gateway-bff           | `vx-gateway-bff`    | 8000     | 唯一公共 API 入口                      |
| auth-bff              | `vx-auth-bff`       | 3090     | JWT 唯一签发源，所有 BFF 依赖          |
| website-bff           | `vx-website-bff`    | 3011     | 注册/登录/租户初始化                   |
| console-bff           | `vx-console-bff`    | 3021     | 租户管理/成员/账单/订阅                |
| admin-bff             | `vx-admin-bff`      | 3031     | 平台运营管理                           |
| **platform-postgres** | `vx-platform-pg`    | 内部     | 平台数据库（见 Schema 表）             |
| **platform-redis**    | `vx-platform-redis` | 内部     | 会话/限流/Token 黑名单                 |

**平台数据库 Schema 分布（`platform_main`，8 个 schema）：**

| Schema     | 内容                                      | 管理方                    |
| ---------- | ----------------------------------------- | ------------------------- |
| `identity` | 账号、凭证、OAuth、会话、验证码、登录记录 | auth-bff / website-bff    |
| `iam`      | 角色、权限、成员角色绑定、能力定义        | console-bff               |
| `tenant`   | 租户、成员、配置、邀请                    | website-bff / console-bff |
| `product`  | 产品方案、能力定义、定价                  | admin-bff                 |
| `commerce` | 订单、账单、支付、退款、订阅、积分        | admin-bff / console-bff   |
| `model`    | AI 模型目录、授权、定价策略               | admin-bff                 |
| `ops`      | 平台管理员、角色权限、配置、治理记录      | admin-bff                 |
| `support`  | 工单、审计日志、通知日志                  | admin-bff                 |

> **worker-01 内存压力提示**：2G RAM 运行全套平台服务较紧。建议 Next.js 使用 `output: 'standalone'`，各容器设置 `--memory` 上限，开启 2G swap 作为应急缓冲。

### worker-02 — 业务执行面（每个业务独立 prod + beta）

每新增一个业务，按以下模板独立部署：

| 层         | 容器（prod）           | 容器（beta）           | 端口     | 说明          |
| ---------- | ---------------------- | ---------------------- | -------- | ------------- |
| BFF        | `vx-{biz}-bff-prod`    | `vx-{biz}-bff-beta`    | 业务专属 | NestJS        |
| Server     | `vx-{biz}-server-prod` | `vx-{biz}-server-beta` | 业务专属 | Agent Server  |
| PostgreSQL | `vx-{biz}-pg-prod`     | `vx-{biz}-pg-beta`     | 内部     | 业务数据库    |
| Redis      | `vx-{biz}-redis-prod`  | `vx-{biz}-redis-beta`  | 内部     | 业务缓存/队列 |

**当前已注册业务：**

| 业务  | BFF 端口 | Server 端口 | Schema    |
| ----- | -------- | ----------- | --------- |
| vela  | 3121     | 3122        | `vela_*`  |
| ruyin | 3111     | 3112        | `ruyin_*` |

**共享服务（worker-02）：**

| 服务       | 容器名          | 端口 | 说明                           |
| ---------- | --------------- | ---- | ------------------------------ |
| ai-gateway | `vx-ai-gateway` | 3100 | 模型路由/额度/计量，各业务共用 |

---

## 四、数据持久化目录

### worker-01：`/data/`（10G ESSD — 平台数据）

```
/data/
├── nginx/
│   ├── conf/
│   │   ├── nginx.conf
│   │   ├── sites-enabled/       ← 各域名 server block
│   │   └── snippets/            ← ssl-params.conf / proxy-params.conf
│   ├── ssl/                     ← *.vxture.com 通配符证书 + 私钥
│   └── logs/
└── platform/
    ├── db/
    │   ├── postgres/            ← Platform PostgreSQL PGDATA（所有平台 schema）
    │   └── redis/               ← Platform Redis AOF（会话/限流/黑名单）
    ├── backups/                 ← pg_dump 本地存储，再同步阿里云 OSS
    └── logs/                    ← 各平台 BFF 运行日志
```

**10G ESSD 容量估算：**

| 内容                          | 估计大小      |
| ----------------------------- | ------------- |
| PostgreSQL 初期（全平台数据） | 1~3G          |
| Redis 持久化                  | < 0.5G        |
| 日志（保留 30 天）            | 1~2G          |
| 备份（保留 7 天）             | 2~5G          |
| **合计**                      | **4.5~10.5G** |

> 10G 启动可用，用量增长后可在线扩容 Alibaba Cloud ESSD，无需停机。

### worker-02：`/data/`（3T RAID-1 — 业务数据）

```
/data/
├── vela/
│   ├── prod/
│   │   ├── postgres/            ← Vela prod PGDATA
│   │   └── redis/               ← Vela prod Redis AOF
│   └── beta/
│       ├── postgres/            ← Vela beta PGDATA
│       └── redis/               ← Vela beta Redis AOF
├── ruyin/
│   ├── prod/
│   │   ├── postgres/
│   │   └── redis/
│   └── beta/
│       ├── postgres/
│       └── redis/
├── ai-gateway/
│   └── postgres/                ← ai_gateway schema PGDATA
└── ops/
    └── scripts/                 ← 运维脚本（清理、健康检查）
```

**扩展规则**：新增业务时，在 `/data/` 下新增 `/{business-name}/` 目录，按相同结构初始化。

---

## 五、域名规划

| 域名                    | 接入方式                          | 目标服务（节点）                                      | 状态      |
| ----------------------- | --------------------------------- | ----------------------------------------------------- | --------- |
| `vxture.com`            | CF Proxy → Nginx → website        | worker-01:3010                                        | 待部署    |
| `www.vxture.com`        | CF Proxy                          | 重定向到 vxture.com                                   | 待部署    |
| `admin.vxture.com`      | CF Proxy → Nginx → admin          | worker-01:3030                                        | 待部署    |
| `console.vxture.com`    | CF Proxy → Nginx → console        | worker-01:3020                                        | 待部署    |
| `api.vxture.com`        | CF Proxy → Nginx → gateway-bff    | worker-01:8000                                        | 待部署    |
| `ruyin.vxture.com`      | CF Tunnel → ruyin-bff             | worker-02:3111                                        | ✅ 已打通 |
| `beta.ruyin.vxture.com` | CF Proxy → Nginx → ruyin-bff-beta | worker-02:TBD（beta 端口待定，见 port-allocation.md） | 待部署    |
| `asctr.vxture.com`      | CF Proxy → Nginx → asctr-bff      | worker-02:TBD                                         | 待部署    |
| `ruyin.ai`              | Cloudflare（海外）                | 海外品牌入口                                          | 规划中    |

**CF Proxy 模式**：Full Strict（Cloudflare ↔ Nginx 之间必须有效 HTTPS）

---

## 六、跨节点服务调用关系

```
worker-01（平台控制面）
  ├── Nginx → portals（内部容器网络）
  ├── portals → platform BFFs（内部容器网络）
  ├── platform BFFs → platform-postgres（内部容器网络）
  ├── platform BFFs → platform-redis（内部容器网络）
  └── platform BFFs ← worker-02 BFFs 验证 JWT（Tailscale）

worker-02（业务执行面）
  ├── {biz}-bff → {biz}-server（内部容器网络）
  ├── {biz}-server → {biz}-postgres（内部容器网络）
  ├── {biz}-server → ai-gateway（内部容器网络）
  ├── {biz}-bff → worker-01 auth-bff（Tailscale 100.100.197.42:3090）
  └── ai-gateway → 外部 LLM API（公网 HTTPS）
```

**关键约束**：worker-02 各业务 BFF 调用 auth-bff 进行 JWT 验证必须走 Tailscale，不得绕过。

---

## 七、端口速查

> 端口权威定义见 [`docs/ai/port-allocation.md`](../ai/port-allocation.md)，本文件不再维护端口表。

---

## 八、当前状态快照（2026-05-11）

### worker-01 运行中的容器

| 容器名            | 状态      | 处置                                                                  |
| ----------------- | --------- | --------------------------------------------------------------------- |
| vxture-nginx      | ✅ 运行   | 已配 vxture.com + ruyin.vxture.com，继续使用                          |
| vxture-pg-prod    | ⚠️ 运行   | 重命名为 `vx-platform-pg`，数据目录迁至 `/data/platform/db/postgres/` |
| vxture-pg-beta    | ❌ 需清理 | 平台层无 beta，停止并删除                                             |
| vxture-redis-prod | ⚠️ 运行   | 重命名为 `vx-platform-redis`，数据目录迁至 `/data/platform/db/redis/` |
| vxture-redis-beta | ❌ 需清理 | 平台层无 beta，停止并删除                                             |
| ruyin-8443-test   | ❌ 需清理 | 测试 Caddy，停止并删除                                                |

### worker-02 运行中的容器

| 容器名   | 状态      | 处置                   |
| -------- | --------- | ---------------------- |
| test-web | ❌ 需清理 | 测试 nginx，停止并删除 |

---

## 九、待完成事项

> 部署任务跟踪见 [`docs/status.md § 部署待完成事项`](../status.md)。
