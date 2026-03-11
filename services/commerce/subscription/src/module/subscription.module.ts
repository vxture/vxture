/**
 * subscription.module.ts - 订阅管理 NestJS 模块定义
 * @package @vxture/service-subscription
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
import { SubscriptionService } from '../service/subscription.service';
import { PlanRepository } from '../repository/plan.repository';
import { SubscriptionRepository } from '../repository/subscription.repository';

@Module({
  providers: [SubscriptionService, PlanRepository, SubscriptionRepository],
  exports: [SubscriptionService]
})
export class SubscriptionModule {}
