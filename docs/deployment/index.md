# 部署文档

> 更新：2026-05-17


---

## 文档职责划分

每份文档只负责一个关注点，避免重复。

| 文件 | 唯一职责 | 内容 |
|------|---------|------|
| [`00-overview.md`](00-overview.md) | **架构全景** | 节点信息、服务分工、数据目录、域名规划、跨节点调用关系、当前状态快照 |
| [`01-environments.md`](01-environments.md) | **环境变量** | 各服务的必填/可选环境变量，按服务分组 |
| [`02-infrastructure.md`](02-infrastructure.md) | **运维操作手册** | Nginx/PostgreSQL/Redis docker run 命令、volume 映射、备份脚本、内存优化 |
| [`03-containers.md`](03-containers.md) | **构建规范** | Dockerfile 模板、构建顺序、服务调用拓扑、健康检查约定、资源规格 |
| [`04-services.md`](04-services.md) | **Compose 编排** | worker-01/02 完整 Compose YAML、启动顺序、端口总表 |
| [`05-ci-cd.md`](05-ci-cd.md) | **CI/CD 流水线** | 分支触发矩阵、CI（类型检查/lint/边界）、prod 镜像构建、beta 镜像构建 + 自动部署、手动部署工作流、Husky hooks |
| [`06-subdomain-dns.md`](06-subdomain-dns.md) | **DNS 记录** | Cloudflare DNS 记录清单、预注册子域名说明 |
| [`07-checklist.md`](07-checklist.md) | **部署检查单** | 部署前后验证步骤、回滚预案 |

**端口分配** → [`docs/ai/port-allocation.md`](../ai/port-allocation.md)（端口权威来源，部署文档只引用，不重复定义）

---

## 服务清单

| 服务 | 端口 | 类型 | 节点 |
|------|------|------|------|
| Nginx | 80 / 443 | nginx | worker-01 |
| gateway-bff | 8000 | Node.js | worker-01 |
| auth-bff | 3090 | NestJS | worker-01 |
| website-portal | 3010 | Next.js | worker-01 |
| website-bff | 3011 | NestJS | worker-01 |
| console-portal | 3020 | Next.js | worker-01 |
| console-bff | 3021 | NestJS | worker-01 |
| admin-portal | 3030 | Next.js | worker-01 |
| admin-bff | 3031 | NestJS | worker-01 |
| ai-gateway | 3100 | NestJS | worker-02 |
| ruyin-studio | 3110 | Next.js | worker-02（待建） |
| ruyin-bff | 3111 | NestJS | worker-02 |
| ruyin-server | 3112 | NestJS | worker-02 |
| vela-studio | 3120 | Next.js | worker-02 |
| vela-bff | 3121 | NestJS | worker-02 |
| vela-server | 3122 | NestJS | worker-02 |
