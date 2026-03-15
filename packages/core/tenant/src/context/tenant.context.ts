/**
 * tenant.context.ts - 租户上下文存取工具
 * @package @vxture/core-tenant
 * @description
 *   提供请求作用域的租户上下文存取能力
 *
 * @author AI-Generated
 * @date 2026-03-15
 */

import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import type { TenantInfo, TenantRequest } from '../types';

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  private readonly _tenant: TenantInfo | undefined;

  constructor(@Inject(REQUEST) request: Request & TenantRequest) {
    this._tenant = request.tenant;
    // request 只在构造时用一次，不需要存为 private
  }

  get id(): string {
    if (!this._tenant) {
      throw new Error(
        '[TenantContext] tenantId not available. ' +
        'Ensure TenantMiddleware runs before TenantContext is accessed.',
      );
    }
    return this._tenant.id;
  }

  get info(): TenantInfo | undefined {
    return this._tenant;
  }

  get isResolved(): boolean {
    return this._tenant !== undefined;
  }
}
