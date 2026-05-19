/**
 * index.ts - @vxture/agent-studio-vela 公共导出入口
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Index
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

// ============================================================================
// 主入口组件（宿主 portal 通过 dynamic import 使用）
// ============================================================================

export { VelaChat } from "./components/VelaChat";
export type { VelaChatProps } from "./components/VelaChat";

// ============================================================================
// 类型（供宿主 portal 类型检查）
// ============================================================================

export type {
  VelaSurface,
  VelaMessage,
  ChatStreamEvent,
} from "./types/vela.types";
