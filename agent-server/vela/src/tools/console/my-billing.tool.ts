/**
 * my-billing.tool.ts - 当前租户账单查询（console surface）
 * @package vela-server
 * @layer Application
 * @category Tool
 *
 * @description
 *   tenantId 强制来自 CallerContext，前端无法篡改（spec §11.3）。
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import { billingService } from '@vxture/service-billing';
import type { VelaTool } from '../tool.types';

export const myBillingTool: VelaTool = {
  id:          'my_billing',
  name:        '我的账单',
  description: '查询当前租户的近期发票和账单记录',
  surfaces:    ['console'],
  dataScope:   'tenant',
  inputSchema: {
    type: 'object',
    properties: {
      limit: { type: 'number', default: 5, description: '返回最近 N 张发票，最大 20' },
    },
  },
  async execute(input, ctx) {
    const { limit = 5 } = input as { limit?: number };
    const invoices = await billingService.queryInvoices({
      tenantId: ctx.tenantId!,
      limit: Math.min(limit, 20),
    });
    return { success: true, data: invoices, displayHint: 'table' };
  },
};
