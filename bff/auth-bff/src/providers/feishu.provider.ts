/**
 * feishu.provider.ts - 飞书 OAuth 2.0 提供方实现
 * @package @vxture/bff-auth
 *
 * 从 @vxture/bff-website 的 feishu.provider.ts 迁移而来。
 *
 * 环境变量：
 * - FEISHU_APP_ID
 * - FEISHU_APP_SECRET
 *
 * @author AI-Generated
 * @date 2026-05-07
 * @version 1.0
 */

import { OAuthProviderType } from '@vxture/core-auth';

// ============================================================================
// 类型
// ============================================================================

interface FeishuTokenResponse {
  code: number;
  msg: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  } | null;
}

interface FeishuUserResponse {
  code: number;
  msg: string;
  data: {
    name: string;
    avatar: {
      avatar_big?: string;
      avatar_middle?: string;
      avatar_thumb?: string;
    };
    email?: string;
    mobile?: string;
    sub: string;        // user_id，飞书分配给用户的唯一标识
    picture?: string;
    union_id?: string;
    en_name?: string;
    tenant_key: string;
  } | null;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface OAuthUserProfileResponse {
  providerId: string;
  provider: OAuthProviderType;
  email?: string;
  name: string;
  avatar?: string;
  raw: Record<string, unknown>;
}

// ============================================================================
// Feishu Provider
// ============================================================================

export class FeishuProvider {
  readonly name = 'feishu';

  private get appId(): string {
    return process.env.FEISHU_APP_ID ?? '';
  }

  private get appSecret(): string {
    return process.env.FEISHU_APP_SECRET ?? '';
  }

  /**
   * 用授权码换取用户 access token
   * @see https://open.feishu.cn/document/common-capabilities/sso/api/authentication-code-flow
   */
  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens> {
    const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        app_id: this.appId,
        app_secret: this.appSecret,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Feishu token exchange failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as FeishuTokenResponse;
    if (data.code !== 0 || !data.data) {
      throw new Error(`Feishu token exchange error: ${data.code} ${data.msg}`);
    }

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresIn: data.data.expires_in,
    };
  }

  /**
   * 用 access token 获取用户信息
   * @see https://open.feishu.cn/document/common-capabilities/sso/api/authentication-code-flow
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserProfileResponse> {
    const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Feishu userinfo failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as FeishuUserResponse;
    if (data.code !== 0 || !data.data) {
      throw new Error(`Feishu userinfo error: ${data.code} ${data.msg}`);
    }

    return {
      providerId: data.data.sub,
      provider: OAuthProviderType.FEISHU,
      email: data.data.email,
      name: data.data.en_name || data.data.name,
      avatar: data.data.avatar?.avatar_big || data.data.picture,
      raw: data as unknown as Record<string, unknown>,
    };
  }

  /**
   * 构建飞书授权页面 URL
   */
  buildAuthorizationUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user:email,user:name,user:avatar',
      state,
    });
    return `https://open.feishu.cn/open-apis/authen/v1/index?${params.toString()}`;
  }
}
