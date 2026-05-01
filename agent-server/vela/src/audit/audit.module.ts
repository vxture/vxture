/**
 * audit.module.ts - 审计日志模块
 * @package vela-server
 * @layer Application
 * @category Module
 *
 * @description
 *   @Global() 使 AuditRepository 在整个 vela-server 中可直接注入，
 *   无需在各业务模块中重复 import AuditModule。
 *
 * @author AI-Generated
 * @date 2026-05-01
 */

import { Global, Module } from '@nestjs/common';
import { AuditRepository } from './audit.repository';

@Global()
@Module({
  providers: [AuditRepository],
  exports:   [AuditRepository],
})
export class AuditModule {}
