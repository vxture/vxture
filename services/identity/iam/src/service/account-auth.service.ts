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

  /**
   * 生成密码重置 token，返回 { accountId, rawToken } 供 BFF 构建重置链接并发邮件。
   * 若 identifier 不存在，返回 null（调用方不应泄露此信息）。
   */
  async requestPasswordReset(identifier: string): Promise<{ accountId: string; rawToken: string } | null> {
    const account = await this.repository.findByIdentifier(identifier);
    if (!account) {
      return null;
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 分钟
    const rawToken = await this.repository.createPasswordResetToken(account.id, expiresAt);
    return { accountId: account.id, rawToken };
  }

  /** 用 token 重置密码，token 消费后立即失效。token 无效或已过期返回 false。 */
  async resetPasswordWithToken(rawToken: string, newPassword: string): Promise<boolean> {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('密码至少 8 位字符');
    }

    const accountId = await this.repository.consumePasswordResetToken(rawToken);
    if (!accountId) {
      return false;
    }

    await this.resetPassword(accountId, newPassword);
    return true;
  }

  async registerWithPassword(email: string, name: string, password: string): Promise<AuthenticatedAccountView> {
    if (!email?.trim() || !name?.trim() || !password) {
      throw new BadRequestException('邮箱、姓名和密码均为必填项');
    }

    if (password.length < 8) {
      throw new BadRequestException('密码至少 8 位字符');
    }

    const passwordHash = await hash(password, 10);
    return this.repository.createAccount({ email: email.trim(), name: name.trim(), passwordHash });
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
