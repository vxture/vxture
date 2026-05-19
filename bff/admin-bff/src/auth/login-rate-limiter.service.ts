/**
 * login-rate-limiter.service.ts - 登录请求限速服务
 * @package @vxture/bff-admin
 *
 * Description: 基于固定窗口计数器实现 IP + 账号双维度限速，防止暴力破解。
 * 进程内存存储，重启后计数器清零（适合单实例部署场景）。
 *
 * @author AI-Generated
 * @date 2026-05-02
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Service
 */

import { Injectable } from "@nestjs/common";

// ─── 配置常量 ─────────────────────────────────────────────────────────────────

const WINDOW_MS = 15 * 60 * 1000; // 固定窗口：15 分钟
const IP_LIMIT = 10; // IP 维度：15 分钟内最多 10 次失败
const ACCOUNT_LIMIT = 5; // 账号维度：15 分钟内最多 5 次失败

// ─── 类型 ─────────────────────────────────────────────────────────────────────

interface Bucket {
  attempts: number;
  windowStart: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // 秒，仅在 allowed=false 时有值
}

// ─── 服务 ─────────────────────────────────────────────────────────────────────

@Injectable()
export class LoginRateLimiterService {
  private readonly ipBuckets = new Map<string, Bucket>();
  private readonly accountBuckets = new Map<string, Bucket>();

  /** 检查是否允许继续尝试登录。调用不修改计数器。 */
  check(ip: string, account: string): RateLimitResult {
    const now = Date.now();
    const ipResult = this.checkBucket(this.ipBuckets, ip, IP_LIMIT, now);
    if (!ipResult.allowed) return ipResult;
    return this.checkBucket(
      this.accountBuckets,
      account.toLowerCase(),
      ACCOUNT_LIMIT,
      now,
    );
  }

  /** 登录失败后调用：IP + 账号计数各加一 */
  recordFailure(ip: string, account: string): void {
    const now = Date.now();
    this.increment(this.ipBuckets, ip, now);
    this.increment(this.accountBuckets, account.toLowerCase(), now);
  }

  /** 登录成功后调用：清除 IP + 账号的计数器 */
  recordSuccess(ip: string, account: string): void {
    this.ipBuckets.delete(ip);
    this.accountBuckets.delete(account.toLowerCase());
  }

  // ─── 私有方法 ──────────────────────────────────────────────────────────────

  private checkBucket(
    buckets: Map<string, Bucket>,
    key: string,
    limit: number,
    now: number,
  ): RateLimitResult {
    const bucket = buckets.get(key);
    if (!bucket) return { allowed: true };

    if (now - bucket.windowStart > WINDOW_MS) {
      buckets.delete(key);
      return { allowed: true };
    }

    if (bucket.attempts >= limit) {
      const retryAfter = Math.ceil(
        (bucket.windowStart + WINDOW_MS - now) / 1000,
      );
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  private increment(
    buckets: Map<string, Bucket>,
    key: string,
    now: number,
  ): void {
    const bucket = buckets.get(key);
    if (!bucket || now - bucket.windowStart > WINDOW_MS) {
      buckets.set(key, { attempts: 1, windowStart: now });
    } else {
      bucket.attempts += 1;
    }
  }
}
