# Domain Layer 严格边界重构指南

## ❌ 禁止出现的内容

### 1. 不允许的导入
```typescript
// ❌ 禁止
import fetch from 'node-fetch';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

// ✅ 允许
import type { ValidationResult } from '../types';
```

### 2. 不允许的语法
```typescript
// ❌ 禁止使用 class
export class ContentEntity {
  constructor(public readonly key: string) {}
}

// ✅ 使用 interface + 纯函数
export interface ContentEntity {
  readonly key: string;
}

export const ContentEntityHelpers = {
  create: (key: string): ContentEntity => ({ key }),
  validate: (entity: ContentEntity): ValidationResult => {...}
};
```

### 3. 不允许的依赖
```typescript
// ❌ 禁止
- 外部 HTTP 库（fetch, axios）
- React（useState, useEffect）
- UI 框架（Ant Design, Material-UI）
- CMS SDK（Strapi, Contentful）
- 数据库 ORM（Prisma, TypeORM）

// ✅ 允许
- 纯 TypeScript 类型
- 纯函数
- 常量定义
```

## ✅ 允许出现的内容

### 1. Interface 和 Type
```typescript
// ✅ 接口定义
export interface HeroContent {
  readonly key: string;
  readonly enabled: boolean;
  readonly title: string;
}

// ✅ 类型别名
export type ContentKey = 'hero' | 'features' | 'solutions';

// ✅ 联合类型
export type Theme = 'primary' | 'secondary' | 'brand';
```

### 2. Enum
```typescript
// ✅ 枚举
export enum ContentStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}
```

### 3. 纯函数
```typescript
// ✅ 验证函数
export const validateEmail = (email: string): ValidationResult => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return {
    valid: isValid,
    errors: isValid ? [] : ['Invalid email format'],
  };
};

// ✅ 转换函数
export const normalizeLocale = (locale: string): LocaleCode => {
  const [lang, region] = locale.toLowerCase().split('-');
  if (region) {
    return `${lang}-${region.toUpperCase()}` as LocaleCode;
  }
  return locale as LocaleCode;
};
```

### 4. 常量定义
```typescript
// ✅ 配置常量
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;
export const DEFAULT_LOCALE = 'zh-CN';

// ✅ 默认值
export const DEFAULT_THEME: Theme = 'primary';
```

## 📋 重构清单

### Phase 1: 移除 Class（优先级：高）

#### shared/entities/
- [ ] `content-entity.ts` - 改为 interface + Helpers
- [ ] `content-item.ts` - 改为 interface + Helpers

#### shared/valueObjects/
- [x] `locale.ts` - 已重构为 interface + LocaleHelpers
- [x] `slug.ts` - 已重构为 interface + SlugHelpers
- [x] `email.ts` - 已重构为 interface + EmailHelpers
- [x] `theme.ts` - 已重构为 interface + ThemeHelpers

#### layout/
- [ ] `header.model.ts` - 所有 class 改为 interface
- [ ] `footer.model.ts` - 所有 class 改为 interface

#### homepage/
- [ ] `hero.model.ts` - 移除 class
- [ ] `features.model.ts` - 移除 class
- [ ] `solutions.model.ts` - 移除 class
- [ ] `cases.model.ts` - 移除 class
- [ ] `cta.model.ts` - 移除 class
- [ ] `homepage.aggregate.ts` - 改为 interface + Helpers

### Phase 2: 移除外部依赖（优先级：高）

- [ ] 检查所有 import 语句
- [ ] 移除 @/shared/types/content.types 的依赖（如果存在）
- [ ] 确保只引用 domain 内部的类型

### Phase 3: 纯函数化（优先级：中）

- [ ] 所有方法改为纯函数
- [ ] 移除 this 关键字
- [ ] 移除实例方法

## 🎯 重构模板

### Before (❌ 错误)
```typescript
export class Logo {
  constructor(
    public readonly text: string,
    public readonly image: string
  ) {}

  validate(): ValidationResult {
    const errors: string[] = [];
    if (!this.text) errors.push('Text is required');
    return { valid: errors.length === 0, errors };
  }
}
```

### After (✅ 正确)
```typescript
export interface Logo {
  readonly text: string;
  readonly image: string;
}

export const LogoHelpers = {
  create: (text: string, image: string): Logo => ({
    text,
    image,
  }),

  validate: (logo: Logo): ValidationResult => {
    const errors: string[] = [];
    if (!logo.text) errors.push('Text is required');
    return { valid: errors.length === 0, errors };
  },
};
```

## 🔍 检查命令

```bash
# 检查是否有 class 关键字
grep -r "export class" src/domain/

# 检查是否有外部导入
grep -r "from ['\"]\(axios\|fetch\|react\|@tanstack\)" src/domain/

# 检查是否有 this 关键字
grep -r "this\." src/domain/

# 检查是否有 extends 关键字
grep -r "extends" src/domain/
```

## ✅ 验证标准

重构完成后，Domain Layer 应满足：

1. ✅ 无 class 定义
2. ✅ 无 extends 继承
3. ✅ 无 this 关键字
4. ✅ 无外部依赖（React, axios, fetch 等）
5. ✅ 只有 interface, type, enum
6. ✅ 只有纯函数
7. ✅ 只有常量定义

## 📝 重构优先级

1. **高优先级**（立即重构）
   - 移除所有 class
   - 移除所有外部依赖

2. **中优先级**（下一步）
   - 优化纯函数实现
   - 完善类型定义

3. **低优先级**（优化阶段）
   - 添加更多辅助函数
   - 完善文档注释
