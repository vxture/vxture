# CLAUDE.md — @vxture/core-locale

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-locale` |
| 路径 | `packages/core/locale/` |
| @layer | `Infrastructure` |

---

## 职责

服务端语言解析和内容本地化工具。

- resolveLocale：从请求中解析语言（Cookie / Accept-Language）
- localizeContent：从多语言对象中取对应语言的字符串

与 `@vxture/shared` 的区别：
- **shared**：仅定义类型和常量（Locale、SUPPORTED_LOCALES）
- **core-locale**：提供服务端解析和查找逻辑

---

## 目录结构

```
src/
├── constants/    # Extension point reserved
├── utils/        # locale.utils.ts, locale-parser.utils.ts
├── types/        # locale.types.ts
└── index.ts      # 单一公共出口（重新导出 shared 的类型和常量）
```

---

## 允许/禁止

**允许：**
- `@vxture/shared`

**禁止：**
- NestJS / Next.js / React
- Prisma / Redis
- `@vxture/service-*` / `bff-*` / `ai-sdk` / `design-system` / `platform-*`
- 浏览器专用 API（仅供服务端使用）

---

## 核心约束

- resolveLocale 仅在服务端调用（bff / services / agent-server）
- 语言解析优先级：Cookie（NEXT_LOCALE）> Accept-Language > DEFAULT_LOCALE
- localizeContent 回退策略：目标语言 > DEFAULT_LOCALE > 第一个可用语言 > 空字符串
- 类型和常量从 @vxture/shared 导入，不重复定义
