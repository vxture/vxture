/**
 * auth.schema.ts - 认证配置schema
 * @package @vxture/core-config
 * @description Zod schema for authentication (JWT) configuration
 */

import { z } from 'zod';

// ============================================================================
// Auth Schema  (JWT + Session)
// ============================================================================

export const authSchema = z.object({
  /** Access token 签名密钥，生产环境必须 ≥ 32 位随机字符串 */
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  /** Access token 有效期，支持 vercel/ms 格式：15m、1h、7d */
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  /** Refresh token 有效期 */
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  /**
   * Refresh token 黑名单存储后端
   * redis  — 推荐生产使用，支持主动吊销
   * memory — 仅用于单进程测试，重启后失效
   */
  JWT_BLACKLIST_STORAGE: z.enum(['redis', 'memory']).default('redis'),

  /** BCRYPT 密码 hash 轮数，越高越安全但越慢 */
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
});

export type AuthConfig = z.infer<typeof authSchema>;