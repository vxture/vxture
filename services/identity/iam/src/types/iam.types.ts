export interface AccountCredentialRecord {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  status: boolean;
}

export interface AuthenticatedAccountView {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
}

export interface AccountProfileView extends AuthenticatedAccountView {
  displayName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  timezone: string | null;
  language: string | null;
  profileUpdatedAt: Date | null;
}

export interface UpdateAccountProfileInput {
  displayName?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  timezone?: string | null;
  language?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface CreateAccountInput {
  email: string;
  name: string;
  passwordHash: string;
}

export interface FindOrCreateByOAuthInput {
  /** OAuth 提供方标识，如 'dingtalk' */
  provider: string;
  /** 提供方侧用户唯一 ID */
  providerId: string;
  /** 用户显示名，用于新建账号时填充 account_profile */
  name: string;
  /** 提供方返回的邮箱，可能为空 */
  email?: string | null;
  /** 头像 URL，可能为空 */
  avatarUrl?: string | null;
}

export interface AccountReadRepository {
  createPasswordResetToken(accountId: string, expiresAt: Date): Promise<string>;
  consumePasswordResetToken(token: string): Promise<string | null>;
  findByIdentifier(identifier: string): Promise<AccountCredentialRecord | null>;
  findCredentialById(accountId: string): Promise<AccountCredentialRecord | null>;
  findById(accountId: string): Promise<AuthenticatedAccountView | null>;
  getProfile(accountId: string): Promise<AccountProfileView | null>;
  updateProfile(accountId: string, input: UpdateAccountProfileInput): Promise<AccountProfileView | null>;
  updatePassword(accountId: string, passwordHash: string): Promise<void>;
  createAccount(input: CreateAccountInput): Promise<AuthenticatedAccountView>;
  /** OAuth 登录：通过 provider + providerId 查找账号，不存在则自动创建 */
  findOrCreateByOAuth(input: FindOrCreateByOAuthInput): Promise<AuthenticatedAccountView>;
}
