/**
 * tools.module.ts - 工具注册模块
 * @package vela-server
 * @layer Application
 * @category Module
 *
 * @description
 *   @Global() 使 ToolRegistry 在整个 vela-server 中可直接注入，
 *   ChatModule 和 ConfirmModule 无需互相导入即可使用同一个 ToolRegistry 实例。
 *
 * @author AI-Generated
 * @date 2026-05-01
 */

import { Global, Module } from '@nestjs/common';
import { AuditRepository } from '../audit/audit.repository';
import { ToolRegistry } from './tool-registry';

// ============================================================================
// 工具导入（一期只读工具 + 二期执行类工具在此集中注册）
// ============================================================================

import { tenantSearchTool, tenantDetailTool }                                                from './admin/tenant-query.tool';
import { billingOverviewTool }                                                                from './admin/billing-query.tool';
import { subscriptionListTool }                                                               from './admin/subscription-query.tool';
import { ticketListTool }                                                                     from './admin/ticket-query.tool';
import { tenantPauseSubscriptionTool, tenantResumeSubscriptionTool, tenantChangePlanTool }   from './admin/tenant-execute.tool';
import { mySubscriptionTool }                                                                 from './console/my-subscription.tool';
import { myBillingTool }                                                                      from './console/my-billing.tool';
import { myUsageTool }                                                                        from './console/my-usage.tool';
import { myTicketsTool }                                                                      from './console/my-tickets.tool';
import { myChangePlanTool }                                                                   from './console/subscription-execute.tool';

const ALL_TOOLS = [
  // admin — 只读工具（一期）
  tenantSearchTool,
  tenantDetailTool,
  billingOverviewTool,
  subscriptionListTool,
  ticketListTool,
  // admin — 执行类工具（二期）
  tenantPauseSubscriptionTool,
  tenantResumeSubscriptionTool,
  tenantChangePlanTool,
  // console — 只读工具（一期）
  mySubscriptionTool,
  myBillingTool,
  myUsageTool,
  myTicketsTool,
  // console — 执行类工具（二期）
  myChangePlanTool,
];

@Global()
@Module({
  providers: [
    {
      provide:    ToolRegistry,
      useFactory: (audit: AuditRepository) => {
        const registry = new ToolRegistry(audit);
        for (const tool of ALL_TOOLS) {
          registry.register(tool);
        }
        return registry;
      },
      inject: [AuditRepository],
    },
  ],
  exports: [ToolRegistry],
})
export class ToolsModule {}
