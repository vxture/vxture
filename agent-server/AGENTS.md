# agent-server/\* 层

> 上下文导航指针 | 完整文档在 `docs/` 体系

## 工作前必读

| 步骤            | 文档                                                                              |
| --------------- | --------------------------------------------------------------------------------- | ----------- |
| 1. 全局规则     | 根目录 `AGENTS.md`（G1–G6）                                                       |
| 2. 任务路由     | [`docs/agent.md`](../docs/agent.md)                                               |
| 3. 层架构规范   | [`docs/architecture/11-agent-server.md`](../docs/architecture/11-agent-server.md) |
| 4. 包实现上下文 | `docs/packages/agents/{agent}/{server                                             | studio}.md` |

> 每个 agent-server 独立治理，禁止跨 agent-server import。

## ⚠️ 未解决技术债务

| ID     | 位置                        | 问题                                                                | 详情                                                                                               |
| ------ | --------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| TD-011 | `ruyin/src/index.ts:296` 🔴 | `JWT_SECRET` 直接读 `process.env`，缺失时静默 `undefined`，认证漏洞 | [tech-debt.md](../docs/tech-debt.md#td-011--agent-server-直接读取-processenv-绕过-vxconfigservice) |
