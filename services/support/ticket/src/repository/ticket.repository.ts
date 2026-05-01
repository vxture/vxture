/**
 * ticket.repository.ts - 工单数据访问层
 * @package @vxture/service-ticket
 *
 * Description: 提供工单数据的存储和查询操作
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category Repository
 */

import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketQueryParams, TicketStats } from '../types/ticket.types';
import { TicketStatus, TicketPriority } from '../types/ticket.types';

// 模拟数据存储
const mockTickets: Ticket[] = [
  {
    id: '1',
    tenantId: 'tenant_demo',
    title: '登录页面无法加载',
    description: '用户反馈登录页面无法正常加载，显示白屏',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    reporterId: 'user123',
    category: 'frontend',
    tags: ['bug', 'login'],
    createdAt: new Date('2026-03-05'),
    updatedAt: new Date('2026-03-05'),
    dueDate: new Date('2026-03-08')
  },
  {
    id: '2',
    tenantId: 'tenant_demo',
    title: 'API响应超时',
    description: '用户查询接口响应时间超过5秒',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.CRITICAL,
    assigneeId: 'dev456',
    reporterId: 'user789',
    category: 'backend',
    tags: ['performance', 'api'],
    createdAt: new Date('2026-03-06'),
    updatedAt: new Date('2026-03-06'),
    dueDate: new Date('2026-03-07')
  }
];

// 工单仓库类
export class TicketRepository {
  private tickets: Ticket[];

  constructor() {
    this.tickets = [...mockTickets];
  }

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      tenantId: input.tenantId ?? 'platform',
      title: input.title,
      description: input.description,
      status: TicketStatus.OPEN,
      priority: input.priority || TicketPriority.MEDIUM,
      assigneeId: input.assigneeId,
      reporterId: input.reporterId ?? 'current-user',
      category: input.category,
      tags: input.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: input.dueDate
    };

    this.tickets.push(newTicket);
    return newTicket;
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    return this.tickets.find(ticket => ticket.id === id) || null;
  }

  async getTickets(params: TicketQueryParams = {}): Promise<Ticket[]> {
    let results = [...this.tickets];

    if (params.tenantId) {
      results = results.filter(ticket => ticket.tenantId === params.tenantId);
    }

    if (params.status) {
      results = results.filter(ticket => ticket.status === params.status);
    }

    if (params.priority) {
      results = results.filter(ticket => ticket.priority === params.priority);
    }

    if (params.assigneeId) {
      results = results.filter(ticket => ticket.assigneeId === params.assigneeId);
    }

    if (params.reporterId) {
      results = results.filter(ticket => ticket.reporterId === params.reporterId);
    }

    if (params.category) {
      results = results.filter(ticket => ticket.category === params.category);
    }

    if (params.tags && params.tags.length > 0) {
      results = results.filter(ticket =>
        params.tags!.some(tag => ticket.tags.includes(tag))
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return results.slice(startIndex, endIndex);
  }

  async updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket | null> {
    const index = this.tickets.findIndex(ticket => ticket.id === id);

    if (index === -1) {
      return null;
    }

    const ticket = this.tickets[index]!;
    this.tickets[index] = {
      ...ticket,
      ...input,
      updatedAt: new Date()
    };

    return this.tickets[index] ?? null;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const index = this.tickets.findIndex(ticket => ticket.id === id);

    if (index === -1) {
      return false;
    }

    this.tickets.splice(index, 1);
    return true;
  }

  async getTicketStats(): Promise<TicketStats> {
    const stats = {
      total: this.tickets.length,
      open: this.tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: this.tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: this.tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
      closed: this.tickets.filter(t => t.status === TicketStatus.CLOSED).length,
      byPriority: {
        [TicketPriority.LOW]: 0,
        [TicketPriority.MEDIUM]: 0,
        [TicketPriority.HIGH]: 0,
        [TicketPriority.URGENT]: 0,
        [TicketPriority.CRITICAL]: 0
      },
      byCategory: {} as { [category: string]: number }
    };

    this.tickets.forEach(ticket => {
      stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] ?? 0) + 1;
    });

    this.tickets.forEach(ticket => {
      stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] ?? 0) + 1;
    });

    return stats;
  }
}

export const ticketRepository = new TicketRepository();
