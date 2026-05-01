/**
 * vela.types.ts - Vela 前端核心类型定义
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Types
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

// ============================================================================
// Surface
// ============================================================================

export type VelaSurface = 'admin' | 'console';

// ============================================================================
// 消息
// ============================================================================

export type VelaMessageRole = 'user' | 'assistant' | 'tool';

export interface VelaTextMessage {
  id:      string;
  role:    'user' | 'assistant';
  content: string;
}

export interface VelaToolMessage {
  id:           string;
  role:         'tool';
  toolId:       string;
  data:         unknown;
  displayHint?: 'table' | 'list' | 'text' | 'card';
}

export type VelaMessage = VelaTextMessage | VelaToolMessage;

// ============================================================================
// SSE 流事件（与 agent-server/vela 定义对应）
// ============================================================================

export type ChatStreamEvent =
  | { type: 'text';             delta: string }
  | { type: 'tool_call';        toolId: string; status: 'running' }
  | { type: 'tool_result';      toolId: string; data: unknown; displayHint?: string }
  | { type: 'confirm_required'; auditId: string; toolId: string; summary: string }
  | { type: 'done';             sessionId: string }
  | { type: 'error';            message: string };

// ============================================================================
// 确认接口
// ============================================================================

export interface VelaConfirmRequest {
  auditId:   string;
  confirmed: boolean;
}

/** store 中挂起的确认任务，来自 confirm_required 事件 */
export interface VelaConfirmPending {
  auditId: string;
  toolId:  string;
  summary: string;
}
