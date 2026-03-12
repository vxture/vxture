# Website 应用 locale 的正确途径分析

> 分析日期：2026-03-12
> 基于架构文档和当前项目状态

---

## 🚫 架构约束分析

### 1. 禁止 portal 直接引用 core-* 的合理性

#### 合理的一面 ✅

**架构原则体现**：
- **层边界清晰**：core 是基础设施，portal 是 UI 层，HTTP 是唯一通信方式
- **避免架构污染**：防止 core 层被前端框架污染（如 React、Next.js）
- **统一访问路径**：BFF 作为单一入口，确保鉴权和租户解析一致
- **部署隔离**：core 层升级不影响前端部署

#### 不合理的一面 ❌（针对 i18n 场景）

**Locale 功能的特殊性**：
- **格式化工具**（formatDate/formatNumber）：纯工具函数，无副作用
- **不依赖服务器**：基于浏览器原生 Intl API，无需 BFF 调用
- **重复实现风险**：前端和 core-locale 可能重复实现相同的格式化逻辑
- **性能损耗**：简单的格式化操作通过 HTTP 调用得不偿失

---

## 🎯 Website 应用 locale 的正确途径

### 方案 A：通过 BFF 访问（架构合规）

```
portals/website (Frontend)
    │  HTTP request
    ▼
bff/website-bff (BFF layer)
    │  @vxture/core-locale
    ▼
@vxture/core-locale (Core layer)
```

#### 实施步骤

**Step 1: 在 website-bff 中添加 locale 路由和聚合器**

```typescript
// bff/website-bff/src/routers/locale.router.ts
import type { Router } from 'express';
import { formatDate, formatNumber } from '@vxture/core-locale';

export function createLocaleRouter(): Router {
  const router = Router();

  // 日期格式化
  router.post('/format-date', (req, res) => {
    const { date, options } = req.body;
    const formatted = formatDate(date, options);
    res.json({ result: formatted });
  });

  // 数字格式化
  router.post('/format-number', (req, res) => {
    const { number, options } = req.body;
    const formatted = formatNumber(number, options);
    res.json({ result: formatted });
  });

  return router;
}
```

**Step 2: 在 website 中添加 API 调用**

```typescript
// portals/website/src/api/locale.api.ts
import { apiClient } from './client';

export async function formatDateApi(date: Date | number | string, options?: any) {
  const response = await apiClient.post('/api/locale/format-date', { date, options });
  return response.data.result;
}

export async function formatNumberApi(number: number | string, options?: any) {
  const response = await apiClient.post('/api/locale/format-number', { number, options });
  return response.data.result;
}
```

**Step 3: 在 website 中创建 Hook**

```typescript
// portals/website/src/hooks/useLocaleFormatter.ts
import { useCallback } from 'react';
import { formatDateApi, formatNumberApi } from '@/api/locale.api';

export function useLocaleFormatter() {
  const formatDate = useCallback(async (date: Date | number | string, options?: any) => {
    return formatDateApi(date, options);
  }, []);

  const formatNumber = useCallback(async (number: number | string, options?: any) => {
    return formatNumberApi(number, options);
  }, []);

  return { formatDate, formatNumber };
}
```

**缺点**：
- 简单操作有网络延迟
- 增加 BFF 复杂度
- 重复代码（core-locale 已有实现）

---

### 方案 B：下沉到 @vxture/shared（更优方案）

```
portals/website (Frontend)
    │  import directly
    ▼
@vxture/shared (Shared layer)
```

#### 理由

**Core-locale 的功能符合 shared 层要求**：
- 纯工具函数，无副作用
- 格式化功能（formatDate/formatNumber）完全是通用工具
- 基于原生 Intl API，无平台耦合

**实施步骤**：

**Step 1: 在 packages/shared 中添加 locale 工具**

```typescript
// packages/shared/src/utils/locale.utils.ts
export function formatDate(date: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Intl.DateTimeFormat(navigator.language, options).format(dateObj);
}

export function formatNumber(number: number | string, options?: Intl.NumberFormatOptions): string {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat(navigator.language, options).format(num);
}

export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  return formatNumber(amount, { style: 'currency', currency });
}
```

**Step 2: 在 packages/shared/src/index.ts 中导出**

```typescript
export * from './utils/locale.utils';
```

**Step 3: 在 website 中直接使用**

```typescript
import { formatDate, formatNumber } from '@vxture/shared';
```

**优点**：
- 符合架构约束（shared 层允许被 portal 直接引用）
- 无网络延迟
- 统一实现，避免重复
- 性能最优

---

### 方案 C：修改架构约束（不建议）

直接允许 portal 层引用 `@vxture/core-locale`：

**优点**：
- 最简单，无需代码迁移
- 直接使用现有的 core-locale 功能

**缺点**：
- 破坏层边界约束
- 可能导致 core 层被前端框架污染
- 与项目架构原则不符

---

## 📊 方案对比

| 方案 | 架构合规性 | 实现复杂度 | 性能 | 维护成本 | 推荐指数 |
|------|------------|------------|------|----------|----------|
| A: BFF 访问 | ✅ 完全合规 | 🟡 中 | 🟡 中（网络延迟） | 🟡 中 | 3/5 |
| B: 下沉到 shared | ✅ 完全合规 | 🟡 中（需要迁移） | 🔴 高（直接调用） | 🟢 低（统一维护） | **5/5（强烈推荐）** |
| C: 修改约束 | ❌ 不符合 | 🟢 低 | 🔴 高 | 🟡 中（架构污染） | 1/5 |

---

## 🎯 推荐方案：方案 B

**理由**：
1. **完全符合架构**：`@vxture/shared` 是唯一允许被所有层直接引用的包
2. **功能定位一致**：格式化工具属于纯通用工具，符合 shared 层定位
3. **避免重复代码**：统一实现，前端和后端共享
4. **性能最优**：直接调用，无网络延迟
5. **维护成本低**：代码单一，避免版本不一致

---

## 🚀 实施路线图

### 短期（立即）
1. 在 `packages/shared/src/utils/` 中添加 locale 工具函数
2. 导出到 `@vxture/shared` 公共 API
3. website 直接使用 `@vxture/shared` 的格式化功能

### 长期（优化）
1. 评估是否需要将 core-locale 的其他功能下沉
2. 保持 core-locale 只保留服务器端专用功能
3. 统一 shared 层的 i18n 工具

---

## ✅ 架构原则保持

**通过方案 B，我们仍然严格遵守架构原则**：

```
portals/*
  ✅ → @vxture/shared        (直接包引用允许)
  ✅ → @vxture/design-system
  ✅ → BFF (HTTP)
  ❌ → @vxture/core-*         (通过 BFF 或 shared 层间接访问)
  ❌ → @vxture/service-*
  ❌ → @vxture/ai-sdk
```

**唯一变化**：格式化功能从 core-locale 下沉到 shared，这完全符合 shared 层的职责。
