# Application Layer

Application Layer 是四层架构的业务逻辑层，负责编排 Use Cases、提供自定义 Hooks，是 Presentation Layer 和 Infrastructure Layer 之间的桥梁。

## 📁 目录结构

```
src/application/
├── usecases/                    # 用例 - 业务逻辑编排
│   ├── homepage/
│   │   ├── GetHomepageUseCase.ts
│   │   ├── GetHeroUseCase.ts
│   │   └── index.ts
│   ├── layout/
│   │   ├── GetLayoutUseCase.ts
│   │   └── index.ts
│   └── index.ts
│
├── hooks/                       # 自定义 Hooks
│   ├── homepage/
│   │   ├── useHomepage.ts
│   │   ├── useHero.ts
│   │   ├── useFeatures.ts
│   │   ├── useSolutions.ts
│   │   ├── useCases.ts
│   │   ├── useCTA.ts
│   │   └── index.ts
│   ├── layout/
│   │   ├── useLayout.ts
│   │   ├── useHeader.ts
│   │   ├── useFooter.ts
│   │   └── index.ts
│   ├── shared/
│   │   ├── useLocale.ts         # 语言管理
│   │   ├── useTheme.ts          # 主题管理
│   │   └── index.ts
│   └── index.ts
│
├── seo/                         # SEO 工具
│   ├── metadata.ts              # Metadata 生成
│   ├── structuredData.ts        # 结构化数据
│   └── index.ts
│
├── index.ts                     # 统一导出
└── README.md                    # 文档说明
```

## 🎯 核心组件

### 1. Use Cases（用例）

Use Cases 封装业务逻辑，编排 Repository 调用。

**GetHomepageUseCase** - 获取首页数据用例
```typescript
export class GetHomepageUseCase {
  async execute(locale: string): Promise<HomepageAggregate> {
    // 业务逻辑：获取首页数据
    const homepage = await this.homepageRepository.getHomepage(locale);

    // 业务规则：验证数据
    const validation = HomepageHelpers.validate(homepage);
    if (!validation.valid) {
      throw new Error('Invalid homepage data');
    }

    return homepage;
  }
}
```

**特性：**
- ✅ 单一职责 - 一个 Use Case 一个业务场景
- ✅ 业务规则验证
- ✅ 错误处理
- ✅ 日志记录

### 2. Hooks（自定义 Hooks）

Hooks 是 React 组件和 Use Cases 之间的桥梁，集成 React Query 管理状态。

**useHomepage** - 首页数据 Hook
```typescript
export const useHomepage = (options?: UseHomepageOptions) => {
  const { locale } = useLocale();

  return useQuery({
    queryKey: ['homepage', locale],
    queryFn: () => getHomepageUseCase.execute(locale),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
```

**特性：**
- ✅ 自动获取当前语言
- ✅ 集成 React Query（加载/错误状态）
- ✅ 缓存管理
- ✅ 自动重试
- ✅ TypeScript 类型安全

### 3. SEO 工具

提供 SEO 相关的工具函数。

**generateMetadata** - 生成页面 Metadata
```typescript
export const generateMetadata = (content: HeroContent, locale: string) => ({
  title: content.title,
  description: content.description,
  openGraph: {
    title: content.title,
    description: content.description,
    locale: locale,
  },
});
```

## 🚀 使用方式

### 方式 1: 使用 Hooks（推荐）

```typescript
import { useHomepage, useLayout } from '@/application/hooks';

function HomePage() {
  const { data: homepage, isLoading } = useHomepage();
  const { data: layout } = useLayout();

  if (isLoading) return <Skeleton />;

  return (
    <>
      <Header {...layout.header} />
      <HeroSection {...homepage.hero} />
      <FeaturesSection {...homepage.features} />
      <Footer {...layout.footer} />
    </>
  );
}
```

### 方式 2: 使用 Use Cases（服务端）

```typescript
import { getHomepageUseCase } from '@/application/usecases';

// Next.js Server Component
export default async function HomePage() {
  const homepage = await getHomepageUseCase.execute('zh-CN');

  return <HeroSection {...homepage.hero} />;
}
```

### 方式 3: 单个区块 Hook

```typescript
import { useHero, useFeatures } from '@/application/hooks/homepage';

function HeroSection() {
  const { data: hero, isLoading } = useHero();

  if (isLoading) return <Skeleton />;

  return <Hero {...hero} />;
}
```

## 📊 数据流

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer                      │
│  (React Components)                             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Application Layer - Hooks                  │
│  useHomepage() → React Query                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Application Layer - Use Cases              │
│  GetHomepageUseCase.execute()                   │
│  - Business Logic                               │
│  - Validation                                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Infrastructure - Repository                │
│  homepageRepository.getHomepage()               │
└─────────────────────────────────────────────────┘
```

## ✅ 设计原则

### 1. 依赖方向 ✅
- Application 依赖 Domain（接口定义）
- Application 使用 Infrastructure（实现注入）
- Presentation 只依赖 Application

### 2. 单一职责 ✅
- Use Case：业务逻辑编排
- Hook：React 状态管理
- SEO：SEO 工具函数

### 3. 开闭原则 ✅
- 易于添加新的 Use Case
- 易于添加新的 Hook
- 无需修改现有代码

### 4. 可测试性 ✅
- Use Cases 易于单元测试
- Hooks 可以使用 React Testing Library
- 依赖注入便于 Mock

## 🎓 最佳实践

### 1. Use Case 设计

```typescript
// ✅ 好的设计 - 单一职责
class GetHeroUseCase {
  async execute(locale: string): Promise<HeroContent> {
    const hero = await this.repository.getHero(locale);

    // 业务规则
    if (!hero.enabled) {
      throw new ContentDisabledError('hero');
    }

    return hero;
  }
}

// ❌ 不好的设计 - 职责过多
class HomepageUseCase {
  async execute() {
    // 获取数据
    // 转换数据
    // 验证数据
    // 发送分析
    // 更新缓存
    // ...太多职责
  }
}
```

### 2. Hook 设计

```typescript
// ✅ 好的设计 - 提供完整状态
export const useHomepage = () => {
  const { locale } = useLocale();

  const query = useQuery({
    queryKey: ['homepage', locale],
    queryFn: () => getHomepageUseCase.execute(locale),
  });

  return {
    homepage: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ❌ 不好的设计 - 隐藏状态
export const useHomepage = () => {
  const [data, setData] = useState();
  // 手动管理状态，重复造轮子
};
```

### 3. 错误处理

```typescript
// ✅ 好的设计 - 使用 Domain 异常
export class GetHomepageUseCase {
  async execute(locale: string): Promise<HomepageAggregate> {
    try {
      return await this.repository.getHomepage(locale);
    } catch (error) {
      if (error instanceof ContentNotFoundError) {
        // 业务异常处理
        console.error('Content not found', error);
      }
      throw error;
    }
  }
}
```

## 📈 性能优化

### 1. React Query 缓存
- ✅ 5 分钟 staleTime（数据新鲜度）
- ✅ 10 分钟 gcTime（垃圾回收）
- ✅ 自动后台更新
- ✅ 智能重试策略

### 2. 并行加载
```typescript
// 并行加载多个区块
const { data: hero } = useHero();
const { data: features } = useFeatures();
const { data: solutions } = useSolutions();
```

### 3. 预加载
```typescript
// 预加载下一页数据
const queryClient = useQueryClient();
queryClient.prefetchQuery({
  queryKey: ['homepage', 'en-US'],
  queryFn: () => getHomepageUseCase.execute('en-US'),
});
```

## 🧪 测试示例

### 测试 Use Case
```typescript
describe('GetHomepageUseCase', () => {
  it('should return homepage data', async () => {
    const mockRepo = {
      getHomepage: jest.fn().mockResolvedValue(mockHomepage),
    };

    const useCase = new GetHomepageUseCase(mockRepo);
    const result = await useCase.execute('zh-CN');

    expect(result).toEqual(mockHomepage);
    expect(mockRepo.getHomepage).toHaveBeenCalledWith('zh-CN');
  });
});
```

### 测试 Hook
```typescript
describe('useHomepage', () => {
  it('should load homepage data', async () => {
    const { result } = renderHook(() => useHomepage(), {
      wrapper: QueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.homepage).toBeDefined();
  });
});
```

## 🚧 扩展性

### 添加新的 Use Case

1. 创建 Use Case 类
```typescript
// usecases/homepage/GetFeaturedCasesUseCase.ts
export class GetFeaturedCasesUseCase {
  async execute(locale: string, limit: number): Promise<CaseItem[]> {
    const cases = await this.repository.getCases(locale);
    return CasesHelpers.getFeatured(cases, limit);
  }
}
```

2. 创建对应的 Hook
```typescript
// hooks/homepage/useFeaturedCases.ts
export const useFeaturedCases = (limit: number = 3) => {
  const { locale } = useLocale();

  return useQuery({
    queryKey: ['featured-cases', locale, limit],
    queryFn: () => getFeaturedCasesUseCase.execute(locale, limit),
  });
};
```

## 📝 已实现功能

- ✅ Homepage Use Cases（5 个）
- ✅ Layout Use Cases（3 个）
- ✅ Homepage Hooks（6 个）
- ✅ Layout Hooks（3 个）
- ✅ Shared Hooks（useLocale）
- ✅ SEO 工具
- ✅ TypeScript 类型安全
- ✅ 完整的错误处理

## 🎉 优势

1. **类型安全** - 端到端 TypeScript 类型推断
2. **易于测试** - Use Cases 和 Hooks 都易于测试
3. **状态管理** - React Query 自动管理加载/错误/缓存
4. **业务隔离** - 业务逻辑在 Use Cases，UI 在 Presentation
5. **可维护性** - 清晰的职责划分
6. **可扩展性** - 易于添加新功能

---

**实现完成日期**: 2026-02-12
**实现文件数**: 20+ 个
**状态**: ✅ 完成