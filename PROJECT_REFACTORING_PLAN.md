# Vxture 项目改造分析 - 2026-02-10

## 📋 项目现状评估

### 1. 项目定位
- **类型**: 企业官网展示平台（纯展示框架）
- **栈**: Next.js 15 + FastAPI + PostgreSQL
- **架构**: pnpm Monorepo（packages/web, packages/api）
- **用户**: 访客为主（无登录需求的页面为主）

### 2. 当前功能清单

✅ **已实现**:
- 页面框架（Home, About, Products）
- 主题系统（Light/Dark，基于 Zustand）
- 多语言框架（zh-CN/en-US，基于 Zustand）
- 响应式设计（TailwindCSS 4）
- 组件化架构（Header, Footer, Section components）
- 状态管理（Zustand + persist middleware）
- TypeScript 类型安全
- Git hooks 和代码规范

❌ **缺失或不完整**:
- 动态内容获取（当前硬编码在组件中）
- 完整的 i18n 翻译管理
- 系统主题检测（System Preference → Dark/Light）
- API 数据源集成
- 翻译资源的模块化管理

---

## 🎯 改造目标与方案

### 目标 1: JSON 数据 → API 动态内容

**现状**:
```typescript
// 当前：内容硬编码在组件中
const sections = [
  { id: 1, title: '特性', content: '...' },
  { id: 2, title: '产品', content: '...' },
]
```

**改造方案**:

#### 阶段 1: 数据分离 (Week 1)
1. **创建数据结构**:
   ```typescript
   // src/types/content.types.ts
   interface ContentBlock {
     id: string;
     type: 'hero' | 'features' | 'products' | 'cta';
     locale: 'zh-CN' | 'en-US';
     title: string;
     description?: string;
     items: ContentItem[];
     metadata: Record<string, any>;
   }
   ```

2. **将硬编码数据导出为 JSON**:
   ```
   public/data/
   ├── content.zh-CN.json      # 中文内容
   ├── content.en-US.json      # 英文内容
   ├── products.zh-CN.json     # 产品列表
   ├── products.en-US.json
   ├── cases.zh-CN.json        # 案例列表
   └── cases.en-US.json
   ```

3. **创建内容加载服务**:
   ```typescript
   // src/services/contentService.ts
   export async function fetchContent(
     type: string,
     locale: LocaleType
   ): Promise<ContentBlock[]> {
     // 先从 public/data/*.json 加载（静态，快速）
     const response = await fetch(`/data/${type}.${locale}.json`);
     return response.json();
   }
   ```

#### 阶段 2: API 集成 (Week 2-3)

**选项 A: Strapi CMS** (推荐)
```bash
# 后端添加 Strapi
cd packages && npx create-strapi-app cms --quickstart
```

**优势**:
- 无需编码，即可管理多语言内容
- 内置权限管理、发布流程
- 自动生成 REST/GraphQL API
- 前端可完全解耦

**集成步骤**:
```typescript
// src/services/contentService.ts
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function fetchContent(type: string, locale: LocaleType) {
  // 查询：GET /api/content-blocks?filters[type][$eq]={type}&filters[locale][$eq]={locale}
  const response = await fetch(`${STRAPI_URL}/api/${type}?locale=${locale}`);
  return response.json();
}
```

**选项 B: 自建内容 API (FastAPI)**
```python
# packages/api/app/routers/content.py
@router.get("/api/content/{type}/{locale}")
async def get_content(type: str, locale: str):
    """获取指定类型和语言的内容"""
    return await ContentService.get(type=type, locale=locale)
```

**选项 C: 混合方案** (推荐初期)
- 静态 JSON (public/data/*.json) → 快速启动，无后端依赖
- Strapi (后期) → 内容管理便利，版本控制
- 预留 API 接口 → 平滑过渡

**实现步骤**:
```typescript
// src/services/contentService.ts
const USE_STATIC_DATA = process.env.NEXT_PUBLIC_USE_STATIC_DATA === 'true';

export async function fetchContent(type: string, locale: LocaleType) {
  if (USE_STATIC_DATA) {
    // 加载静态 JSON
    return import(`@/data/${type}.${locale}.json`).then(m => m.default);
  } else {
    // 调用 API (Strapi 或自建)
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/content/${type}/${locale}`;
    const res = await fetch(url);
    return res.json();
  }
}
```

---

### 目标 2: 完善 i18n 系统

**现状**:
- ✅ 语言切换机制完整
- ❌ 翻译资源硬编码在 store 中
- ❌ 缺少 Server-Side Rendering (SSR) 国际化支持
- ❌ 没有翻译文件管理系统

**改造方案**:

#### 阶段 1: 翻译文件模块化 (Week 1-2)

**项目结构**:
```
src/locales/
├── zh-CN/
│   ├── common.json          # 公共词汇
│   ├── navigation.json      # 导航
│   ├── home.json            # 首页
│   ├── products.json        # 产品页
│   └── footer.json          # 页脚
├── en-US/
│   ├── common.json
│   ├── navigation.json
│   ├── home.json
│   ├── products.json
│   └── footer.json
└── index.ts                 # 导出函数
```

**翻译文件示例**:
```json
// src/locales/zh-CN/common.json
{
  "common.backToHome": "返回首页",
  "common.submit": "提交",
  "common.cancel": "取消",
  "header.login": "登录",
  "header.language": "语言",
  "header.theme": "主题",
  "footer.copyright": "© 2025 vxture. All rights reserved."
}
```

**加载翻译的函数**:
```typescript
// src/services/i18nService.ts
import zhCommon from '@/locales/zh-CN/common.json';
import zhHome from '@/locales/zh-CN/home.json';
// ... 其他导入

const translations = {
  'zh-CN': {
    common: zhCommon,
    home: zhHome,
    // ...
  },
  'en-US': {
    common: enCommon,
    home: enHome,
    // ...
  },
};

export function getTranslations(locale: LocaleType) {
  return translations[locale] || translations['zh-CN'];
}
```

**更新 store**:
```typescript
// src/stores/i18nStore.ts
export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: 'zh-CN',
      // 使用嵌套的命名空间获取翻译
      t: (key: string) => {
        const { locale } = get();
        const [namespace, ...keyParts] = key.split('.');
        const translations = getTranslations(locale);
        let value = translations[namespace];
        
        for (const part of keyParts) {
          value = value?.[part];
        }
        
        return value || key;
      },
    }),
    // ...
  )
);
```

#### 阶段 2: 翻译工具集成 (Week 2-3)

**推荐方案：i18next** (业界标准)

```bash
pnpm add i18next next-i18next i18next-browser-languagedetector
```

**优势**:
- 自动语言检测
- 命名空间分割
- 插值、复数形式支持
- 翻译缺失提醒

**配置**:
```typescript
// i18next.config.ts
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import zhCommon from '@/locales/zh-CN/common.json';
import enCommon from '@/locales/en-US/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh-CN',
    ns: ['common', 'home', 'products'],
    defaultNS: 'common',
    resources: {
      'zh-CN': { common: zhCommon },
      'en-US': { common: enCommon },
    },
  });
```

**使用示例**:
```typescript
// 在组件中
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t, i18n } = useTranslation();
  
  return (
    <header>
      <h1>{t('header.title')}</h1>
      <button onClick={() => i18n.changeLanguage('en-US')}>
        {t('header.language')}
      </button>
    </header>
  );
}
```

#### 阶段 3: SEO 和 SSR 国际化 (Week 3)

**问题**: 当前 SSR 时无法根据语言生成元数据

**方案**:
```typescript
// src/app/layout.tsx
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale(); // 从 Accept-Language 或 Cookie 获取
  
  const metadata = {
    'zh-CN': {
      title: 'vxture AI | 释放数据潜力',
      description: '基于AI的虚拟自然探索平台',
    },
    'en-US': {
      title: 'vxture AI | Unleash Data Potential',
      description: 'AI-based virtual nature exploration platform',
    },
  };
  
  return {
    title: metadata[locale].title,
    description: metadata[locale].description,
  };
}
```

---

### 目标 3: 主题系统升级

**现状**:
- ✅ Dark/Light 主题切换工作
- ❌ 缺少系统主题检测（System Preference）
- ❌ 主题颜色变量不完整
- ❌ 主题切换没有过渡动画

**改造方案**:

#### 第 1 步: 系统主题检测

```typescript
// src/stores/themeStore.ts
export type Theme = 'light' | 'dark' | 'system';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system', // 默认跟随系统
      effectiveTheme: 'light', // 实际生效的主题
      
      /**
       * 初始化主题
       * 1. 检查 localStorage
       * 2. 如果是 'system'，检测系统偏好
       * 3. 应用到 DOM
       */
      initTheme: () => {
        const saved = localStorage.getItem('theme-storage');
        let theme: Theme = 'system';
        
        if (saved) {
          try {
            const { theme: savedTheme } = JSON.parse(saved);
            theme = savedTheme || 'system';
          } catch (e) {
            console.error('Failed to parse theme:', e);
          }
        }
        
        // 获取实际应用的主题
        const effective = theme === 'system' 
          ? detectSystemTheme() 
          : theme;
        
        applyTheme(effective);
        set({ theme, effectiveTheme: effective });
      },
      
      setTheme: (theme: Theme) => {
        const effective = theme === 'system' 
          ? detectSystemTheme() 
          : theme;
        
        applyTheme(effective);
        set({ theme, effectiveTheme: effective });
      },
    }),
    {
      name: 'theme-storage',
      version: 1,
    }
  )
);

// 系统主题检测
function detectSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// 监听系统主题变化
function watchSystemTheme() {
  if (typeof window === 'undefined') return;
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      store.initTheme(); // 重新应用
    }
  });
}
```

#### 第 2 步: TailwindCSS 主题变量完善

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 语义化颜色
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c2d6b',
        },
        secondary: {
          50: '#f5f3ff',
          500: '#a855f7',
          900: '#5e1a84',
        },
        // 亮色主题
        light: {
          bg: '#ffffff',
          surface: '#f9fafb',
          text: '#1f2937',
          border: '#e5e7eb',
        },
        // 暗色主题
        dark: {
          bg: '#1f2937',
          surface: '#111827',
          text: '#f9fafb',
          border: '#374151',
        },
      },
    },
  },
  darkMode: 'class', // 使用 class 而不是 media
};
```

#### 第 3 步: 主题切换动画

```typescript
// src/components/layout/Header.tsx
export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  
  return (
    <button
      onClick={() => {
        // 添加过渡效果
        document.documentElement.style.colorScheme = 
          theme === 'light' ? 'dark' : 'light';
        
        setTheme(theme === 'light' ? 'dark' : 'light');
      }}
      className={cn(
        'transition-all duration-300 ease-in-out',
        'p-2 rounded-lg',
        'hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      {theme === 'light' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

---

### 目标 4: 完整的 API 集成架构

**改造流程**:

#### 第 1 阶段: 静态数据 (立即开始)
```
public/data/
└── *.json (静态内容，无后端依赖)
```

#### 第 2 阶段: 自建 API (Week 2)
```python
# packages/api/app/routers/content.py
@router.get("/content/{type}")
async def get_content(type: str, locale: str = "zh-CN"):
    """获取内容数据"""
    pass
```

#### 第 3 阶段: Strapi CMS (Week 3+)
```
packages/
├── web/        # Next.js 前端
├── api/        # FastAPI 后端
└── cms/        # Strapi CMS (可选)
```

**API 调用链**:
```typescript
// src/services/contentService.ts
export async function getContent(
  type: string,
  locale: LocaleType,
  options: { useCache?: boolean } = {}
) {
  // 策略：内存缓存 → localStorage → 静态 JSON → API → Strapi
  
  // 1. 内存缓存
  if (contentCache[`${type}-${locale}`]) {
    return contentCache[`${type}-${locale}`];
  }
  
  // 2. 尝试 API (如果配置)
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${type}?locale=${locale}`);
      const data = await res.json();
      contentCache[`${type}-${locale}`] = data;
      return data;
    } catch (e) {
      console.warn('API fallback to static JSON:', e);
    }
  }
  
  // 3. 降级到静态 JSON
  const data = await import(`@/data/${type}.${locale}.json`).then(m => m.default);
  contentCache[`${type}-${locale}`] = data;
  return data;
}
```

---

## 🛠️ 实施路线图

### Week 1: 基础改造
- [ ] 分离硬编码数据 → JSON 文件
- [ ] 创建统一的数据加载服务
- [ ] 模块化翻译资源
- [ ] 系统主题检测实现

**交付物**:
- `src/services/contentService.ts` (数据加载)
- `src/services/i18nService.ts` (翻译管理)
- `public/data/*.json` (静态内容)
- `src/locales/` (翻译文件结构)

### Week 2: i18next 集成
- [ ] 安装 i18next 依赖
- [ ] 配置 i18next
- [ ] 迁移现有翻译到 i18n
- [ ] 更新组件使用 i18next

**交付物**:
- `i18next.config.ts` (配置)
- 所有组件更新 (`useTranslation()`)

### Week 3: API 集成（自建后端）
- [ ] FastAPI 路由开发
- [ ] 数据库模型设计
- [ ] 内容管理接口
- [ ] 前端 API 调用

### Week 4+: Strapi CMS（可选）
- [ ] Strapi 部署
- [ ] 内容类型定义
- [ ] 多语言配置
- [ ] 前端适配

---

## 📁 文件结构变化

```
当前：
src/
├── stores/
│   ├── i18nStore.ts (翻译硬编码)
│   └── themeStore.ts
├── components/
│   └── home/
│       ├── HeroSection.tsx (内容硬编码)
│       └── ProductSection.tsx (内容硬编码)
└── services/
    └── i18nService.ts (空)

目标：
src/
├── stores/
│   ├── i18nStore.ts ✅ (只管理 locale 状态)
│   ├── themeStore.ts ✅ (支持 system 选项)
│   └── contentStore.ts 🆕 (管理加载的内容)
├── services/
│   ├── i18nService.ts ✅ (加载翻译文件)
│   ├── contentService.ts 🆕 (加载内容数据)
│   └── apiClient.ts 🆕 (API 客户端)
├── locales/ 🆕
│   ├── zh-CN/
│   │   ├── common.json
│   │   ├── navigation.json
│   │   └── home.json
│   └── en-US/
│       ├── common.json
│       ├── navigation.json
│       └── home.json
├── types/
│   ├── content.types.ts 🆕
│   └── ...
└── components/
    └── home/
        ├── HeroSection.tsx ✅ (从 contentStore 读取)
        └── ProductSection.tsx ✅ (从 contentStore 读取)

public/
└── data/ 🆕
    ├── hero.zh-CN.json
    ├── hero.en-US.json
    ├── products.zh-CN.json
    ├── products.en-US.json
    └── ...
```

---

## 🔧 关键实施细节

### 1. 内容加载优化
```typescript
// 使用 TanStack Query 缓存内容
import { useQuery } from '@tanstack/react-query';

export function useContent(type: string, locale: LocaleType) {
  return useQuery({
    queryKey: ['content', type, locale],
    queryFn: () => contentService.fetch(type, locale),
    staleTime: 1000 * 60 * 5, // 5 分钟缓存
  });
}
```

### 2. 服务端渲染
```typescript
// src/app/(main)/page.tsx
export const revalidate = 3600; // ISR: 1 小时重新验证

export default async function HomePage() {
  // 服务端获取内容和翻译
  const locale = await getServerLocale();
  const content = await fetchContent('home', locale);
  const i18n = getTranslations(locale);
  
  return <PageComponent initialContent={content} i18n={i18n} />;
}
```

### 3. 环境变量管理
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_STATIC_DATA=true  # 开发时使用静态数据
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337  # 生产时可用
```

---

## 📊 技术对比表

| 功能 | 当前 | Week 1 | Week 2 | Week 3 | Week 4 |
|------|------|--------|--------|--------|--------|
| 数据来源 | 硬编码 | JSON | JSON | JSON+API | Strapi |
| i18n 方案 | Zustand | Zustand | i18next | i18next | i18next |
| 主题系统 | Light/Dark | +System | +System | +System | +System |
| 翻译文件 | Store 中 | locales/ | locales/ | locales/ | Strapi |
| 缓存策略 | 无 | localStorage | localStorage | React Query | React Query |
| SEO 友好度 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 维护难度 | 低 | 中 | 中 | 高 | 高 |

---

## 🎯 优先级建议

**P0 (立即做)**:
1. ✅ 分离数据到 JSON
2. ✅ 系统主题检测
3. ✅ 模块化翻译

**P1 (第 2 周)**:
4. i18next 集成
5. TanStack Query 缓存

**P2 (第 3 周+)**:
6. FastAPI 内容 API
7. Strapi CMS (可选)

---

## 📝 总结

### 核心改造思路
1. **数据分离**: 硬编码 → JSON → API
2. **i18n 升级**: Zustand → i18next (业界标准)
3. **主题完善**: Light/Dark → +System (跟随系统)
4. **API 架构**: 静态 → 自建 API → Strapi (渐进式)

### 优势
- ✅ 循序渐进，风险低
- ✅ 每一步都可以单独交付
- ✅ 内容管理与代码完全解耦
- ✅ 支持快速迭代和版本管理

### 预期成果
- 企业级内容管理系统
- 完整的国际化支持
- 规范的主题系统
- 可维护的、可扩展的架构
