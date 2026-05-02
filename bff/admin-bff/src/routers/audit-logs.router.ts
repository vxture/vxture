/**
 * audit-logs.router.ts - 审计日志路由
 * @package @vxture/bff-admin
 *
 * Description: 返回平台管理员操作的审计日志列表。
 * 当前为结构占位，数据层接入后替换为真实查询。
 *
 * @author AI-Generated
 * @date 2026-05-02
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Router
 */

import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuditLogRecord, RequestContext } from '../types/console.types';

@Controller('api/audit-logs')
export class AuditLogsRouter {
  @Get()
  listAuditLogs(@Req() req: Request & RequestContext): AuditLogRecord[] {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }
    // 数据层待接入，暂返回空列表
    return [];
  }
}
