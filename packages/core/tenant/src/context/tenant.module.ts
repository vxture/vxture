/**
 * tenant.module.ts - NestJS 模块定义
 * @package @vxture/core-tenant
 * @description
 *   租户模块的 NestJS 动态模块实现
 *
 * @author AI-Generated
 * @date 2026-03-15
 */

import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";

import { TenantMiddleware } from "../middleware/tenant.middleware";
import { TenantContext } from "./tenant.context";
import type { TenantResolveOptions } from "../types/tenant.types";

export const TENANT_OPTIONS = Symbol("TENANT_OPTIONS");

@Global()
@Module({})
export class TenantModule implements NestModule {
  static register(options: TenantResolveOptions = {}): DynamicModule {
    return {
      module: TenantModule,
      providers: [
        { provide: TENANT_OPTIONS, useValue: options },
        TenantMiddleware,
        TenantContext,
      ],
      exports: [TenantContext],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes("*");
  }
}
