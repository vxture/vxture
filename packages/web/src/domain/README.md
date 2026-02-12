# Domain Layer

Domain Layer 是四层架构的核心层，定义业务领域模型、业务规则和数据访问契约。

## 📁 目录结构

```
src/domain/
├── shared/                    # 共享领域
│   ├── valueObjects/          # 值对象
│   │   ├── locale.ts          # 语言代码值对象
│   │   ├── slug.ts            # URL 标识符值对象
│   │   ├── email.ts           # 邮箱地址值对象
│   │   ├── theme.ts           # 主题值对象
│   │   └── index.ts
│   ├── entities/              # 基础实体
│   │   ├── content-entity.ts  # 内容实体基类
│   │   ├── content-item.ts    # 内容项基类
│   │   └── index.ts
│   ├── repositories/          # 仓储基类
│   │   ├── base.repository.ts # 仓储基础接口
│   │   └── index.ts
│   ├── exceptions/            # 领域异常
│   │   ├── content-not-found.error.ts
│   │   ├── validation.error.ts
│   │   ├── content-load.error.ts
│   │   └── index.ts
│   └── types/                 # 共享类型
│       ├── validation.types.ts
│       ├── media.types.ts
│       ├── seo.types.ts
│       └── index.ts
│
├── layout/                    # 布局领域
│   ├── header.model.ts        # Header 模型
│   ├── footer.model.ts        # Footer 模型
│   └── layout.repository.ts   # Layout 仓储接口
│
├── homepage/                  # 首页领域
│   ├── hero.model.ts          # Hero 区块模型
│   ├── features.model.ts      # Features 区块模型
│   ├── solutions.model.ts     # Solutions 区块模型
│   ├── cases.model.ts         # Cases 区块模型
│   ├── cta.model.ts           # CTA 区块模型
│   ├── homepage.aggregate.ts  # Homepage 聚合根
│   └── homepage.repository.ts # Homepage 仓储接口
│
├── navigation/                # 导航领域（待实现）
│   ├── navigation.model.ts
│   └── navigation.repository.ts
│
├── article/                   # 文章领域（待实现）
│   ├── article.model.ts
│   ├── category.model.ts
│   └── article.repository.ts
│
└── index.ts                   # 统一导出
```

## 🎯 设计原则

### 1. 领域驱动设计（DDD）
- **按业务领域划分**：每个文件夹代表一个限界上下文
- **聚合根模式**：`HomepageAggregate` 聚合首页所有区块
- **值对象**：不可变的领域概念（Locale, Slug, Email 等）
- **实体**：有唯一标识的业务对象

### 2. 依赖倒置
- Domain Layer 定义接口（Repository Interface）
- Infrastructure Layer 实现接口
- Domain Layer 不依赖任何外部框架

### 3. 单一职责
- 每个模型只负责自己的业务逻辑
- 每个仓储接口只定义数据访问契约

### 4. 开闭原则
- 对扩展开放：新增领域（如 `product/`）不影响现有代码
- 对修改封闭：修改一个领域不影响其他领域

## 📦 核心概念

### 实体（Entity）
具有唯一标识的业务对象，生命周期贯穿整个系统。

```typescript
// 示例：HeaderContent 实体
export class HeaderContent extends ContentEntity {
  constructor(
    enabled: boolean,
    public readonly logo: Logo,
    public readonly nav: NavItem[],
    // ...
  ) {
    super('header', enabled);
  }
}
```

### 值对象（Value Object）
不可变的领域概念，通过值相等性比较。

```typescript
// 示例：Locale 值对象
export class Locale {
  private constructor(private readonly value: string) {}

  static create(locale: string): Locale {
    // 验证和标准化逻辑
  }

  equals(other: Locale): boolean {
    return this.value === other.value;
  }
}
```

### 聚合根（Aggregate Root）
聚合多个相关实体和值对象，提供统一的访问入口。

```typescript
// 示例：HomepageAggregate 聚合根
export class HomepageAggregate {
  constructor(
    public readonly hero: HeroContent,
    public readonly features: FeaturesContent,
    public readonly solutions: SolutionsContent,
    public readonly cases: CasesContent,
    public readonly cta: CTAContent
  ) {}
}
```

### 仓储接口（Repository Interface）
定义数据访问的契约，由 Infrastructure Layer 实现。

```typescript
// 示例：IHomepageRepository 接口
export interface IHomepageRepository {
  getHomepage(locale: string): Promise<HomepageAggregate>;
  getHero(locale: string): Promise<HeroContent>;
  // ...
}
```

## 🔄 使用流程

### 1. Application Layer 调用 Repository
```typescript
// application/useCases/getHomepage.ts
import { IHomepageRepository } from '@/domain';

export async function getHomepage(
  repository: IHomepageRepository,
  locale: string
) {
  return await repository.getHomepage(locale);
}
```

### 2. Infrastructure Layer 实现 Repository
```typescript
// infrastructure/repositories/HomepageRepository.ts
import { IHomepageRepository, HomepageAggregate } from '@/domain';

export class HomepageRepository implements IHomepageRepository {
  async getHomepage(locale: string): Promise<HomepageAggregate> {
    // 实现数据获取逻辑
  }
}
```

### 3. Presentation Layer 使用领域模型
```typescript
// presentation/pages/HomePage.tsx
import { useHomepage } from '@/application/hooks';

export function HomePage() {
  const { data: homepage } = useHomepage();

  return (
    <>
      <HeroSection hero={homepage.hero} />
      <FeaturesSection features={homepage.features} />
    </>
  );
}
```

## ✅ 已实现的领域

### Layout 领域
- ✅ Header 模型（Logo、导航、语言切换）
- ✅ Footer 模型（品牌信息、社交链接、版权）
- ✅ Layout 仓储接口

### Homepage 领域
- ✅ Hero 模型（首屏展示）
- ✅ Features 模型（核心能力）
- ✅ Solutions 模型（产品方案）
- ✅ Cases 模型（最佳实践）
- ✅ CTA 模型（行动号召）
- ✅ Homepage 聚合根
- ✅ Homepage 仓储接口

### Shared 领域
- ✅ 值对象（Locale, Slug, Email, Theme）
- ✅ 基础实体（ContentEntity, ContentItem）
- ✅ 仓储基类（IRepository, IContentRepository）
- ✅ 领域异常（ContentNotFoundError, ValidationError）
- ✅ 共享类型（Validation, Media, SEO）

## 🚀 待实现的领域

### Navigation 领域
- ⏳ Navigation 模型（菜单树、面包屑）
- ⏳ Navigation 仓储接口

### Article 领域
- ⏳ Article 模型（文章内容）
- ⏳ Category 模型（文章分类）
- ⏳ Article 仓储接口

## 📚 扩展指南

### 新增领域
1. 在 `src/domain/` 下创建新文件夹（如 `product/`）
2. 创建领域模型（`product.model.ts`）
3. 创建仓储接口（`product.repository.ts`）
4. 在 `domain/index.ts` 中导出

### 新增值对象
1. 在 `shared/valueObjects/` 下创建新文件
2. 实现不可变性和值相等性
3. 在 `valueObjects/index.ts` 中导出

### 新增异常
1. 在 `shared/exceptions/` 下创建新文件
2. 继承 `Error` 类
3. 在 `exceptions/index.ts` 中导出

## 🎓 最佳实践

1. **值对象优先**：能用值对象就不用字符串
2. **验证前置**：在模型中进行业务规则验证
3. **不可变性**：所有属性都使用 `readonly`
4. **类型安全**：充分利用 TypeScript 的类型系统
5. **单一职责**：每个模型只负责自己的业务逻辑
6. **依赖倒置**：Domain Layer 定义接口，Infrastructure Layer 实现

## 📖 参考资料

- [领域驱动设计（DDD）](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [值对象模式](https://martinfowler.com/bliki/ValueObject.html)
- [聚合根模式](https://martinfowler.com/bliki/DDD_Aggregate.html)
- [仓储模式](https://martinfowler.com/eaaCatalog/repository.html)