## 完整目录结构调整方案

### 当前结构

```
packages/web/src/
├── app/
├── components/
├── constants/
├── contexts/
├── hooks/
├── services/
├── stores/
├── styles/
├── theme/
├── types/
└── utils/
```

### 目标结构（调整后）

```
packages/web/
├── public/
│   ├── data/                          # 🆕 静态内容数据
│   │   ├── hero.zh-CN.json
│   │   ├── hero.en-US.json
│   │   ├── features.zh-CN.json
│   │   ├── features.en-US.json
│   │   ├── products.zh-CN.json
│   │   ├── products.en-US.json
│   │   ├── cases.zh-CN.json
│   │   ├── cases.en-US.json
│   │   └── cta.zh-CN.json
│   │       cta.en-US.json
│   ├── images/
│   ├── icons/
│   └── videos/
│
├── src/
│   ├── app/                           # Next.js 路由
│   │   ├── (auth)/
│   │   ├── (main)/
│   │   ├── about/
│   │   ├── products/
│   │   ├── test/
│   │   ├── layout.tsx                 # 根布局（SSR）
│   │   ├── globals.css                # 全局样式
│   │   └── ...
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx             # 导航栏（use client）
│   │   │   ├── Footer.tsx             # 页脚（use client）
│   │   │   └── Sidebar.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx        # 使用 useContent('hero')
│   │   │   ├── FeaturesSection.tsx    # 使用 useContent('features')
│   │   │   ├── ProductSection.tsx     # 使用 useContent('products')
│   │   │   └── CTASection.tsx
│   │   ├── about/
│   │   ├── products/
│   │   ├── common/
│   │   │   ├── Notifications.tsx
│   │   │   ├── ClientSyncAgg.tsx
│   │   │   └── ...
│   │   └── atomic/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── ...
│   │
│   ├── locales/                       # 🆕 翻译文件（替换 Store 中硬编码的翻译）
│   │   ├── zh-CN/
│   │   │   ├── common.json            # { "common.submit": "提交" }
│   │   │   ├── navigation.json        # { "nav.home": "首页" }
│   │   │   ├── home.json              # { "hero.title": "释放数据潜力" }
│   │   │   ├── products.json
│   │   │   ├── footer.json
│   │   │   └── errors.json
│   │   ├── en-US/
│   │   │   ├── common.json
│   │   │   ├── navigation.json
│   │   │   ├── home.json
│   │   │   ├── products.json
│   │   │   ├── footer.json
│   │   │   └── errors.json
│   │   └── index.ts                   # 导出 getTranslations() 函数
│   │
│   ├── stores/                        # Zustand 状态管理
│   │   ├── themeStore.ts              # 🔄 升级：添加 'system' 支持
│   │   ├── i18nStore.ts               # 🔄 简化：只保留 locale 状态，移除翻译数据
│   │   ├── authStore.ts
│   │   ├── notificationStore.ts
│   │   ├── contentStore.ts            # 🆕 可选：管理加载的内容
│   │   └── persistHelper.ts
│   │
│   ├── services/                      # 业务服务层
│   │   ├── contentService.ts          # 🆕 内容加载（支持 JSON + API 降级）
│   │   ├── i18nService.ts             # 🔄 改：加载翻译文件而非存储
│   │   ├── apiClient.ts               # 🆕 API 客户端
│   │   ├── authService.ts
│   │   └── themeService.ts
│   │
│   ├── hooks/                         # React 自定义 Hook
│   │   ├── useContent.ts              # 🆕 加载内容数据（集成 React Query）
│   │   ├── useWindowScrollSnap.ts
│   │   ├── useScrollSnap.js
│   │   └── ...
│   │
│   ├── lib/                           # 🆕 通用工具函数
│   │   ├── apiClient.ts               # 已移到 services，此处删除
│   │   └── cache.ts
│   │
│   ├── constants/
│   │   ├── i18nConfig.ts              # 多语言配置（保持不动）
│   │   ├── themeConfig.ts             # 主题配置
│   │   └── authConfig.ts
│   │
│   ├── types/
│   │   ├── content.types.ts           # 🆕 内容数据类型定义
│   │   ├── i18n.types.ts
│   │   ├── theme.types.ts
│   │   ├── auth.types.ts
│   │   └── api.types.ts               # 🆕 API 响应类型
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── base/
│   │   ├── components/
│   │   ├── themes/
│   │   └── utilities/
│   │
│   ├── utils/
│   │   ├── scroll.ts
│   │   ├── string.ts
│   │   └── ...
│   │
│   ├── theme/
│   │   └── colorMap.ts
│   │
│   ├── contexts/
│   │   └── GlobalContext.tsx
│   │
│   └── global.d.ts
│
├── package.json                       # 检查依赖：i18next（可选）
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── ...

packages/api/
└── ...（无需改动）
```

---

## 📋 目录变化清单

### 新增目录/文件

| 路径                             | 用途             | 优先级      |
| -------------------------------- | ---------------- | ----------- |
| `public/data/`                   | 静态内容 JSON    | P0 (Week 1) |
| `src/locales/`                   | 多语言翻译文件   | P0 (Week 1) |
| `src/services/contentService.ts` | 内容加载服务     | P0 (Week 1) |
| `src/services/apiClient.ts`      | API 客户端       | P1 (Week 2) |
| `src/hooks/useContent.ts`        | 内容加载 Hook    | P0 (Week 1) |
| `src/types/content.types.ts`     | 内容类型定义     | P0 (Week 1) |
| `src/stores/contentStore.ts`     | 内容状态（可选） | P2          |
| `src/locales/index.ts`           | 翻译导出函数     | P0 (Week 1) |

### 修改文件

| 文件                               | 改动                               | 优先级      |
| ---------------------------------- | ---------------------------------- | ----------- |
| `src/stores/themeStore.ts`         | 添加 `theme: 'system'` 支持        | P0 (Week 1) |
| `src/stores/i18nStore.ts`          | 移除翻译硬编码，只保留 locale 状态 | P0 (Week 1) |
| `src/services/i18nService.ts`      | 改为加载 `src/locales/` 文件       | P0 (Week 1) |
| `src/components/home/*.tsx`        | 使用 `useContent()` 替代硬编码数据 | P0 (Week 1) |
| `src/components/layout/Header.tsx` | 更新主题选择为支持 'system'        | P0 (Week 1) |
| `package.json`                     | 可选添加 `i18next` 依赖            | P1 (Week 2) |

### 删除/合并

| 文件 | 操作 | 原因                   |
| ---- | ---- | ---------------------- |
| -    | 无   | 保持向后兼容，逐步迁移 |

---

## 🔧 Week 1 快速实施

### Step 1: 创建目录

```bash
mkdir -p public/data
mkdir -p src/locales/{zh-CN,en-US}
```

### Step 2: 导出内容为 JSON

**从 components 中提取**:

```bash
# public/data/hero.zh-CN.json
{
  "id": "hero-zh",
  "type": "hero",
  "locale": "zh-CN",
  "title": "释放数据潜力",
  "description": "...",
  "items": [...]
}

# 重复为: hero.en-US, features.zh-CN, features.en-US, ...
```

### Step 3: 导出翻译到文件

**从 i18nStore 中提取**:

```bash
# src/locales/zh-CN/common.json
{
  "common.submit": "提交",
  "common.cancel": "取消",
  "common.backToHome": "返回首页"
}

# src/locales/zh-CN/home.json
{
  "hero.title": "释放数据潜力",
  "hero.description": "..."
}

# 重复为: en-US 版本
```

### Step 4: 创建内容加载服务

```typescript
// src/services/contentService.ts
export async function fetchContent(type: string, locale: string) {
  try {
    // 优先 API（如果配置）
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/content/${type}?locale=${locale}`
      );
      if (res.ok) return res.json();
    }
  } catch (e) {
    console.warn(`API 调用失败，降级到 JSON: ${e}`);
  }

  // 降级到静态 JSON
  const data = await import(`@/data/${type}.${locale}.json`).then((m) => m.default);
  return data;
}
```

### Step 5: 创建内容 Hook

```typescript
// src/hooks/useContent.ts
import { useQuery } from '@tanstack/react-query';
import { fetchContent } from '@/services/contentService';

export function useContent(type: string, locale: string) {
  return useQuery({
    queryKey: ['content', type, locale],
    queryFn: () => fetchContent(type, locale),
    staleTime: 1000 * 60 * 5, // 5 分钟
  });
}
```

### Step 6: 更新组件

```typescript
// src/components/home/FeaturesSection.tsx - Before
const sections = [{ title: '特性', items: [...] }];
export default function FeaturesSection() {
  return sections.map(...);
}

// After
import { useContent } from '@/hooks/useContent';
import { useI18nStore } from '@/stores/i18nStore';

export default function FeaturesSection() {
  const locale = useI18nStore(s => s.locale);
  const { data, isLoading } = useContent('features', locale);

  if (isLoading) return <div>Loading...</div>;
  return data?.items?.map(...);
}
```

### Step 7: 升级主题 Store

```typescript
// src/stores/themeStore.ts - 添加
export type Theme = 'light' | 'dark' | 'system'; // 新增 system

export const useThemeStore = create<ThemeState>()(
  persist((set, get) => ({
    theme: 'system' as Theme, // 改为默认 system
    effectiveTheme: detectSystemTheme(),

    initTheme: () => {
      // 检测系统主题 + 监听变化
      const effective = detectSystemTheme();
      set({ effectiveTheme: effective });

      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (get().theme === 'system') {
          set({ effectiveTheme: e.matches ? 'dark' : 'light' });
        }
      });
    },
  }))
);
```

### Step 8: 简化 i18n Store

```typescript
// src/stores/i18nStore.ts - 移除翻译数据
export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'zh-CN' as LocaleType,

      setLocale: (locale) => {
        set({ locale });
        // 触发内容重新加载（通过 useContent hook 的 queryKey 变化）
      },
    }),
    { name: 'locale-storage' }
  )
);

// 翻译由 i18nService 加载
```

### Step 9: 更新 i18n Service

```typescript
// src/services/i18nService.ts
import { LocaleType } from '@/types/i18n.types';

export async function getTranslations(locale: LocaleType) {
  // 动态加载翻译文件
  const common = await import(`@/locales/${locale}/common.json`).then((m) => m.default);
  const home = await import(`@/locales/${locale}/home.json`).then((m) => m.default);

  return { common, home };
}
```

### Step 10: 测试

```bash
pnpm run type-check
pnpm run dev
# 访问 localhost:3000 验证所有功能正常
```

---

## ✅ 验证清单（Week 1 完成后）

- [ ] `public/data/` 包含所有内容 JSON
- [ ] `src/locales/` 包含所有翻译文件
- [ ] `useContent()` Hook 工作正常
- [ ] 主要组件（Hero, Features, Products）使用 `useContent()`
- [ ] 主题切换支持 Light/Dark/System 三个选项
- [ ] i18n Store 只包含 locale 状态，无翻译数据
- [ ] 语言切换时内容自动更新
- [ ] `pnpm type-check` 通过
- [ ] 无控制台错误
- [ ] `localhost:3000` 完全正常工作

---

## 📝 文件对照表

| 类别 | 文件                             | 说明         |
| ---- | -------------------------------- | ------------ |
| 🆕   | `public/data/*.json`             | 所有页面内容 |
| 🆕   | `src/locales/*/`                 | 翻译文件     |
| 🆕   | `src/services/contentService.ts` | 内容加载     |
| 🆕   | `src/services/apiClient.ts`      | API 客户端   |
| 🆕   | `src/hooks/useContent.ts`        | 内容 Hook    |
| 🆕   | `src/types/content.types.ts`     | 内容类型     |
| 🔄   | `src/stores/themeStore.ts`       | 支持 system  |
| 🔄   | `src/stores/i18nStore.ts`        | 简化状态     |
| 🔄   | `src/services/i18nService.ts`    | 加载文件     |
| 🔄   | `src/components/home/*.tsx`      | 使用 Hook    |

---

## 🎯 总结

**新增**: 4 个文件/目录 (contentService, useContent, content.types, public/data, src/locales)
**修改**: 4 个文件 (themeStore, i18nStore, i18nService, 组件们)
**删除**: 0 个文件
**时间**: 8-12 小时（1-2 天）
**复杂度**: 低（逐步迁移，无破坏性改动）
