# DS 审计整改清单

> 生成时间：2026-05-17
> 来源：设计系统双维度审计报告
> 状态图例：⬜ 待处理 / 🔄 进行中 / ✅ 已完成 / ⏭ 跳过(需更大重构)

---

## P0 — 单行/小范围修复，优先完成

| # | 状态 | 问题 | 文件 |
|---|------|------|------|
| 1 | ⬜ | `FullscreenToggle` 激活态使用非规范 `bg-primary` 类，改为 `bg-vx-primary` | `packages/design/design-system/src/components/layout/fullscreen/Toggle.tsx:75` |
| 2 | ⬜ | `button.tsx` destructive variant hover 无视觉反馈（hover=default），补充深化 token | `packages/design/design-system/src/components/ui/button.tsx:33` |
| 3 | ⬜ | `types/index.ts` 遗漏导出 `FullscreenState`、`FullscreenContextValue`、`FullscreenPortalProps` | `packages/design/design-system/src/types/index.ts` |
| 4 | ⬜ | `icons/index.ts` 遗漏导出 `IconWeight`、`IconSize`、`IconSizeMap` | `packages/design/design-system/src/icons/index.ts` |
| 5 | ⬜ | `types-entry.ts` 导出无意义运行时常量 `DESIGN_SYSTEM_TYPES_ENTRY`，删除 | `packages/design/design-system/src/types-entry.ts` |
| 6 | ⬜ | `package.json` 将 `tailwindcss`、`tailwindcss-animate`、`next-themes` 移入 `peerDependencies` | `packages/design/design-system/package.json` |
| 7 | ⬜ | website 保留的 tailwind v3 配置文件在 v4 中不生效，删除 | `portals/website/tailwind.config.js` |

---

## P1 — 组件/Hook 规范修复

| # | 状态 | 问题 | 文件 |
|---|------|------|------|
| 8 | ⬜ | `useControllableState.setValue` 未用 `useCallback`，破坏子组件 memoization | `packages/design/design-system/src/hooks/useControllableState.ts` |
| 9 | ⬜ | `useFullscreen` 四个内部函数无 `useCallback` | `packages/design/design-system/src/hooks/useFullscreen.ts` |
| 10 | ⬜ | `useBreakpoint` 监听裸 resize 事件无节流，高频触发 state 更新 | `packages/design/design-system/src/hooks/useBreakpoint.ts` |
| 11 | ⬜ | `useMediaQuery` 初始 state 为 false，Next.js 严格模式下触发 hydration mismatch | `packages/design/design-system/src/hooks/useMediaQuery.ts` |
| 12 | ⬜ | `Container`/`Stack`/`Grid` props 不继承 `React.HTMLAttributes<HTMLDivElement>`，原生属性全丢 | `src/components/layout/` 三个组件 |
| 13 | ⬜ | `FullscreenContainer` 同时用 JSX 条件 class 和 `useEffect` 操作 classList，双重管理 | `src/components/layout/fullscreen/Container.tsx:53-71` |
| 14 | ⬜ | `layout/Stack` 和 `Grid` 的 gap、`Container` 的 padding 使用硬编码 Tailwind 数字类，跳过 spacing token | `Stack.tsx`, `Grid.tsx`, `Container.tsx:39` |
| 15 | ⬜ | `PromptInput` 的 `<textarea>` 无 `aria-label`/`id`，屏幕阅读器无 accessible name | `src/components/ai/PromptInput.tsx:71-78` |
| 16 | ⬜ | `ModelBadge` Space 键在 `keydown` 触发（标准应在 `keyup`），缺 `aria-disabled` | `src/components/ai/ModelBadge.tsx:49-66` |
| 17 | ⬜ | `ThemeProvider` 的 `defaultTheme` prop 无 `@deprecated` 标注 | `src/theme/ThemeProvider.tsx` |
| 18 | ⬜ | admin `globals.css` 未导入 `console.css`，但代码依赖其中的 `--vx-console-*` token | `portals/admin/src/app/globals.css` |
| 19 | ⬜ | admin/console/website 重复 import 行（同包两行 import），合并为单行 | 多处 `ActionButton.tsx`, `tenant-switcher.tsx` 等 |

---

## P1 — website marketing CTA 按钮整改

| # | 状态 | 问题 | 文件 |
|---|------|------|------|
| 20 | ⬜ | `BestPracticePage` CTA 链接改用 `<Button asChild>` | `portals/website/src/components/marketing/BestPracticePage.tsx` |
| 21 | ⬜ | `AgentMarketplacePage` CTA 链接改用 `<Button asChild>` | `portals/website/src/components/marketing/AgentMarketplacePage.tsx` |
| 22 | ⬜ | `AboutUsPage` CTA 链接改用 `<Button asChild>` | `portals/website/src/components/marketing/AboutUsPage.tsx` |
| 23 | ⬜ | `EmergencySolutionPage` CTA 链接改用 `<Button asChild>` | `portals/website/src/components/marketing/EmergencySolutionPage.tsx` |
| 24 | ⬜ | `ProductDetailPartOne` CTA 链接改用 `<Button asChild>` | `portals/website/src/components/marketing/ProductDetailPartOne.tsx` |
| 25 | ⬜ | `SolutionSection` CTA 链接改用 `<Button asChild>` | `portals/website/src/components/marketing/SolutionSection.tsx` |

---

## P2 — Token 体系整改

| # | 状态 | 问题 | 文件 |
|---|------|------|------|
| 26 | ⬜ | `motion.ts` easing/duration 冗余别名键（6个别名），清理或加注释说明规范名 | `packages/design/design-system/src/tokens/motion.ts` |
| 27 | ⬜ | `colors.ts` 中 gray 色阶补充 950 步长，与 brand 对齐 | `packages/design/design-system/src/tokens/colors.ts` |
| 28 | ⬜ | admin `--tenant-*` 私有 token 映射到 DS `--vx-color-danger/warning/success` 语义 token | `portals/admin/src/styles/` 多处 |

---

## P2 — admin !important 覆盖整改

| # | 状态 | 问题 | 文件 |
|---|------|------|------|
| 29 | ⬜ | DS `Button` 补充 `variant="danger"` 扩展点，替换 admin CSS 的 `!important` 覆盖 | `button.tsx` + admin CSS 文件 |
| 30 | ⬜ | admin dark 选择器 `.dark html, .dark body` 错误写法改为 `html.dark, body.dark` | `portals/admin/src/styles/admin-base-document.css:10-12` |

---

## P2 — Server Component 优化

| # | 状态 | 问题 | 文件 |
|---|------|------|------|
| 31 | ⬜ | website 落地页 `page.tsx` 去掉 `'use client'`，交互逻辑下移到子组件 | `portals/website/src/app/[locale]/(marketing)/(main)/page.tsx` |
| 32 | ⬜ | admin 首页 `page.tsx` 改为 Server Component，数据获取移入 RSC | `portals/admin/src/app/(admin)/page.tsx` |

---

## P3 — 共享组件提取（架构级，需独立分支）

| # | 状态 | 问题 | 文件 |
|---|------|------|------|
| 33 | ⏭ | `ActionButton` 从 console/admin 双份维护提取到共享包 | `portals/console` + `portals/admin` |
| 34 | ⏭ | `EmptyState` 同上 | `portals/console` + `portals/admin` |
| 35 | ⏭ | admin `ThemeProvider` 委托给 `ConsoleAppProviders` 的多余 Client 层重构 | `portals/admin/src/providers/ConsoleAppProviders.tsx` |
| 36 | ⏭ | `density`/`theme` 共享 context 拆分为独立 context，避免密度变化触发全量重渲染 | `packages/design/design-system/src/theme/ThemeProvider.tsx` |
| 37 | ⏭ | `DensityProvider` Consumer+Provider 反模式重构 | `src/theme/ThemeProvider.tsx:107-116` |
| 38 | ⏭ | DS `Button` 补充 `variant="danger"` 后，DS `console-base.css:11-12` 的错误 dark 选择器同步修复 | DS styles |

---

> P3 标记为 ⏭ 的条目需要独立分支和更大范围回归测试，本次整改不纳入。
