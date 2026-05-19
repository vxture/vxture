/* ─────────────────────────────────────────────────────────────────
   Append to packages/design/design-system/src/index.ts
   ───────────────────────────────────────────────────────────────── */

// AI component family (new — components/ai/)
export {
  ModelBadge,
  GenerationStream,
  PromptInput,
  AIAssistantBubble,
  TokenCounter,
} from "./components/ai";
export type {
  ModelBadgeProps,
  GenerationStreamProps,
  PromptInputProps,
  PromptInputChip,
  AIAssistantBubbleProps,
  TokenCounterProps,
} from "./components/ai";

// New basic UI components (components/ui/)
export { ToastProvider, useToast, Drawer, Skeleton } from "./components/ui";
export type {
  ToastTone,
  ToastInput,
  DrawerProps,
  SkeletonProps,
} from "./components/ui";

// Theme (existing — extend re-exports)
export { ThemeProvider, useTheme, themeBootstrapScript } from "./theme";
export type { Theme, ThemeMode, ThemeProviderProps } from "./theme";
