# vxture v1.3.0 — Component Wave

本包包含三件事：

1. **AI 专属组件族** (`components/ai/`)
2. **缺失基础组件** (`components/ui/`)
3. **ThemeProvider** (`theme/`)

---

## 1 · AI Component Family

5 个新组件，落到 `packages/design/design-system/src/components/ai/`：

- `ModelBadge.tsx` — 模型身份徽章 (variants: default / flagship)
- `GenerationStream.tsx` — 流式生成展示（spark + cursor）
- `PromptInput.tsx` — AI 输入框（@mention / attach / commands）
- `AIAssistantBubble.tsx` — 对话气泡（user / ai）
- `TokenCounter.tsx` — 用量进度条

配套样式：`styles/components-ai.css`

---

## 2 · Missing Basics

3 个补全基础组件，落到 `packages/design/design-system/src/components/ui/`：

- `Toast.tsx` — 通知（success / error / ai 三种语义）
- `Drawer.tsx` — 侧滑面板（含 scrim + 出入动画）
- `Skeleton.tsx` — shimmer 加载占位

配套样式：`styles/components-toast-drawer-skeleton.css`

---

## 3 · ThemeProvider

完整主题运行时：

- `theme/ThemeProvider.tsx` — Context provider + localStorage 持久化 + OS 偏好监听
- `theme/useTheme.ts` — Hook
- `theme/script.ts` — SSR 防闪烁内联脚本（粘贴到 `app/layout.tsx`）

---

## 落地步骤

```bash
# 1. 解压到 packages/design/design-system/src/ 对应路径
unzip vxture-v1.3.0-components.zip -d packages/design/design-system/src/

# 2. 更新公共导出
#    src/index.ts 中追加 AI 组件 + Toast / Drawer / Skeleton + ThemeProvider 导出

# 3. 样式入口聚合
#    src/styles/components.css 追加 @import './components-ai.css'
#                                     @import './components-toast-drawer-skeleton.css'

# 4. 在应用 app/layout.tsx 包裹 ThemeProvider
#    并在 <head> 内联 SSR 防闪烁脚本

# 5. 运行验收
pnpm lint:design
pnpm --filter @vxture/design-system lint
pnpm --filter @vxture/design-system type-check
pnpm --filter @vxture/design-system build
```

## 公共入口示例

```tsx
import {
  // AI family
  ModelBadge, GenerationStream, PromptInput, AIAssistantBubble, TokenCounter,
  // Basics
  Toast, ToastProvider, useToast,
  Drawer,
  Skeleton,
  // Theme
  ThemeProvider, useTheme,
} from '@vxture/design-system';
```
