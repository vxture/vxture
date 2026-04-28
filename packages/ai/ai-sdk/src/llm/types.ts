/**
 * llm/types.ts - LLM 相关类型定义
 * @package @vxture/ai-sdk
 *
 * Description: LLM 客户端的类型定义，包括模型配置、请求参数、响应格式等
 *
 * @author AI-Generated
 * @date 2026-03-11 11:20:00
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category AI - LLM
 */

/**
 * LLM 模型类型
 */
export enum LLMModel {
  CLAUDE = 'claude',
  DOUBAO = 'doubao',
  CUSTOM = 'custom',
}

/**
 * Gateway 模型编码，支持平台预置枚举，也支持数据库注册的自定义模型编码
 */
export type LLMModelCode = LLMModel | string;

/**
 * LLM 请求配置
 */
export interface LLMConfig {
  /**
   * 模型名称
   */
  model: LLMModelCode;

  /**
   * 温度参数，控制输出的随机性
   * 0.0 - 1.0，值越高越随机
   */
  temperature?: number;

  /**
   * 最大输出令牌数
   */
  maxTokens?: number;

  /**
   * 顶 p 采样参数
   */
  topP?: number;

  /**
   * 顶 k 采样参数
   */
  topK?: number;
}

/**
 * LLM 消息类型
 */
export interface LLMMessage {
  /**
   * 角色：system、user、assistant
   */
  role: 'system' | 'user' | 'assistant';

  /**
   * 消息内容
   */
  content: string;

  /**
   * 消息时间戳
   */
  timestamp?: number;
}

/**
 * LLM 响应
 */
export interface LLMResponse {
  /**
   * 模型输出内容
   */
  content: string;

  /**
   * 响应的使用的令牌统计
   */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  /**
   * 模型名称
   */
  model?: string;

  /**
   * 响应时间
   */
  latency?: number;
}

/**
 * LLM 错误类型
 */
export interface LLMError {
  /**
   * 错误代码
   */
  code: string;

  /**
   * 错误信息
   */
  message: string;

  /**
   * 原始错误
   */
  originalError?: unknown;
}

/**
 * 流式响应回调
 */
export interface LLMStreamCallbacks {
  /**
   * 流式数据回调
   */
  onData?: (chunk: string) => void;

  /**
   * 错误回调
   */
  onError?: (error: LLMError) => void;

  /**
   * 完成回调
   */
  onComplete?: (response: LLMResponse) => void;
}

/**
 * LLM 请求选项
 */
export interface LLMOptions {
  /**
   * 是否使用流式响应
   */
  stream?: boolean;

  /**
   * 流式响应回调
   */
  callbacks?: LLMStreamCallbacks;

  /**
   * 请求超时时间（毫秒）
   */
  timeout?: number;
}
