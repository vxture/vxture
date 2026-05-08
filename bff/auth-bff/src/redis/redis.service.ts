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
 *     {prefix}refresh:tenant:platform:{userId} → .vxture.com 租户 refresh token
 *     {prefix}refresh:tenant:ruyin:{userId}    → ruyin.ai 租户 refresh token
 *     {prefix}refresh:operator:{userId}     → 运营人员 refresh token
 *     {prefix}blacklist:{jti}               → 已吊销 access token
 *     {prefix}crossdomain:{token}           → 跨域一次性 token
 *     {prefix}oauth:state:{state}           → OAuth 防 CSRF state
 *
 * @author AI-Generated
 * @date 2026-05-07
 */

import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  buildAccessTokenBlacklistKey,
  buildSubjectRevokedBeforeKey,
  type AccessRevocationSurface,
} from '@vxture/core-auth';
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

export type TenantRefreshSurface = 'platform' | 'ruyin';

// ============================================================================
// RedisService
// ============================================================================

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;
  private prefix!: string;

  constructor(@Inject(VxConfigService) private readonly config: VxConfigService) {}

  async onModuleInit(): Promise<void> {
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

    try {
      await this.client.connect();
    } catch (err) {
      this.logger.error(`Redis initial connection failed: ${String(err)}`);
      throw new ServiceUnavailableException('Auth session store unavailable');
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
    } catch (err) {
      this.logger.warn(`Redis quit failed: ${String(err)}`);
    }
  }

  private requireReadyClient(): Redis {
    if (this.client.status !== 'ready') {
      throw new ServiceUnavailableException('Auth session store unavailable');
    }
    return this.client;
  }

  // ─── Refresh Token 存储 ────────────────────────────────────────────────

  private refreshKey(userId: string, isOperator: boolean, surface: TenantRefreshSurface = 'platform'): string {
    if (isOperator) return `${this.prefix}refresh:operator:${userId}`;
    return `${this.prefix}refresh:tenant:${surface}:${userId}`;
  }

  private legacyTenantRefreshKey(userId: string): string {
    return `${this.prefix}refresh:tenant:${userId}`;
  }

  async storeRefreshToken(
    userId: string,
    token: string,
    ttlSeconds: number,
    isOperator = false,
    surface: TenantRefreshSurface = 'platform',
  ): Promise<void> {
    const client = this.requireReadyClient();
    const key = this.refreshKey(userId, isOperator, surface);
    try {
      await client.setex(key, ttlSeconds, token);
    } catch (err) {
      this.logger.error(`storeRefreshToken failed: ${String(err)}`);
      throw new ServiceUnavailableException('Refresh token persistence failed');
    }
  }

  async getRefreshToken(
    userId: string,
    isOperator = false,
    surface: TenantRefreshSurface = 'platform',
  ): Promise<string | null> {
    const client = this.requireReadyClient();
    const key = this.refreshKey(userId, isOperator, surface);
    try {
      return await client.get(key);
    } catch (err) {
      this.logger.error(`getRefreshToken failed: ${String(err)}`);
      throw new ServiceUnavailableException('Refresh token lookup failed');
    }
  }

  async deleteRefreshToken(
    userId: string,
    isOperator = false,
    surface?: TenantRefreshSurface,
  ): Promise<void> {
    const client = this.requireReadyClient();
    try {
      if (isOperator) {
        await client.del(this.refreshKey(userId, true));
        return;
      }

      const keys = surface
        ? [this.refreshKey(userId, false, surface)]
        : [
            this.refreshKey(userId, false, 'platform'),
            this.refreshKey(userId, false, 'ruyin'),
            this.legacyTenantRefreshKey(userId),
          ];
      await client.del(...keys);
    } catch (err) {
      this.logger.error(`deleteRefreshToken failed: ${String(err)}`);
      throw new ServiceUnavailableException('Refresh token revocation failed');
    }
  }

  // ─── jti 黑名单 ────────────────────────────────────────────────────────

  async addToBlacklist(jti: string, ttlSeconds: number): Promise<void> {
    const client = this.requireReadyClient();
    const key = buildAccessTokenBlacklistKey(this.prefix, jti);
    try {
      await client.setex(key, ttlSeconds, '1');
    } catch (err) {
      this.logger.error(`addToBlacklist failed: ${String(err)}`);
      throw new ServiceUnavailableException('Access token revocation failed');
    }
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const client = this.requireReadyClient();
    const key = buildAccessTokenBlacklistKey(this.prefix, jti);
    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (err) {
      this.logger.error(`isBlacklisted check failed: ${String(err)}`);
      throw new ServiceUnavailableException('Access token revocation check failed');
    }
  }

  async revokeSubjectAccessTokens(
    userId: string,
    isOperator: boolean,
    ttlSeconds: number,
  ): Promise<void> {
    const client = this.requireReadyClient();
    const surface: AccessRevocationSurface = isOperator ? 'operator' : 'tenant';
    const key = buildSubjectRevokedBeforeKey(this.prefix, surface, userId);
    const revokedBefore = String(Math.floor(Date.now() / 1000));

    try {
      await client.setex(key, ttlSeconds, revokedBefore);
    } catch (err) {
      this.logger.error(`revokeSubjectAccessTokens failed: ${String(err)}`);
      throw new ServiceUnavailableException('Subject access token revocation failed');
    }
  }

  async isSubjectAccessRevoked(
    userId: string,
    isOperator: boolean,
    issuedAt?: number,
  ): Promise<boolean> {
    const client = this.requireReadyClient();
    const surface: AccessRevocationSurface = isOperator ? 'operator' : 'tenant';
    const key = buildSubjectRevokedBeforeKey(this.prefix, surface, userId);

    try {
      const value = await client.get(key);
      if (!value) return false;
      const revokedBefore = Number(value);
      if (!Number.isFinite(revokedBefore)) return false;
      return !issuedAt || issuedAt <= revokedBefore;
    } catch (err) {
      this.logger.error(`isSubjectAccessRevoked failed: ${String(err)}`);
      throw new ServiceUnavailableException('Subject access token revocation check failed');
    }
  }

  // ─── 跨域一次性 token ──────────────────────────────────────────────────

  /** 生成跨域 token（随机 UUID），存入 Redis，返回 token 字符串 */
  async storeCrossDomainToken(payload: CrossDomainPayload): Promise<string> {
    const { randomUUID } = await import('node:crypto');
    const token = randomUUID();
    const key = `${this.prefix}crossdomain:${token}`;
    const value = JSON.stringify(payload);
    const client = this.requireReadyClient();
    try {
      await client.setex(key, 30, value); // TTL 30 秒
    } catch (err) {
      this.logger.error(`storeCrossDomainToken failed: ${String(err)}`);
      throw new ServiceUnavailableException('Cross-domain token persistence failed');
    }
    return token;
  }

  /**
   * 原子性取出并删除跨域 token（GETDEL）。
   * 返回 null 表示 token 不存在或已过期。
   */
  async consumeCrossDomainToken(token: string): Promise<CrossDomainPayload | null> {
    const client = this.requireReadyClient();
    const key = `${this.prefix}crossdomain:${token}`;
    try {
      // ioredis 的 getdel 方法
      const raw = await client.getdel(key);
      if (!raw) return null;
      return JSON.parse(raw) as CrossDomainPayload;
    } catch (err) {
      this.logger.error(`consumeCrossDomainToken failed: ${String(err)}`);
      throw new ServiceUnavailableException('Cross-domain token verification failed');
    }
  }

  // ─── OAuth state ───────────────────────────────────────────────────────

  async storeOAuthState(state: string, data: string): Promise<void> {
    const client = this.requireReadyClient();
    const key = `${this.prefix}oauth:state:${state}`;
    try {
      await client.setex(key, 600, data); // TTL 10 分钟
    } catch (err) {
      this.logger.error(`storeOAuthState failed: ${String(err)}`);
      throw new ServiceUnavailableException('OAuth state persistence failed');
    }
  }

  async getAndDeleteOAuthState(state: string): Promise<string | null> {
    const client = this.requireReadyClient();
    const key = `${this.prefix}oauth:state:${state}`;
    try {
      return await client.getdel(key);
    } catch (err) {
      this.logger.error(`getAndDeleteOAuthState failed: ${String(err)}`);
      throw new ServiceUnavailableException('OAuth state verification failed');
    }
  }
}
