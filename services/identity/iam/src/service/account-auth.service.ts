import { compare, hash } from 'bcryptjs';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ACCOUNT_REPOSITORY } from '../tokens';
import type {
  AccountCredentialRecord,
  AccountProfileView,
  AccountReadRepository,
  AuthenticatedAccountView,
  UpdateAccountProfileInput,
} from '../types/iam.types';

@Injectable()
export class AccountAuthService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly repository: AccountReadRepository,
  ) {}

  async authenticate(identifier: string, password: string): Promise<AuthenticatedAccountView> {
    if (!identifier.trim() || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const account = await this.repository.findByIdentifier(identifier);
    if (!account || !account.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.verifyPassword(password, account);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: account.id,
      username: account.username,
      email: account.email,
      phone: account.phone,
    };
  }

  async getAccountById(accountId: string): Promise<AuthenticatedAccountView | null> {
    return this.repository.findById(accountId);
  }

  async getAccountProfile(accountId: string): Promise<AccountProfileView | null> {
    return this.repository.getProfile(accountId);
  }

  async updateAccountProfile(accountId: string, input: UpdateAccountProfileInput): Promise<AccountProfileView | null> {
    return this.repository.updateProfile(accountId, input);
  }

  async changePassword(accountId: string, currentPassword: string, nextPassword: string): Promise<void> {
    if (!currentPassword || !nextPassword) {
      throw new BadRequestException('Current password and next password are required.');
    }

    if (nextPassword.length < 6) {
      throw new BadRequestException('New password must contain at least 6 characters.');
    }

    const account = await this.repository.findCredentialById(accountId);
    if (!account || !account.passwordHash) {
      throw new UnauthorizedException('Account is unavailable.');
    }

    const isValid = await this.verifyPassword(currentPassword, account);
    if (!isValid) {
      throw new UnauthorizedException('Current password is invalid.');
    }

    const nextPasswordHash = await hash(nextPassword, 10);
    await this.repository.updatePassword(accountId, nextPasswordHash);
  }

  async resetPassword(accountId: string, nextPassword: string): Promise<void> {
    if (!nextPassword || nextPassword.length < 6) {
      throw new BadRequestException('New password must contain at least 6 characters.');
    }

    const nextPasswordHash = await hash(nextPassword, 10);
    await this.repository.updatePassword(accountId, nextPasswordHash);
  }

  private async verifyPassword(password: string, account: AccountCredentialRecord): Promise<boolean> {
    const hash = account.passwordHash ?? '';

    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return compare(password, hash);
    }

    return safeStringCompare(password, hash);
  }
}

function safeStringCompare(left: string, right: string): boolean {
  const leftBuffer = createHash('sha256').update(left).digest();
  const rightBuffer = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftBuffer, rightBuffer);
}
