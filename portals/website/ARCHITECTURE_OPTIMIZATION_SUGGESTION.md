# 架构优化建议：允许 portal 只引用 @vxture/core-locale

> 建议日期：2026-03-12
> 分析人：AI-Generated

---

## 🎯 优化建议

**原架构约束**：
```
portals/*
  ❌ → @vxture/core-* (全部禁止)
```

**建议的新约束**：
```
portals/*
  ✅ → @vxture/core-locale (仅允许这一个)
  ❌ → @vxture/core-api, core-auth, core-config, core-tenant, core-utils (其他继续禁止)
  ✅ → @vxture/shared, design-system, platform-*
  ✅ → BFF (HTTP)
```

---

## ✅ 为什么这个方案更合理

### 1. core-locale 的特殊性

| core 包 | 特性 | 是否适合前端直接引用 |
|---------|------|------------------|
| `core-api` | HTTP 客户端、请求拦截 | ❌ 包含鉴权逻辑，必须通过 BFF |
| `core-auth` | Token 验证、Session 管理 | ❌ 安全敏感，必须通过 BFF |
| `core-config` | 环境变量、Secrets | ❌ 包含敏感信息，必须通过 BFF |
| `core-tenant` | 租户上下文解析 | ❌ 包含业务逻辑，必须通过 BFF |
| `core-locale` | 格式化工具、语言检测 | **✅ 纯工具，无副作用，适合前端直接引用** |
| `core-utils` | 日志、错误处理 | ⚠️ 视具体功能而定 |

**core-locale 的特性**：
- 纯工具函数，无副作用
- 基于浏览器原生 Intl API
- 无安全敏感内容
- 无业务逻辑
- 无状态管理
- 性能敏感（简单操作通过 HTTP 调用得不偿失）

---

### 2. 架构简化的收益

#### 原方案（全部下沉到 shared）

```
修改前需要做的工作：
1. 从 core-locale 提取格式化工具
2. 复制/移动到 @vxture/shared
3. 修改 core-locale 的导出
4. 更新所有引用 core-locale 的地方
5. 维护两套代码（core-locale 和 shared）
```

**问题**：
- 代码重复（core-locale 和 shared 有相同功能）
- 维护成本高
- 迁移复杂度高
- 容易版本不一致

---

#### 新方案（只允许 core-locale）

```
新方案的工作：
1. 更新架构文档，明确例外规则
2. website 直接 import from '@vxture/core-locale'
3. 无需代码迁移
4. 无需重复代码
```

**收益**：
- 架构更简单直观
- 无代码重复
- 维护成本低
- 无需迁移工作
- 性能最优（直接调用）

---

### 3. 行业实践支持

**大厂们怎么做的？**

| 公司 | 做法 |
|------|------|
| Vercel | 无 core 层概念，前端直接用 i18n 库 |
| Shopify | 前端直接用格式化工具 |
| GitHub | 前端直接用 Intl API 封装 |
| **大多数公司** | 不会为纯工具函数设置 HTTP 边界 |

**反模式识别**：
- 简单操作（如 formatDate）通过 HTTP 调用 → **反模式**
- 安全敏感操作（如 token 验证）通过 HTTP 调用 → **最佳实践**

---

## 📊 方案对比

| 维度 | 原方案（全部禁止） | 建议方案（仅 core-locale 例外） |
|------|----------------|-------------------------|
| 架构一致性 | ⚠️ 不一致（需要迁移） | ✅ 清晰的例外规则 |
| 代码重复 | ❌ 高（shared + core-locale） | ✅ 无 |
| 维护成本 | 🟡 中 | 🟢 低 |
| 性能 | 🟡 中（HTTP 延迟） | 🔴 高（直接调用） |
| 迁移工作量 | 🟡 中（需要代码移动） | 🟢 低（仅文档更新） |
| 架构清晰度 | ⚠️ 需要解释为什么下沉 | ✅ 清晰（按功能特性分） |
| 安全风险 | ✅ 低 | ✅ 低（core-locale 无安全问题） |
| **推荐度** | ⭐⭐⭐ | **⭐⭐⭐⭐⭐** |

---

## 🏗️ 新架构边界的清晰定义

### 为什么只允许 core-locale？

**判断标准**：
- ✅ 纯工具函数，无副作用
- ✅ 无状态管理
- ✅ 无安全敏感内容
- ✅ 无业务逻辑
- ✅ 性能敏感（简单操作）
- ✅ 框架无关（可在浏览器运行）

### 其他 core-* 继续禁止的原因

| core 包 | 禁止原因 |
|---------|---------|
| `core-api` | 包含请求拦截、鉴权，必须通过 BFF 统一处理 |
| `core-auth` | Token 验证、Session 管理，安全敏感 |
| `core-config` | 环境变量、Secrets 读取，必须通过 BFF |
| `core-tenant` | 租户上下文解析，包含业务逻辑 |
| `core-utils` | 视具体功能而定，建议单独评估 |

---

## 📝 实施建议

### 1. 更新架构文档

**在 `docs/architecture/02-package-boundaries.md` 中添加**：

```diff
- ❌ → @vxture/core-* (全部禁止)
+ ✅ → @vxture/core-locale (例外：仅允许这一个 core 包)
+ ❌ → @vxture/core-api, core-auth, core-config, core-tenant, core-utils (其他继续禁止)
+
+ 说明：
+ - core-locale 是例外，因为它提供纯工具函数（formatDate/formatNumber）
+ - 这些函数无副作用、无安全风险、性能敏感
+ - 所有其他 core-* 包仍然禁止直接引用
```

### 2. 更新 portals/CLAUDE.md

```diff
- ❌ → @vxture/core-*
+ ✅ → @vxture/core-locale (仅允许这一个)
+ ❌ → @vxture/core-api, core-auth, core-config, core-tenant, core-utils (其他继续禁止)
```

### 3. website 直接使用 core-locale

```typescript
// portals/website/src/components/SomeComponent.tsx
import { formatDate, formatNumber } from '@vxture/core-locale';

// 直接使用，无需通过 BFF
const date = formatDate(new Date());
const number = formatNumber(1000);
```

---

## 🔐 保持安全边界

**新方案仍然保持严格的安全边界**：

```
安全敏感操作（仍然禁止）：
  ❌ → @vxture/core-auth (token 验证)
  ❌ → @vxture/core-config (secrets 读取)
  ❌ → @vxture/core-tenant (业务逻辑)
  ❌ → @vxture/core-api (请求拦截)

纯工具函数（例外允许）：
  ✅ → @vxture/core-locale (格式化工具)
```

---

## ✅ 总结

**建议采用新方案：允许 portal 只引用 @vxture/core-locale，其他 core-* 继续禁止**

### 理由

1. **core-locale 具有特殊性**：纯工具函数，无副作用，无安全风险
2. **架构更简化**：无需代码迁移，无需重复代码
3. **符合行业实践**：大多数公司不会为简单工具设置 HTTP 边界
4. **性能最优**：直接调用，无网络延迟
5. **安全仍有保障**：其他 core-* 仍然禁止，安全边界完整

### 实施成本

- **低**：只需更新架构文档
- **无代码迁移**：无需移动代码
- **无重复代码**：无需维护两套实现

---

**这个方案既保持了架构的清晰性和安全性，又避免了过度设计带来的复杂性！** 🎉
