# 技术债登记表

**版本**: 1.0.0
**更新**: 2026-05-14
**维护人**: 架构组

---

## 机制说明

### 登记 ID

格式：`TD-NNN`（三位数字，从 001 递增，永不复用）。

### 状态值

| 状态 | 含义 |
|------|------|
| `Open` | 已登记，待处理 |
| `In Progress` | 正在处理中，有负责人 |
| `Resolved` | 已销号，条目保留作历史记录 |

### 登记模板

在"详情"章节末尾追加新条目：

```
### TD-NNN — [简短标题]

| 字段 | 内容 |
|------|------|
| **分类** | Architecture / Security / Implementation Gap / Design Pending |
| **状态** | Open |
| **登记日期** | YYYY-MM-DD |
| **来源** | 文档路径 / ADR 编号 / 代码注释位置 |

**描述**：问题的具体内容，一到三句话。

**影响**：不解决会带来什么风险或限制。

**解决方向**：计划如何处理，可以是方向性描述。
```

### 销号流程

1. 问题解决后，将 `状态` 改为 `Resolved`
2. 在汇总表中标记该行
3. 在条目末尾追加销号记录：
   ```
   **销号**：YYYY-MM-DD | Commit: `abc1234` | [简要说明]
   ```
4. 条目保留不删除，作为决策历史

---

## 汇总表

| ID | 标题 | 分类 | 状态 |
|----|------|------|------|
| [TD-001](#td-001--bff-层结构待大版本重构) | BFF 层结构待大版本重构 | Architecture | Open |
| [TD-002](#td-002--prisma-schema-集中管理待重构) | Prisma schema 集中管理待重构 | Architecture | Open |
| [TD-003](#td-003--business-bff-认证流程未实现) | Business BFF 认证流程未实现 | Implementation Gap | Open |
| [TD-004](#td-004--会话空闲超时未实现) | 会话空闲超时未实现 | Implementation Gap | Open |
| [TD-005](#td-005--ai-gateway-流式响应未实现) | AI Gateway 流式响应未实现 | Implementation Gap | Open |
| [TD-006](#td-006--ai-gateway-provider-api-key-无轮换机制) | AI Gateway Provider API Key 无轮换机制 | Security | Open |
| [TD-007](#td-007--ai-gateway-provider-重试--降级未实现) | AI Gateway Provider 重试 / 降级未实现 | Implementation Gap | Open |
| [TD-008](#td-008--ai-gateway-provider-合同价格为占位数据) | AI Gateway Provider 合同价格为占位数据 | Implementation Gap | Open |
| [TD-009](#td-009--surface-命名方案待定) | surface 命名方案待定 | Design Pending | Open |
| [TD-010](#td-010--platform-sdk-部分模块计划中未实现) | Platform SDK 部分模块计划中未实现 | Implementation Gap | Open |

---

## 详情

### TD-001 — BFF 层结构待大版本重构

| 字段 | 内容 |
|------|------|
| **分类** | Architecture |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/packages/bff/` 各包文档、代码内注释 |

**描述**：各业务型 BFF 内部存在历史遗留结构问题，注释标记为"待大版本重构"。包括 Guard 链路不完整、跨 BFF 公共逻辑重复（如 auth 中间件、tenant 解析）、部分路由层职责混乱。

**影响**：随功能迭代，维护成本持续累积；Guard 不完整可能导致权限校验存在盲点。

**解决方向**：在 BFF 层结构趋稳后，统一提取公共 Guard/Interceptor 到 `packages/core-bff`（待建），按 ADR-004 规范逐个重构业务型 BFF。

---

### TD-002 — Prisma schema 集中管理待重构

| 字段 | 内容 |
|------|------|
| **分类** | Architecture |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/glossary.md` → Prisma 条目；`packages/core-database/` |

**描述**：DDL 集中在 `@vxture/core-database`，当前有 6 个 schema 文件（⚠️ 待大幅重构）。随业务域增长，单包集中管理导致边界模糊，schema 变更影响面过大，迁移方向和拆分粒度尚未确定。

**影响**：schema 变更牵一发动全身；多个 service 共享同一数据库包，职责边界不清晰；重构成本随时间指数级累积。

**解决方向**：按服务域（`identity`、`commerce`、`ai_gateway` 等）拆分 schema，每个 service 持有自己的 Prisma schema 和 migration history；需配合 database access 层权限边界重构。

---

### TD-003 — Business BFF 认证流程未实现

| 字段 | 内容 |
|------|------|
| **分类** | Implementation Gap |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/decisions/001-auth-bff-sole-jwt-issuer.md` §实施范围 |

**描述**：ADR-001 规定 Business BFF（ruyin-bff / vela-bff / agent-template-bff）应读取浏览器已有 Cookie，未登录或 Cookie 无效时 302 跳转 console 登录页。当前仅 Platform BFF 完成实施，Business BFF 的标准认证中间件标注为 `🔲 规划中`。

**影响**：Business BFF 当前缺少规范的未授权跳转保护，认证边界依赖各 BFF 自行处理，一致性无保证。

**解决方向**：为 vela-bff、ruyin-bff 各自的 auth 中间件实现：读取 Cookie → JWT 校验 → 无效时 `302 Location: console.vxture.com/login?redirect=<当前URL>`；可提取为 `@vxture/core-bff` 公共中间件复用。

---

### TD-004 — 会话空闲超时未实现

| 字段 | 内容 |
|------|------|
| **分类** | Implementation Gap |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/decisions/001-auth-bff-sole-jwt-issuer.md` §会话空闲超时 |

**描述**：ADR-001 规划了 4h 空闲超时机制，基于 Redis 滑动窗口（key: `session:activity:{userId}:{surface}`，TTL 4h，每次认证请求续期）。当前未实现，所有 Platform BFF 认证请求无空闲超时保护，仅靠 access token 15min + refresh token 7d 控制有效期。

**影响**：用户长时间无操作时（如会议、锁屏期间），无人值守终端存在 stolen token 风险。

**解决方向**：在 auth-bff 的 JWT 验证中间件中新增 Redis 滑动窗口检查；配置项 `SESSION_IDLE_TIMEOUT=14400`；Redis 不可用时 fail-open（跳过超时检查，不踢用户）；豁免 `/auth/*` 和 `/health` 端点。

---

### TD-005 — AI Gateway 流式响应未实现

| 字段 | 内容 |
|------|------|
| **分类** | Implementation Gap |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/design/ai-gateway.md` §11 后续推荐工作 |

**描述**：当前 AI Gateway 仅支持同步响应，大模型回复长文本时用户需等待完整响应。vela-bff → browser 层已有 SSE 协议设计，但 gateway → provider 层的 streaming 调用未打通，`ChatRequest.stream: true` 参数当前无效。

**影响**：长回复场景用户体验差（TTFT 高）；大响应体增加 gateway 内存压力；Ruyin 超级智能体产品尤其依赖流式体验。

**解决方向**：在 provider adapter 层实现 streaming API 调用（async iterator / ReadableStream）；gateway HTTP controller 支持 SSE 输出；agent-server 消费 streaming 后经 BFF 转发给 browser，打通完整链路。

---

### TD-006 — AI Gateway Provider API Key 无轮换机制

| 字段 | 内容 |
|------|------|
| **分类** | Security |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/design/ai-gateway.md` §11 后续推荐工作；§5 `ai_model.api_key_env_var` |

**描述**：Provider API Key 当前通过环境变量注入（数据库只存变量名，Key 不入库）。该方案无 Key 轮换机制：Key 泄露后需停机修改环境变量并重启服务，多环境 Key 管理分散。

**影响**：Key 泄露后响应窗口长；轮换操作需要服务停机；无法审计 Key 使用历史。

**解决方向**：引入 Secret 管理方案（优先考虑 Kubernetes Secrets + RBAC，或 HashiCorp Vault）；gateway 启动时从 Secret Store 拉取 Key，支持定期无感知轮换；保留环境变量方案作为本地开发 fallback。

---

### TD-007 — AI Gateway Provider 重试 / 降级未实现

| 字段 | 内容 |
|------|------|
| **分类** | Implementation Gap |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/design/ai-gateway.md` §11 后续推荐工作 |

**描述**：Provider 调用当前无重试策略，瞬时故障直接返回错误给调用方。无 fallback 路由（如主 Provider 不可用时切换备用 modelCode）。

**影响**：Provider 偶发抖动直接造成用户会话中断；单点 Provider 故障导致全部 AI 功能不可用；SLA 无法保证。

**解决方向**：在 provider adapter 层实现 exponential backoff 重试（最大 3 次，仅对幂等请求）；在 `ai_model` 配置中支持 `fallback_model_code` 字段；可选引入 circuit breaker 避免雪崩。

---

### TD-008 — AI Gateway Provider 合同价格为占位数据

| 字段 | 内容 |
|------|------|
| **分类** | Implementation Gap |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/design/ai-gateway.md` §10 Phase 1 Seed、§6 Cost And Fee Model |

**描述**：`ai_gateway.ai_model_cost_rate` 表中的 Provider 成本价格为 seed 文件占位数据，非实际合同价格。商务面向客户的计费规则（超额用量、add-on agent、私有模型部署服务、实施费）也未实现。

**影响**：毛利分析报表和 Provider 结算数据不可信；超额用量无法正确计费；商务决策依赖失准数据。

**解决方向**：商务确认各 Provider 合同单价后替换 seed 数据；在 `commerce` 域实现 overage 计费规则、add-on 定价逻辑和客户账单生成。上生产前完成此项。

---

### TD-009 — surface 命名方案待定

| 字段 | 内容 |
|------|------|
| **分类** | Design Pending |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/glossary.md` → surface 条目 |

**描述**：当前 surface 取值为 `admin` 和 `console`，但 `admin` 与 RBAC 中的角色名重名，语义存在歧义。规划中 surface 将细分为两层（运营管理子域 + 平台自治子域；管理子域 + 应用子域），候选更名方案（如 `admin` → `ops`）尚未决策。

**影响**：命名歧义增加 AI coding 的上下文理解成本；两层 surface 设计未定前，CallerContext 的 `dataScope` 语义在边界场景存在模糊区间。

**解决方向**：在下一版本 surface 两层设计时一并确定命名方案，更新 glossary、ADR-001、CallerContext 类型定义，前后端协调一次性完成重命名（不分步，避免中间态混乱）。

---

### TD-010 — Platform SDK 部分模块计划中未实现

| 字段 | 内容 |
|------|------|
| **分类** | Implementation Gap |
| **状态** | Open |
| **登记日期** | 2026-05-14 |
| **来源** | `docs/packages/` Platform SDK 相关文档 |

**描述**：Platform SDK 中部分模块（地图集成 `amap`、三维可视化 `cesium` 等）标注为"计划中"，尚未实现。当前只有 `@vxture/platform-browser` 一个已实现 SDK，其余模块为占位。

**影响**：依赖这些功能的业务场景（无人机监测、地质灾害分析等）无法开发，需要临时方案兜底或推迟排期。

**解决方向**：随对应业务场景立项时按需开发，遵循 `packages/platform/` 下的包结构规范；不提前实现，避免过度设计。
