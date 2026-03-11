# Phase 6 AI Prompt — 跨层依赖审计

> 直接将以下内容发送给执行 Claude。

---

你是 Vxture Monorepo 的架构审计专家。现在执行 Phase 6：跨层依赖全局审计。

## 目标

扫描整个 monorepo，发现并修正所有违反架构层级规则的非法依赖。

---

## 审计范围

### 1. package.json dependencies 审计

逐包检查 `dependencies` 和 `devDependencies`，识别非法引用：

| 包 / 层 | 非法依赖示例 |
|------|------|
| `portals/*` / `agent-studio/*` | service-* / core-* / ai-sdk / bff-* |
| `bff/*` | ai-sdk / design-system / platform-* / 跨 bff-* |
| `services/*/*` | 跨 service-* / bff-* / ai-sdk / design-system |
| `agent-server/*` | 跨 agent-server/* / bff-* / design-system / platform-* |
| `@vxture/shared` | 任何 @vxture/* 内部包 |
| `@vxture/core-*` | service-* / bff-* / ai-sdk / design-system / platform-* |
| `@vxture/ai-sdk` | service-* / bff-* / design-system / platform-* |
| `@vxture/platform-*` | core-* / service-* / ai-sdk / bff-* |
| `@vxture/design-system` | core-* / service-* / ai-sdk / bff-* / platform-* |

### 2. import 语句审计

扫描所有 `.ts` / `.tsx` 文件中的 import 语句：

**禁止的跨层导入模式**：

```typescript
// 前端层不得导入服务端包
import { BillingService } from '@vxture/service-billing'  // ❌ in portals/*
import { validateToken } from '@vxture/core-auth'          // ❌ in portals/*
import { llmClient } from '@vxture/ai-sdk'                 // ❌ in portals/*

// 跨相对路径 import 内部包
import { x } from '../../../packages/core/api/src'         // ❌ 任何地方
import { x } from '../../services/commerce/billing/src'    // ❌ 任何地方

// BFF 不得 import AI SDK
import { llmClient } from '@vxture/ai-sdk'                 // ❌ in bff/*

// service 不得跨 service import
import { getSubscription } from '@vxture/service-subscription' // ❌ in service-billing

// agent-server 不得跨 agent import
import { x } from '../../agent02/src/services/...'         // ❌
```

### 3. tsconfig paths 审计

检查根 `tsconfig.base.json`：
- 所有 @vxture/* 包是否有对应 paths 映射
- service 别名是否为 @vxture/service-{name}（不含域路径）
- 是否存在多余或错误的 paths 条目

### 4. pnpm-workspace.yaml 审计

- glob 是否覆盖所有包目录
- services/*/* 两级通配是否正确
- 是否有包目录未被 workspace 覆盖

---

## 审计输出格式

每个问题按以下格式报告：

```
[❌ 非法依赖]
文件：portals/admin/src/pages/billing.tsx
问题：直接 import @vxture/service-billing（服务端包）
规则：前端层禁止 import service-*
修复：通过 BFF HTTP 接口获取数据，移除此 import
```

---

## 修复优先级

**P0 — 立即修复（架构破坏性）**
- 前端直接 import 服务端包
- 跨 agent-server 导入
- 跨 service 导入
- shared 层 import 内部包

**P1 — 本次修复（规范违反）**
- 相对跨包路径导入
- BFF import ai-sdk
- tsconfig paths 缺失或错误

**P2 — 记录待修复（技术债）**
- devDependencies 中的非必要依赖
- 未使用的 dependencies
- workspace 配置冗余项

---

## 执行方式

1. 按层逐一扫描，输出完整问题清单
2. 对每个 P0 / P1 问题给出具体修复方案
3. 最终输出汇总报告：
   - 总问题数 / P0 数 / P1 数 / P2 数
   - 已修复项
   - 待修复项（含修复建议）

---

End of Phase 6 Prompt.
