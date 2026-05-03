/**
 * dingtalk.provider.ts - DingTalk OAuth 2.0 提供方实现
 * @package @vxture/bff-website
 *
 * 实现 core-auth 定义的 OAuthProvider 接口，封装钉钉 OAuth 2.0 API 调用。
 * 仅用于 website + console 账号体系，禁止用于 admin 平台管理员登录。
 *
 * 文档：https://open.dingtalk.com/document/orgapp/obtain-user-token
 *
 * @author AI-Generated
 * @date 2026-05-03
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Auth
 */

import type { OAuthProvider, OAuthTokens, OAuthUserProfile } from '@vxture/core-auth';
import { OAuthProviderType } from '@vxture/core-auth';

// ============================================================================
// DingTalk API 响应类型（私有，不对外暴露）
// ============================================================================

interface DingTalkTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expireIn: number;
  corpId?: string;
}

interface DingTalkUserResponse {
  unionId: string;
  openId: string;
  nick: string;
  avatarUrl?: string;
  email?: string;
  mobile?: string;
  stateCode?: string;
}

// ============================================================================
// DingTalk OAuth Provider
// ============================================================================

/**
 * DingTalk OAuth 2.0 Provider
 *
 * 环境变量（从 process.env 直接读取，不经过 VxConfigService，
 * 因为 core-config 的 authSchema 不包含 OAuth 第三方配置）：
 * - DINGTALK_APP_KEY        企业内部应用 AppKey
 * - DINGTALK_APP_SECRET     企业内部应用 AppSecret
 * - DINGTALK_SUITE_KEY      第三方企业应用 SuiteKey（二选一）
 * - DINGTALK_SUITE_SECRET   第三方企业应用 SuiteSecret（二选一）
 */
export class DingtalkProvider implements OAuthProvider {
  readonly name = OAuthProviderType.DINGTALK;

  private get clientId(): string {
    return (
      process.env['DINGTALK_APP_KEY'] ??
      process.env['DINGTALK_SUITE_KEY'] ??
      ''
    );
  }

  private get clientSecret(): string {
    return (
      process.env['DINGTALK_APP_SECRET'] ??
      process.env['DINGTALK_SUITE_SECRET'] ??
      ''
    );
  }

  /**
   * 用授权码换取用户 access token
   * @see https://open.dingtalk.com/document/orgapp/obtain-user-token
   */
  async exchangeCode(code: string, _redirectUri: string): Promise<OAuthTokens> {
    const response = await fetch('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        code,
        grantType: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`DingTalk token exchange failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as DingTalkTokenResponse;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expireIn ?? 7200,
    };
  }

  /**
   * 用用户 access token 获取用户信息
   * @see https://open.dingtalk.com/document/orgapp/obtain-the-user-information-based-on-the-sns-temporary-authorization
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserProfile> {
    const response = await fetch('https://api.dingtalk.com/v1.0/contact/users/me', {
      headers: {
        'x-acs-dingtalk-access-token': accessToken,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`DingTalk userinfo failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as DingTalkUserResponse;
    return {
      providerId: data.unionId,
      provider: OAuthProviderType.DINGTALK,
      email: data.email,
      name: data.nick,
      avatar: data.avatarUrl,
      raw: data as unknown as Record<string, unknown>,
    };
  }

  /**
   * 构建钉钉授权页面 URL
   */
  buildAuthorizationUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: 'openid',
      prompt: 'consent',
      state,
    });
    return `https://login.dingtalk.com/oauth2/auth?${params.toString()}`;
  }
}
