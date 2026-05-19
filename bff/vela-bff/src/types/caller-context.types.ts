/**
 * caller-context.types.ts - CallerContext 上下文隔离核心类型
 * @package @vxture/bff-vela
 * @layer Application
 * @category Types
 *
 * @description
 *   CallerContext 由 surface.middleware.ts 构造，携带到 agent-server/vela。
 *   两处定义保持一致（bff/vela-bff 与 agent-server/vela 各自独立定义，禁止跨包 import）。
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

// ============================================================================
// Surface 与用户身份类型
// ============================================================================

/** Vela 前端声明的入口面（由 X-Vela-Surface Header 携带，服务端二次校验） */
export type VelaSurface = "admin" | "console";

/** Vela 认可的用户身份类型（来自 JWT payload.userType） */
export type VelaUserType = "operator" | "tenant_user";

// ============================================================================
// CallerContext
// ============================================================================

/**
 * 调用上下文，贯穿 vela-bff → agent-server/vela 整个请求链路。
 * 由 vela-bff 的 surface.middleware.ts 在服务端构造，以 base64 JSON 编码通过
 * X-Vela-Context Header 传递给 agent-server/vela，agent-server 不信任前端输入。
 */
export interface CallerContext {
  /** 来自 X-Vela-Surface Header（服务端校验合法性） */
  surface: VelaSurface;

  /** 来自 JWT payload.sub */
  userId: string;

  /** 来自 JWT payload.userType */
  userType: VelaUserType;

  /** 用户角色：super_admin | admin | owner | member */
  role: string;

  /** 租户 ID，operator 时为 null */
  tenantId: string | null;

  /** 当前 surface + role 允许调用的工具 ID 列表（由 vela-bff 根据常量计算后注入） */
  allowedTools: readonly string[];

  /** 数据查询范围：admin surface → global；console surface → tenant */
  dataScope: "global" | "tenant";
}
