# Website 包问题检查清单

> 检查日期：2026-03-12
> 基于根目录 CLAUDE.md 规范检查

---

## 📋 架构与层边界问题

### A1. 状态管理重复 / 冲突
- **问题**：同时存在 `GlobalContext` 和 Zustand stores（`themeStore`、`i18nStore`、`authStore`）
- **位置**：`src/shared/contexts/GlobalContext.tsx` vs `src/stores/`
- **严重程度**：🔴 高
- **说明**：
  - `GlobalContext` 中管理了 `theme` 和 `locale`
  - `themeStore.ts` 和 `i18nStore.ts` 也管理相同状态
  - Header 组件使用 `useThemeStore`，但 layout 也有 server context
  - **建议**：统一使用 Zustand stores，移除 GlobalContext

### A2. 目录结构不符合 portals/ 规范
- **问题**：目录结构与 `portals/CLAUDE.md` 约定不一致
- **位置**：整体目录结构
- **严重程度**：🟡 中
- **说明**：
  - 规范要求：`src/pages/`、`src/components/common/`、`src/hooks/`、`src/api/`、`src/types/`
  - 当前：`src/app/`（Next.js App Router）、`src/infrastructure/`、`src/shared/`
  - `src/docs/` 目录不应放在源代码中
  - `src/data/` 目录位置待确认
  - **建议**：按 Next.js App Router 实际情况调整规范或目录

### A3. 认证适配器层混乱
- **问题**：auth service 适配器命名和职责不清晰
- **位置**：`src/infrastructure/adapters/auth/authService.ts`
- **严重程度**：🟡 中
- **说明**：
  - 文件头部注释写着"临时的认证服务适配器"
  - 同时存在 `src/api/auth.ts` 和这个适配器
  - `authStore` 引用的是 `infrastructure/adapters/auth/authService`
  - **建议**：统一 API 调用路径，移除临时适配器注释或正式化

---

## 📋 TypeScript 与类型问题

### T1. ESLint 错误（已通过 lint 验证）
- **位置**：多个文件
- **严重程度**：🔴 高

| 文件 | 行号 | 问题 |
|------|------|------|
| `src/components/layout/Header.tsx` | 36 | `'theme'` 赋值但未使用 |
| `src/infrastructure/adapters/auth/authService.ts` | 7 | `'UserInfo'` 定义但未使用 |
| `src/infrastructure/adapters/auth/authService.ts` | 10 | 使用 `any` 类型 |
| `src/infrastructure/adapters/auth/authService.ts` | 32 | `'token'` 参数未使用（应加 `_` 前缀） |
| `src/infrastructure/adapters/auth/authService.ts` | 36 | `'refreshToken'` 参数未使用（应加 `_` 前缀） |

### T2. 路径别名混用
- **问题**：tsconfig paths 与根目录不一致
- **位置**：`tsconfig.json`
- **严重程度**：🟡 中
- **说明**：
  - 根目录 tsconfig.base.json 定义了 `@vxture/*` 别名
  - website tsconfig 定义了 `@/*` 别名指向 `./src/*`
  - 两者同时使用可能造成混淆
  - **建议**：统一别名风格，website 内可以保留 `@/*`

---

## 📋 代码质量与规范问题

### Q1. React Hook 依赖缺失警告
- **位置**：`src/hooks/useWindowScrollSnap.ts`
- **严重程度**：🟡 中
- **说明**：
  - 多个 `useCallback` 和 `useEffect` 缺失 `hasWindow` 依赖
  - 行号：172, 222, 244, 270, 381, 408, 440, 502, 632, 646, 716
  - **建议**：添加依赖或使用 `// eslint-disable-next-line react-hooks/exhaustive-deps` 并注释说明

### Q2. Next.js 图片优化警告
- **位置**：多个组件
- **严重程度**：🟢 低
- **说明**：
  - `src/components/home/HeroSection.tsx:173,209` - 使用 `<img>` 而非 `<Image>`
  - `src/components/layout/Footer.tsx:199` - 使用 `<img>` 而非 `<Image>`
  - `src/components/layout/Header.tsx` - 已有 `/* eslint-disable @next/next/no-img-element */` 注释
  - **建议**：统一处理，要么都禁用，要么都改用 Next.js Image

### Q3. 文件头注释不统一
- **位置**：多个文件
- **严重程度**：🟢 低
- **说明**：
  - 部分文件有详细文件头（`page.tsx`、`authStore.ts`、`HeroSection.tsx`）
  - 部分文件只有简单注释（`api/index.ts`、`api/client.ts`、`useHomepage.ts`）
  - 部分文件几乎没有注释（`GlobalContext.tsx`）
  - **建议**：按照 `docs/ai/claude-coding-comments.md` 统一

---

## 📋 架构设计问题

### D1. i18n 实现方案不明确
- **问题**：同时存在旧的 i18n 实现和 react-i18next
- **位置**：`src/hooks/useLocale.ts` vs `src/hooks/useLocaleOld.ts`
- **严重程度**：🟡 中
- **说明**：
  - 存在 `useLocaleOld.ts`，暗示正在迁移
  - package.json 已引入 `i18next`、`react-i18next`、`i18next-browser-languagedetector`、`i18next-http-backend`
  - 但未看到 i18next 初始化配置
  - **建议**：明确迁移状态，完成迁移或回退

### D2. API 客户端 token 获取方式不一致
- **问题**：apiClient 直接访问 localStorage，与 authStore 状态管理脱节
- **位置**：`src/api/client.ts:23`
- **严重程度**：🟡 中
- **说明**：
  - 当前：`localStorage.getItem('auth_token')`
  - 但 token 实际由 `authStore` 管理（使用 Zustand persist）
  - 可能造成不同步
  - **建议**：从 authStore 获取 token，或统一存储策略

### D3. 基础设施层命名不清晰
- **问题**：`infrastructure` 目录在 Presentation 层中的角色
- **位置**：`src/infrastructure/`
- **严重程度**：🟢 低
- **说明**：
  - 根据根 CLAUDE.md，`infrastructure` 层应在 `packages/core/`
  - portals/website 作为 Presentation 层有自己的 `infrastructure` 目录
  - **建议**：明确该目录用途，考虑重命名（如 `adapters/` 或 `services/`）

---

## 📋 未使用/遗留代码

### U1. 待清理文件
- **位置**：
  - `src/hooks/useLocaleOld.ts`
  - `public/css-test.html`
  - `public/html/component-system-architecture.html`
  - `public/html/icon-system-architecture.html`
  - `src/docs/develop/authdesign.tsx`
- **严重程度**：🟢 低
- **建议**：确认后删除或移到 `docs/` 目录

---

## 📋 问题优先级总结

| 优先级 | 数量 | 问题 |
|--------|------|------|
| 🔴 高 | 2 | A1 状态管理重复、T1 ESLint 错误 |
| 🟡 中 | 6 | A2 目录结构、A3 认证适配器、T2 路径别名、Q1 Hook 依赖、D1 i18n 方案、D2 API token |
| 🟢 低 | 4 | Q2 图片优化、Q3 文件头注释、D3 infrastructure 命名、U1 待清理文件 |

---

## 📋 后续建议

1. **立即修复**：🔴 高优先级问题（ESLint 错误、状态管理统一）
2. **短期修复**：🟡 中优先级问题（Hook 依赖、API token 同步）
3. **中长期规划**：目录结构统一、i18n 方案明确化
4. **文档对齐**：确认 `portals/CLAUDE.md` 与 Next.js App Router 的兼容性
