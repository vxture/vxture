/**
 * provider.utils.ts - OAuth provider 工具函数
 * @package @vxture/core-auth
 * @description
 *   OAuth provider 验证、用户信息标准化构建、JTI 生成等工具函数。
 */

import { OAuthProviderType } from '../types/auth.types';
import type { OAuthUserProfile } from '../types/auth.types';

// ============================================================================
// Provider 验证
// ============================================================================

/**
 * 判断字符串是否为合法的 OAuthProviderType
 */
export function isValidProvider(value: string): value is OAuthProviderType {
  return Object.values(OAuthProviderType).includes(value as OAuthProviderType);
}

// ============================================================================
// OAuthUserProfile 标准化工具
// — 供各 provider 实现内部使用，统一输出格式
// ============================================================================

/**
 * 构建标准化的 OAuthUserProfile
 * 确保必填字段存在，raw 字段完整保留
 *
 * @example
 * // 在 DingtalkProvider.getUserInfo() 内部
 * return buildOAuthProfile({
 *   providerId: data.userid,
 *   provider:   OAuthProviderType.DINGTALK,
 *   name:       data.name,
 *   avatar:     data.avatar,
 *   email:      data.email,
 *   raw:        data,
 * });
 */
export function buildOAuthProfile(params: {
  providerId: string;
  provider:   OAuthProviderType;
  name:       string;
  email?:     string;
  avatar?:    string;
  raw:        Record<string, unknown>;
}): OAuthUserProfile {
  return {
    providerId: params.providerId,
    provider:   params.provider,
    name:       params.name,
    email:      params.email,
    avatar:     params.avatar,
    raw:        params.raw,
  };
}

// ============================================================================
// JTI 生成（Refresh Token 唯一 ID，用于 Redis 黑名单）
// ============================================================================

/**
 * 生成 refresh token 的 jti（JWT ID）
 * 格式：{userId}:{timestamp}:{random}
 * 供 Redis key 存储和黑名单比对使用
 */
export function generateJti(userId: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${userId}:${Date.now()}:${random}`;
}
