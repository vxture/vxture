# @vxture/core-locale

服务端语言解析和内容本地化工具。

## 安装

```bash
pnpm add @vxture/core-locale
```

## 快速开始

```typescript
import { resolveLocale, localizeContent } from "@vxture/core-locale";

// 从请求解析语言
const locale = resolveLocale(request);

// 本地化内容
const title = localizeContent({ zh: "专业版", en: "Pro" }, locale);
```

## API

### resolveLocale(request, options)

从 HTTP 请求中解析语言。

**参数：**
- `request`: LocaleRequest（框架无关的请求接口）
- `options`: ResolveLocaleOptions（可选配置）

**返回：** Locale

### localizeContent(content, locale, options)

从多语言对象中取对应语言的字符串。

**参数：**
- `content`: LocalizedContent（多语言对象）
- `locale`: Locale（目标语言）
- `options`: LocalizationOptions（可选配置）

**返回：** string

## 导出

```typescript
// 从 @vxture/shared 重新导出
export type { Locale } from "@vxture/shared";
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@vxture/shared";

// core-locale 特有类型
export type {
  LocaleRequest,
  LocalizedContent,
  ResolveLocaleOptions,
  LocalizationOptions,
} from "./types";

// core-locale 工具函数
export {
  resolveLocale,
  localizeContent,
  parseAcceptLanguage,
  normalizeLocale,
  parseCookieValue,
  isSupportedLocale,
} from "./utils";
```

## 脚本

```bash
pnpm type-check   # 类型检查
pnpm build        # 构建
pnpm clean        # 清理构建产物
```
