# 技术债登记表

**版本**: 1.2.0
**更新**: 2026-05-20
**维护人**: 架构组

---

## 机制说明

### 登记 ID

格式：`TD-NNN`（三位数字，从 001 递增，永不复用）。

### 状态值

| 状态          | 含义                       |
| ------------- | -------------------------- |
| `Open`        | 已登记，待处理             |
| `In Progress` | 正在处理中，有负责人       |
| `Resolved`    | 已销号，条目保留作历史记录 |

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

| ID                                                                          | 标题                                            | 分类               | 状态     | 优先级  |
| --------------------------------------------------------------------------- | ----------------------------------------------- | ------------------ | -------- | ------- |
| [TD-001](#td-001--bff-层结构待大版本重构)                                   | BFF 层结构待大版本重构                          | Architecture       | Open     |         |
| [TD-002](#td-002--prisma-schema-集中管理待重构)                             | Prisma schema 集中管理待重构                    | Architecture       | Open     |         |
| [TD-003](#td-003--business-bff-认证流程未实现)                              | Business BFF 认证流程未实现                     | Implementation Gap | Open     |         |
| [TD-004](#td-004--会话空闲超时未实现)                                       | 会话空闲超时未实现                              | Implementation Gap | Open     |         |
| [TD-005](#td-005--ai-gateway-流式响应未实现)                                | AI Gateway 流式响应未实现                       | Implementation Gap | Open     |         |
| [TD-006](#td-006--ai-gateway-provider-api-key-无轮换机制)                   | AI Gateway Provider API Key 无轮换机制          | Security           | Open     |         |
| [TD-007](#td-007--ai-gateway-provider-重试--降级未实现)                     | AI Gateway Provider 重试 / 降级未实现           | Implementation Gap | Open     |         |
| [TD-008](#td-008--ai-gateway-provider-合同价格为占位数据)                   | AI Gateway Provider 合同价格为占位数据          | Implementation Gap | Open     |         |
| [TD-009](#td-009--surface-命名方案待定)                                     | surface 命名方案待定                            | Design Pending     | Open     |         |
| [TD-010](#td-010--platform-sdk-部分模块计划中未实现)                        | Platform SDK 部分模块计划中未实现               | Implementation Gap | Open     |         |
| [TD-011](#td-011--agent-server-直接读取-process.env-绕过-vxconfigservice)   | agent-server 直接读取 process.env               | Security           | Resolved | 🔴 HIGH |
| [TD-012](#td-012--bff-oauth-provider-凭据未入-core-config-schema)           | BFF OAuth provider 凭据未入 schema              | Security           | Resolved | 🔴 HIGH |
| [TD-013](#td-013--bff-跨服务-url--cookie-domain-未入-core-config-schema)    | BFF 跨服务 URL / cookie domain 未入 schema      | Implementation Gap | Resolved | 🟡 MED  |
| [TD-014](#td-014--vela-server-操作配置直读-processenv-无-zod-验证)          | vela-server 操作配置直读 process.env            | Implementation Gap | Open     | 🟡 MED  |
| [TD-015](#td-015--admin-bff-reporting_ro_database_url-未入-schema)          | admin-bff REPORTING_RO_DATABASE_URL 未入 schema | Implementation Gap | Open     | 🟡 MED  |
| [TD-016](#td-016--gateway-client-ai_gateway_url-库级-fallback-无-fail-fast) | gateway-client AI_GATEWAY_URL 库级 fallback     | Implementation Gap | Open     | 🟢 LOW  |

---

## 详情

### TD-001 — BFF 层结构待大版本重构

| 字段         | 内容                                      |
| ------------ | ----------------------------------------- |
| **分类**     | Architecture                              |
| **状态**     | Open                                      |
| **登记日期** | 2026-05-14                                |
| **来源**     | `docs/packages/bff/` 各包文档、代码内注释 |

**描述**：各业务型 BFF 内部存在历史遗留结构问题，注释标记为"待大版本重构"。包括 Guard 链路不完整、跨 BFF 公共逻辑重复（如 auth 中间件、tenant 解析）、部分路由层职责混乱。

**影响**：随功能迭代，维护成本持续累积；Guard 不完整可能导致权限校验存在盲点。

**解决方向**：在 BFF 层结构趋稳后，统一提取公共 Guard/Interceptor 到 `packages/core-bff`（待建），按 ADR-004 规范逐个重构业务型 BFF。

---

### TD-002 — Prisma schema 集中管理待重构

| 字段         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| **分类**     | Architecture                                                |
| **状态**     | Open                                                        |
| **登记日期** | 2026-05-14                                                  |
| **来源**     | `docs/glossary.md` → Prisma 条目；`packages/core-database/` |

**描述**：DDL 集中在 `@vxture/core-database`，当前有 6 个 schema 文件（⚠️ 待大幅重构）。随业务域增长，单包集中管理导致边界模糊，schema 变更影响面过大，迁移方向和拆分粒度尚未确定。

**影响**：schema 变更牵一发动全身；多个 service 共享同一数据库包，职责边界不清晰；重构成本随时间指数级累积。

**解决方向**：按服务域（`identity`、`commerce`、`ai_gateway` 等）拆分 schema，每个 service 持有自己的 Prisma schema 和 migration history；需配合 database access 层权限边界重构。

---

### TD-003 — Business BFF 认证流程未实现

| 字段         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| **分类**     | Implementation Gap                                         |
| **状态**     | Open                                                       |
| **登记日期** | 2026-05-14                                                 |
| **来源**     | `docs/decisions/001-auth-bff-sole-jwt-issuer.md` §实施范围 |

**描述**：ADR-001 规定 Business BFF（ruyin-bff / vela-bff / agent-template-bff）应读取浏览器已有 Cookie，未登录或 Cookie 无效时 302 跳转 console 登录页。当前仅 Platform BFF 完成实施，Business BFF 的标准认证中间件标注为 `🔲 规划中`。

**影响**：Business BFF 当前缺少规范的未授权跳转保护，认证边界依赖各 BFF 自行处理，一致性无保证。

**解决方向**：为 vela-bff、ruyin-bff 各自的 auth 中间件实现：读取 Cookie → JWT 校验 → 无效时 `302 Location: console.vxture.com/login?redirect=<当前URL>`；可提取为 `@vxture/core-bff` 公共中间件复用。

---

### TD-004 — 会话空闲超时未实现

| 字段         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| **分类**     | Implementation Gap                                             |
| **状态**     | Open                                                           |
| **登记日期** | 2026-05-14                                                     |
| **来源**     | `docs/decisions/001-auth-bff-sole-jwt-issuer.md` §会话空闲超时 |

**描述**：ADR-001 规划了 4h 空闲超时机制，基于 Redis 滑动窗口（key: `session:activity:{userId}:{surface}`，TTL 4h，每次认证请求续期）。当前未实现，所有 Platform BFF 认证请求无空闲超时保护，仅靠 access token 15min + refresh token 7d 控制有效期。

**影响**：用户长时间无操作时（如会议、锁屏期间），无人值守终端存在 stolen token 风险。

**解决方向**：在 auth-bff 的 JWT 验证中间件中新增 Redis 滑动窗口检查；配置项 `SESSION_IDLE_TIMEOUT=14400`；Redis 不可用时 fail-open（跳过超时检查，不踢用户）；豁免 `/auth/*` 和 `/health` 端点。

---

### TD-005 — AI Gateway 流式响应未实现

| 字段         | 内容                                         |
| ------------ | -------------------------------------------- |
| **分类**     | Implementation Gap                           |
| **状态**     | Open                                         |
| **登记日期** | 2026-05-14                                   |
| **来源**     | `docs/design/ai-gateway.md` §11 后续推荐工作 |

**描述**：当前 AI Gateway 仅支持同步响应，大模型回复长文本时用户需等待完整响应。vela-bff → browser 层已有 SSE 协议设计，但 gateway → provider 层的 streaming 调用未打通，`ChatRequest.stream: true` 参数当前无效。

**影响**：长回复场景用户体验差（TTFT 高）；大响应体增加 gateway 内存压力；Ruyin 超级智能体产品尤其依赖流式体验。

**解决方向**：在 provider adapter 层实现 streaming API 调用（async iterator / ReadableStream）；gateway HTTP controller 支持 SSE 输出；agent-server 消费 streaming 后经 BFF 转发给 browser，打通完整链路。

---

### TD-006 — AI Gateway Provider API Key 无轮换机制

| 字段         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| **分类**     | Security                                                                    |
| **状态**     | Open                                                                        |
| **登记日期** | 2026-05-14                                                                  |
| **来源**     | `docs/design/ai-gateway.md` §11 后续推荐工作；§5 `ai_model.api_key_env_var` |

**描述**：Provider API Key 当前通过环境变量注入（数据库只存变量名，Key 不入库）。该方案无 Key 轮换机制：Key 泄露后需停机修改环境变量并重启服务，多环境 Key 管理分散。

**影响**：Key 泄露后响应窗口长；轮换操作需要服务停机；无法审计 Key 使用历史。

**解决方向**：引入 Secret 管理方案（优先考虑 Kubernetes Secrets + RBAC，或 HashiCorp Vault）；gateway 启动时从 Secret Store 拉取 Key，支持定期无感知轮换；保留环境变量方案作为本地开发 fallback。

---

### TD-007 — AI Gateway Provider 重试 / 降级未实现

| 字段         | 内容                                         |
| ------------ | -------------------------------------------- |
| **分类**     | Implementation Gap                           |
| **状态**     | Open                                         |
| **登记日期** | 2026-05-14                                   |
| **来源**     | `docs/design/ai-gateway.md` §11 后续推荐工作 |

**描述**：Provider 调用当前无重试策略，瞬时故障直接返回错误给调用方。无 fallback 路由（如主 Provider 不可用时切换备用 modelCode）。

**影响**：Provider 偶发抖动直接造成用户会话中断；单点 Provider 故障导致全部 AI 功能不可用；SLA 无法保证。

**解决方向**：在 provider adapter 层实现 exponential backoff 重试（最大 3 次，仅对幂等请求）；在 `ai_model` 配置中支持 `fallback_model_code` 字段；可选引入 circuit breaker 避免雪崩。

---

### TD-008 — AI Gateway Provider 合同价格为占位数据

| 字段         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| **分类**     | Implementation Gap                                                  |
| **状态**     | Open                                                                |
| **登记日期** | 2026-05-14                                                          |
| **来源**     | `docs/design/ai-gateway.md` §10 Phase 1 Seed、§6 Cost And Fee Model |

**描述**：`ai_gateway.ai_model_cost_rate` 表中的 Provider 成本价格为 seed 文件占位数据，非实际合同价格。商务面向客户的计费规则（超额用量、add-on agent、私有模型部署服务、实施费）也未实现。

**影响**：毛利分析报表和 Provider 结算数据不可信；超额用量无法正确计费；商务决策依赖失准数据。

**解决方向**：商务确认各 Provider 合同单价后替换 seed 数据；在 `commerce` 域实现 overage 计费规则、add-on 定价逻辑和客户账单生成。上生产前完成此项。

---

### TD-014 — vela-server 操作配置直读 process.env 无 Zod 验证

| 字段         | 内容                                               |
| ------------ | -------------------------------------------------- |
| **分类**     | Implementation Gap                                 |
| **状态**     | Open                                               |
| **优先级**   | 🟡 MED                                             |
| **登记日期** | 2026-05-20                                         |
| **来源**     | `agent-server/vela/src/chat/chat.service.ts:40-47` |

**描述**：`chat.service.ts` 在模块顶层直接读取三个操作配置变量作为模块级常量：`VELA_PLATFORM_LLM_TENANT_ID`（LLM 计费追踪用租户 UUID，缺失时静默使用硬编码占位 UUID）、`VELA_DEFAULT_MODEL_CODE`（默认模型代码，缺失时使用硬编码 doubao 型号）、`VELA_LLM_AGENT_ID`（LLM agent 过滤器，可选）。三个变量均无 Zod 格式校验，在模块加载时一次性求值，后续无法通过 DI 覆盖，也不参与 `VxConfigModule` 的 fail-fast 验证流程。

**影响**：`VELA_PLATFORM_LLM_TENANT_ID` 缺失时会使用占位 UUID，计费数据归属混乱；`VELA_DEFAULT_MODEL_CODE` 未配置时可能引用已停用的模型；变量配置错误在运行时才暴露，无法在启动阶段发现。

**解决方向**：在 `agent-server/vela` 的 NestJS 模块中注册 `VxConfigModule.register({ domains: ['app', 'vela'] })`，新建 `vela.schema.ts` 声明上述三个字段（`VELA_PLATFORM_LLM_TENANT_ID` 为必填 UUID 格式，`VELA_DEFAULT_MODEL_CODE` 为必填字符串，`VELA_LLM_AGENT_ID` 为 optional）；`ChatService` 通过构造函数注入 `VxConfigService` 读取，移除模块级 `const` 直读。

---

### TD-015 — admin-bff REPORTING_RO_DATABASE_URL 未入 schema

| 字段         | 内容                                             |
| ------------ | ------------------------------------------------ |
| **分类**     | Implementation Gap                               |
| **状态**     | Open                                             |
| **优先级**   | 🟡 MED                                           |
| **登记日期** | 2026-05-20                                       |
| **来源**     | `bff/admin-bff/src/providers/pools.module.ts:41` |

**描述**：`AdminBffPoolsModule` 为只读报表数据库连接池直接读取 `process.env["REPORTING_RO_DATABASE_URL"]`，该变量未在 `database.schema.ts` 或任何其他 schema 中声明。读写池（`ADMIN_BFF_RW_POOL`）已通过 `VxConfigService.database` 正确注入；只读报表池游离于类型系统之外，缺失时静默降级至主库连接（`makePool(undefined, config.database)`），无 fail-fast 保护。

**影响**：报表查询静默落回主库 RW 连接，高负荷报表查询可能影响主库性能；`REPORTING_RO_DATABASE_URL` 配置错误（如 URL 格式不合法）在启动时不报错，而是在首次数据库操作时抛出运行时异常。

**解决方向**：在 `database.schema.ts` 中新增 `REPORTING_RO_DATABASE_URL: z.string().url().optional()`；`AdminBffPoolsModule` 通过 `VxConfigService.database.REPORTING_RO_DATABASE_URL` 读取，移除直接的 `process.env` 访问。

---

### TD-016 — gateway-client AI_GATEWAY_URL 库级 fallback 无 fail-fast 保护

| 字段         | 内容                                              |
| ------------ | ------------------------------------------------- |
| **分类**     | Implementation Gap                                |
| **状态**     | Open                                              |
| **优先级**   | 🟢 LOW                                            |
| **登记日期** | 2026-05-20                                        |
| **来源**     | `packages/ai/gateway-client/src/llm/client.ts:85` |

**描述**：`GatewayLLMClient` 构造函数在 `options.gatewayUrl` 未传入时以 `process.env.AI_GATEWAY_URL` 作为 fallback。该包是纯库包（无 NestJS DI），只能通过 `process.env` 读取环境变量。问题在于：`AI_GATEWAY_URL` 在此处仅做字符串读取，未经 Zod 的 URL 格式校验；而调用方（vela-server `chat.service.ts`）在实例化时总是传入 `options.gatewayUrl`，此 fallback 实际上是一个死代码路径，但可能给未来调用方制造误解，认为不传 gatewayUrl 是安全的。

**影响**：若未来调用方省略 `gatewayUrl` 参数，会在运行时以未经验证的 URL 发起请求；当前影响有限（vela-server 始终传入配置值）。

**解决方向**：移除 `process.env.AI_GATEWAY_URL` fallback，改为 `options.gatewayUrl` 为必填项；或在 constructor 中加入 URL 格式断言（`new URL(...)` 抛出则 fail-fast）。优先级低，不阻塞功能。

---

### TD-009 — surface 命名方案待定

| 字段         | 内容                              |
| ------------ | --------------------------------- |
| **分类**     | Design Pending                    |
| **状态**     | Open                              |
| **登记日期** | 2026-05-14                        |
| **来源**     | `docs/glossary.md` → surface 条目 |

**描述**：当前 surface 取值为 `admin` 和 `console`，但 `admin` 与 RBAC 中的角色名重名，语义存在歧义。规划中 surface 将细分为两层（运营管理子域 + 平台自治子域；管理子域 + 应用子域），候选更名方案（如 `admin` → `ops`）尚未决策。

**影响**：命名歧义增加 AI coding 的上下文理解成本；两层 surface 设计未定前，CallerContext 的 `dataScope` 语义在边界场景存在模糊区间。

**解决方向**：在下一版本 surface 两层设计时一并确定命名方案，更新 glossary、ADR-001、CallerContext 类型定义，前后端协调一次性完成重命名（不分步，避免中间态混乱）。

---

### TD-010 — Platform SDK 部分模块计划中未实现

| 字段         | 内容                                   |
| ------------ | -------------------------------------- |
| **分类**     | Implementation Gap                     |
| **状态**     | Open                                   |
| **登记日期** | 2026-05-14                             |
| **来源**     | `docs/packages/` Platform SDK 相关文档 |

**描述**：Platform SDK 中部分模块（地图集成 `amap`、三维可视化 `cesium` 等）标注为"计划中"，尚未实现。当前只有 `@vxture/platform-browser` 一个已实现 SDK，其余模块为占位。

**影响**：依赖这些功能的业务场景（无人机监测、地质灾害分析等）无法开发，需要临时方案兜底或推迟排期。

**解决方向**：随对应业务场景立项时按需开发，遵循 `packages/platform/` 下的包结构规范；不提前实现，避免过度设计。

---

### TD-011 — agent-server 直接读取 process.env 绕过 VxConfigService

| 字段         | 内容                                  |
| ------------ | ------------------------------------- |
| **分类**     | Security                              |
| **状态**     | ✅ Resolved                           |
| **优先级**   | 🔴 HIGH                               |
| **登记日期** | 2026-05-20                            |
| **解决日期** | 2026-05-20                            |
| **来源**     | `agent-server/ruyin/src/index.ts:296` |

**描述**：`agent-server/ruyin` 在业务代码中直接读取 `process.env.JWT_SECRET` 用于 JWT 验证，完全绕过 `VxConfigService`。该值既无 Zod 校验（长度、格式），也无类型保障，若环境变量缺失则静默得到 `undefined`，JWT 验证会以空 secret 通过或抛出运行时错误。

**影响**：secret 缺失时行为不可预测（可能签发全为空 secret 的 token，构成认证漏洞）；与 `@vxture/core-config` 的 authSchema 验证逻辑脱节，双轨配置无法统一管理。

**解决方向**：在 `agent-server/ruyin` 的 `AppModule` 中注册 `VxConfigModule.register({ domains: ['app', 'auth', 'ai'] })`，注入 `VxConfigService`，用 `configService.auth.JWT_SECRET` 替换直接的 `process.env` 读取。

---

### TD-012 — BFF OAuth provider 凭据未入 core-config schema

| 字段         | 内容                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **分类**     | Security                                                                                                       |
| **状态**     | ✅ Resolved                                                                                                    |
| **优先级**   | 🔴 HIGH                                                                                                        |
| **登记日期** | 2026-05-20                                                                                                     |
| **解决日期** | 2026-05-20                                                                                                     |
| **来源**     | `bff/auth-bff/src/providers/dingtalk.provider.ts:63,68`、`bff/auth-bff/src/providers/feishu.provider.ts:76,80` |

**描述**：DingTalk（`DINGTALK_APP_KEY`、`DINGTALK_APP_SECRET`、`DINGTALK_SUITE_KEY`、`DINGTALK_SUITE_SECRET`）和飞书（`FEISHU_APP_ID`、`FEISHU_APP_SECRET`）的 OAuth 凭据直接通过 `process.env.XXX ?? ""` 读取，缺失时静默降级为空字符串。这些凭据既无 Zod 最小长度校验，也不在任何 `core-config` schema domain 内，启动时不会报错，但 OAuth 回调会以空凭据发起请求，导致第三方 API 静默返回授权失败。

**影响**：OAuth provider 凭据缺失时应用正常启动但登录功能不可用，错误发现滞后；凭据轮换后无法通过配置系统统一验证；安全审计无法覆盖这些字段。

**解决方向**：在 `core-config` 的 `authSchema`（或新建 `oauth.schema.ts`）中注册 OAuth provider 凭据字段，标记为 optional（未启用的 provider 不需要配置）；在 auth-bff 启动时通过 `VxConfigService` 注入，在 provider 实例化时断言所需字段存在。

---

### TD-013 — BFF 跨服务 URL / cookie domain 未入 core-config schema

| 字段         | 内容                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **分类**     | Implementation Gap                                                                                                                                                 |
| **状态**     | ✅ Resolved                                                                                                                                                        |
| **优先级**   | 🟡 MED                                                                                                                                                             |
| **登记日期** | 2026-05-20                                                                                                                                                         |
| **解决日期** | 2026-05-20                                                                                                                                                         |
| **来源**     | `bff/auth-bff/src/routers/oauth.router.ts:68-83`、`bff/auth-bff/src/routers/password-auth.router.ts:143-151`、`bff/admin-bff/src/routers/ai-gateway.router.ts:233` |

**描述**：以下环境变量在多处路由中直接读取，均未纳入 `core-config` 任何 schema domain：`WEBSITE_BASE_URL`、`CONSOLE_BASE_URL`、`ADMIN_BASE_URL`、`AI_GATEWAY_URL`、`COOKIE_DOMAIN_PLATFORM`、`AUTH_COOKIE_DOMAIN`、`COOKIE_DOMAIN_RUYIN`、`RUYIN_COOKIE_DOMAIN`。缺失时以 `?? ""` 静默兜底，Cookie domain 设为空字符串会导致 Cookie 无法在子域间共享，OAuth redirect URL 构造失败等问题。

**影响**：跨服务 URL 和 Cookie domain 配置错误时行为不可预期；无法在启动时 fail-fast；多个 BFF 读取同名变量但无统一约束，环境差异难以排查。

**解决方向**：在 `core-config` 中新增 `platform.schema.ts` domain，注册 `WEBSITE_BASE_URL`、`CONSOLE_BASE_URL`、`ADMIN_BASE_URL`、`AI_GATEWAY_URL`、`COOKIE_DOMAIN_*` 等字段（url 类型或 string，各自设合理默认值）；各 BFF 通过 `VxConfigService` 统一读取，移除散落的 `process.env` 直接访问。
