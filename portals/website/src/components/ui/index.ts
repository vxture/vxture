/**
 * UI 组件统一导出
 * @package @vxture/website
 * @layer Presentation
 * @category Components - UI
 */

export { default as LocaleSwitcher } from './LocaleSwitcher';
export { default as ThemeSwitcher } from './ThemeSwitcher';
export { default as PriceDisplay } from './PriceDisplay';
export type { PriceDisplayProps } from './PriceDisplay';

// 通知和主题组件
export { default as Notifications } from './Notifications';
export { default as ThemeSync } from './ThemeSync';
export { default as ThemeToggleButton } from './ThemeToggleButton';

// 滚动组件
export { default as ScrollToButton } from './ScrollToButton';

// Panels 调试组件
export { default as SnapChoicePanel } from './panels/SnapChoicePanel';
export { default as SnapDebugPanel } from './panels/SnapDebugPanel';
export type { SnapChoicePanelProps } from './panels/SnapChoicePanel';
export type { SnapDebugPanelProps, SnapDebugInfo, PanelPosition } from './panels/SnapDebugPanel';
