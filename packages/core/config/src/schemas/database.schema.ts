/**
 * database.schema.ts - Database configuration schema
 * @package @vxture/core-config
 * @description
 *   Zod schema for database (PostgreSQL) configuration
 */

import { z } from 'zod';

// ============================================================================
// Database Schema  (PostgreSQL via Prisma)
// ============================================================================

export const databaseSchema = z.object({
  /** Prisma DATABASE_URL, highest priority */
  DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgresql://')
    .optional(),

  /**
   * Individual connection parameters — used when DATABASE_URL is not provided
   * Usually safer for separate injection in K8s Secret mounting scenarios
   */
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_NAME: z.string().min(1).default('vxture'),
  DB_USER: z.string().min(1).default('postgres'),
  DB_PASSWORD: z.string().min(1),

  /** Connection pool maximum connections */
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),

  /** SSL mode: should be require in production */
  DB_SSL: z.enum(['disable', 'allow', 'prefer', 'require']).default('prefer'),
});

export type DatabaseConfig = z.infer<typeof databaseSchema>;