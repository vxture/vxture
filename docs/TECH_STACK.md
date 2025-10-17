# Vxture Tech Stack (Simplified v1.0)

A modern stack focused on the company website and account system
本技术栈专注于公司官网与账号系统。

## 🏗️ Core Architecture

### PNPM Monorepo Structure

```text
vxture/
├── packages/web/    # Next.js frontend
└── packages/api/    # FastAPI backend
```

## 📦 Technology Choices

### Frontend Stack (`packages/web`)

-- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript 5.9
- **Styling:** TailwindCSS
- **State Management:** TanStack Query
- **Data Validation:** Zod
- **Code Quality:** ESLint + Prettier + Husky

### Backend Stack (`packages/api`)

- **Framework:** FastAPI + Uvicorn[standard]
- **Database:** PostgreSQL + Redis
- **Authentication:** JWT (python-jose) + Password Hashing (passlib + bcrypt)
- **Data Validation:** Pydantic
- **DB Migration:** Alembic
- **Testing:** pytest + pytest-asyncio

### Removed Dependencies (v1.0 Simplified)

- ❌ OpenAI API
- ❌ Vector stores (ChromaDB, Qdrant, FAISS)
- ❌ AI toolchains (LlamaIndex, sentence-transformers)
- ❌ Complex monitoring (Prometheus, OpenTelemetry)
- ❌ Duplicate config files

## 🚀 Development Commands

```bash
# Install dependencies
pnpm install

# Start dev servers
pnpm dev          # Frontend (localhost:3000)
pnpm dev:api      # Backend (localhost:8000)

# Build & check
pnpm build        # Build frontend
# Vxture 技术栈与平台架构（2025）

本文件概述 vxture 智能体服务平台推荐的现代化技术栈与部署建议，目标是支持微服务架构、高可用性、高可扩展性与企业级安全性。

> 注意：下面的建议针对生产级平台，包含前端微前端/微应用、Node/Golang 后端服务、以及完整的监控/安全/CI 流程。迁移建议采用分阶段、可回滚方式。

## 1. 前端技术栈（建议）
- 核心框架：React + Next.js（SSR/ISR 提升首屏与 SEO）
- 构建工具：Vite（适用于独立 micro-frontend 与组件库开发）
- 状态管理：Redux Toolkit + RTK Query（全局数据与缓存策略）
- UI：Ant Design Pro（企业级风格与多主题支持）
- 多语言：react-i18next
- 样式：Tailwind CSS + CSS Modules（高性能 + 局部隔离）
- 地图：Mapbox GL JS
- 图表：ECharts + Recharts
- 测试：Jest + React Testing Library

## 2. 后端与微服务
- 语言/框架：Node.js（NestJS/Express）+ Golang（高性能服务）
- API：RESTful + GraphQL（按需复杂查询）
- 服务间通信：gRPC
- 服务网格：Istio（流量管理、熔断、策略）
- 认证/鉴权：OAuth 2.0 + JWT + RBAC
- 异步消息：RocketMQ（或 Kafka，依据团队经验）
- 缓存：Redis（分布式）
- 搜索/检索：Elasticsearch
- 异步任务：Celery (Python) 与阿里云 Function Compute（FC）作弹性函数处理

## 3. 数据与存储
- 关系型：PostgreSQL（RDS）
- 文档：MongoDB
- 时序：InfluxDB（传感器/无人机数据）
- 对象存储：阿里云 OSS
- 数据仓库：阿里云 AnalyticDB

## 4. DevOps 与基础设施
- 容器化：Docker
- 编排：Kubernetes（阿里云 ACK）
- CI/CD：Jenkins + 阿里云部署插件（示例 Jenkinsfile 已提供）
- 服务网格与流量管理：Istio
- 监控：Prometheus + Grafana；阿里云 ARMS 作为补充
- 日志：ELK + 阿里云 SLS
- CDN：阿里云 CDN

## 5. 安全性
- WAF：阿里云 WAF
- 资产/安全情报：阿里云 SAS
- 身份与访问：OAuth2 / OIDC + JWT；RBAC 权限模型
- 证书管理：阿里云证书服务，HTTPS 强制

## 6. 建议的迁移与分阶段实施
1. 先在 staging 环境部署服务网格 + 微服务，使用 mock 或边车代理进行兼容测试。
2. 在边缘或 BFF 层统一做认证与路由，减少服务之间耦合。
3. 将监控/日志标准化（Prometheus metrics + structured logs JSON），并在每个服务中加入健康检查与指标导出。

## 7. 接下来的文档与模板（本仓库已添加）
- `docs/ARCHITECTURE.md`：系统高层架构图与组件说明（待完善）
- `docs/DEPLOYMENT.md`：CI/CD 与部署流程说明
- `docs/SECURITY.md`：安全集成建议与对接点
- `infra/`：包含示例 Dockerfile、Jenkinsfile、Kubernetes README

----
如需我生成更详细的迁移路线图（含时间估算、团队角色与风险评估）或自动化脚本（Jenkins pipeline / terraform / helm charts），请告诉我优先级与你可提供的云账号/凭证（我不会主动使用凭证，需你明确提供）。
