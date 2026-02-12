# Infrastructure Layer

Infrastructure Layer 是四层架构的数据访问层，负责实现 Domain Layer 定义的 Repository 接口，提供实际的数据获取、转换和缓存功能。

## 📁 目录结构

```
src/infrastructure/
├── adapters/                    # 数据适配器 ✅
│   └── json/
│       ├── JsonAdapter.ts      # JSON 文件适配器
│       └── index.ts
│
├── cache/                       # 缓存管理 ✅
│   ├── CacheManager.ts         # 内存缓存管理器
│   └── index.ts
│
├── mappers/                     # 数据映射器 ✅
│   ├── layout/
│   │   ├── HeaderMapper.ts     # Header 数据映射
│   │   ├── FooterMapper.ts     # Footer 数据映射
│   │   └── index.ts
│   ├── homepage/
│   │   ├── HeroMapper.ts       # Hero 数据映射
│   │   ├── FeaturesMapper.ts   # Features 数据映射
│   │   ├── SolutionsMapper.ts  # Solutions 数据映射
│   │   ├── CasesMapper.ts      # Cases 数据映射
│   │   ├── CTAMapper.ts        # CTA 数据映射
│   │   └── index.ts
│   └── index.ts
│
├── repositories/                # Repository 实现 ✅
│   ├── layout/
│   │   ├── LayoutRepository.ts
│   │   └── index.ts
│   ├── homepage/
│   │   ├── CasesRepository.ts
│   │   ├── HomepageRepository.ts
│   │   └── index.ts
│   └── index.ts
│
├── factory.ts                   # 实例工厂 ✅
├── index.ts                     # 统一导出 ✅
└── README.md                    # 文档说明 ✅
```

## 🎯 核心组件

### 1. Adapters（适配器）

负责从数据源获取原始数据。

**JsonAdapter** - JSON 文件适配器
```typescript
const adapter = createJsonAdapter({
  baseUrl: '/data',
  timeout: 5000,
});

// 获取数据
const data = await adapter.fetch('hero', 'zh-CN');
// GET /data/sections/hero.zh-CN.json
```

**特性：**
- ✅ 自动路径映射（layout/sections）
- ✅ 请求超时控制
- ✅ 错误处理
- ✅ 数据验证

### 2. Cache（缓存）

提供内存缓存功能，减少重复请求。

**CacheManager** - 缓存管理器
```typescript
const cache = createCacheManager({
  ttl: 5 * 60 * 1000, // 5 分钟
  maxSize: 100,
});

// 使用缓存
cache.set('key', data);
const cached = cache.get('key');
cache.clear();
```

**特性：**
- ✅ TTL（Time To Live）支持
- ✅ 最大容量限制
- ✅ 前缀清除
- ✅ 自动过期清理

### 3. Mappers（映射器）

将 JSON 原始数据转换为 Domain 模型。

**Mapper 模式**
```typescript
export const HeroMapper = {
  // JSON → Domain
  toDomain: (raw: HeroContentRaw): HeroContent => ({
    key: 'hero',
    enabled: raw.enabled,
    title: raw.title,
    // ...
  }),

  // Domain → JSON
  fromDomain: (domain: HeroContent): HeroContentRaw => ({
    key: 'hero',
    enabled: domain.enabled,
    title: domain.title,
    // ...
  }),
};
```

**已实现的 Mappers：**
- ✅ HeroMapper
- ✅ FeaturesMapper
- ✅ SolutionsMapper
- ✅ CasesMapper
- ✅ CTAMapper
- ✅ HeaderMapper
- ✅ FooterMapper

### 4. Repositories（仓储）

实现 Domain Layer 定义的 Repository 接口。

**HomepageRepository** - 首页仓储
```typescript
const repo = createHomepageRepository(adapter, cache);

// 获取完整首页数据
const homepage = await repo.getHomepage('zh-CN');

// 获取单个区块
const hero = await repo.getHero('zh-CN');
const features = await repo.getFeatures('zh-CN');

// 批量获取
const sections = await repo.getSections(['hero', 'features'], 'zh-CN');

// 清除缓存
repo.clearCache('zh-CN');
```

**LayoutRepository** - 布局仓储
```typescript
const repo = createLayoutRepository(adapter, cache);

// 获取完整布局数据
const layout = await repo.getLayout('zh-CN');

// 获取单个组件
const header = await repo.getHeader('zh-CN');
const footer = await repo.getFooter('zh-CN');
```

## 🚀 使用方式

### 方式 1: 使用工厂（推荐）

```typescript
import { infrastructure, repositories } from '@/infrastructure';

// 使用预配置的实例
const homepage = await repositories.homepage.getHomepage('zh-CN');
const layout = await repositories.layout.getLayout('zh-CN');
```

### 方式 2: 自定义配置

```typescript
import { createInfrastructure } from '@/infrastructure';

const infra = createInfrastructure({
  json: {
    baseUrl: '/api/content',
    timeout: 10000,
  },
  cache: {
    ttl: 10 * 60 * 1000, // 10 分钟
    maxSize: 200,
  },
});

const homepage = await infra.homepageRepository.getHomepage('zh-CN');
```

### 方式 3: 手动创建

```typescript
import {
  createJsonAdapter,
  createCacheManager,
  createHomepageRepository,
} from '@/infrastructure';

const adapter = createJsonAdapter();
const cache = createCacheManager();
const repo = createHomepageRepository(adapter, cache);

const homepage = await repo.getHomepage('zh-CN');
```

## 📊 数据流

```
┌─────────────────────────────────────────────────┐
│           Application Layer                     │
│  (useHomepage Hook)                             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Infrastructure - Repository                │
│  1. Check Cache                                 │
│  2. If cached → return                          │
│  3. If not → fetch from Adapter                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Infrastructure - Adapter                   │
│  fetch('/data/sections/hero.zh-CN.json')        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Infrastructure - Mapper                    │
│  JSON → Domain Model                            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Infrastructure - Cache                     │
│  Store for future requests                      │
└─────────────────────────────────────────────────┘
```

## 🔧 扩展性

### 添加新的数据源

1. 创建新的 Adapter
```typescript
// adapters/api/ApiAdapter.ts
export class ApiAdapter {
  async fetch(key: string, locale: string) {
    const response = await fetch(`/api/content/${key}/${locale}`);
    return response.json();
  }
}
```

2. 更新 Repository 使用新 Adapter
```typescript
const apiAdapter = new ApiAdapter();
const repo = createHomepageRepository(apiAdapter, cache);
```

### 添加新的内容类型

1. 在 Domain Layer 定义模型和接口
2. 创建 Mapper
3. 创建 Repository 实现
4. 在 factory.ts 中注册

## ✅ 已实现功能

- ✅ JSON 文件适配器
- ✅ 内存缓存管理
- ✅ 7 个数据映射器
- ✅ 2 个聚合仓储
- ✅ 工厂模式实例创建
- ✅ 完整的错误处理
- ✅ TypeScript 类型安全

## 🚧 未来扩展

- ⏳ API 适配器（Week 3+）
- ⏳ CMS 适配器（Strapi/Contentful）
- ⏳ Redis 缓存支持
- ⏳ 数据预加载策略
- ⏳ 离线缓存支持

## 📚 设计模式

### 1. 适配器模式
JsonAdapter 适配不同的数据源（JSON、API、CMS）

### 2. 仓储模式
Repository 封装数据访问逻辑，隔离数据源细节

### 3. 映射器模式
Mapper 负责数据格式转换（JSON ↔ Domain）

### 4. 工厂模式
Factory 统一创建和管理实例

### 5. 缓存模式
CacheManager 提供透明的缓存层

## 🎓 最佳实践

1. **使用工厂创建实例** - 避免手动管理依赖
2. **合理设置缓存时间** - 平衡性能和数据新鲜度
3. **错误处理** - 使用 Domain 定义的异常类型
4. **类型安全** - 充分利用 TypeScript 类型系统
5. **可测试性** - 所有组件都易于单元测试

---

**实现完成日期**: 2026-02-12
**实现文件数**: 18 个
**状态**: ✅ 完成