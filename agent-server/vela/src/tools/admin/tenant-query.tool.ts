/**
 * tenant-query.tool.ts - 租户查询工具（admin surface）
 * @package vela-server
 * @layer Application
 * @category Tool
 *
 * @description
 *   tenant_search：按名称/ID 搜索租户，数据来自 @vxture/service-organization tenantService。
 *   tenant_detail：查询指定租户的上下文详情。
 *   两个工具共享本文件，均限 admin surface / global dataScope / 只读。
 *
 * @author AI-Generated
 * @date 2026-05-02
 */

import { tenantService } from "@vxture/service-organization";
import type { VelaTool } from "../tool.types";

// ============================================================================
// tenant_search
// ============================================================================

export const tenantSearchTool: VelaTool = {
  id: "tenant_search",
  name: "搜索租户",
  description:
    "根据租户名称或 ID 搜索平台租户，返回基本信息与订阅状态概览。关键词大小写不敏感，同时匹配名称、租户码、租户 ID。",
  surfaces: ["admin"],
  dataScope: "global",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "搜索关键词（租户名称、租户码或租户 ID）",
      },
      limit: {
        type: "number",
        default: 10,
        description: "最多返回条数，最大 50",
      },
    },
    required: ["query"],
  },
  async execute(input, _ctx) {
    const { query, limit = 10 } = input as { query: string; limit?: number };
    const results = await tenantService.searchTenants(query, limit);
    return { success: true, data: results, displayHint: "table" };
  },
};

// ============================================================================
// tenant_detail
// ============================================================================

export const tenantDetailTool: VelaTool = {
  id: "tenant_detail",
  name: "租户详情",
  description:
    "按租户 ID 查询租户上下文详情，包含租户类型、状态、域名、工作区等信息。",
  surfaces: ["admin"],
  dataScope: "global",
  inputSchema: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
    },
    required: ["tenantId"],
  },
  async execute(input, _ctx) {
    const { tenantId } = input as { tenantId: string };
    const tenant = await tenantService.getTenantById(tenantId);
    if (!tenant) {
      return { success: false, error: `租户 ${tenantId} 不存在` };
    }
    return { success: true, data: tenant, displayHint: "card" };
  },
};
