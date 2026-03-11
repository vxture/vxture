/**
 * index.ts - 工单管理服务入口
 * @package @vxture/service-ticket
 *
 * Description: 提供工单创建、查询、更新、删除等基础功能
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Service
 */

// ============================================================================
// Module Exports
// ============================================================================

export { TicketModule } from './module/ticket.module';

// ============================================================================
// Service Exports
// ============================================================================

export { TicketService } from './service/ticket.service';
export { ticketService } from './service/ticket.service';

// ============================================================================
// Types Exports
// ============================================================================

export type {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketQueryParams,
  TicketStats
} from './types/ticket.types';

// ============================================================================
// DTO Exports
// ============================================================================

export { CreateTicketInput } from './dto/create-ticket.dto';
export { UpdateTicketInput } from './dto/update-ticket.dto';
