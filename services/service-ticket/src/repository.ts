/**
 * repository.ts - 工单管理服务数据访问层
 * @package @vxture/service-ticket
 *
 * Description: 提供工单数据的存储和查询操作
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @layer Services
 * @category Business Services
 */

import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketQueryParams } from './types';
import { TicketStatus, TicketPriority } from './types';

// 模拟数据存储
const mockTickets: Ticket[] = [
  {
    id: '1',
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

  // 创建工单
  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      title: input.title,
      description: input.description,
      status: TicketStatus.OPEN,
      priority: input.priority || TicketPriority.MEDIUM,
      assigneeId: input.assigneeId,
      reporterId: 'current-user', // 待实现：从上下文中获取
      category: input.category,
      tags: input.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: input.dueDate
    };

    this.tickets.push(newTicket);
    return newTicket;
  }

  // 获取工单详情
  async getTicketById(id: string): Promise<Ticket | null> {
    return this.tickets.find(ticket => ticket.id === id) || null;
  }

  // 查询工单列表
  async getTickets(params: TicketQueryParams = {}): Promise<Ticket[]> {
    let results = [...this.tickets];

    // 按状态筛选
    if (params.status) {
      results = results.filter(ticket => ticket.status === params.status);
    }

    // 按优先级筛选
    if (params.priority) {
      results = results.filter(ticket => ticket.priority === params.priority);
    }

    // 按分配人筛选
    if (params.assigneeId) {
      results = results.filter(ticket => ticket.assigneeId === params.assigneeId);
    }

    // 按报告人筛选
    if (params.reporterId) {
      results = results.filter(ticket => ticket.reporterId === params.reporterId);
    }

    // 按分类筛选
    if (params.category) {
      results = results.filter(ticket => ticket.category === params.category);
    }

    // 按标签筛选
    if (params.tags && params.tags.length > 0) {
      results = results.filter(ticket =>
        params.tags!.some(tag => ticket.tags.includes(tag))
      );
    }

    // 分页
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return results.slice(startIndex, endIndex);
  }

  // 更新工单
  async updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket | null> {
    const index = this.tickets.findIndex(ticket => ticket.id === id);

    if (index === -1) {
      return null;
    }

    this.tickets[index] = {
      ...this.tickets[index],
      ...input,
      updatedAt: new Date()
    };

    return this.tickets[index];
  }

  // 删除工单
  async deleteTicket(id: string): Promise<boolean> {
    const index = this.tickets.findIndex(ticket => ticket.id === id);

    if (index === -1) {
      return false;
    }

    this.tickets.splice(index, 1);
    return true;
  }

  // 获取工单统计数据
  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byPriority: { [key in TicketPriority]: number };
    byCategory: { [category: string]: number };
  }> {
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
        [TicketPriority.CRITICAL]: 0
      },
      byCategory: {} as { [category: string]: number }
    };

    // 按优先级统计
    this.tickets.forEach(ticket => {
      stats.byPriority[ticket.priority]++;
    });

    // 按分类统计
    this.tickets.forEach(ticket => {
      if (!stats.byCategory[ticket.category]) {
        stats.byCategory[ticket.category] = 0;
      }
      stats.byCategory[ticket.category]++;
    });

    return stats;
  }
}

// 导出单例实例
export const ticketRepository = new TicketRepository();