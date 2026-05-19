# DS 审计整改清单

> 生成时间：2026-05-17
> 来源：设计系统双维度审计报告
> 状态图例：⬜ 待处理 / 🔄 进行中 / ✅ 已完成 / ⏭ 跳过(需更大重构)

---

## P0 — 单行/小范围修复 ✅ 全部完成（Commit a59b7a2）

| #   | 状态 | 问题                                                                                          | 文件                                  |
| --- | ---- | --------------------------------------------------------------------------------------------- | ------------------------------------- |
| 1   | ✅   | `FullscreenToggle` 激活态改为 `bg-vx-primary/text-vx-text-inverse/hover:bg-vx-primary-strong` | `Toggle.tsx:75`                       |
| 2   | ✅   | `button.tsx` destructive 添加 `--vx-color-danger-strong` token，修复 hover bug                | `button.tsx:33` + 两个 CSS token 文件 |
| 3   | ✅   | `types/index.ts` 补充 `FullscreenState/FullscreenContextValue/FullscreenPortalProps`          | `src/types/index.ts`                  |
| 4   | ✅   | `icons/index.ts` 补充 `IconWeight/IconSize/IconSizeMap` 导出                                  | `src/icons/index.ts`                  |
| 5   | ✅   | 删除 `types-entry.ts` 无意义运行时常量 `DESIGN_SYSTEM_TYPES_ENTRY`                            | `src/types-entry.ts`                  |
| 6   | ✅   | `tailwindcss/tailwindcss-animate/next-themes` 移入 `peerDependencies`                         | `package.json`                        |
| 7   | ✅   | 删除 website 失效的 tailwind v3 配置文件                                                      | `portals/website/tailwind.config.js`  |

---

## P1 — Hook 效率修复 ✅ 全部完成（Commit a349d57）

| #   | 状态 | 问题                                                                 | 文件                            |
| --- | ---- | -------------------------------------------------------------------- | ------------------------------- |
| 8   | ✅   | `useControllableState.setValue` 补 `useCallback`                     | `hooks/useControllableState.ts` |
| 9   | ✅   | `useFullscreen` 四个函数补 `useCallback`                             | `hooks/useFullscreen.ts`        |
| 10  | ✅   | `useBreakpoint` resize 事件改为 `requestAnimationFrame` 节流         | `hooks/useBreakpoint.ts`        |
| 11  | ✅   | `useMediaQuery` 改用 `useSyncExternalStore`，消除 hydration mismatch | `hooks/useMediaQuery.ts`        |

---

## P1 — 组件规范修复 ✅ 全部完成（Commit 0854728）

| #   | 状态 | 问题                                                                                        | 文件                                |
| --- | ---- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| 12  | ✅   | `Container/Stack/Grid` props 继承 `React.HTMLAttributes<HTMLDivElement>`，透传原生属性      | 三个布局组件                        |
| 13  | ⏭   | `FullscreenContainer` 双重 classList 管理（需更大重构，风险高）                             | `fullscreen/Container.tsx`          |
| 14  | ⏭   | layout gap/padding 硬编码 Tailwind 数字类（组件 xs/sm 与 token xs/sm 语义不同，需设计对齐） | `Stack/Grid/Container`              |
| 15  | ✅   | `PromptInput` 添加 `label` prop，绑定 `aria-label`                                          | `components/ai/PromptInput.tsx`     |
| 16  | ✅   | `ModelBadge` 添加 `disabled`/`aria-disabled`；Space 键移到 `keyup`                          | `components/ai/ModelBadge.tsx`      |
| 17  | ✅   | `ThemeProvider.defaultTheme` 标注 `@deprecated`                                             | `src/theme/ThemeProvider.tsx`       |
| 18  | ✅   | admin `globals.css` 补充 `console.css` 导入                                                 | `portals/admin/src/app/globals.css` |
| 19  | ✅   | 合并重复 import 行（ActionButton/tenant-switcher 系列/ConsolePreferenceControls）           | 多处 portal 文件                    |

---

## P1 — website marketing CTA ✅ 全部完成（Commit 78bc076）

| #   | 状态 | 问题                                                | 文件           |
| --- | ---- | --------------------------------------------------- | -------------- |
| 20  | ✅   | `BestPracticePage` CTA 改用 `<Button asChild>`      | marketing 文件 |
| 21  | ✅   | `AgentMarketplacePage` CTA 改用 `<Button asChild>`  | marketing 文件 |
| 22  | ✅   | `AboutUsPage` CTA 改用 `<Button asChild>`           | marketing 文件 |
| 23  | ✅   | `EmergencySolutionPage` CTA 改用 `<Button asChild>` | marketing 文件 |
| 24  | ✅   | `ProductDetailPartOne` CTA 改用 `<Button asChild>`  | marketing 文件 |
| 25  | ✅   | `SolutionSection` CTA 改用 `<Button asChild>`       | marketing 文件 |

---

## P2 — Token 体系整改 ✅ 部分完成（Commit f1d53fa）

| #   | 状态 | 问题                                                                                                                                                 | 文件               |
| --- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 26  | ✅   | `motion.ts` 删除冗余别名键（6个 easing + 2个 duration）                                                                                              | `tokens/motion.ts` |
| 27  | ⏭   | `colors.ts` gray 补充 950 步长（CSS 变量不存在，需先定义，属设计层决策）                                                                             | `tokens/colors.ts` |
| 28  | ⏭   | admin `--tenant-*` 体系：已验证 `admin-management-core.css` 中已映射到 DS 语义 token，结构合理；scale token 使用（如 warning-600）是设计决策，暂保留 | admin styles       |

---

## P2 — admin !important 整改 ✅ 完成（Commit f1d53fa）

| #   | 状态 | 问题                                                                                        | 文件                            |
| --- | ---- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| 29  | ✅   | 删除 4 处 `!important`，用 `.vx-btn` 提升特异度；`--tenant-rose` 替换为 `--vx-color-danger` | admin CSS 4 个文件              |
| 30  | ✅   | DS `console-base.css` + admin `admin-base-document.css` 修复错误 dark 选择器                | 两处 CSS 文件（Commit 7d73e33） |

---

## P2 — Server Component 优化

| #   | 状态 | 问题                                                                         | 文件                                  |
| --- | ---- | ---------------------------------------------------------------------------- | ------------------------------------- |
| 31  | ⏭   | website 落地页 `page.tsx` 去掉 `'use client'`（需确认 hooks 依赖，防止回归） | `portals/website/.../(main)/page.tsx` |
| 32  | ⏭   | admin 首页 `page.tsx` 改为 Server Component（大范围重构，涉及数据获取层）    | `portals/admin/.../page.tsx`          |

---

## P3 — 架构级重构（独立分支）

| #   | 状态 | 问题                                                                    |
| --- | ---- | ----------------------------------------------------------------------- |
| 33  | ⏭   | `ActionButton` 从 console/admin 双份提取到共享包                        |
| 34  | ⏭   | `EmptyState` 同上                                                       |
| 35  | ⏭   | admin `ThemeProvider` 委托给 `ConsoleAppProviders` 的额外 Client 层重构 |
| 36  | ⏭   | `density`/`theme` 共享 context 拆分                                     |
| 37  | ⏭   | `DensityProvider` Consumer+Provider 反模式重构                          |
| 38  | ⏭   | DS `Button` 补充官方 `variant="danger"` 扩展点                          |

---

## Commit 记录

| Commit  | 内容                                                                     |
| ------- | ------------------------------------------------------------------------ |
| a59b7a2 | fix(ds): P0 DS internal audit remediation                                |
| a349d57 | perf(ds): fix hook stability and SSR safety                              |
| 0854728 | fix(ds/portal): P1 component API, accessibility, and import cleanup      |
| 78bc076 | fix(website): replace hardcoded CTA class strings with DS Button asChild |
| f1d53fa | fix(ds/admin): P2 token cleanup and !important removal                   |
| 7d73e33 | fix(ds): 删除 console-base.css 中不可匹配的 dark 选择器                  |
