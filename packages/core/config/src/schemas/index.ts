/**
 * index.ts - index
 * @package @vxture/core-config
 * @layer Infrastructure
 * @category Schemas
 * @author AI-Generated
 * @date 2026-03-14
 * @copyright Vxture Team
 * @description
 *   文件功能描述
 */

export type { AppConfig, AppEnv } from './app.schema';
export { appSchema, AppEnvEnum } from './app.schema';

export type { DatabaseConfig } from './database.schema';
export { databaseSchema } from './database.schema';

export type { RedisConfig } from './redis.schema';
export { redisSchema } from './redis.schema';

export type { AuthConfig } from './auth.schema';
export { authSchema } from './auth.schema';

export type { AiConfig, DoubaoConfig, ClaudeConfig, CustomModelConfig } from './ai.schema';
export { aiSchema } from './ai.schema';