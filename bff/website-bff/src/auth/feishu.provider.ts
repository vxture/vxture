/**
 * feishu.provider.ts - 飞书 OAuth 2.0 提供方实现
 * @package @vxture/bff-website
 *
 * 实现 core-auth 定义的 OAuthProvider 接口，封装飞书 OAuth 2.0 API 调用。
 * 仅用于 website + console 租户账号体系，禁止用于 admin 平台管理员登录。
 *
 * 文档：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/authen/access_token
 *
 * @author AI-Generated
 * @date 2026-05-04
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
// 飞书 API 响应类型（私有）
// ============================================================================

interface FeishuAppTokenResponse {
  code: number;
  msg: string;
  app_access_token: string;
  expire: number;
}

interface FeishuUserTokenResponse {
  code: number;
  msg: string;
  data?: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    name: string;
    en_name: string;
    open_id: string;
    union_id: string;
    email?: string;
    mobile?: string;
    avatar_url?: string;
  };
}

interface FeishuUserInfoResponse {
  code: number;
  msg: string;
  data?: {
    name: string;
    en_name?: string;
    open_id: string;
    union_id: string;
    email?: string;
    enterprise_email?: string;
    mobile?: string;
    avatar_url?: string;
  };
}

// ============================================================================
// 飞书 OAuth Provider
// ============================================================================

/**
 * Feishu (Lark) OAuth 2.0 Provider
 *
 * 环境变量（process.env 直接读取，core-config authSchema 不含 OAuth 三方配置）：
 * - FEISHU_APP_ID       企业内部应用 App ID
 * - FEISHU_APP_SECRET   企业内部应用 App Secret
 * - FEISHU_REDIRECT_URI OAuth 回调地址（须在飞书应用后台安全设置中注册）
 */
export class FeishuProvider implements OAuthProvider {
  readonly name = OAuthProviderType.FEISHU;

  private get appId(): string {
    return process.env['FEISHU_APP_ID'] ?? '';
  }

  private get appSecret(): string {
    return process.env['FEISHU_APP_SECRET'] ?? '';
  }

  /**
   * 构建飞书授权页面 URL
   * @see https://open.feishu.cn/document/common-capabilities/sso/api/obtain-oauth-code
   */
  buildAuthorizationUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'contact:user.base:readonly contact:user.basic_profile:readonly contact:user.email:readonly',
      state,
    });
    return `https://open.feishu.cn/open-apis/authen/v1/index?${params.toString()}`;
  }

  /**
   * 两步换取用户 access token：
   * 1. 获取企业 app_access_token
   * 2. 用 app_access_token + code 换取 user_access_token
   * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/authen/access_token
   */
  async exchangeCode(code: string, _redirectUri: string): Promise<OAuthTokens> {
    const appToken = await this.fetchAppAccessToken();

    const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${appToken}`,
      },
      body: JSON.stringify({ grant_type: 'authorization_code', code }),
    });

    if (!response.ok) {
      throw new Error(`Feishu token exchange failed: ${response.status}`);
    }

    const data = (await response.json()) as FeishuUserTokenResponse;

    if (data.code !== 0 || !data.data) {
      throw new Error(`Feishu token exchange error: ${data.msg}`);
    }

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresIn: data.data.expires_in ?? 7200,
    };
  }

  /**
   * 用用户 access token 获取用户信息
   * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/authen/user_info
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserProfile> {
    const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Feishu userinfo failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as FeishuUserInfoResponse;

    if (data.code !== 0 || !data.data) {
      throw new Error(`Feishu userinfo error: ${data.msg}`);
    }

    const { open_id, union_id, name, email, enterprise_email, avatar_url } = data.data;

    return {
      providerId: union_id,
      provider: OAuthProviderType.FEISHU,
      email: enterprise_email || email,
      name,
      avatar: avatar_url,
      raw: data.data as unknown as Record<string, unknown>,
    };
  }

  // ─── 私有：获取企业 app_access_token ─────────────────────────────────────────

  private async fetchAppAccessToken(): Promise<string> {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ app_id: this.appId, app_secret: this.appSecret }),
    });

    if (!response.ok) {
      throw new Error(`Feishu app_access_token request failed: ${response.status}`);
    }

    const data = (await response.json()) as FeishuAppTokenResponse;

    if (data.code !== 0) {
      throw new Error(`Feishu app_access_token error: ${data.msg}`);
    }

    return data.app_access_token;
  }
}
