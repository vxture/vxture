/**
 * subscription.router.ts - 租户订阅管理路由
 * @package @vxture/bff-console
 * @layer Application
 * @category Router
 *
 * @author AI-Generated
 * @date 2026-05-02
 */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { MailService } from '@vxture/core-mail';
import { SubscriptionService } from '@vxture/service-subscription';
import type { Subscription } from '@vxture/service-subscription';
import type { RequestContext } from '../types/console.types';

// ============================================================================
// 订阅操作类型
// ============================================================================

type SubscriptionAction = 'upgrade' | 'pause' | 'resume' | 'cancel';

interface SubscriptionActionBody {
  subscriptionId: string;
  action: SubscriptionAction;
  /** upgrade 操作必填 */
  planId?: string;
  /** pause / cancel 操作可选 */
  reason?: string;
  /** cancel 时是否立即生效，默认 false（到期取消） */
  immediate?: boolean;
}

// ============================================================================
// Router
// ============================================================================

@Controller('api/subscription')
export class SubscriptionRouter {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly mailService: MailService,
  ) {}

  // --------------------------------------------------------------------------
  // GET /api/subscription/my — 查询当前租户的全部订阅
  // --------------------------------------------------------------------------

  @Get('my')
  async getMySubscriptions(@Req() req: Request & RequestContext): Promise<Subscription[]> {
    if (!req.tenant) throw new UnauthorizedException('租户上下文缺失');
    return this.subscriptionService.getTenantSubscriptions(req.tenant.id);
  }

  // --------------------------------------------------------------------------
  // POST /api/subscription/actions — 执行订阅变更操作
  // --------------------------------------------------------------------------

  @Post('actions')
  async executeAction(
    @Req() req: Request & RequestContext,
    @Body() body: SubscriptionActionBody,
  ): Promise<Subscription> {
    if (!req.user || !req.tenant) throw new UnauthorizedException('会话已失效');

    const { subscriptionId, action, planId, reason, immediate = false } = body ?? {};

    // ── 入参校验 ──────────────────────────────────────────────────────────
    if (!subscriptionId?.trim()) throw new BadRequestException('subscriptionId 不能为空');

    const VALID: SubscriptionAction[] = ['upgrade', 'pause', 'resume', 'cancel'];
    if (!VALID.includes(action)) throw new BadRequestException(`无效操作类型：${String(action)}`);

    if (action === 'upgrade' && !planId?.trim()) {
      throw new BadRequestException('upgrade 操作需要提供 planId');
    }

    // ── 查订阅并校验租户归属 ──────────────────────────────────────────────
    let current: Subscription;
    try {
      current = await this.subscriptionService.getSubscriptionById(subscriptionId);
    } catch {
      throw new BadRequestException('订阅不存在');
    }

    if (current.tenantId !== req.tenant.id) {
      throw new UnauthorizedException('无权操作该订阅');
    }

    // ── 执行操作 ──────────────────────────────────────────────────────────
    const changedBy = req.user.email;
    let updated!: Subscription;
    try {
      if (action === 'upgrade') {
        updated = await this.subscriptionService.upgradePlan(subscriptionId, planId!, changedBy);
      } else if (action === 'pause') {
        updated = await this.subscriptionService.pauseSubscription(subscriptionId, reason, changedBy);
      } else if (action === 'resume') {
        updated = await this.subscriptionService.resumeSubscription(subscriptionId, changedBy);
      } else {
        updated = await this.subscriptionService.cancelSubscription(subscriptionId, reason, immediate, changedBy);
      }
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : '订阅操作失败');
    }

    // ── 发送确认邮件（失败不阻断主流程）─────────────────────────────────
    void this.mailService
      .send(buildActionEmail(req.user.email, action, updated))
      .catch(() => {});

    return updated;
  }
}

// ============================================================================
// 内部：构建操作确认邮件
// ============================================================================

const ACTION_LABELS: Record<SubscriptionAction, string> = {
  upgrade: '套餐升级',
  pause:   '订阅暂停',
  resume:  '订阅恢复',
  cancel:  '订阅取消',
};

function buildActionEmail(to: string, action: SubscriptionAction, sub: Subscription) {
  const label = ACTION_LABELS[action];
  const subject = `[Vxture] 您的${label}操作已完成`;
  const html = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
  <h2 style="margin-bottom:8px">${label}成功</h2>
  <p style="color:#555">您好，您的订阅操作已处理完成，详情如下：</p>
  <table style="border-collapse:collapse;width:100%;margin:16px 0">
    <tr style="background:#f5f5f5">
      <td style="padding:10px 12px;color:#888;width:120px">订阅 ID</td>
      <td style="padding:10px 12px">${sub.id}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;color:#888">套餐名称</td>
      <td style="padding:10px 12px">${sub.planName}</td>
    </tr>
    <tr style="background:#f5f5f5">
      <td style="padding:10px 12px;color:#888">当前状态</td>
      <td style="padding:10px 12px">${sub.status}</td>
    </tr>
  </table>
  <p style="color:#aaa;font-size:12px;margin-top:24px">
    如有疑问，请联系 Vxture 支持团队。<br>
    此邮件由系统自动发送，请勿回复。
  </p>
</div>`;

  return { to, subject, html };
}
