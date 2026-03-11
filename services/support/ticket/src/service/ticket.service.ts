/**
 * ticket.service.ts - 工单管理业务逻辑层
 * @package @vxture/service-ticket
 *
 * Description: 实现工单管理的核心业务逻辑
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Service
 */

import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketQueryParams, TicketStats } from '../types/ticket.types';
import { TicketStatus, TicketPriority } from '../types/ticket.types';
import { ticketRepository } from '../repository/ticket.repository';

export class TicketService {
  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('工单标题不能为空');
    }

    if (!input.description || input.description.trim().length === 0) {
      throw new Error('工单描述不能为空');
    }

    if (input.dueDate && input.dueDate < new Date()) {
      throw new Error('截止日期不能早于当前日期');
    }

    const ticket = await ticketRepository.createTicket(input);
    return ticket;
  }

  async getTicketById(id: string): Promise<Ticket> {
    if (!id || id.trim().length === 0) {
      throw new Error('工单ID不能为空');
    }

    const ticket = await ticketRepository.getTicketById(id);

    if (!ticket) {
      throw new Error('工单不存在');
    }

    return ticket;
  }

  async getTickets(params: TicketQueryParams = {}): Promise<Ticket[]> {
    if (params.page && params.page <= 0) {
      throw new Error('页码必须大于0');
    }

    if (params.limit && (params.limit <= 0 || params.limit > 100)) {
      throw new Error('每页数量必须在1-100之间');
    }

    const tickets = await ticketRepository.getTickets(params);
    return tickets;
  }

  async updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('工单ID不能为空');
    }

    const existingTicket = await ticketRepository.getTicketById(id);

    if (!existingTicket) {
      throw new Error('工单不存在');
    }

    if (input.dueDate && input.dueDate < new Date()) {
      throw new Error('截止日期不能早于当前日期');
    }

    if (input.status && existingTicket.status === TicketStatus.CLOSED && input.status !== TicketStatus.CLOSED) {
      throw new Error('已关闭的工单无法重新打开');
    }

    const updatedTicket = await ticketRepository.updateTicket(id, input);
    return updatedTicket;
  }

  async deleteTicket(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('工单ID不能为空');
    }

    const existingTicket = await ticketRepository.getTicketById(id);

    if (!existingTicket) {
      throw new Error('工单不存在');
    }

    if (existingTicket.status === TicketStatus.IN_PROGRESS || existingTicket.status === TicketStatus.RESOLVED) {
      throw new Error('正在处理或已解决的工单无法删除');
    }

    const success = await ticketRepository.deleteTicket(id);
    return success;
  }

  async assignTicket(id: string, assigneeId: string): Promise<Ticket> {
    if (!id || id.trim().length === 0) {
      throw new Error('工单ID不能为空');
    }

    if (!assigneeId || assigneeId.trim().length === 0) {
      throw new Error('分配人ID不能为空');
    }

    const existingTicket = await ticketRepository.getTicketById(id);

    if (!existingTicket) {
      throw new Error('工单不存在');
    }

    if (existingTicket.status === TicketStatus.CLOSED || existingTicket.status === TicketStatus.CANCELLED) {
      throw new Error('已关闭或已取消的工单无法分配');
    }

    const updatedTicket = await ticketRepository.updateTicket(id, {
      assigneeId,
      status: existingTicket.status === TicketStatus.OPEN ? TicketStatus.IN_PROGRESS : existingTicket.status
    });

    return updatedTicket!;
  }

  async startWork(id: string): Promise<Ticket> {
    const existingTicket = await this.getTicketById(id);

    if (existingTicket.status === TicketStatus.IN_PROGRESS) {
      throw new Error('工单已经在处理中');
    }

    if (existingTicket.status === TicketStatus.CLOSED || existingTicket.status === TicketStatus.CANCELLED) {
      throw new Error('已关闭或已取消的工单无法开始处理');
    }

    const updatedTicket = await ticketRepository.updateTicket(id, {
      status: TicketStatus.IN_PROGRESS
    });

    return updatedTicket!;
  }

  async resolveTicket(id: string, resolution?: string): Promise<Ticket> {
    const existingTicket = await this.getTicketById(id);

    if (existingTicket.status === TicketStatus.CLOSED || existingTicket.status === TicketStatus.CANCELLED) {
      throw new Error('已关闭或已取消的工单无法标记为已解决');
    }

    const updatedTicket = await ticketRepository.updateTicket(id, {
      status: TicketStatus.RESOLVED,
      resolution,
      resolutionDate: new Date()
    });

    return updatedTicket!;
  }

  async closeTicket(id: string): Promise<Ticket> {
    const existingTicket = await this.getTicketById(id);

    if (existingTicket.status === TicketStatus.CLOSED || existingTicket.status === TicketStatus.CANCELLED) {
      throw new Error('工单已经是关闭状态');
    }

    let updateData: UpdateTicketInput = {
      status: TicketStatus.CLOSED
    };

    if (existingTicket.status === TicketStatus.OPEN || existingTicket.status === TicketStatus.IN_PROGRESS) {
      updateData.resolution = '工单已关闭';
      updateData.resolutionDate = new Date();
    }

    const updatedTicket = await ticketRepository.updateTicket(id, updateData);
    return updatedTicket!;
  }

  async cancelTicket(id: string): Promise<Ticket> {
    const existingTicket = await this.getTicketById(id);

    if (existingTicket.status === TicketStatus.CLOSED || existingTicket.status === TicketStatus.CANCELLED) {
      throw new Error('工单已经是关闭或取消状态');
    }

    if (existingTicket.status === TicketStatus.RESOLVED) {
      throw new Error('已解决的工单无法取消');
    }

    const updatedTicket = await ticketRepository.updateTicket(id, {
      status: TicketStatus.CANCELLED
    });

    return updatedTicket!;
  }

  async getTicketStats(): Promise<TicketStats> {
    const stats = await ticketRepository.getTicketStats();
    return stats;
  }
}

export const ticketService = new TicketService();
