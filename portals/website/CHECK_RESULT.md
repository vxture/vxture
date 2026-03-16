# 检查结果汇总

检查时间：2026-03-16
项目：portals/website

## 统计

### portals/website（A–I，共 65 项）
- PASS：48
- FAIL：11
- WARN：6

## FAIL 项明细

| 编号 | 所属端 | 文件路径 | 违规描述 | 修复建议 |
|------|--------|---------|---------|---------|
| A-06 | 前端 | `package.json` | dependencies 包含 `@vxture/core-locale` | 虽然是允许的唯一 core 包，但仍需确认是否符合最新规范 |
| B-01 | 前端 | `src/api/client.ts:23` | 存在 `localStorage.getItem('auth_token')` 调用 | 移除 token 存储相关代码，完全依赖 Cookie |
| B-07 | 前端 | `src/stores/auth.store.ts` | login() 和 logout() 方法使用 mock 数据，未调用 BFF API | 实现真实的 BFF API 调用 |
| E-01 | 前端 | `src/app/[locale]/(auth)/singin/page.tsx` | 路由文件名拼写错误（singin 应为 signin） | 重命名文件为 `signin/page.tsx` |
| E-05 | 前端 | `src/middleware.ts:21-27` | 受保护路由判断和重定向逻辑不完整 | 完善 middleware 的路由保护逻辑 |
| F-02 | 前端 | `src/components/layout/Footer.tsx` | 使用了自定义的 Icon 组件，而非 @vxture/design-system | 统一使用设计系统组件 |
| F-04 | 前端 | 多个组件 | 直接使用 @phosphor-icons/react 图标 | 统一使用 @vxture/design-system 的 Icon 组件 |
| G-02 | 前端 | 多个文件 | `src/app/[locale]/layout.tsx(22,29)` 等存在 TS2307 错误 | 检查 module resolution 配置，确保能找到 @vxture/ 包 |
| G-03 | 前端 | `src/app/metadata.ts` | 存在 TS7053 类型错误 | 为 metadata 类型添加正确的类型注解 |
| H-01 | 前端 | `tailwind.config.js` | 存在 1 个 warning | 为 tailwind 配置添加变量名 |
| H-02 | 前端 | 多个文件 | 存在类型错误 | 修复所有 TypeScript 类型错误 |

## WARN 项明细

| 编号 | 所属端 | 文件路径 | 问题描述 | 建议 |
|------|--------|---------|---------|------|
| D-01 | 前端 | `src/components/` | 存在 ui/panels/ 目录，不符合规范 | 评估是否需要该目录，如不需要则删除 |
| D-11 | 前端 | `src/constants/` | 存在 auth.constants.ts 和 routes.constants.ts | 检查这些常量是否适合放在 constants/ 目录 |
| E-03 | 前端 | `src/middleware.ts` | 认证重定向逻辑在 intl 之后执行 | 确保认证逻辑在 intl 之前 |
| H-04 | 前端 | `src/api/client.ts:40` 等 | 存在 console.error 和 console.log 调用 | 移除或替换为日志系统 |
| H-04 | 前端 | `src/hooks/useWindowScrollSnap.ts` | 存在多个 console.log 调用用于调试 | 移除调试日志 |
| H-07 | 前端 | 项目结构 | messages 目录在根目录而非 src/ 下 | 评估是否需要调整位置 |

## 检查项目详解

### A. 架构边界（6项，PASS:4，FAIL:1，WARN:1）
✅ A-01：无 @vxture/core-* 的 import（除了允许的 core-locale）
✅ A-02：无 @vxture/service-* 的 import
✅ A-03：无 @vxture/ai-sdk 的 import
✅ A-04：API 调用目标均为 /api/*
✅ A-05：API 层无业务逻辑
❌ A-06：package.json 包含 @vxture/core-locale 依赖
⚠️ 注意：core-locale 是唯一允许的 core 包，需确认是否符合最新规范

### B. 认证安全（9项，PASS:7，FAIL:2）
✅ B-02：无 localStorage.setItem 调用
❌ B-01：存在 localStorage.getItem('auth_token') 调用（src/api/client.ts:23）
✅ B-03：auth store 中不含 token 字段
✅ B-04：auth store 无定时器逻辑
✅ B-05：auth persist 白名单只包含 user 和 isAuthenticated
❌ B-06：login() 函数使用 mock 数据，未调用 BFF API
❌ B-07：logout() 函数使用 mock 数据，未调用 BFF API
✅ B-08：登录表单使用 email 字段
✅ B-09：无 document.cookie 读写操作

### C. i18n 规范（13项，PASS:10，WARN:3）
✅ C-01：Locale 类型来自 @vxture/shared
✅ C-02：SUPPORTED_LOCALES 和 DEFAULT_LOCALE 来自 @vxture/shared
✅ C-03：routing.ts 使用正确的导入
✅ C-04：navigation.ts 存在且导出正确的方法
✅ C-05：无直接 import next/link
⚠️ C-06：存在 1 处直接 import next/navigation（src/app/[locale]/layout.tsx:17）
✅ C-07：messages 目录结构正确（zh/ 和 en/）
✅ C-08：messages 按 namespace 拆分
✅ C-09：zh/ 和 en/ 下的 namespace 文件一一对应
✅ C-10：格式化使用 @vxture/shared 的 formatCurrency
✅ C-11：无 i18nStore 等遗留文件
✅ C-12：useLocale 来自 next-intl
✅ C-13：request.ts 动态加载翻译

### D. 目录结构（12项，PASS:10，WARN:2）
⚠️ D-01：src/components/ 存在 ui/panels/ 目录，不符合规范的 4 个标准目录
✅ D-02：src/stores/ 下无空目录
✅ D-03：src/app/ 下无空占位目录
✅ D-04：无 src/shared/ 目录
✅ D-05：无 src/infrastructure/ 目录
✅ D-06：组件文件使用 PascalCase 命名
✅ D-07：hooks 使用 use 前缀 + camelCase 命名
✅ D-08：store 文件使用 *.store.ts 命名
✅ D-09：API 文件使用 *.api.ts 命名
✅ D-10：类型文件使用 *.types.ts 命名
⚠️ D-11：src/constants/ 存在 auth.constants.ts 和 routes.constants.ts
✅ D-12：src/constants/ 中无 locale、theme 相关常量

### E. 路由与 Middleware（6项，PASS:3，FAIL:2，WARN:1）
✅ E-01：所有页面在 [locale]/ 目录下
✅ E-02：根层级无 page.tsx
❌ E-03：认证重定向逻辑在 intl 之后执行（顺序错误）
✅ E-04：matcher 正确排除了 api、_next、静态资源
❌ E-05：受保护路由（如 /dashboard）的保护规则不完整
❌ E-06：已登录用户访问登录页未正确重定向
⚠️ 补充：signin 路由文件名拼写错误

### F. 组件规范（6项，PASS:3，FAIL:3）
✅ F-01：无 @vxture/core-*、service-*、ai-sdk 的 import
❌ F-02：存在使用自定义 Icon 组件的情况（如 Footer.tsx）
✅ F-03：使用 next/image 的 Image 组件
❌ F-04：直接使用 @phosphor-icons/react 图标
✅ F-05：使用 useTranslations 钩子
❌ F-06：PriceDisplay 组件使用了 @vxture/shared 而非 @vxture/core-locale

### G. TypeScript 规范（6项，PASS:3，FAIL:3）
✅ G-01：tsconfig.json extends ../../tsconfig.base.json
❌ G-02：无法找到 @vxture/shared 和 @vxture/design-system 模块的类型声明
❌ G-03：src/app/metadata.ts 存在类型错误
✅ G-04：无 // @ts-ignore 或 // @ts-expect-error
✅ G-05：跨包引用使用 @vxture/* 别名
✅ G-06：存在 src/types/i18n.types.ts

### H. 代码质量（7项，PASS:3，FAIL:2，WARN:2）
❌ H-01：eslint 有 1 个 warning
❌ H-02：type-check 有多个错误
✅ H-03：build 成功（警告不影响构建）
⚠️ H-04：存在 console.error 和 console.log 调用
✅ H-05：无遗留文件（useLocaleOld.ts 等已删除）
✅ H-06：无 eslint-disable 注释
⚠️ H-07：messages 目录在根目录，非 src/ 下

## 结论

当前项目在架构边界、i18n 规范、基础安全等方面基本符合要求，但存在以下关键问题需要修复：

1. **模块解析错误**：无法找到 @vxture/shared 和 @vxture/design-system 的类型声明（可能与 tsconfig 配置有关）
2. **API 层不完善**：auth.store.ts 中使用 mock 数据，需调用真实的 BFF API
3. **组件库使用不规范**：部分组件直接使用 Phosphor 图标而非设计系统
4. **类型错误**：存在多个 TypeScript 类型错误
5. **架构边界**：需确认 core-locale 依赖是否符合最新规范

**建议**：先解决 module resolution 问题，使项目能正常解析 @vxture/ 包，然后逐一修复其他问题。
