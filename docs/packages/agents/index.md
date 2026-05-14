# Agent 层包文档

> Agent = agent-server（后端）+ agent-studio（前端）两部分，各自独立文档

---

## 已上线 Agent

### Vela — 内嵌智能助手

| 部分 | 文档 | 路径 | 端口 | 说明 |
|------|------|------|------|------|
| 后端 | [`vela/server.md`](vela/server.md) | `agent-server/vela/` | 3122 | Tool Use Loop，持久化会话，接入 ai-gateway |
| 前端 | [`vela/studio.md`](vela/studio.md) | `agent-studio/vela/` | — | 嵌入式微前端，渲染对话 UI，SSE 消费 |

**部署模式**：嵌入式（iframe / module federation），载入 admin 和 console portal。

### Ruyin — 超级智能体

| 部分 | 文档 | 路径 | 端口 | 说明 |
|------|------|------|------|------|
| 后端 | [`ruyin/server.md`](ruyin/server.md) | `agent-server/ruyin/` | 3112 | 多模态工作流，BullMQ 任务队列，独立 PostgreSQL + Redis |
| 前端 | [`ruyin/studio.md`](ruyin/studio.md) | `business/ruyin/` | — | 独立部署，类 claude.ai 交互体验 |

**部署模式**：独立域名（`ruyin.ai` / `ruyin.vxture.com`），Cloudflare Tunnel 接入 worker-02。

---

## 新 Agent Fork 起点

| 部分 | 文档 | 说明 |
|------|------|------|
| 后端 | [`agent-template/server.md`](agent-template/server.md) | agent-server fork 模板，含 CallerContext、ToolRegistry 接入规范 |
| 前端 | [`agent-template/studio.md`](agent-template/studio.md) | agent-studio fork 模板，SSE 消费，BFF 接入规范 |

新增 Agent 时先 fork 这两个模板，再注册端口（见 `docs/ai/port-allocation.md`）。

---

## 共同约束

- 每个 agent-server 是**独立进程**，**禁止**跨 Agent 实例 import
- 所有 LLM 调用**必须**经过 ai-gateway（`http://host.docker.internal:3100`），禁止直接 import Anthropic / Doubao SDK
- CallerContext 由 BFF 组装并传入，agent-server 必须**二次校验**，不信任前端传入字段
- `allowedTools` 来自 CallerContext，不接受前端覆盖（ToolRegistry 白名单执行）
