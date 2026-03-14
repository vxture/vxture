/**
 * database.schema.ts - 数据库配置schema
 * @package @vxture/core-config
 * @description Zod schema for database (PostgreSQL) configuration
 */

import { z } from 'zod';

// ============================================================================
// Database Schema  (PostgreSQL via Prisma)
// ============================================================================

export const databaseSchema = z.object({
  /** Prisma DATABASE_URL，优先级最高 */
  DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgresql://')
    .optional(),

  /**
   * 分项连接参数 — 当 DATABASE_URL 未提供时使用
   * 通常在 K8s Secret 挂载场景下分项注入更安全
   */
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_NAME: z.string().min(1).default('vxture'),
  DB_USER: z.string().min(1).default('postgres'),
  DB_PASSWORD: z.string().min(1),

  /** 连接池最大连接数 */
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),

  /** SSL 模式：生产环境应为 require */
  DB_SSL: z.enum(['disable', 'allow', 'prefer', 'require']).default('prefer'),
});

export type DatabaseConfig = z.infer<typeof databaseSchema>;