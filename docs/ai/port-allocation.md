# 端口分配规范 — Port Allocation

> **本文件具有强制约束力。**
> AI coding 和 human coding 在启动新服务、分配端口时，**必须**查阅本文件并严格遵守。
> 任何端口变更须先修改本文件，再修改代码。

---

## 一、设计原则

全局使用 `3NNX` 四位端口格式：

| 位 | 含义 |
|----|------|
| `3` | 固定前缀 |
| `NN` | 服务组编号（两位，00~99） |
| `X` | 组内服务偏移（0~9） |

**分区规则：**

| NN 范围 | 区域 | 用途 |
|---------|------|------|
| `00` | 别名/特殊 | 3000 = website 别名（302→3010），其余保留 |
| `01~03` | Platform Portals | 三个运营 Portal（UI + BFF 对） |
| `10` | Infrastructure | AI Gateway 及基础服务 |
| `11~99` | Agents | 每个 Agent 独占一个 `NN` 段 |

**单独保留：**

| 端口 | 用途 |
|------|------|
| `8000` | API Gateway（唯一公共入口，NN 规则之外） |
| `8090` | Dev Panel（开发工具面板） |

---

## 二、Platform Portals（NN = 01~03）

**偏移规则：**
- `X = 0`：UI（Next.js）
- `X = 1`：BFF（NestJS）

| 端口 | 服务 | 包 | 环境变量 |
|------|------|----|----------|
| **3010** | website-portal | `@vxture/website` | — |
| **3011** | website-bff | `@vxture/bff-website` | `WEBSITE_BFF_PORT` |
| **3020** | console-portal | `@vxture/console` | — |
| **3021** | console-bff | `@vxture/bff-console` | `CONSOLE_BFF_PORT` |
| **3030** | admin-portal | `@vxture/admin` | — |
| **3031** | admin-bff | `@vxture/bff-admin` | `ADMIN_BFF_PORT` |
| 3040~3091 | 预留（最多 6 个新 portal） | — | — |

---

## 三、Infrastructure（NN = 10）

| 端口 | 服务 | 说明 |
|------|------|------|
| **3100** | AI Gateway | `@vxture/service-ai-gateway`，**已固定，不得迁移** |
| 3101~3109 | 预留 | 监控、消息队列等基础设施 |

---

## 四、Agents（NN = 11~99）

**偏移规则（Agent 层统一）：**
- `X = 0`：Agent Studio（Next.js 前端）
- `X = 1`：Agent BFF（NestJS）
- `X = 2`：Agent Server（私有后端）
- `X = 3~9`：预留（子服务 / WebSocket / gRPC 等）

### Agent 注册表

| Agent | NN | 端口 X0 | 端口 X1 | 端口 X2 | 状态 |
|-------|----|---------|---------|---------|------|
| **ruyinagent**（长子，P0） | `11` | 3110 studio | 3111 bff | **3112** server | 🟡 server 已运行，studio/bff 建设中 |
| **vela**（次子） | `12` | **3120** studio | **3121** bff | **3122** server | ✅ 三端运行中 |
| Future Agent #3 | `13` | 3130 | 3131 | 3132 | 预留 |
| Future Agent #4 | `14` | 3140 | 3141 | 3142 | 预留 |
| … | … | … | … | … | … |
| Future Agent #99 | `99` | 3990 | 3991 | 3992 | 预留 |

---

## 五、完整端口速查表

```
8000   API Gateway（唯一公共入口）
8090   Dev Panel

3000   website 别名（302 → 3010，方便开发者习惯性访问）
3010   website-portal（Next.js）
3011   website-bff（NestJS）
3020   console-portal（Next.js）
3021   console-bff（NestJS）
3030   admin-portal（Next.js）
3031   admin-bff（NestJS）

3100   AI Gateway（固定）

3110   ruyinagent-studio（待建）
3111   ruyinagent-bff（待建）
3112   ruyinagent-server（运行中）

3120   vela-studio（Next.js）
3121   vela-bff（NestJS）
3122   vela-server（NestJS）
```

---

## 六、环境变量命名约定

```bash
# Platform BFF（变量名固定格式：{NAME}_BFF_PORT）
WEBSITE_BFF_PORT=3011
CONSOLE_BFF_PORT=3021
ADMIN_BFF_PORT=3031

# Agent（变量名固定格式：{AGENT}_BFF_PORT / {AGENT}_SERVER_PORT）
RUYINAGENT_BFF_PORT=3111
RUYINAGENT_SERVER_PORT=3112

VELA_BFF_PORT=3121
VELA_SERVER_PORT=3122
VELA_SERVER_INTERNAL_URL=http://localhost:3122

# 基础设施
AI_GATEWAY_URL=http://localhost:3100
GATEWAY_PORT=8000
```

---

## 七、强制执行规则

### R1 — 新 Agent 上线前必须登记

在本文件 **四、Agent 注册表** 中登记 `NN` 编号后，才允许在代码中使用端口。
**禁止**自行选取未登记的端口。

### R2 — 代码中的端口必须来自环境变量

所有服务的监听端口通过环境变量注入，代码中只允许写**回退默认值**：

```typescript
// ✅ 正确
const port = Number(process.env.VELA_BFF_PORT ?? 3121);

// ❌ 错误：硬编码无环境变量覆盖
await app.listen(3121);
```

### R3 — 回退默认值必须与本表一致

代码中 `?? 端口号` 的回退默认值必须与本文件中登记的端口完全一致。
发现不一致时，以本文件为准修正代码。

### R4 — 禁止在 Platform 区间（3010~3099）放 Agent 服务

Platform（NN=01~09）和 Agent（NN=11~99）区间已明确隔离，不得跨区使用。

### R5 — 变更流程

1. 修改本文件（登记新端口或标记迁移）
2. 修改 `.env.local.template`
3. 修改服务代码中的默认值
4. 修改 `tools/dev-panel/src/server.mjs` 的 SERVICES 数组
5. 通知团队（更新 PR 描述）

---

## 八、保留端口说明

以下端口由外部系统管理，不纳入 `3NNX` 规则：

| 端口 | 用途 |
|------|------|
| 5432 | PostgreSQL |
| 6379 | Redis |
| 8000 | API Gateway（单独保留） |
| 8090 | Dev Panel（单独保留） |

---

_版本：1.0.0 | 2026-05-02_
