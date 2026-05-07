# CLAUDE.md — @vxture/website

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。
> 版本：2.0.0 | 日期：2026-05-06

要求全部会话用中文回复

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/website` |
| 路径 | `portals/website/` |
| @layer | `Presentation` |
| 服务对象 | 公开营销站点 |
| 框架 | Next.js 15.5.6 (App Router + Turbopack) |
| 端口 | 3010 |

---

## 依赖约束

### 核心原则

只允许依赖**纯显示、无安全风险**的包：

```typescript
✅ @vxture/design-system（组件、theme、tokens、icons）
✅ @vxture/platform-*（地图、3D 等 SDK，可选）
✅ @vxture/shared（基础工具、Locale 类型/常量）
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
├── components/       # 页面专属组件（按职责分层）
│   ├── layout/       # 全局布局（Header, Footer, Sidebar）
│   ├── marketing/    # 营销页区块组件
│   ├── cases/        # 案例库页组件
│   ├── auth/         # 认证页组件
│   └── ui/           # 应用级 UI 扩展
├── hooks/            # 自定义 React Hooks
├── stores/           # 全局状态（Zustand，只存 UI 状态，不存 token）
├── api/              # BFF 接口调用层（axios）
├── data/             # 结构数据（不含翻译文本，使用 i18n key 引用）
├── lib/              # 框架胶水代码
│   ├── i18n/         # next-intl 配置（routing / navigation / request）
│   └── content/      # Content Registry 系统
├── constants/        # website 专属常量
├── types/            # website 专属类型
└── middleware.ts     # Next.js Middleware（认证 + intl + pathname）
```

### 核心路由结构

```
[locale]/
  (public)/layout.tsx        ← ⭐ Header + Footer 唯一实例
  (marketing)/               ← 营销页（TODO：未来移入 (public)）
  (content)/                 ← Content Registry（TODO：未来移入 (public)）
  (auth)/                    ← 认证页（无 Header/Footer）
```

### Content Registry 系统

Content Registry 通过 `(content)/[...slug]/page.tsx` 通配路由接管所有内容类页面。

```
CONTENT_REGISTRY = {
  legal:  { loader: legalLoader,  staticParams: legalStaticParams },
  blog:   { loader: blogLoader,   staticParams: blogStaticParams },
  faq:    { loader: createStubLoader('faq') },
  support:{ loader: createStubLoader('support') },
  // ... 其他 stub 区段
}
```

扩展示例：
```typescript
// 1. types.ts — ContentSection 追加 key
// 2. 实现 ContentLoader 函数
// 3. registry.ts 注册
```

---

## 编写要求

1. **API 调用统一放在 `api/` 目录**，页面组件不直接调用 fetch
2. 复杂业务状态使用 Hook 封装，不写在组件内部
3. 组件文件不超过 150 行，超出则拆分
4. 使用 `@vxture/design-system` 的组件，不自行实现已有 UI 原语
5. 页面级组件使用懒加载（`React.lazy`）
6. i18n 格式化工具优先使用 `@vxture/shared` 的纯工具函数，或使用 `@vxture/core-locale`
7. **结构数据与翻译分离** — data 文件只含结构（href、图片路径、i18n key），所有文本在 messages/ 中
8. **组件导出统一通过 index.ts** — 各组件目录（layout/marketing/cases/auth/ui）均有 index.ts

---

## i18n 使用规范

### 翻译文本

```typescript
// ✅ 使用 next-intl
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('home.hero');
  return <p>{t('title')}</p>;
}
```

### 翻译文件结构

```
messages/{locale}/
├── common/common.json         # 权威：通用词
├── layout/header.json         # 权威：顶栏
├── layout/footer.json         # 权威：底栏
├── home/{hero,features,solutions,cases,cta}.json  # 首页各区块
├── appcenter.json             # 应用广场
├── products.json              # 产品服务
├── solutions.json             # 解决方案
├── cases.json                 # 案例库（列表 + 详情）
├── legal.json                 # 🆕 法律政策（列表 + 详情文档）
├── company/{about,contact}.json
└── auth/auth.json
```

注意：`common.json`、`layout.json`、`home.json` 等根级文件为**指针文件（遗留残留）**，`request.ts` 忽略不加载。

### 格式化

```typescript
// ✅ 推荐：使用 @vxture/shared 的纯工具函数
import { formatDate, formatNumber, formatCurrency } from '@vxture/shared';

// ✅ 备选：使用 @vxture/core-locale（无需通过 BFF）
import { formatDate, formatNumber } from '@vxture/core-locale';
```

---

## Middleware 设计

`middleware.ts` 固定三个关注点顺序：

```
1. 认证重定向 — 读取 vx_refresh_token Cookie，保护 /dashboard
2. intlMiddleware — next-intl 语言前缀路由（zh-CN / en-US）
3. response.headers.set('x-pathname', ...) — 供 request.ts 按需加载翻译
```

不在 middleware 层拦截"已登录用户访问登录页"——由客户端 `AuthSessionBootstrap` 处理。

---

## AI 编码规则

1. 组件文件头部必须包含完整文件头（参见 docs/ai-coding/claude-coding-comments.md）
2. 超过 80 行的文件必须添加分区注释
3. 禁止使用 `any` 类型
4. 所有公共符号通过 `index.ts` 导出
5. 文件命名使用 kebab-case（翻译文件）或 PascalCase/camelCase（源码）
6. **禁止直接引用 `(footer-links)/` 相关路径** — 已被 Content Registry 取代
7. **新增内容页时优先使用 Content Registry 机制** — 不要创建静态路由文件
8. **Header 和 Footer 实例化在 `(public)/layout.tsx`** — 不要在子路由 layout 中重复渲染

