/**
 * redis.service.ts - Redis 客户端（refresh token 存储 + 黑名单 + 跨域 token）
 * @package @vxture/bff-auth
 * @layer Application
 * @category Service
 *
 * @description
 *   封装 ioredis 连接，提供：
 *   - refresh token 有状态存储（支持吊销）
 *   - jti 黑名单（access token 吊销）
 *   - 跨域一次性 token（TTL 30s，原子 GETDEL）
 *   - OAuth state 存储（TTL 10min）
 *
 *   Redis 键规范（与设计文档一致）：
 *     {prefix}refresh:tenant:{userId}       → refresh token
 *     {prefix}refresh:operator:{userId}     → 运营人员 refresh token
 *     {prefix}blacklist:{jti}               → 已吊销 access token
 *     {prefix}crossdomain:{token}           → 跨域一次性 token
 *     {prefix}oauth:state:{state}           → OAuth 防 CSRF state
 *
 * @author AI-Generated
 * @date 2026-05-07
 */

import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { VxConfigService } from '@vxture/core-config';
import Redis from 'ioredis';

// ============================================================================
// 类型
// ============================================================================

export interface CrossDomainPayload {
  /** 用户 ID */
  sub: string;
  /** 用户类型，目标 BFF 据此校验 */
  userType: string;
  /** 当前 tenantId */
  tenantId: string;
  /** 目标 domain，防止 token 在第三方 domain 使用 */
  targetDomain: string;
  /** OAuth provider */
  provider?: string;
}

// ============================================================================
// RedisService
// ============================================================================

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;
  private prefix!: string;

  constructor(@Inject(VxConfigService) private readonly config: VxConfigService) {}

  onModuleInit(): void {
    const { REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB, REDIS_KEY_PREFIX } =
      this.config.redis;

    this.prefix = REDIS_KEY_PREFIX ?? 'vx:';

    this.client = REDIS_URL
      ? new Redis(REDIS_URL, { lazyConnect: true })
      : new Redis({
          host: REDIS_HOST ?? 'localhost',
          port: REDIS_PORT ?? 6379,
          password: REDIS_PASSWORD,
          db: REDIS_DB,
          lazyConnect: true,
        });

    this.client.on('error', (err: Error) => {
      this.logger.warn(`Redis connection error: ${err.message}`);
    });

    this.client.connect().catch((err: Error) => {
      this.logger.warn(
        `Redis initial connection failed: ${err.message} — auth-bff will operate without Redis (tokens become stateless, cross-domain login disabled)`,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  /** 检查 Redis 是否可用 */
  private isAvailable(): boolean {
    return this.client.status === 'ready';
  }

  // ─── Refresh Token 存储 ────────────────────────────────────────────────

  async storeRefreshToken(userId: string, token: string, ttlSeconds: number, isOperator = false): Promise<void> {
    if (!this.isAvailable()) return;
    const key = `${this.prefix}refresh:${isOperator ? 'operator' : 'tenant'}:${userId}`;
    try {
      await this.client.setex(key, ttlSeconds, token);
    } catch (err) {
      this.logger.warn(`storeRefreshToken failed: ${String(err)}`);
    }
  }

  async getRefreshToken(userId: string, isOperator = false): Promise<string | null> {
    if (!this.isAvailable()) return null;
    const key = `${this.prefix}refresh:${isOperator ? 'operator' : 'tenant'}:${userId}`;
    try {
      return await this.client.get(key);
    } catch (err) {
      this.logger.warn(`getRefreshToken failed: ${String(err)}`);
      return null;
    }
  }

  async deleteRefreshToken(userId: string, isOperator = false): Promise<void> {
    if (!this.isAvailable()) return;
    const key = `${this.prefix}refresh:${isOperator ? 'operator' : 'tenant'}:${userId}`;
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.warn(`deleteRefreshToken failed: ${String(err)}`);
    }
  }

  // ─── jti 黑名单 ────────────────────────────────────────────────────────

  async addToBlacklist(jti: string, ttlSeconds: number): Promise<void> {
    if (!this.isAvailable()) return;
    const key = `${this.prefix}blacklist:${jti}`;
    try {
      await this.client.setex(key, ttlSeconds, '1');
    } catch (err) {
      this.logger.warn(`addToBlacklist failed: ${String(err)}`);
    }
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const key = `${this.prefix}blacklist:${jti}`;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (err) {
      this.logger.warn(`isBlacklisted check failed (fail-open): ${String(err)}`);
      return false;
    }
  }

  // ─── 跨域一次性 token ──────────────────────────────────────────────────

  /** 生成跨域 token（随机 UUID），存入 Redis，返回 token 字符串 */
  async storeCrossDomainToken(payload: CrossDomainPayload): Promise<string> {
    const { randomUUID } = await import('node:crypto');
    const token = randomUUID();
    const key = `${this.prefix}crossdomain:${token}`;
    const value = JSON.stringify(payload);
    try {
      await this.client.setex(key, 30, value); // TTL 30 秒
    } catch (err) {
      this.logger.warn(`storeCrossDomainToken failed: ${String(err)}`);
      // Redis 不可用时仍然返回 token（客户端将收到 verify 失败）
    }
    return token;
  }

  /**
   * 原子性取出并删除跨域 token（GETDEL）。
   * 返回 null 表示 token 不存在或已过期。
   */
  async consumeCrossDomainToken(token: string): Promise<CrossDomainPayload | null> {
    if (!this.isAvailable()) return null;
    const key = `${this.prefix}crossdomain:${token}`;
    try {
      // ioredis 的 getdel 方法
      const raw = await this.client.getdel(key);
      if (!raw) return null;
      return JSON.parse(raw) as CrossDomainPayload;
    } catch (err) {
      this.logger.warn(`consumeCrossDomainToken failed: ${String(err)}`);
      return null;
    }
  }

  // ─── OAuth state ───────────────────────────────────────────────────────

  async storeOAuthState(state: string, data: string): Promise<void> {
    if (!this.isAvailable()) return;
    const key = `${this.prefix}oauth:state:${state}`;
    try {
      await this.client.setex(key, 600, data); // TTL 10 分钟
    } catch (err) {
      this.logger.warn(`storeOAuthState failed: ${String(err)}`);
    }
  }

  async getAndDeleteOAuthState(state: string): Promise<string | null> {
    if (!this.isAvailable()) return null;
    const key = `${this.prefix}oauth:state:${state}`;
    try {
      return await this.client.getdel(key);
    } catch (err) {
      this.logger.warn(`getAndDeleteOAuthState failed: ${String(err)}`);
      return null;
    }
  }
}
