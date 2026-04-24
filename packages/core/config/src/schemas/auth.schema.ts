/**
 * auth.schema.ts - Authentication configuration schema
 * @package @vxture/core-config
 * @description
 *   Zod schema for authentication (JWT) configuration
 * 
 * @author AI-Generated
 * @date 2026-03-15
 */

import { z } from 'zod';

// ============================================================================
// Auth Schema  (JWT + Session)
// ============================================================================

export const authSchema = z.object({
  /** Access token signing secret, must be ≥ 32 random characters in production */
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  /** Access token expiration, supports vercel/ms format: 15m, 1h, 7d */
  JWT_ACCESS_EXPIRES_IN: z.string().default('8h'),

  /** Refresh token expiration */
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  /**
   * Refresh token blacklist storage backend
   * redis  — Recommended for production, supports active revocation
   * memory — Only for single-process testing, lost after restart
   */
  JWT_BLACKLIST_STORAGE: z.enum(['redis', 'memory']).default('redis'),

  /** BCRYPT password hash rounds, higher is safer but slower */
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
});

export type AuthConfig = z.infer<typeof authSchema>;
