/**
 * index.ts - 工单管理服务入口
 * @package @vxture/service-ticket
 *
 * Description: 提供工单创建、查询、更新、删除等基础功能
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @layer Services
 * @category Business Services
 */

import type { Ticket, TicketStatus, TicketPriority, CreateTicketInput, UpdateTicketInput } from './types';
import { ticketRepository } from './repository';
import { ticketService } from './services';

// 导出类型
export type {
  Ticket,
  TicketStatus,
  TicketPriority,
  CreateTicketInput,
  UpdateTicketInput
};

// 导出服务
export {
  ticketRepository,
  ticketService
};

// 默认导出
export default {
  ticketRepository,
  ticketService
};