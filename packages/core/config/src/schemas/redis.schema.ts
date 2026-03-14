/**
 * redis.schema.ts - redisundefined
 * @package @vxture/core-config
 * @layer Infrastructure
 * @category Schemas
 * @author AI-Generated
 * @date 2026-03-14
 * @copyright Vxture Team
 * @description
 *   文件功能描述
 */

import { z } from 'zod';

// ============================================================================
// Redis Schema  (缓存 + BullMQ broker)
// ============================================================================

export const redisSchema = z.object({
  /** Redis 连接 URL，优先级最高 */
  REDIS_URL: z.string().url().startsWith('redis').optional(),

  /** 分项连接参数 */
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).max(15).default(0),

  /** 默认 TTL（秒），用于缓存键 */
  REDIS_TTL: z.coerce.number().int().min(1).default(3600),

  /** Key 前缀，多租户或多应用共享同一 Redis 时隔离用 */
  REDIS_KEY_PREFIX: z.string().default('vx:'),
});

export type RedisConfig = z.infer<typeof redisSchema>;