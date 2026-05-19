/**
 * tenant-als.service.ts - AsyncLocalStorage 租户上下文传播
 * @package @vxture/core-tenant
 * @description
 *   基于 Node.js AsyncLocalStorage 的租户上下文，覆盖 NestJS DI 无法触达的场景：
 *   Prisma 中间件、EventEmitter 回调、BullMQ Worker、setTimeout/setInterval 内部。
 *
 *   由 TenantMiddleware 在每个请求入口调用 run()；业务代码通过 get() / getOrThrow() 读取。
 */

import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";
import type { TenantInfo } from "../types";

@Injectable()
export class TenantAlsService {
  private readonly als = new AsyncLocalStorage<TenantInfo>();

  /** 在指定租户上下文中执行同步或异步函数 */
  run<T>(tenant: TenantInfo, fn: () => T): T {
    return this.als.run(tenant, fn);
  }

  /** 返回当前 ALS 上下文中的租户，未设置时返回 undefined */
  get(): TenantInfo | undefined {
    return this.als.getStore();
  }

  /** 返回当前 ALS 上下文中的租户，未设置时抛出异常 */
  getOrThrow(): TenantInfo {
    const tenant = this.als.getStore();
    if (!tenant) {
      throw new Error(
        "[TenantAlsService] No tenant in AsyncLocalStorage context. " +
          "Ensure TenantModule is registered and TenantMiddleware runs before this call.",
      );
    }
    return tenant;
  }
}
