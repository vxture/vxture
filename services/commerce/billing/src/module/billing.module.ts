/**
 * billing.module.ts - 计费管理 NestJS 模块定义
 * @package @vxture/service-billing
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
import { BillingService } from '../service/billing.service';
import { BillingRepository } from '../repository/billing.repository';

@Module({
  providers: [BillingService, BillingRepository],
  exports: [BillingService]
})
export class BillingModule {}
