# CLAUDE.md — @vxture/website

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

要求全部会话用中文回复

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/website` |
| 路径 | `portals/website/` |
| @layer | `Presentation` |
| 服务对象 | 公开营销站点 |

---

## 依赖约束

### 核心原则

只允许依赖**纯显示、无安全风险**的包：

```
✅ @vxture/design-system（组件、theme、tokens）
✅ @vxture/platform-*（地图、3D 等 SDK，可选）
✅ @vxture/shared（基础工具）
✅ @vxture/core-locale（i18n 格式化工具，唯一允许的 core 包）
✅ BFF（HTTP only，禁止包引用）
❌ @vxture/service-*（绕过 BFF 直连禁止）
❌ @vxture/core-api, core-auth, core-config, core-tenant, core-utils（其他 core 包禁止）
❌ @vxture/ai-sdk
❌ agent-server/*
```

---

## 📁 文件结构规范

```
src/
├── app/              # Next.js App Router 页面
├── components/       # 页面专属组件
│   ├── common/       # 跨页面复用
│   ├── home/         # 首页组件
│   └── layout/       # 布局组件
├── hooks/            # 数据获取、业务 Hooks
├── stores/           # 全局状态（Zustand）
├── api/              # BFF 接口调用层
├── shared/           # 共享常量、类型、上下文
│   ├── constants/    # 常量配置
│   ├── contexts/     # React 上下文
│   └── types/        # TypeScript 类型
├── data/             # 模拟数据
└── index.ts
```

---

## 编写要求

1. **API 调用统一放在 `api/` 目录**，页面组件不直接调用 fetch
2. 复杂业务状态使用 Hook 封装，不写在组件内部
3. 组件文件不超过 150 行，超出则拆分
4. 使用 `@vxture/design-system` 的组件，不自行实现已有 UI 原语
5. 页面级组件使用懒加载（`React.lazy`）
6. i18n 格式化工具优先使用 `@vxture/shared` 的纯工具函数（预留），或使用 `@vxture/core-locale`

---

## i18n 使用规范

### 翻译文本

```typescript
// ✅ 使用 next-intl
import { useTranslation } from 'next-intl';

function MyComponent() {
  const { t } = useTranslation();
  return <p>{t('common.title')}</p>;
}
```

### 格式化

```typescript
// ✅ 推荐：使用 @vxture/shared 的纯工具函数（预留）
import { formatDate, formatNumber, formatCurrency } from '@vxture/shared';

const date = formatDate(new Date(), 'zh-CN', { dateStyle: 'long' });
const number = formatNumber(1000.5, 'en-US', { style: 'decimal' });
const currency = formatCurrency(100, 'USD', 'zh-CN');

// ✅ 备选：使用 @vxture/core-locale（无需通过 BFF）
import { formatDate, formatNumber } from '@vxture/core-locale';

const date = formatDate(new Date());
const number = formatNumber(1000);
```

---

## AI 编码规则

1. 组件文件头部必须包含完整文件头
2. 超过 80 行的文件必须添加分区注释
3. 禁止使用 `any` 类型
4. 所有公共符号通过 `index.ts` 导出
5. 文件命名使用 kebab-case

---

## 文件头模板

参见：docs\ai-coding\claude-coding-comments.md

