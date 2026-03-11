/**
 * ticket.module.ts - 工单管理 NestJS 模块定义
 * @package @vxture/service-ticket
 *
 * Description: NestJS 模块定义，注册和导出服务
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Module
 */

import { Module } from '@nestjs/common';
import { TicketService } from '../service/ticket.service';
import { TicketRepository } from '../repository/ticket.repository';

@Module({
  providers: [TicketService, TicketRepository],
  exports: [TicketService]
})
export class TicketModule {}
