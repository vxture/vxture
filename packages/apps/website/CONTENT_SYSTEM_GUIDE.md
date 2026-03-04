# Content Management System - 使用指南

## 📋 目录

- [架构概览](#架构概览)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

---

## 🏗️ 架构概览

### 四层架构设计

```
┌─────────────────────────────────────────────────┐
│ Layer 1: 组件层 (Components)                     │
│ - 使用 useContent Hook 获取数据                   │
│ - 专注于 UI 渲染和用户交互                         │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Layer 2: 能力层 (Hooks + Services)                │
│ - useContent: React Hook，集成 React Query        │
│ - contentService: 高级业务逻辑和工具函数            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Layer 3: 访问层 (Clients)                         │
│ - contentClient: 统一数据访问接口                  │
│ - 提供缓存、错误处理、数据源切换                    │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Layer 4: 数据源层 (Adapters)                      │
│ - jsonAdapter: 从 JSON 文件加载                   │
│ - apiAdapter: 从 API 端点加载 (Week 3+)           │
│ - cmsAdapter: 从 CMS 加载 (Week 4+)               │
└─────────────────────────────────────────────────┘
```

### 文件结构

```
src/
├── types/
│   └── content.types.ts          # 所有内容类型定义
├── clients/
│   ├── contentClient.ts          # 统一内容访问接口
│   └── adapters/
│       └── jsonAdapter.ts        # JSON 文件适配器
├── services/
│   └── contentService.ts         # 高级业务逻辑服务
├── hooks/
│   ├── useContent.ts             # 内容获取 Hook
│   └── useLocale.ts              # 语言管理 Hook
└── components/
    └── examples/
        └── ContentUsageExamples.tsx  # 使用示例

public/data/
├── layout/
│   ├── header.zh-CN.json
│   ├── header.en-US.json
│   ├── footer.zh-CN.json
│   └── footer.en-US.json
└── sections/
    ├── hero.zh-CN.json
    ├── hero.en-US.json
    ├── features.zh-CN.json
    ├── features.en-US.json
    ├── solutions.zh-CN.json
    ├── solutions.en-US.json
    ├── cases.zh-CN.json
    ├── cases.en-US.json
    ├── cta.zh-CN.json
    └── cta.en-US.json
```

---

## 🚀 快速开始

### 1. 基础使用

```tsx
'use client';

import { useContent } from '@/hooks/useContent';

export function HeroSection() {
  // 自动类型推断为 HeroContent
  const { data, isLoading, isError } = useContent('hero');

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Error loading content</div>;

  return (
    <section>
      <h1>{data.title} {data.titleHighlight}</h1>
      <p>{data.description}</p>
    </section>
  );
}
```

### 2. 服务端组件使用

```tsx
import { contentService } from '@/services/contentService';

export default async function HeroSection({ locale }: { locale: string }) {
  const hero = await contentService.getEnabledContent('hero', locale);

  if (!hero) return null;

  return (
    <section>
      <h1>{hero.title} {hero.titleHighlight}</h1>
      <p>{hero.description}</p>
    </section>
  );
}
```

---

## 📚 API 文档

### useContent Hook

#### 类型签名

```typescript
function useContent<K extends ContentKey>(
  key: K,
  options?: UseContentOptions
): UseContentReturn<ContentTypeMap[K]>;
```

#### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | `ContentKey` | - | 内容键名 (hero, features, etc.) |
| `options.retry` | `number` | `2` | 失败后重试次数 |
| `options.retryDelay` | `number` | `1000` | 重试延迟（毫秒） |
| `options.enabled` | `boolean` | `true` | 是否启用查询 |
| `options.staleTime` | `number` | `300000` | 数据新鲜时间（毫秒） |
| `options.gcTime` | `number` | `600000` | 垃圾回收时间（毫秒） |

#### 返回值

```typescript
interface UseContentReturn<T> {
  data: T | undefined;        // 内容数据
  isLoading: boolean;         // 是否正在加载
  isError: boolean;           // 是否发生错误
  error: Error | null;        // 错误对象
  refetch: () => void;        // 手动重新获取
}
```

#### 示例

```tsx
// 基础使用
const { data, isLoading } = useContent('hero');

// 带选项
const { data, isLoading, refetch } = useContent('features', {
  retry: 3,
  retryDelay: 2000,
  enabled: shouldLoad,
});

// 条件加载
const { data } = useContent('cta', {
  enabled: showCTA,  // 只在 showCTA 为 true 时加载
});
```

---

### contentService

#### 方法列表

##### `batchLoad(keys, locale)`

批量加载多个内容。

```typescript
const result = await contentService.batchLoad(
  ['hero', 'features', 'solutions'],
  'zh-CN'
);

console.log(result.success); // 成功加载的内容
console.log(result.errors);  // 失败的内容和错误信息
```

##### `preloadPageContent(pageName, locale)`

预加载页面所需的所有内容。

```typescript
// 预加载首页内容（header, footer, hero, features, solutions, cases, cta）
await contentService.preloadPageContent('home', 'zh-CN');
```

##### `getEnabledContent(key, locale)`

获取启用的内容（自动过滤 `enabled: false` 的内容）。

```typescript
const hero = await contentService.getEnabledContent('hero', 'zh-CN');
// 如果 hero.enabled === false，返回 null
```

##### `filterByTags(content, tags)`

按标签过滤内容。

```typescript
const solutions = await contentClient.getContent('solutions', 'zh-CN');
const filtered = contentService.filterByTags(solutions, ['数据融合', '智能调度']);
```

##### `searchItems(content, query)`

搜索内容项（根据标题和描述）。

```typescript
const features = await contentClient.getContent('features', 'zh-CN');
const results = contentService.searchItems(features, '智能');
```

##### `clearAllCache()`

清除所有内容缓存。

```typescript
contentService.clearAllCache();
```

##### `warmupCache(locale)`

预热缓存（预加载常用内容）。

```typescript
await contentService.warmupCache('zh-CN');
```

---

### contentClient

#### 方法列表

##### `getContent(key, locale)`

获取内容（带缓存和类型安全）。

```typescript
// 自动类型推断
const hero = await contentClient.getContent('hero', 'zh-CN');
// hero 的类型是 HeroContent

// 通用版本
const data = await contentClient.getContent('custom-key', 'zh-CN');
// data 的类型是 unknown
```

##### `clearCache()`

清除所有缓存。

```typescript
contentClient.clearCache();
```

##### `clearCacheFor(key, locale?)`

清除特定内容的缓存。

```typescript
// 清除特定语言的缓存
contentClient.clearCacheFor('hero', 'zh-CN');

// 清除所有语言的缓存
contentClient.clearCacheFor('hero');
```

---

## 💡 使用示例

### 示例 1: 带加载状态的组件

```tsx
export function FeaturesSection() {
  const { data, isLoading, isError } = useContent('features');

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <div>Failed to load features</div>;
  }

  return (
    <section>
      <h2>{data.title}</h2>
      <div className="grid">
        {data.items.map(item => (
          <div key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### 示例 2: 搜索和过滤

```tsx
export function SearchableSolutions() {
  const [query, setQuery] = useState('');
  const { data } = useContent('solutions');

  if (!data) return null;

  const filtered = query
    ? contentService.searchItems(data, query)
    : data;

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {filtered.items.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

### 示例 3: 服务端预加载

```tsx
// app/page.tsx
export default async function HomePage() {
  const locale = 'zh-CN';

  // 预加载页面内容
  await contentService.preloadPageContent('home', locale);

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <SolutionsSection />
    </>
  );
}
```

### 示例 4: 错误处理和重试

```tsx
export function RobustSection() {
  const { data, isError, error, refetch } = useContent('features', {
    retry: 3,
    retryDelay: 2000,
  });

  if (isError) {
    return (
      <div className="error">
        <p>Error: {error?.message}</p>
        <button onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return <div>{/* render content */}</div>;
}
```

---

## 🎯 最佳实践

### 1. 类型安全

```tsx
// ✅ 推荐：使用类型推断
const { data } = useContent('hero');
// data 的类型自动推断为 HeroContent

// ✅ 也可以：显式指定类型
const { data } = useContent<HeroContent>('hero');

// ❌ 避免：使用 any
const { data } = useContent<any>('hero');
```

### 2. 加载状态处理

```tsx
// ✅ 推荐：提供友好的加载状态
if (isLoading) return <Skeleton />;
if (isError) return <ErrorFallback onRetry={refetch} />;
if (!data) return null;

// ❌ 避免：直接渲染可能为 undefined 的数据
return <div>{data.title}</div>; // 可能报错
```

### 3. 缓存管理

```tsx
// ✅ 推荐：在适当的时机清除缓存
useEffect(() => {
  // 用户登出时清除缓存
  if (isLoggedOut) {
    contentService.clearAllCache();
  }
}, [isLoggedOut]);

// ✅ 推荐：预热常用内容
useEffect(() => {
  contentService.warmupCache(locale);
}, [locale]);
```

### 4. 服务端渲染

```tsx
// ✅ 推荐：在服务端组件中直接使用 contentService
export default async function Page() {
  const data = await contentService.getEnabledContent('hero', 'zh-CN');
  return <Hero data={data} />;
}

// ❌ 避免：在服务端组件中使用 useContent
export default async function Page() {
  const { data } = useContent('hero'); // 错误！Hook 只能在客户端使用
}
```

### 5. 错误边界

```tsx
// ✅ 推荐：使用错误边界包裹内容组件
<ErrorBoundary fallback={<ErrorFallback />}>
  <FeaturesSection />
</ErrorBoundary>
```

---

## 🔧 故障排除

### 问题 1: 内容加载失败

**症状**: 控制台显示 `Failed to fetch` 错误

**解决方案**:
1. 检查 JSON 文件路径是否正确
2. 确认文件名格式为 `{key}.{locale}.json`
3. 验证 JSON 文件语法是否正确
4. 检查网络请求（开发者工具 → Network）

```bash
# 验证 JSON 文件
cd packages/web/public/data
node -e "JSON.parse(require('fs').readFileSync('sections/hero.zh-CN.json'))"
```

### 问题 2: 类型错误

**症状**: TypeScript 报类型不匹配错误

**解决方案**:
1. 确保 `content.types.ts` 与 JSON 结构一致
2. 重启 TypeScript 服务器
3. 检查是否使用了正确的类型

```tsx
// ❌ 错误
const { data } = useContent<FeaturesContent>('hero');

// ✅ 正确
const { data } = useContent('hero'); // 自动推断为 HeroContent
```

### 问题 3: 缓存问题

**症状**: 内容更新后仍显示旧数据

**解决方案**:
1. 手动清除缓存
2. 调整 `staleTime` 和 `gcTime`
3. 使用 `refetch()` 强制刷新

```tsx
// 清除特定内容的缓存
contentService.clearCacheFor('hero', 'zh-CN');

// 或调整缓存时间
const { data } = useContent('hero', {
  staleTime: 0, // 立即过期
  gcTime: 0,    // 立即清除
});
```

### 问题 4: 服务端渲染错误

**症状**: `useContent is not a function` 或 Hook 错误

**解决方案**:
- 确保在客户端组件中使用 `useContent`
- 在服务端组件中使用 `contentService`

```tsx
// ✅ 客户端组件
'use client';
export function ClientComponent() {
  const { data } = useContent('hero');
}

// ✅ 服务端组件
export async function ServerComponent() {
  const data = await contentService.getEnabledContent('hero', 'zh-CN');
}
```

---

## 📊 性能优化

### 1. 预加载策略

```tsx
// 在布局组件中预加载常用内容
export default function RootLayout({ children }) {
  useEffect(() => {
    contentService.warmupCache('zh-CN');
  }, []);

  return <>{children}</>;
}
```

### 2. 条件加载

```tsx
// 只在需要时加载
const { data } = useContent('features', {
  enabled: isVisible, // 只在可见时加载
});
```

### 3. 批量加载

```tsx
// 一次性加载多个内容
const result = await contentService.batchLoad(
  ['hero', 'features', 'solutions'],
  locale
);
```

---

## 🔄 迁移指南

### 从硬编码内容迁移

**之前**:
```tsx
const features = {
  title: '核心能力',
  items: [...]
};
```

**之后**:
```tsx
const { data: features } = useContent('features');
```

### 从其他 CMS 迁移

Week 3+ 将支持 API 适配器，可以无缝切换数据源：

```typescript
// contentClient 会自动选择可用的数据源
// 优先级: API > JSON
const data = await contentClient.getContent('hero', 'zh-CN');
```

---

## 📝 总结

- ✅ 使用 `useContent` Hook 在客户端组件中获取数据
- ✅ 使用 `contentService` 在服务端组件中获取数据
- ✅ 利用类型推断获得完整的 TypeScript 支持
- ✅ 合理使用缓存和预加载优化性能
- ✅ 提供友好的加载和错误状态

需要帮助？查看 [使用示例](./ContentUsageExamples.tsx) 或联系开发团队。
