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

export interface AccountReadRepository {
  findByIdentifier(identifier: string): Promise<AccountCredentialRecord | null>;
  findCredentialById(accountId: string): Promise<AccountCredentialRecord | null>;
  findById(accountId: string): Promise<AuthenticatedAccountView | null>;
  getProfile(accountId: string): Promise<AccountProfileView | null>;
  updateProfile(accountId: string, input: UpdateAccountProfileInput): Promise<AccountProfileView | null>;
  updatePassword(accountId: string, passwordHash: string): Promise<void>;
}
