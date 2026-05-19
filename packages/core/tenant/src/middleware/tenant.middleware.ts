/**
 * tenant.middleware.ts - 租户解析中间件
 * @package @vxture/core-tenant
 * @description
 *   从请求中解析租户信息并写入两个上下文：
 *   1. request.tenant — 供 NestJS DI (TenantContext) 使用
 *   2. TenantAlsService — 供 Prisma 钩子、EventEmitter、队列 Worker 等非 DI 代码使用
 *
 * @author AI-Generated
 * @date 2026-03-15
 */

import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

import { resolveTenantId } from "../utils/tenant.utils";
import { TENANT_OPTIONS } from "../context/tenant.module";
import { TenantAlsService } from "../context/tenant-als.service";
import type {
  TenantResolveOptions,
  TenantRequest,
} from "../types/tenant.types";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @Inject(TENANT_OPTIONS) private readonly options: TenantResolveOptions,
    private readonly tenantAls: TenantAlsService,
  ) {}

  use(req: Request & TenantRequest, _res: Response, next: NextFunction): void {
    try {
      req.tenant = resolveTenantId(req as TenantRequest, this.options);
    } catch {
      // 解析失败时不阻断请求，由后续 Guard 或 router 处理缺失的 tenant
    }

    if (req.tenant) {
      // Wrap the rest of the request pipeline in ALS so non-DI code can read tenant
      this.tenantAls.run(req.tenant, () => next());
    } else {
      next();
    }
  }
}
