/**
 * tool.types.ts - Vela 工具接口定义
 * @package vela-server
 * @layer Application
 * @category Types
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import type {
  CallerContext,
  VelaSurface,
} from "../context/caller-context.types";

export interface VelaTool {
  /** 工具唯一 ID，对应 LLM function name */
  id: string;
  /** 工具显示名称（用于日志和审计） */
  name: string;
  /** 提供给 LLM 的工具描述 */
  description: string;
  /** 允许调用的 surface 白名单 */
  surfaces: VelaSurface[];
  /** 数据范围要求 */
  dataScope: "global" | "tenant";
  /** JSON Schema（用于 LLM function calling parameters 字段） */
  inputSchema: Record<string, unknown>;
  /**
   * 二期执行类工具设为 true。
   * true → ToolRegistry 执行前发送 confirm_required 事件，等待用户确认；完成后写入 VelaAuditLog。
   * false / undefined → 只读工具，直接执行，不写审计。
   */
  requiresConfirmation?: boolean;
  /** 生成确认弹窗摘要文案，requiresConfirmation=true 时必须提供 */
  confirmSummary?: (input: unknown) => string;
  /** 工具执行函数 */
  execute: (input: unknown, ctx: CallerContext) => Promise<VelaToolResult>;
}

export interface VelaToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  /** 前端渲染提示 */
  displayHint?: "table" | "list" | "text" | "card";
  /**
   * 执行类工具（requiresConfirmation=true）写入 VelaAuditLog 后返回该字段。
   * T4 确认流程通过 auditId 关联 confirm_required 事件与审计记录。
   */
  auditId?: string;
}
