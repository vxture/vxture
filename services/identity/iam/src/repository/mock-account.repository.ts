import { Injectable } from '@nestjs/common';
import type {
  AccountCredentialRecord,
  AccountProfileView,
  AccountReadRepository,
  AuthenticatedAccountView,
  CreateAccountInput,
  UpdateAccountProfileInput,
} from '../types/iam.types';

const mockAccount: AccountCredentialRecord = {
  id: 'u_console_admin',
  username: 'console.admin',
  email: 'lin.chen@vxture.ai',
  phone: '13800000000',
  passwordHash: 'console123',
  status: true,
};

let mockProfile: AccountProfileView = {
  id: mockAccount.id,
  username: mockAccount.username,
  email: mockAccount.email,
  phone: mockAccount.phone,
  displayName: 'Lin Chen',
  avatarUrl: null,
  headline: 'Platform Operator',
  bio: 'Responsible for workspace operations and tenant governance.',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  profileUpdatedAt: new Date(),
};

@Injectable()
export class MockAccountRepository implements AccountReadRepository {
  async findByIdentifier(identifier: string): Promise<AccountCredentialRecord | null> {
    const normalized = identifier.trim().toLowerCase();
    const matches = [mockAccount.username, mockAccount.email, mockAccount.phone]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase());

    return matches.includes(normalized) ? mockAccount : null;
  }

  async findById(accountId: string): Promise<AuthenticatedAccountView | null> {
    if (accountId !== mockAccount.id) {
      return null;
    }

    const { passwordHash: _passwordHash, ...account } = mockAccount;
    return account;
  }

  async findCredentialById(accountId: string): Promise<AccountCredentialRecord | null> {
    return accountId === mockAccount.id ? mockAccount : null;
  }

  async getProfile(accountId: string): Promise<AccountProfileView | null> {
    return accountId === mockAccount.id ? mockProfile : null;
  }

  async updateProfile(accountId: string, input: UpdateAccountProfileInput): Promise<AccountProfileView | null> {
    if (accountId !== mockAccount.id) {
      return null;
    }

    if (input.email !== undefined) {
      mockAccount.email = input.email;
    }

    if (input.phone !== undefined) {
      mockAccount.phone = input.phone;
    }

    mockProfile = {
      ...mockProfile,
      email: input.email ?? mockProfile.email,
      phone: input.phone ?? mockProfile.phone,
      displayName: input.displayName ?? mockProfile.displayName,
      avatarUrl: input.avatarUrl ?? mockProfile.avatarUrl,
      headline: input.headline ?? mockProfile.headline,
      bio: input.bio ?? mockProfile.bio,
      timezone: input.timezone ?? mockProfile.timezone,
      language: input.language ?? mockProfile.language,
      profileUpdatedAt: new Date(),
    };

    return mockProfile;
  }

  async updatePassword(accountId: string, passwordHash: string): Promise<void> {
    if (accountId === mockAccount.id) {
      mockAccount.passwordHash = passwordHash;
    }
  }

  async createAccount(_input: CreateAccountInput): Promise<AuthenticatedAccountView> {
    return { id: mockAccount.id, username: mockAccount.username, email: mockAccount.email, phone: mockAccount.phone };
  }

  async createPasswordResetToken(_accountId: string, _expiresAt: Date): Promise<string> {
    return 'mock-reset-token';
  }

  async consumePasswordResetToken(_rawToken: string): Promise<string | null> {
    return mockAccount.id;
  }
}
