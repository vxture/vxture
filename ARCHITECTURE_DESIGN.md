# Vxture 架构设计文档

## 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        浏览器客户端                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Header       │  │ Main Content │  │ Footer               │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│         ▲                  ▲                    ▲               │
│         │                  │                    │               │
└─────────┼──────────────────┼────────────────────┼───────────────┘
          │                  │                    │
          ├─────────────────┬┴────────────────────┤
          │                 │                    │
    ┌─────▼─────┐  ┌─────────▼──────┐  ┌────────▼────────┐
    │ 状态管理   │  │   翻译系统     │  │   内容系统      │
    │ (Zustand) │  │  (i18next)     │  │ (ContentStore)  │
    └─────┬─────┘  └─────────┬──────┘  └────────┬────────┘
          │                  │                    │
          ├──────────────────┼────────────────────┤
          │                  │                    │
    ┌─────▼─────────────────┴────────────────────▼─────┐
    │           React Query (TanStack Query)          │
    │         缓存层 & 服务端状态管理                  │
    └─────┬──────────────────────────────────────────┬─┘
          │                                          │
          ├──────────────────┬───────────────────────┤
          │                  │                       │
    ┌─────▼──────────┐  ┌────▼──────────────┐  ┌────▼──────┐
    │ 静态数据加载    │  │ 翻译文件加载      │  │ API 调用  │
    │ public/data/   │  │ src/locales/      │  │ FastAPI   │
    │   *.json       │  │   *.json          │  │ or Strapi │
    └────────────────┘  └───────────────────┘  └───────────┘
          │                                          │
          └──────────────────────┬───────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   后端服务 API         │
                    │ (FastAPI + PostgreSQL) │
                    │ 或 Strapi CMS          │
                    └────────────────────────┘
```

---

## 1. 客户端架构

### 1.1 核心层次

```
应用层 (App Layer)
├── 页面路由 (pages)
├── 布局组件 (layouts)
└── 特定功能页面

组件层 (Component Layer)
├── Layout Components (Header, Footer, Navigation)
├── Content Components (Hero, Features, Products, CTA)
├── Common Components (Buttons, Cards, Forms)
└── Atomic Components (Icons, Text, Badges)

状态层 (State Layer)
├── Zustand Stores
│   ├── useThemeStore (主题状态)
│   ├── useI18nStore (语言状态)
│   ├── useAuthStore (认证状态)
│   └── useContentStore (内容状态)
├── React Context (全局 Props)
└── React Query (服务器状态)

服务层 (Service Layer)
├── API Clients
├── Data Loaders (JSON, API)
├── i18n Utilities
└── Theme Utilities

Hook 层 (Custom Hooks)
├── useContent (内容加载)
├── useTranslation (翻译)
├── useTheme (主题切换)
└── useLocalStorage (本地存储)

数据层 (Data Layer)
├── 静态数据 (public/data/)
├── 翻译文件 (src/locales/)
└── API 接口 (后端)
```

### 1.2 数据流

#### 初始化流程

```
1. App 启动 → RootLayout (SSR)
   ├─ getServerTheme() → 读取 Cookie
   ├─ getServerLocale() → 读取 Accept-Language
   └─ 初始化 HTML 属性 (lang, data-theme, class)

2. 客户端水合 (Hydration)
   ├─ useThemeStore.initTheme()
   ├─ useI18nStore.setLocale()
   └─ ClientSyncAgg 同步状态

3. 页面加载
   ├─ useContent() 使用 React Query 缓存内容
   ├─ useTranslation() 获取翻译
   └─ 渲染组件
```

#### 内容获取流程

```
useContent(type, locale)
    ↓
contentService.fetch()
    ├─ 检查 React Query 缓存
    │   ├─ 命中 → 返回缓存
    │   └─ 未命中 ↓
    ├─ 尝试 API 调用
    │   ├─ 成功 → 返回 + 缓存
    │   └─ 失败 ↓
    └─ 加载静态 JSON
        └─ 返回 + 缓存
```

#### 主题切换流程

```
用户点击主题按钮
    ↓
Header.toggleTheme()
    ↓
useThemeStore.setTheme(newTheme)
    ├─ 更新 DOM (class + data-theme)
    ├─ 更新 localStorage (persist)
    └─ Trigger 重新渲染

系统主题变化 (media query change)
    ↓
watchSystemTheme()
    ├─ 检查当前设置是否为 'system'
    ├─ 重新计算 effectiveTheme
    └─ 应用到 DOM
```

#### 语言切换流程

```
用户选择语言
    ↓
Header.handleLanguageChange()
    ↓
useI18nStore.setLocale(newLocale)
    ├─ 更新 locale
    ├─ 更新 HTML lang 属性
    ├─ 更新 localStorage
    └─ Trigger 重新渲染

组件重新渲染时
    ├─ useTranslation() 返回新语言的翻译
    ├─ useContent() 自动加载新语言的内容
    └─ UI 更新为新语言
```

---

## 2. 状态管理架构

### 2.1 Zustand Store 设计

#### Theme Store

```typescript
interface ThemeState {
  // 状态
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  isDarkMode: boolean;

  // 方法
  initTheme(): void; // 初始化（检查 localStorage & 系统）
  setTheme(theme): void; // 设置主题
  toggleTheme(): void; // 切换主题
}

// 持久化: theme-storage → localStorage
// 默认值: 'system'
```

#### I18n Store

```typescript
interface I18nState {
  // 状态
  locale: 'zh-CN' | 'en-US';
  availableLocales: LocaleConfig[];

  // 方法
  setLocale(locale): Promise<void>; // 设置语言
  t(key): string; // 翻译函数
}

// 持久化: locale-storage → localStorage (仅 locale)
// 翻译由 i18next 或服务层管理
// 默认值: 'zh-CN'
```

#### Content Store (新增)

```typescript
interface ContentState {
  // 状态
  content: Record<string, any>;
  isLoading: Record<string, boolean>;
  error: Record<string, Error | null>;

  // 方法
  setContent(type, locale, data): void;
  setLoading(type, loading): void;
  setError(type, error): void;
  clearContent(type): void;
}

// 不持久化（与 React Query 配合使用）
// 由 contentService 管理
```

### 2.2 React Query 缓存策略

```typescript
// 缓存配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 分钟
      gcTime: 1000 * 60 * 30, // 30 分钟垃圾回收
      retry: 2, // 失败重试 2 次
      refetchOnWindowFocus: false, // 窗口聚焦不重新获取
      refetchOnReconnect: true, // 网络恢复时重新获取
    },
  },
});

// 查询 Key 设计
const contentKeys = {
  all: ['content'] as const,
  byType: (type: string) => [...contentKeys.all, type] as const,
  byTypeAndLocale: (type: string, locale: string) => [...contentKeys.byType(type), locale] as const,
};
```

### 2.3 Store 之间的关联

```
useI18nStore (locale)
    ↓
    ├─→ 触发 contentService 重新加载
    │      useContent(type, locale)
    │      → queryKey 变化 → 重新获取
    │
    └─→ 触发 i18n 翻译更新
           useTranslation()
           → 返回新语言的翻译

useThemeStore (theme)
    ↓
    └─→ DOM 更新 (class + CSS 变量)
           → Tailwind @media dark: 选择器激活
           → 组件自动应用主题颜色
```

---

## 3. i18n 系统架构

### 3.1 翻译文件结构

```
src/locales/
├── zh-CN/
│   ├── common.json          # 通用词汇
│   │   {
│   │     "common.submit": "提交",
│   │     "common.cancel": "取消"
│   │   }
│   ├── navigation.json      # 导航菜单
│   │   {
│   │     "nav.home": "首页",
│   │     "nav.about": "关于",
│   │     "nav.products": "产品"
│   │   }
│   ├── home.json            # 首页
│   ├── products.json        # 产品页
│   ├── footer.json          # 页脚
│   └── errors.json          # 错误消息
│
├── en-US/
│   ├── common.json
│   ├── navigation.json
│   ├── home.json
│   ├── products.json
│   ├── footer.json
│   └── errors.json
│
└── index.ts                 # 导出函数
    export function getTranslations(locale)
    export function getTranslation(locale, key)
```

### 3.2 双层翻译管理

**第 1 层：Zustand Store (快速访问)**

```typescript
useI18nStore()
  ├─ locale: 当前语言
  ├─ t(key): 快速翻译函数 (同步)
  └─ setLocale(locale): 切换语言

用于: Header 语言切换、快速翻译
```

**第 2 层：i18next (标准化管理)**

```typescript
i18n
  ├─ i18n.language: 当前语言
  ├─ i18n.t(key): 翻译函数 (支持复数、插值等)
  ├─ i18n.changeLanguage(locale): 切换语言
  └─ useTranslation(): React Hook

用于: 组件级翻译、高级特性
```

### 3.3 翻译加载流程

```
页面加载
  ↓
getServerLocale() 获取服务端语言
  ↓
generateMetadata() 生成本地化元数据
  ↓
RootLayout SSR
  ├─ 设置 HTML lang 属性
  └─ 传递初始 locale 到客户端

客户端水合
  ↓
useI18nStore 初始化
  ├─ 从 localStorage 读取上次选择的语言
  └─ 设置为当前 locale

组件渲染
  ↓
useTranslation() 获取翻译
  ├─ 返回对应语言的翻译对象
  └─ t(key) 获取翻译文本
```

---

## 4. 内容系统架构

### 4.1 内容数据模型

```typescript
// 所有内容的基础结构
interface ContentBlock {
  id: string;
  type: 'hero' | 'features' | 'products' | 'cta' | 'testimonials';
  locale: 'zh-CN' | 'en-US';
  title: string;
  description?: string;

  // 类型特定的数据
  items?: ContentItem[];
  metadata?: Record<string, any>;

  // 时间戳（用于缓存验证）
  createdAt?: Date;
  updatedAt?: Date;
  version?: string;
}

// 内容项（列表项）
interface ContentItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
  badge?: string;
  metadata?: Record<string, any>;
}
```

### 4.2 静态数据结构

```
public/data/
├── home.zh-CN.json
│   {
│     "id": "home-zh",
│     "type": "hero",
│     "locale": "zh-CN",
│     "title": "释放数据潜力",
│     "items": [...]
│   }
├── home.en-US.json
├── products.zh-CN.json
├── products.en-US.json
├── cases.zh-CN.json
├── cases.en-US.json
└── features.zh-CN.json
```

### 4.3 内容加载优先级

```
1️⃣ React Query 内存缓存 (最快，5分钟过期)
   └─ 若无缓存或已过期 ↓

2️⃣ 尝试 API 调用 (如配置且网络正常)
   ├─ 成功 → 返回数据 + 更新缓存
   └─ 失败 ↓

3️⃣ 降级到静态 JSON (public/data/)
   ├─ 加载 + 返回
   └─ 更新 React Query 缓存

4️⃣ 若以上都失败 → 返回错误状态
   └─ UI 展示错误提示或占位符
```

### 4.4 内容加载的 Hook 实现

```typescript
function useContent(type: string, locale: LocaleType) {
  return useQuery({
    queryKey: contentKeys.byTypeAndLocale(type, locale),
    queryFn: async () => {
      // 尝试 API
      if (process.env.NEXT_PUBLIC_API_URL) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/content/${type}?locale=${locale}`
        );
        if (res.ok) return res.json();
      }

      // 降级到静态 JSON
      const data = await import(`@/data/${type}.${locale}.json`).then((m) => m.default);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 分钟
  });
}
```

---

## 5. API 集成架构

### 5.1 API 客户端设计

```typescript
// src/lib/apiClient.ts
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL) {
    this.baseUrl = baseUrl;
  }

  // 通用请求方法
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }

  // 业务方法
  async getContent(type: string, locale: string) {
    return this.request(`/api/content/${type}?locale=${locale}`);
  }

  async searchProducts(query: string, locale: string) {
    return this.request(`/api/products/search?q=${query}&locale=${locale}`);
  }
}

export const apiClient = new ApiClient();
```

### 5.2 后端 API 规范

#### FastAPI 路由示例

```python
# packages/api/app/routers/content.py
@router.get("/api/content/{type}")
async def get_content(
    type: str,
    locale: str = Query("zh-CN"),
    cache: bool = Query(True)
) -> ContentResponse:
    """
    获取指定类型和语言的内容

    - **type**: 内容类型 (hero, features, products, cta)
    - **locale**: 语言 (zh-CN, en-US)
    - **cache**: 是否使用缓存 (默认 true)

    返回: ContentBlock 列表
    """
    if not locale in ["zh-CN", "en-US"]:
        raise HTTPException(status_code=400, detail="Invalid locale")

    # 从数据库或缓存获取
    content = await ContentService.get(type=type, locale=locale, use_cache=cache)

    return ContentResponse(data=content, success=True)
```

#### Strapi API 示例

```
GET /api/content-blocks?filters[type][$eq]=hero&filters[locale][$eq]=zh-CN&populate=*

返回:
{
  "data": [
    {
      "id": 1,
      "type": "hero",
      "locale": "zh-CN",
      "title": "释放数据潜力",
      "items": [...],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-02-10T12:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 100,
      "total": 5
    }
  }
}
```

### 5.3 错误处理策略

```typescript
async function fetchContentWithFallback(type: string, locale: LocaleType): Promise<ContentBlock[]> {
  try {
    // 尝试 API
    if (process.env.NEXT_PUBLIC_API_URL) {
      const data = await apiClient.getContent(type, locale);
      return data;
    }
  } catch (error) {
    console.warn(`API 调用失败，降级到静态数据: ${error}`);
  }

  try {
    // 降级到静态 JSON
    const data = await import(`@/data/${type}.${locale}.json`).then((m) => m.default);
    return data;
  } catch (error) {
    console.error(`静态数据加载失败: ${error}`);
    // 返回空数据或默认占位符
    return [];
  }
}
```

---

## 6. 性能优化

### 6.1 缓存策略

| 缓存层       | 过期时间    | 用途           | 管理方          |
| ------------ | ----------- | -------------- | --------------- |
| 内存缓存     | 5 分钟      | API 数据       | React Query     |
| localStorage | 用户自定义  | 语言、主题偏好 | Zustand persist |
| 浏览器 HTTP  | 按 API 响应 | 静态资源       | Next.js         |
| CDN          | 按部署配置  | 静态文件       | Vercel/Netlify  |

### 6.2 加载优化

- **ISR (增量静态再生)**: 页面 3600s 重新验证
- **SSR (服务端渲染)**: 内容页面使用 SSR
- **图片优化**: Next.js Image 组件自动优化
- **代码分割**: 路由级别自动分割

### 6.3 SEO 优化

- **动态元数据**: 根据语言生成 meta 标签
- **Open Graph**: 社交分享优化
- **Sitemap**: 自动生成多语言 sitemap
- **Robots.txt**: 爬虫指引

---

## 7. 部署架构

### 7.1 开发环境

```
localhost:3000    (Next.js 前端)
localhost:8000    (FastAPI 后端)
public/data/      (静态内容)
```

### 7.2 生产环境

```
┌─────────────────────────────────────┐
│  CDN (图片、CSS、JS 静态资源)       │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Vercel (Next.js 前端托管)          │
│  - 自动 CI/CD                        │
│  - ISR 缓存                          │
│  - 全球 CDN 加速                     │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Backend (FastAPI / Strapi)         │
│  - Railway / Render / Heroku        │
│  - Docker 容器化                     │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Database (PostgreSQL)              │
│  - AWS RDS / Digital Ocean          │
│  - 自动备份                          │
└─────────────────────────────────────┘
```

---

## 8. 安全考虑

### 8.1 前端安全

- ✅ 使用 HTTPS 确保传输安全
- ✅ CSP (Content Security Policy) 防 XSS
- ✅ 敏感数据不存储在 localStorage
- ✅ 验证 API 响应数据

### 8.2 后端安全

- ✅ CORS 跨域配置
- ✅ Rate Limiting 限流
- ✅ JWT 令牌验证
- ✅ 数据库查询参数化

### 8.3 内容管理安全

- ✅ Strapi 权限模型
- ✅ 环境变量隐藏敏感信息
- ✅ API 密钥管理
- ✅ 发布审核流程

---

## 总结

### 核心架构原则

1. **分层清晰**: 应用层 → 组件层 → 状态层 → 服务层 → 数据层
2. **数据流单向**: 用户操作 → Store 更新 → 组件重新渲染
3. **缓存多层**: 内存 → localStorage → HTTP → CDN
4. **渐进式增强**: 静态 → API → Strapi (无需重构)
5. **错误恢复**: 主方案失败自动降级到备选方案

### 扩展能力

- 🔄 **内容管理**: 静态 JSON → Strapi 无缝迁移
- 🌍 **多语言**: i18next 完整支持，包括复数、插值等
- 🎨 **主题定制**: TailwindCSS + CSS 变量，轻松扩展
- 📊 **数据分析**: 埋点接口预留，易于接入
- 🔐 **认证授权**: Auth Store + API 中间件，支持多种方案

### 团队协作

- ✅ 前端可独立开发 (使用静态数据)
- ✅ 后端可独立开发 (提供 API 契约)
- ✅ CMS 管理员可独立管理内容 (Strapi)
- ✅ 设计师可关注 UI/UX (TailwindCSS + 主题系统)
