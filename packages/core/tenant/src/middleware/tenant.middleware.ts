/**
 * tenant.middleware.ts - 租户解析中间件
 * @package @vxture/core-tenant
 * @description
 *   从请求中解析租户信息的 NestJS 中间件
 */

import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { resolveTenantId } from '../utils/tenant.utils';
import { TENANT_OPTIONS } from '../context/tenant.module';
import type { TenantResolveOptions, TenantRequest } from '../types/tenant.types';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @Inject(TENANT_OPTIONS) private readonly options: TenantResolveOptions,
  ) {}

  use(req: Request & TenantRequest, _res: Response, next: NextFunction): void {
    try {
      req.tenant = resolveTenantId(req as TenantRequest, this.options);
    } catch {
      // 解析失败时不阻断请求，由后续 Guard 或 router 处理缺失的 tenant
      // 如果业务上必须有 tenant，在 Guard 里检查 request.tenant 是否存在
    }

    next();
  }
}
