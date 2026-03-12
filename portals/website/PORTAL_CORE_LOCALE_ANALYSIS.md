# Portal 层禁止直接引用 @vxture/core-* 的合理性分析

> 分析日期：2026-03-12
> 分析范围：website 包对 locale/i18n 功能的需求场景

---

## 🎯 核心问题

**问题**：架构禁止 portal 层直接引用 core-* 包，但 core-locale 包含通用的格式化工具（formatDate/formatNumber），这些工具完全符合 shared 层的职责。

## 🏗️ 架构约束的合理性

### 约束的初衷 ✅

**架构原则**：core 层是**平台基础设施**，应该保持**框架无关**、**双端兼容**、**高度稳定**。

**合理的约束场景**：
- 认证服务（core-auth）：包含安全敏感操作，必须通过 BFF
- 配置服务（core-config）：包含环境变量和 secrets，必须通过 BFF
- API 客户端（core-api）：包含请求拦截逻辑，属于基础架构
- 租户解析（core-tenant）：包含业务逻辑，必须通过 BFF 统一处理

### 不合理的场景 ❌（locale 格式化）

**core-locale 中的 formatDate/formatNumber 功能**：
- 纯工具函数，无副作用
- 基于浏览器原生 Intl API，无需服务器端支持
- 格式化操作与平台业务逻辑无关
- 简单操作通过 HTTP 调用有性能损耗

---

## 📊 成本收益分析

| 方案 | 架构合规性 | 实现复杂度 | 性能 | 维护成本 | 推荐指数 |
|------|------------|------------|------|----------|----------|
| 通过 BFF | ✅ | 🟡 中 | 🟡 中 | 🟡 中 | 3/5 |
| 下沉到 shared | ✅ | 🟡 中 | 🔴 高 | 🟢 低 | **5/5** |
| 修改约束 | ❌ | 🟢 低 | 🔴 高 | 🟡 中 | 1/5 |

---

## 🎯 结论与建议

### 禁止引用 core-* 总体上是合理的，但需要优化

**对于 locale 格式化功能**：
- `core-locale` 中的 formatDate/formatNumber 应该下沉到 `@vxture/shared`
- shared 层完全符合这些功能的定位（纯工具、无副作用）
- 前端可以直接引用 shared 层，符合架构约束

### 行动建议

1. **立即实施**：将 core-locale 的 formatDate/formatNumber 下沉到 shared
2. **长期优化**：重新评估 core-locale 的职责范围
3. **保持架构原则**：其他 core-* 功能继续禁止直接引用

---

## 📝 架构优化后的依赖图

```
portals/website (Frontend)
    ├── ✅ @vxture/shared (直接引用 - 包含 locale 格式化)
    ├── ✅ @vxture/design-system
    ├── ✅ @vxture/platform-* (可选)
    └── ✅ BFF (HTTP 调用)
            ├── ✅ @vxture/core-locale (其他功能)
            ├── ✅ @vxture/service-*
            └── ✅ @vxture/core-*
```

---

## 🎯 最终决策

**禁止 portal 直接引用 @vxture/core-* 总体上是合理的架构决策，但对于 core-locale 中的通用格式化功能，应该下沉到 shared 层以便直接使用。**

这个方案既保持了架构的完整性，又满足了 website 包对 locale 格式化功能的需求。
