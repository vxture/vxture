/**
 * ticket.types.ts - 工单管理领域类型定义
 * @package @vxture/service-ticket
 *
 * Description: 包含工单管理相关的所有类型定义
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Types
 */

// ============================================================================
// Enums
// ============================================================================

// 工单状态
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

// 工单优先级
export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

// ============================================================================
// Domain Types
// ============================================================================

// 工单基本信息类型
export interface Ticket {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  reporterId: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  resolution?: string;
  resolutionDate?: Date;
}

// ============================================================================
// Query Params
// ============================================================================

// 工单查询参数类型
export interface TicketQueryParams {
  tenantId?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  reporterId?: string;
  category?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTicketInput {
  tenantId?: string;
  title: string;
  description: string;
  priority?: TicketPriority;
  assigneeId?: string;
  reporterId?: string;
  category: string;
  tags?: string[];
  dueDate?: Date;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  category?: string;
  tags?: string[];
  dueDate?: Date;
  resolution?: string;
  resolutionDate?: Date;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byPriority: { [key in TicketPriority]: number };
  byCategory: { [category: string]: number };
}
