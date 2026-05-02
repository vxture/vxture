/**
 * announcements.router.ts - 通知公告路由
 * @package @vxture/bff-admin
 *
 * Description: 平台公告的增删改查接口。
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
import type { AnnouncementRecord, RequestContext } from '../types/console.types';

@Controller('api/announcements')
export class AnnouncementsRouter {
  @Get()
  listAnnouncements(@Req() req: Request & RequestContext): AnnouncementRecord[] {
    if (!req.user) {
      throw new UnauthorizedException('No active session');
    }
    // 数据层待接入，暂返回空列表
    return [];
  }
}
