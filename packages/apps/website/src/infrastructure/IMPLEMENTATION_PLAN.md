# Infrastructure Layer 实现计划

## 📁 目录结构

```
src/infrastructure/
├── adapters/                    # 数据适配器
│   ├── json/
│   │   ├── JsonAdapter.ts      # JSON 文件适配器
│   │   └── index.ts
│   └── index.ts
│
├── mappers/                     # 数据映射器
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
├── repositories/                # Repository 实现
│   ├── layout/
│   │   ├── HeaderRepository.ts
│   │   ├── FooterRepository.ts
│   │   ├── LayoutRepository.ts
│   │   └── index.ts
│   ├── homepage/
│   │   ├── HeroRepository.ts
│   │   ├── FeaturesRepository.ts
│   │   ├── SolutionsRepository.ts
│   │   ├── CasesRepository.ts
│   │   ├── CTARepository.ts
│   │   ├── HomepageRepository.ts
│   │   └── index.ts
│   └── index.ts
│
├── cache/                       # 缓存管理
│   ├── CacheManager.ts
│   └── index.ts
│
└── index.ts                     # 统一导出
```

## 🎯 实施步骤

### Phase 1: 核心基础设施 ✅
1. JSON Adapter - 从 public/data/ 读取 JSON 文件
2. Cache Manager - 内存缓存管理

### Phase 2: 数据映射器
3. Layout Mappers - Header、Footer 数据映射
4. Homepage Mappers - Hero、Features、Solutions、Cases、CTA 映射

### Phase 3: Repository 实现
5. Layout Repositories - 实现 ILayoutRepository
6. Homepage Repositories - 实现 IHomepageRepository

## 📋 设计原则

1. **依赖倒置**: Infrastructure 实现 Domain 定义的接口
2. **单一职责**: Adapter 负责数据获取，Mapper 负责数据转换，Repository 负责编排
3. **可测试性**: 所有实现都易于单元测试
4. **可替换性**: 未来可以轻松替换为 API、CMS 等数据源