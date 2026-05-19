/**
 * phone-code.service.ts - 手机验证码服务
 * @package @vxture/service-sms
 * @description 生成 6 位数字验证码，存入 Redis（TTL 10 分钟），同一手机号限流
 *
 * Redis Key 规范：
 *   svc:code:{scope}:{phone}      验证码本体，TTL 600s
 *   svc:rl:{scope}:1m:{phone}     1 分钟计数器，TTL 60s
 *   svc:rl:{scope}:1h:{phone}     1 小时计数器，TTL 3600s
 *   svc:rl:{scope}:1d:{phone}     1 天计数器，TTL 86400s
 *
 * @author AI-Generated
 * @date 2026-05-05
 */

import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import type Redis from "ioredis";
import { REDIS_CLIENT } from "../constants/tokens";
import { SmsService } from "./sms.service";

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const CODE_TTL = 600; // 验证码有效期，秒
const RL_1M_LIMIT = 1; // 每分钟上限
const RL_1H_LIMIT = 5; // 每小时上限
const RL_1D_LIMIT = 10; // 每天上限
const DEFAULT_SCOPE = "tenant-auth";

export interface PhoneCodeOptions {
  scope?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class PhoneCodeService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(SmsService) private readonly smsService: SmsService,
  ) {}

  // ─── 公开接口 ─────────────────────────────────────────────────────────────

  /**
   * 发送验证码到手机；命中限流则抛出 429
   * @param phone 手机号（仅限中国大陆格式）
   */
  async sendCode(phone: string, options: PhoneCodeOptions = {}): Promise<void> {
    const key = normalizePhone(phone);
    const scope = normalizeScope(options.scope);

    await this.checkRateLimits(scope, key);

    const code = generateCode();
    await this.redis.set(codeKey(scope, key), code, "EX", CODE_TTL);

    await this.smsService.sendVerifyCode(phone, code);

    await this.incrementCounters(scope, key);
  }

  /**
   * 验证验证码；正确返回 true 并立即销毁，否则返回 false
   * @param phone 手机号
   * @param code 用户输入的验证码
   */
  async verifyCode(
    phone: string,
    code: string,
    options: PhoneCodeOptions = {},
  ): Promise<boolean> {
    const key = normalizePhone(phone);
    const scope = normalizeScope(options.scope);
    const stored = await this.redis.get(codeKey(scope, key));

    if (!stored || stored !== code.trim()) {
      return false;
    }

    await this.redis.del(codeKey(scope, key));
    return true;
  }

  // ─── 私有方法 ─────────────────────────────────────────────────────────────

  private async checkRateLimits(scope: string, key: string): Promise<void> {
    const [per1m, per1h, per1d] = await Promise.all([
      this.redis.get(rateLimitKey(scope, "1m", key)),
      this.redis.get(rateLimitKey(scope, "1h", key)),
      this.redis.get(rateLimitKey(scope, "1d", key)),
    ]);

    if (Number(per1m ?? 0) >= RL_1M_LIMIT) {
      throw new HttpException(
        "操作过于频繁，请 1 分钟后再试",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (Number(per1h ?? 0) >= RL_1H_LIMIT) {
      throw new HttpException(
        "1 小时内发送次数已达上限，请稍后再试",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (Number(per1d ?? 0) >= RL_1D_LIMIT) {
      throw new HttpException(
        "今日验证码发送次数已达上限",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /** 仅在发送成功后计数 */
  private async incrementCounters(scope: string, key: string): Promise<void> {
    await Promise.all([
      incrWithTtl(this.redis, rateLimitKey(scope, "1m", key), 60),
      incrWithTtl(this.redis, rateLimitKey(scope, "1h", key), 3600),
      incrWithTtl(this.redis, rateLimitKey(scope, "1d", key), 86400),
    ]);
  }
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s+/g, "");
}

function normalizeScope(scope?: string): string {
  const normalized = (scope ?? DEFAULT_SCOPE)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || DEFAULT_SCOPE;
}

function codeKey(scope: string, key: string): string {
  return `svc:code:${scope}:${key}`;
}

function rateLimitKey(
  scope: string,
  window: "1m" | "1h" | "1d",
  key: string,
): string {
  return `svc:rl:${scope}:${window}:${key}`;
}

async function incrWithTtl(
  redis: Redis,
  redisKey: string,
  ttlSeconds: number,
): Promise<void> {
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.expire(redisKey, ttlSeconds);
  }
}
