import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import type { Pool } from "pg";
import { IAM_PG_POOL } from "../tokens";
import type {
  AccountCredentialRecord,
  AccountProfileView,
  AccountReadRepository,
  AuthenticatedAccountView,
  CreateAccountInput,
  FindOrCreateByOAuthInput,
  UpdateAccountProfileInput,
} from "../types/iam.types";

interface AccountRow {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  status: string;
}

interface AccountCredentialRow extends AccountRow {
  password_hash: string | null;
}

interface AccountProfileRow extends AccountRow {
  password_hash: string | null;
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

  async findByIdentifier(
    identifier: string,
  ): Promise<AccountCredentialRecord | null> {
    const result = await this.pool.query<AccountCredentialRow>(
      `
        select
          a.id,
          a.username,
          a.email,
          a.phone,
          a.status,
          c.password_hash
        from identity.account a
        left join identity.account_credential c on c.account_id = a.id
        where a.deleted_at is null
          and a.status = 'active'
          and (
            lower(a.username) = lower($1)
            or lower(coalesce(a.email, '')) = lower($1)
            or coalesce(a.phone, '') = $1
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
          status
        from identity.account
        where id = $1
          and deleted_at is null
          and status = 'active'
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

  async findCredentialById(
    accountId: string,
  ): Promise<AccountCredentialRecord | null> {
    const result = await this.pool.query<AccountCredentialRow>(
      `
        select
          a.id,
          a.username,
          a.email,
          a.phone,
          a.status,
          c.password_hash
        from identity.account a
        left join identity.account_credential c on c.account_id = a.id
        where a.id = $1
          and a.deleted_at is null
          and a.status = 'active'
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
          a.status,
          c.password_hash,
          p.display_name,
          p.avatar_url,
          p.headline,
          p.bio,
          p.timezone,
          p.language,
          p.updated_at as profile_updated_at
        from identity.account a
        left join identity.account_credential c on c.account_id = a.id
        left join identity.account_profile p on p.account_id = a.id
        where a.id = $1
          and a.deleted_at is null
          and a.status = 'active'
        limit 1
      `,
      [accountId],
    );

    return this.mapProfile(result.rows[0]);
  }

  async updateProfile(
    accountId: string,
    input: UpdateAccountProfileInput,
  ): Promise<AccountProfileView | null> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");

      if (
        Object.prototype.hasOwnProperty.call(input, "email") ||
        Object.prototype.hasOwnProperty.call(input, "phone")
      ) {
        await client.query(
          `
            update identity.account
            set
              email = coalesce($2, email),
              phone = coalesce($3, phone),
              updated_at = now()
            where id = $1
              and deleted_at is null
          `,
          [
            accountId,
            normalizeNullable(input.email),
            normalizeNullable(input.phone),
          ],
        );
      }

      await client.query(
        `
          insert into identity.account_profile (
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

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    return this.getProfile(accountId);
  }

  async createPasswordResetToken(
    accountId: string,
    expiresAt: Date,
  ): Promise<string> {
    // 生成 64 字符随机 hex token，仅在此处可见，DB 存哈希
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await this.pool.query(
      `insert into identity.password_reset_token (account_id, token_hash, expires_at)
       values ($1, $2, $3)
       on conflict do nothing`,
      [accountId, tokenHash, expiresAt],
    );

    return rawToken;
  }

  async consumePasswordResetToken(token: string): Promise<string | null> {
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const result = await this.pool.query<{ account_id: string }>(
      `update identity.password_reset_token
       set used_at = now()
       where token_hash = $1
         and used_at is null
         and expires_at > now()
       returning account_id`,
      [tokenHash],
    );

    return result.rows[0]?.account_id ?? null;
  }

  async createAccount(
    input: CreateAccountInput,
  ): Promise<AuthenticatedAccountView> {
    const id = crypto.randomUUID();
    const username = deriveUsername(input.email);
    const email = input.email.toLowerCase().trim();

    const client = await this.pool.connect();
    try {
      await client.query("begin");

      await client.query(
        `insert into identity.account (id, username, email, status, created_at, updated_at)
         values ($1, $2, $3, 'active', now(), now())`,
        [id, username, email],
      );

      await client.query(
        `insert into identity.account_credential (account_id, password_hash, created_at, updated_at)
         values ($1, $2, now(), now())`,
        [id, input.passwordHash],
      );

      await client.query(
        `insert into identity.account_profile (account_id, display_name, created_at, updated_at)
         values ($1, $2, now(), now())`,
        [id, input.name.trim()],
      );

      await client.query("commit");
    } catch (error: unknown) {
      await client.query("rollback");
      if (isUniqueViolation(error)) {
        throw new ConflictException("该邮箱已被注册");
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
        insert into identity.account_credential (account_id, password_hash, created_at, updated_at)
        values ($1, $2, now(), now())
        on conflict (account_id) do update set
          password_hash = excluded.password_hash,
          password_changed_at = now(),
          updated_at = now()
      `,
      [accountId, passwordHash],
    );
  }

  async findOrCreateByOAuth(
    input: FindOrCreateByOAuthInput,
  ): Promise<AuthenticatedAccountView> {
    // 1. 通过 sso_connection 表查找已绑定账号
    const existing = await this.pool.query<{ account_id: string }>(
      `select account_id from identity.sso_connection
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
      await client.query("begin");

      await client.query(
        `insert into identity.account (id, username, email, status, created_at, updated_at)
         values ($1, $2, $3, 'active', now(), now())`,
        [id, username, input.email?.toLowerCase().trim() ?? null],
      );

      await client.query(
        `insert into identity.account_profile (account_id, display_name, avatar_url, created_at, updated_at)
         values ($1, $2, $3, now(), now())`,
        [id, input.name.trim(), input.avatarUrl ?? null],
      );

      await client.query(
        `insert into identity.sso_connection (account_id, provider, provider_account_id, provider_account_data, created_at, updated_at)
         values ($1, $2, $3, $4, now(), now())`,
        [id, input.provider, input.providerId, providerAccountData],
      );

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    return {
      id,
      username,
      email: input.email?.toLowerCase().trim() ?? null,
      phone: null,
    };
  }

  private mapCredential(
    row?: AccountCredentialRow,
  ): AccountCredentialRecord | null {
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

function deriveUsernameFromName(name: string): string {
  const prefix = name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 6);
  return prefix ? `${prefix}_${suffix}` : `user_${suffix}`;
}

function deriveUsername(email: string): string {
  const prefix = (email.split("@")[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 6);
  return prefix ? `${prefix}_${suffix}` : `user_${suffix}`;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}
