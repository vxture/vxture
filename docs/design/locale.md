# 多语言系统重构方案

**项目**：Vxture Monorepo
**模块**：@vxture/shared、@vxture/core-locale、@vxture/website
**类型**：架构升级

---

## 1. 问题分析

### 当前问题
- **语言标识不规范**：使用 `zh`、`en` 简写格式，不符合 W3C 规范
- **HTML 属性不符合标准**：`lang` 属性值应为完整 BCP47 标签
- **类型系统简单**：不支持地区变体（如 zh-TW、en-GB）
- **URL 与属性不一致**：URL 使用 `/zh/`，但 Intl API 需要 `zh-CN`

### 影响范围
- `packages/shared/` - 类型和常量定义
- `packages/core-locale/` - 服务端解析逻辑
- `portals/website/` - 前端渲染和路由
- 所有依赖 Locale 类型的包

---

## 2. 方案设计

### 设计原则
1. **简单直接**：避免复杂的回退逻辑
2. **符合标准**：使用完整的 BCP47 语言标签
3. **现代主流**：采用大厂通用的方案
4. **易于维护**：代码清晰，扩展性好

### 核心架构

#### 类型定义
```typescript
// @vxture/shared/types/locale.types.ts
export type Locale = 'zh-CN' | 'en-US';

export interface LocaleConfig {
  locale: Locale;
  displayName: string;
  nativeName: string;
  flag?: string;
}
```

#### 常量配置
```typescript
// @vxture/shared/constants/locale.constants.ts
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;
export const DEFAULT_LOCALE: Locale = 'zh-CN';

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  'zh-CN': {
    locale: 'zh-CN',
    displayName: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳'
  },
  'en-US': {
    locale: 'en-US',
    displayName: 'English (US)',
    nativeName: 'English (US)',
    flag: '🇺🇸'
  }
};
```

#### 语言配置
```typescript
// @vxture/core-locale/src/utils/locale.utils.ts
export function getHtmlLang(locale: Locale): string {
  return locale;  // 直接使用完整标签
}
```

---

## 3. 实施步骤

### 阶段一：类型和常量重构 ✅ 完成

已完成时间：2026-03-16

#### 3.1 @vxture/shared 更新

**修改文件**：
- `src/types/locale.types.ts` - 更新类型定义
- `src/constants/locale.constants.ts` - 更新常量配置
- `src/utils/format.utils.ts` - 更新格式化工具

**主要变更**：
- 将 `Locale` 类型从 `'zh' | 'en'` 改为 `'zh-CN' | 'en-US'`
- 添加 `LOCALE_CONFIGS` 对象，包含完整语言信息
- 移除复杂的语言映射关系

#### 3.2 @vxture/core-locale 更新

**修改文件**：
- `src/types/locale.types.ts` - 导入新类型
- `src/utils/locale.utils.ts` - 更新解析逻辑
- `src/index.ts` - 重新导出类型和常量

**主要变更**：
- 简化 `resolveLocale` 函数
- 移除 `getBaseLocale` 等复杂逻辑
- 确保与 shared 包类型一致

---

### 阶段二：前端应用更新

#### 3.3 页面组件

**修改文件**：
- `src/app/[locale]/layout.tsx` - 更新 HTML lang 属性
- `src/components/ui/LocaleSwitcher.tsx` - 更新语言选项
- `src/lib/i18n/routing.ts` - 更新路由配置

**主要变更**：
```typescript
// 旧的 HTML lang 属性
<html lang={locale}>  // 输出 zh 或 en

// 新的 HTML lang 属性
<html lang={locale}>  // 输出 zh-CN 或 en-US
```

#### 3.4 语言切换组件

**修改文件**：`src/components/ui/LocaleSwitcher.tsx`

**主要变更**：
```typescript
import { LOCALE_CONFIGS, SUPPORTED_LOCALES } from '@vxture/shared';

export function LocaleSwitcher() {
  return (
    <div className="flex space-x-2">
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
        >
          {LOCALE_CONFIGS[locale].flag}
          {LOCALE_CONFIGS[locale].nativeName}
        </button>
      ))}
    </div>
  );
}
```

#### 3.5 翻译内容

**修改文件**：`messages/` 目录结构

**新结构**：
```
messages/
├── zh-CN/
│   ├── common.json
│   └── home.json
└── en-US/
    ├── common.json
    └── home.json
```

---

## 4. 验证计划

### 功能验证清单

#### 4.1 基础功能

- [ ] URL 路由正常工作
- [ ] 语言切换功能正常
- [ ] 页面内容正确显示
- [ ] HTML lang 属性符合规范

#### 4.2 类型系统验证

- [ ] TypeScript 类型无错误
- [ ] 所有导入路径正确
- [ ] 常量配置类型安全

#### 4.3 服务端验证

- [ ] resolveLocale 函数正确解析语言
- [ ] localizeContent 函数正确查找翻译
- [ ] 与客户端解析逻辑一致

---

## 5. 向后兼容性

### 策略

1. **保留对旧 URL 的支持**：如果有用户访问 `/zh/`，自动重定向到 `/zh-CN/`
2. **渐进式迁移**：允许旧版本的翻译文件继续存在，但建议逐步迁移
3. **平滑过渡**：提供工具或脚本辅助迁移

### 实施方法

```typescript
// middleware.ts 中添加重定向逻辑
if (request.nextUrl.pathname.startsWith('/zh/') && request.nextUrl.pathname !== '/zh-CN/') {
  const newUrl = request.nextUrl.pathname.replace('/zh/', '/zh-CN/');
  return NextResponse.redirect(new URL(newUrl, request.url));
}
```

---

## 6. 技术规范

### 文件命名规范

```
packages/shared/
├── src/
│   ├── types/
│   │   └── locale.types.ts     # 类型定义
│   ├── constants/
│   │   └── locale.constants.ts # 常量配置
│   └── utils/
│       └── format.utils.ts     # 格式化工具
└── __tests__
    └── locale.spec.ts          # 测试文件
```

### 代码规范

```typescript
// ✅ 推荐的 Locale 使用方式
import { Locale, LOCALE_CONFIGS } from '@vxture/shared';

function getLanguageName(locale: Locale): string {
  return LOCALE_CONFIGS[locale].displayName;
}

// ❌ 不推荐的方式（使用字符串常量）
function badPractice() {
  const locale = 'zh'; // 可能与类型不匹配
  return translate(locale);
}
```

---

## 8. 未来扩展性

### 添加新语言的步骤

```typescript
// 1. 更新类型定义
export type Locale = 'zh-CN' | 'en-US' | 'ja-JP';

// 2. 更新支持的语言列表
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US', 'ja-JP'] as const;

// 3. 添加配置
export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  // 已有的配置...
  'ja-JP': {
    locale: 'ja-JP',
    displayName: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵'
  }
};

// 4. 添加翻译文件
// 在 messages/ 目录下创建 ja-JP/ 文件夹
```

### 支持地区变体

```typescript
// 未来支持 zh-TW 的方式
export type Locale = 'zh-CN' | 'zh-TW' | 'en-US';

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  'zh-CN': {
    // 现有配置
  },
  'zh-TW': {
    locale: 'zh-TW',
    displayName: '繁體中文',
    nativeName: '繁體中文',
    flag: '🇹🇼'
  }
};
```

---

## 9. 总结

本方案采用现代主流的单级完整 BCP47 标签格式，确保：
- 代码实现简单且易于维护
- 完全符合 W3C 规范
- 与现代浏览器 API 完美配合
- 为未来扩展提供良好的基础架构

通过这次重构，我们将建立一个健壮且符合标准的多语言系统。
