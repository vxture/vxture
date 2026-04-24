import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { IAM_PG_POOL } from '../tokens';
import type {
  AccountCredentialRecord,
  AccountProfileView,
  AccountReadRepository,
  AuthenticatedAccountView,
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
  private profileTableEnsured = false;

  constructor(@Inject(IAM_PG_POOL) private readonly pool: Pool) {}

  async findByIdentifier(identifier: string): Promise<AccountCredentialRecord | null> {
    await this.ensureProfileTable();
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
    await this.ensureProfileTable();
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
    await this.ensureProfileTable();
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
    await this.ensureProfileTable();
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
    await this.ensureProfileTable();

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

  private async ensureProfileTable() {
    if (this.profileTableEnsured) {
      return;
    }

    await this.pool.query(`
      create table if not exists account.account_profile (
        account_id uuid primary key references account.account(id) on delete cascade,
        display_name varchar(96),
        avatar_url varchar(512),
        headline varchar(128),
        bio text,
        timezone varchar(64),
        language varchar(32),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);
    this.profileTableEnsured = true;
  }
}

function normalizeNullable(value: string | null | undefined) {
  if (value === undefined) {
    return null;
  }

  const normalized = value?.trim();
  return normalized ? normalized : null;
}
