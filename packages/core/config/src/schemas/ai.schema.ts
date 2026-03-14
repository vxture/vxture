/**
 * ai.schema.ts - AI 配置schema
 * @package @vxture/core-config
 * @description
 *   Zod schema for AI (LLM provider) configuration
 */

import { z } from 'zod';

// ============================================================================
// AI Schema  (LLM provider credentials + endpoints)
//
// 仅 agent-server/* 消费此 schema，BFF / services 不注入 AI 配置
// ============================================================================

// ----------------------------------------------------------------------------
// Doubao (豆包) — 字节跳动 LLM
// ----------------------------------------------------------------------------
const doubaoSchema = z.object({
  /** 豆包 API Key */
  DOUBAO_API_KEY: z.string().min(1),

  /** 豆包 API Endpoint，默认官方地址 */
  DOUBAO_API_URL: z
    .string()
    .url()
    .default('https://ark.cn-beijing.volces.com/api/v3'),

  /**
   * 默认模型 ID（豆包 ARK 模型接入点 ID）
   * 不同租户可能有不同的接入点，这里是平台级默认值
   */
  DOUBAO_DEFAULT_MODEL: z.string().default('doubao-pro-32k'),

  /** Embedding 模型 ID */
  DOUBAO_EMBEDDING_MODEL: z.string().default('doubao-embedding'),
});

// ----------------------------------------------------------------------------
// Claude (Anthropic)
// ----------------------------------------------------------------------------
const claudeSchema = z.object({
  /** Anthropic API Key */
  ANTHROPIC_API_KEY: z.string().min(1),

  /** Anthropic API Base URL，私有化部署时可覆盖 */
  ANTHROPIC_API_URL: z
    .string()
    .url()
    .default('https://api.anthropic.com'),

  /** 默认模型 */
  ANTHROPIC_DEFAULT_MODEL: z.string().default('claude-sonnet-4-20250514'),
});

// ----------------------------------------------------------------------------
// ChatGPT (OpenAI)
// ----------------------------------------------------------------------------
const chatgptSchema = z.object({
  /** OpenAI API Key */
  OPENAI_API_KEY: z.string().min(1),

  /** OpenAI API Base URL，私有化部署时可覆盖 */
  OPENAI_API_URL: z
    .string()
    .url()
    .default('https://api.openai.com/v1'),

  /** 默认模型 */
  OPENAI_DEFAULT_MODEL: z.string().default('gpt-4o'),

  /** Embedding 模型 */
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
});

// ----------------------------------------------------------------------------
// Qwen (字节跳动 通义千问)
// ----------------------------------------------------------------------------
const qwenSchema = z.object({
  /** 通义千问 API Key */
  QWEN_API_KEY: z.string().min(1),

  /** 通义千问 API Base URL，私有化部署时可覆盖 */
  QWEN_API_URL: z
    .string()
    .url()
    .default('https://dashscope.aliyuncs.com/compatible-mode'),

  /** 默认模型 */
  QWEN_DEFAULT_MODEL: z.string().default('qwen-plus'),

  /** Embedding 模型 */
  QWEN_EMBEDDING_MODEL: z.string().default('text-embedding-v2'),
});

// ----------------------------------------------------------------------------
// 自定义 / 私有模型 endpoint（OpenAI 兼容接口）
// ----------------------------------------------------------------------------
const customModelSchema = z.object({
  /** 私有模型 Base URL，需兼容 OpenAI Chat Completions API */
  CUSTOM_MODEL_API_URL: z.string().url().optional(),

  /** 私有模型 API Key，如不需要鉴权可留空 */
  CUSTOM_MODEL_API_KEY: z.string().optional(),

  /** 私有模型名称 */
  CUSTOM_MODEL_NAME: z.string().optional(),
});

// ----------------------------------------------------------------------------
// 全局 AI 限流与超时配置
// ----------------------------------------------------------------------------
const aiGlobalSchema = z.object({
  /** 单次 LLM 请求超时（毫秒） */
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).default(60_000),

  /** LLM 请求失败后最大重试次数 */
  AI_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),

  /** 重试间隔（毫秒，指数退避基数） */
  AI_RETRY_DELAY_MS: z.coerce.number().int().min(100).default(1000),
});

// ----------------------------------------------------------------------------
// 组合导出
// ----------------------------------------------------------------------------
export const aiSchema = doubaoSchema
  .merge(claudeSchema)
  .merge(chatgptSchema)
  .merge(qwenSchema)
  .merge(customModelSchema)
  .merge(aiGlobalSchema);

export type AiConfig = z.infer<typeof aiSchema>;

// 单独导出子类型，供 ai-sdk 各模块按需使用
export type DoubaoConfig = z.infer<typeof doubaoSchema>;
export type ClaudeConfig = z.infer<typeof claudeSchema>;
export type ChatgptConfig = z.infer<typeof chatgptSchema>;
export type QwenConfig = z.infer<typeof qwenSchema>;
export type CustomModelConfig = z.infer<typeof customModelSchema>;