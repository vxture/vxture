import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import type { Pool } from 'pg';
import { IAM_PG_POOL } from '../tokens';
import type {
  AccountCredentialRecord,
  AccountProfileView,
  AccountReadRepository,
  AuthenticatedAccountView,
  CreateAccountInput,
  FindOrCreateByOAuthInput,
  UpdateAccountProfileInput,
} from '../types/iam.types';

interface AccountRow {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  status: boolean;
}

interface AccountProfileRow extends AccountRow {
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  timezone: string | null;
  language: string | null;
  profile_updated_at: Date | null;
}

@Injectable()
export class PgAccountRepository implements AccountReadRepository {
  constructor(@Inject(IAM_PG_POOL) private readonly pool: Pool) {}

  async findByIdentifier(identifier: string): Promise<AccountCredentialRecord | null> {
    const result = await this.pool.query<AccountRow>(
      `
        select
          id,
          username,
          email,
          phone,
          password_hash,
          status
        from account.account
        where deleted_at is null
          and status = true
          and (
            lower(username) = lower($1)
            or lower(coalesce(email, '')) = lower($1)
            or coalesce(phone, '') = $1
          )
        limit 1
      `,
      [identifier.trim()],
    );

    return this.mapCredential(result.rows[0]);
  }

  async findById(accountId: string): Promise<AuthenticatedAccountView | null> {
    const result = await this.pool.query<AccountRow>(
      `
        select
          id,
          username,
          email,
          phone,
          password_hash,
          status
        from account.account
        where id = $1
          and deleted_at is null
          and status = true
        limit 1
      `,
      [accountId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      phone: row.phone,
    };
  }

  async findCredentialById(accountId: string): Promise<AccountCredentialRecord | null> {
    const result = await this.pool.query<AccountRow>(
      `
        select
          id,
          username,
          email,
          phone,
          password_hash,
          status
        from account.account
        where id = $1
          and deleted_at is null
          and status = true
        limit 1
      `,
      [accountId],
    );

    return this.mapCredential(result.rows[0]);
  }

  async getProfile(accountId: string): Promise<AccountProfileView | null> {
    const result = await this.pool.query<AccountProfileRow>(
      `
        select
          a.id,
          a.username,
          a.email,
          a.phone,
          a.password_hash,
          a.status,
          p.display_name,
          p.avatar_url,
          p.headline,
          p.bio,
          p.timezone,
          p.language,
          p.updated_at as profile_updated_at
        from account.account a
        left join account.account_profile p on p.account_id = a.id
        where a.id = $1
          and a.deleted_at is null
          and a.status = true
        limit 1
      `,
      [accountId],
    );

    return this.mapProfile(result.rows[0]);
  }

  async updateProfile(accountId: string, input: UpdateAccountProfileInput): Promise<AccountProfileView | null> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');

      if (Object.prototype.hasOwnProperty.call(input, 'email') || Object.prototype.hasOwnProperty.call(input, 'phone')) {
        await client.query(
          `
            update account.account
            set
              email = coalesce($2, email),
              phone = coalesce($3, phone),
              updated_at = now()
            where id = $1
              and deleted_at is null
          `,
          [accountId, normalizeNullable(input.email), normalizeNullable(input.phone)],
        );
      }

      await client.query(
        `
          insert into account.account_profile (
            account_id,
            display_name,
            avatar_url,
            headline,
            bio,
            timezone,
            language,
            created_at,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, now(), now())
          on conflict (account_id) do update set
            display_name = coalesce(excluded.display_name, account_profile.display_name),
            avatar_url = coalesce(excluded.avatar_url, account_profile.avatar_url),
            headline = coalesce(excluded.headline, account_profile.headline),
            bio = coalesce(excluded.bio, account_profile.bio),
            timezone = coalesce(excluded.timezone, account_profile.timezone),
            language = coalesce(excluded.language, account_profile.language),
            updated_at = now()
        `,
        [
          accountId,
          normalizeNullable(input.displayName),
          normalizeNullable(input.avatarUrl),
          normalizeNullable(input.headline),
          normalizeNullable(input.bio),
          normalizeNullable(input.timezone),
          normalizeNullable(input.language),
        ],
      );

      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return this.getProfile(accountId);
  }

  async createPasswordResetToken(accountId: string, expiresAt: Date): Promise<string> {
    // 生成 64 字符随机 hex token，仅在此处可见，DB 存哈希
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await this.pool.query(
      `insert into account.password_reset_token (account_id, token_hash, expires_at)
       values ($1, $2, $3)
       on conflict do nothing`,
      [accountId, tokenHash, expiresAt],
    );

    return rawToken;
  }

  async consumePasswordResetToken(token: string): Promise<string | null> {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const result = await this.pool.query<{ account_id: string }>(
      `update account.password_reset_token
       set used_at = now()
       where token_hash = $1
         and used_at is null
         and expires_at > now()
       returning account_id`,
      [tokenHash],
    );

    return result.rows[0]?.account_id ?? null;
  }

  async createAccount(input: CreateAccountInput): Promise<AuthenticatedAccountView> {
    const id = crypto.randomUUID();
    const username = deriveUsername(input.email);
    const email = input.email.toLowerCase().trim();

    const client = await this.pool.connect();
    try {
      await client.query('begin');

      await client.query(
        `insert into account.account (id, username, email, password_hash, status, created_at, updated_at)
         values ($1, $2, $3, $4, true, now(), now())`,
        [id, username, email, input.passwordHash],
      );

      await client.query(
        `insert into account.account_profile (account_id, display_name, created_at, updated_at)
         values ($1, $2, now(), now())`,
        [id, input.name.trim()],
      );

      await client.query('commit');
    } catch (error: unknown) {
      await client.query('rollback');
      // PostgreSQL unique_violation 错误码
      if (isUniqueViolation(error)) {
        throw new ConflictException('该邮箱已被注册');
      }

      throw error;
    } finally {
      client.release();
    }

    return { id, username, email, phone: null };
  }

  async updatePassword(accountId: string, passwordHash: string): Promise<void> {
    await this.pool.query(
      `
        update account.account
        set password_hash = $2,
            updated_at = now()
        where id = $1
          and deleted_at is null
          and status = true
      `,
      [accountId, passwordHash],
    );
  }

  async findOrCreateByOAuth(input: FindOrCreateByOAuthInput): Promise<AuthenticatedAccountView> {
    // 1. 通过 account_identity 表查找已绑定账号
    const existing = await this.pool.query<{ account_id: string }>(
      `select account_id from account.account_identity
       where provider = $1 and provider_account_id = $2
         and deleted_at is null
       limit 1`,
      [input.provider, input.providerId],
    );

    if (existing.rows[0]) {
      const account = await this.findById(existing.rows[0].account_id);
      if (account) {
        return account;
      }
    }

    // 2. 不存在则创建新账号（事务）
    const id = crypto.randomUUID();
    const username = deriveUsernameFromName(input.name);
    const providerAccountData = JSON.stringify({
      name: input.name,
      email: input.email ?? null,
      avatarUrl: input.avatarUrl ?? null,
    });

    const client = await this.pool.connect();

    try {
      await client.query('begin');

      await client.query(
        `insert into account.account (id, username, email, password_hash, status, created_at, updated_at)
         values ($1, $2, $3, null, true, now(), now())`,
        [id, username, input.email?.toLowerCase().trim() ?? null],
      );

      await client.query(
        `insert into account.account_profile (account_id, display_name, avatar_url, created_at, updated_at)
         values ($1, $2, $3, now(), now())`,
        [id, input.name.trim(), input.avatarUrl ?? null],
      );

      await client.query(
        `insert into account.account_identity (account_id, provider, provider_account_id, provider_account_data, created_at, updated_at)
         values ($1, $2, $3, $4, now(), now())`,
        [id, input.provider, input.providerId, providerAccountData],
      );

      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return { id, username, email: input.email?.toLowerCase().trim() ?? null, phone: null };
  }

  private mapCredential(row?: AccountRow): AccountCredentialRecord | null {
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      phone: row.phone,
      passwordHash: row.password_hash,
      status: row.status,
    };
  }

  private mapProfile(row?: AccountProfileRow): AccountProfileView | null {
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      phone: row.phone,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      headline: row.headline,
      bio: row.bio,
      timezone: row.timezone,
      language: row.language,
      profileUpdatedAt: row.profile_updated_at,
    };
  }
}

function normalizeNullable(value: string | null | undefined) {
  if (value === undefined) {
    return null;
  }

  const normalized = value?.trim();
  return normalized ? normalized : null;
}

// 从显示名派生用户名，加随机后缀避免冲突（OAuth 账号无邮箱时使用）
function deriveUsernameFromName(name: string): string {
  const prefix = name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 6);
  return prefix ? `${prefix}_${suffix}` : `user_${suffix}`;
}

// 从邮箱前缀派生用户名，加随机后缀避免冲突
function deriveUsername(email: string): string {
  const prefix = (email.split('@')[0] ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 6);
  return prefix ? `${prefix}_${suffix}` : `user_${suffix}`;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === '23505'
  );
}
