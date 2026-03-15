/**
 * index.ts - Schemas barrel export
 * @package @vxture/core-config
 * @description Config schemas barrel export
 */

export type { AppConfig, AppEnv } from './app.schema';
export { appSchema, AppEnvEnum } from './app.schema';

export type { DatabaseConfig } from './database.schema';
export { databaseSchema } from './database.schema';

export type { RedisConfig } from './redis.schema';
export { redisSchema } from './redis.schema';

export type { AuthConfig } from './auth.schema';
export { authSchema } from './auth.schema';

export type { AiConfig, DoubaoConfig, ClaudeConfig, ChatgptConfig, QwenConfig, CustomModelConfig } from './ai.schema';
export { aiSchema } from './ai.schema';