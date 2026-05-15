-- ═══════════════════════════════════════════════════════════════
-- Migration: 0001_schema_migration
-- Based on platform-db.md v1.3.0
-- Covers: schema renames, table renames, column changes, new tables
-- ═══════════════════════════════════════════════════════════════

-- ── Phase 1: Rename schemas ────────────────────────────────────
ALTER SCHEMA "account"  RENAME TO "identity";
ALTER SCHEMA "tenancy"  RENAME TO "tenant";
ALTER SCHEMA "platform" RENAME TO "ops";

-- ── Phase 2: Create new schemas ───────────────────────────────
CREATE SCHEMA IF NOT EXISTS "iam";
CREATE SCHEMA IF NOT EXISTS "model";

-- ═══════════════════════════════════════════════════════════════
-- identity schema
-- ═══════════════════════════════════════════════════════════════

-- Rename tables
ALTER TABLE "identity"."account_identity"       RENAME TO "sso_connection";
ALTER TABLE "identity"."account_oauth_provider" RENAME TO "oauth_provider";
ALTER TABLE "identity"."account_oauth_state"    RENAME TO "oauth_state";

-- Rename old index names to match new convention
ALTER INDEX "identity"."idx_account_identities_account_id"                   RENAME TO "idx_sso_connection_account_id";
ALTER INDEX "identity"."idx_account_identities_provider"                     RENAME TO "idx_sso_connection_provider";
ALTER INDEX "identity"."idx_account_identities_provider_account_id"          RENAME TO "idx_sso_connection_provider_account_id";
ALTER INDEX "identity"."idx_account_identities_deleted_at"                   RENAME TO "idx_sso_connection_deleted_at";
ALTER INDEX "identity"."account_identities_account_id_provider_key"          RENAME TO "sso_connection_account_id_provider_key";
ALTER INDEX "identity"."account_identities_provider_provider_account_id_key" RENAME TO "sso_connection_provider_provider_account_id_key";
ALTER INDEX "identity"."oauth_providers_code_key"                            RENAME TO "oauth_provider_code_key";
ALTER INDEX "identity"."oauth_providers_is_enabled_idx"                      RENAME TO "idx_oauth_provider_is_enabled";
ALTER INDEX "identity"."oauth_providers_sort_idx"                            RENAME TO "idx_oauth_provider_sort";
ALTER INDEX "identity"."oauth_states_state_key"                              RENAME TO "oauth_state_state_key";
ALTER INDEX "identity"."oauth_states_expires_at_idx"                         RENAME TO "idx_oauth_state_expires_at";
ALTER INDEX "identity"."oauth_states_provider_code_idx"                      RENAME TO "idx_oauth_state_provider_code";

-- identity.account: convert status BOOLEAN → VARCHAR(32), add security fields
ALTER TABLE "identity"."account"
  ALTER COLUMN "status" TYPE VARCHAR(32)
  USING CASE WHEN "status" = true THEN 'active' ELSE 'inactive' END;
ALTER TABLE "identity"."account" ALTER COLUMN "status" SET DEFAULT 'active';

ALTER TABLE "identity"."account"
  ADD COLUMN IF NOT EXISTS "account_source"      VARCHAR(32) NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS "email_verified_at"   TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "phone_verified_at"   TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "login_count"         INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "login_failure_count" INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "mfa_enabled"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "locked_until"        TIMESTAMPTZ(6);

CREATE INDEX "idx_account_source" ON "identity"."account"("account_source");

-- Create account_credential before dropping password_hash from account
CREATE TABLE "identity"."account_credential" (
    "account_id"            UUID NOT NULL,
    "password_hash"         VARCHAR(255),
    "mfa_secret"            VARCHAR(255),
    "mfa_recovery_codes"    TEXT[] NOT NULL DEFAULT '{}',
    "force_password_change" BOOLEAN NOT NULL DEFAULT false,
    "password_changed_at"   TIMESTAMPTZ(6),
    "created_at"            TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_credential_pkey" PRIMARY KEY ("account_id")
);

-- Migrate existing password_hash values to account_credential
INSERT INTO "identity"."account_credential" ("account_id", "password_hash", "created_at", "updated_at")
SELECT "id", "password_hash", "created_at", CURRENT_TIMESTAMP
FROM "identity"."account"
WHERE "password_hash" IS NOT NULL;

ALTER TABLE "identity"."account_credential"
  ADD CONSTRAINT "account_credential_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "identity"."account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop password_hash from account now that it lives in account_credential
ALTER TABLE "identity"."account" DROP COLUMN "password_hash";

-- identity.account_profile: add country_code and metadata
ALTER TABLE "identity"."account_profile"
  ADD COLUMN IF NOT EXISTS "country_code" CHAR(2),
  ADD COLUMN IF NOT EXISTS "metadata"     JSONB;

-- identity.oauth_state: add PKCE / OIDC fields
ALTER TABLE "identity"."oauth_state"
  ADD COLUMN IF NOT EXISTS "code_verifier" VARCHAR(128),
  ADD COLUMN IF NOT EXISTS "nonce"         VARCHAR(128),
  ADD COLUMN IF NOT EXISTS "ip_address"    VARCHAR(64);

-- New identity tables

-- account_session: JWT revocation blacklist, append-only
CREATE TABLE "identity"."account_session" (
    "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id"    UUID NOT NULL,
    "jti"           VARCHAR(128) NOT NULL,
    "revoke_reason" VARCHAR(64) NOT NULL,
    "expires_at"    TIMESTAMPTZ(6) NOT NULL,
    "created_at"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "account_session_jti_key"        ON "identity"."account_session"("jti");
CREATE INDEX        "idx_account_session_account_id" ON "identity"."account_session"("account_id");
CREATE INDEX        "idx_account_session_expires_at" ON "identity"."account_session"("expires_at");

-- account_verification: email/phone OTP, append-only
CREATE TABLE "identity"."account_verification" (
    "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id"    UUID,
    "target_type"   VARCHAR(16) NOT NULL,
    "target"        VARCHAR(128) NOT NULL,
    "purpose"       VARCHAR(32) NOT NULL,
    "code_hash"     VARCHAR(64) NOT NULL,
    "attempt_count" INT NOT NULL DEFAULT 0,
    "expires_at"    TIMESTAMPTZ(6) NOT NULL,
    "used_at"       TIMESTAMPTZ(6),
    "created_at"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_verification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_account_verification_account_id"     ON "identity"."account_verification"("account_id");
CREATE INDEX "idx_account_verification_target_expires" ON "identity"."account_verification"("target", "expires_at");

-- login_attempt: rate-limiting / risk, append-only
CREATE TABLE "identity"."login_attempt" (
    "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id"   UUID,
    "identity"     VARCHAR(128) NOT NULL,
    "auth_method"  VARCHAR(32) NOT NULL DEFAULT 'password',
    "result"       VARCHAR(32) NOT NULL,
    "ip_address"   VARCHAR(64) NOT NULL,
    "country_code" CHAR(2),
    "user_agent"   VARCHAR(512),
    "created_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_login_attempt_identity_created" ON "identity"."login_attempt"("identity", "created_at" DESC);
CREATE INDEX "idx_login_attempt_ip_created"       ON "identity"."login_attempt"("ip_address", "created_at" DESC);
CREATE INDEX "idx_login_attempt_account_id"       ON "identity"."login_attempt"("account_id");

-- ═══════════════════════════════════════════════════════════════
-- tenant schema
-- ═══════════════════════════════════════════════════════════════

-- Rename tenant_config → tenant_setting
ALTER TABLE "tenant"."tenant_config" RENAME TO "tenant_setting";

-- Rename associated indexes to match new table name
ALTER INDEX "tenant"."idx_tc_config_key"    RENAME TO "idx_tset_config_key";
ALTER INDEX "tenant"."idx_tc_deleted_at"    RENAME TO "idx_tset_deleted_at";
ALTER INDEX "tenant"."idx_tc_tenant_group"  RENAME TO "idx_tset_tenant_group";
ALTER INDEX "tenant"."idx_tc_tenant_id"     RENAME TO "idx_tset_tenant_id";
ALTER INDEX "tenant"."tenant_configs_tenant_id_config_key_key" RENAME TO "tenant_settings_tenant_id_config_key_key";
ALTER TABLE "tenant"."tenant_setting"
  RENAME CONSTRAINT "tenant_config_pkey" TO "tenant_setting_pkey";
ALTER TABLE "tenant"."tenant_setting"
  RENAME CONSTRAINT "tenant_config_tenant_id_fkey" TO "tenant_setting_tenant_id_fkey";

-- Add is_encrypted to tenant_setting
ALTER TABLE "tenant"."tenant_setting"
  ADD COLUMN IF NOT EXISTS "is_encrypted" BOOLEAN NOT NULL DEFAULT false;

-- tenant.tenant: add PLG / ownership / region fields
ALTER TABLE "tenant"."tenant"
  ADD COLUMN IF NOT EXISTS "region"           VARCHAR(64) NOT NULL DEFAULT 'cn-hangzhou',
  ADD COLUMN IF NOT EXISTS "source"           VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "owner_account_id" UUID,
  ADD COLUMN IF NOT EXISTS "is_trial"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "trial_ends_at"    TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "converted_at"     TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "metadata"         JSONB;

CREATE INDEX "idx_tenants_is_trial" ON "tenant"."tenant"("is_trial");

ALTER TABLE "tenant"."tenant"
  ADD CONSTRAINT "tenant_owner_account_id_fkey"
  FOREIGN KEY ("owner_account_id") REFERENCES "identity"."account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- tenant.tenant_member: drop role_id FK + column, add invited_by and metadata
ALTER TABLE "tenant"."tenant_member"
  DROP CONSTRAINT "tenant_member_role_id_fkey";

DROP INDEX "tenant"."idx_tm_role_id";

ALTER TABLE "tenant"."tenant_member" DROP COLUMN "role_id";

ALTER TABLE "tenant"."tenant_member"
  ADD COLUMN IF NOT EXISTS "invited_by" UUID,
  ADD COLUMN IF NOT EXISTS "metadata"   JSONB;

ALTER TABLE "tenant"."tenant_member"
  ADD CONSTRAINT "tenant_member_invited_by_fkey"
  FOREIGN KEY ("invited_by") REFERENCES "identity"."account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- New tenant tables

-- tenant_invitation
CREATE TABLE "tenant"."tenant_invitation" (
    "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   UUID NOT NULL,
    "target_type" VARCHAR(16) NOT NULL,
    "target"      VARCHAR(128) NOT NULL,
    "role"        VARCHAR(32) NOT NULL,
    "status"      VARCHAR(32) NOT NULL DEFAULT 'pending',
    "token_hash"  VARCHAR(64) NOT NULL,
    "expires_at"  TIMESTAMPTZ(6) NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "created_by"  UUID NOT NULL,
    "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_invitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_invitation_token_hash_key" ON "tenant"."tenant_invitation"("token_hash");
CREATE INDEX        "idx_tinv_tenant_id"               ON "tenant"."tenant_invitation"("tenant_id");
CREATE INDEX        "idx_tinv_status"                  ON "tenant"."tenant_invitation"("status");
CREATE INDEX        "idx_tinv_expires_at"              ON "tenant"."tenant_invitation"("expires_at");

ALTER TABLE "tenant"."tenant_invitation"
  ADD CONSTRAINT "tenant_invitation_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenant"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- iam schema: tables moved from tenant schema
-- ═══════════════════════════════════════════════════════════════

-- Move and rename: tenant_role → iam.role
ALTER TABLE "tenant"."tenant_role" SET SCHEMA "iam";
ALTER TABLE "iam"."tenant_role" RENAME TO "role";

-- Move and rename: tenant_permission → iam.permission
ALTER TABLE "tenant"."tenant_permission" SET SCHEMA "iam";
ALTER TABLE "iam"."tenant_permission" RENAME TO "permission";

-- Move and rename: tenant_role_permission → iam.role_permission
ALTER TABLE "tenant"."tenant_role_permission" SET SCHEMA "iam";
ALTER TABLE "iam"."tenant_role_permission" RENAME TO "role_permission";

-- Rename indexes after table moves and renames
ALTER INDEX "idx_tr_deleted_at"  RENAME TO "idx_iam_role_deleted_at";
ALTER INDEX "idx_tr_role_code"   RENAME TO "idx_iam_role_code";
ALTER INDEX "idx_tr_sort"        RENAME TO "idx_iam_role_sort";
ALTER INDEX "idx_tr_status"      RENAME TO "idx_iam_role_status";
ALTER INDEX "idx_tr_tenant_id"   RENAME TO "idx_iam_role_tenant_id";
ALTER INDEX "tenant_roles_tenant_id_role_code_key" RENAME TO "iam_role_tenant_id_role_code_key";
ALTER INDEX "idx_tp_deleted_at"       RENAME TO "idx_iam_perm_deleted_at";
ALTER INDEX "idx_tp_parent_code"      RENAME TO "idx_iam_perm_parent_code";
ALTER INDEX "idx_tp_permission_code"  RENAME TO "idx_iam_perm_code";
ALTER INDEX "idx_tp_sort"             RENAME TO "idx_iam_perm_sort";
ALTER INDEX "tenant_permissions_permission_code_key" RENAME TO "iam_permission_code_key";
ALTER INDEX "idx_trp_permission_id" RENAME TO "idx_iam_rp_permission_id";
ALTER INDEX "idx_trp_role_id"       RENAME TO "idx_iam_rp_role_id";
ALTER INDEX "idx_trp_tenant_id"     RENAME TO "idx_iam_rp_tenant_id";

-- iam.role: add ui_config
ALTER TABLE "iam"."role"
  ADD COLUMN IF NOT EXISTS "ui_config" JSONB;

-- iam.permission: remove tenant-scoped columns, rename status → is_active, add new fields
ALTER TABLE "iam"."permission" DROP COLUMN "tenant_id";
ALTER TABLE "iam"."permission" DROP COLUMN "permission_scope";
ALTER TABLE "iam"."permission" RENAME COLUMN "status" TO "is_active";
ALTER TABLE "iam"."permission"
  ADD COLUMN IF NOT EXISTS "module"     VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "is_visible" BOOLEAN NOT NULL DEFAULT true;

DROP INDEX IF EXISTS "idx_tp_status";
CREATE INDEX "idx_iam_perm_module" ON "iam"."permission"("module");

-- New iam tables

-- member_role_binding: member → role many-to-many, hard delete
CREATE TABLE "iam"."member_role_binding" (
    "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"  UUID NOT NULL,
    "member_id"  UUID NOT NULL,
    "role_id"    UUID NOT NULL,
    "granted_by" UUID,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_role_binding_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "iam_member_role_binding_member_role_key" ON "iam"."member_role_binding"("member_id", "role_id");
CREATE INDEX        "idx_iam_mrb_member_id"                   ON "iam"."member_role_binding"("member_id");
CREATE INDEX        "idx_iam_mrb_role_id"                     ON "iam"."member_role_binding"("role_id");
CREATE INDEX        "idx_iam_mrb_tenant_id"                   ON "iam"."member_role_binding"("tenant_id");

ALTER TABLE "iam"."member_role_binding"
  ADD CONSTRAINT "iam_mrb_member_id_fkey"
  FOREIGN KEY ("member_id") REFERENCES "tenant"."tenant_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "iam"."member_role_binding"
  ADD CONSTRAINT "iam_mrb_role_id_fkey"
  FOREIGN KEY ("role_id") REFERENCES "iam"."role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- capability: platform capability catalog
CREATE TABLE "iam"."capability" (
    "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
    "capability_code" VARCHAR(128) NOT NULL,
    "category"        VARCHAR(64) NOT NULL,
    "capability_name" VARCHAR(128) NOT NULL,
    "description"     VARCHAR(512),
    "unit"            VARCHAR(32),
    "default_limit"   BIGINT,
    "is_active"       BOOLEAN NOT NULL DEFAULT true,
    "is_metered"      BOOLEAN NOT NULL DEFAULT false,
    "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "iam_capability_code_key" ON "iam"."capability"("capability_code");
CREATE INDEX        "idx_iam_cap_category"    ON "iam"."capability"("category");
CREATE INDEX        "idx_iam_cap_is_active"   ON "iam"."capability"("is_active");

-- plan_capability: plan → capability mapping, composite PK, hard delete
CREATE TABLE "iam"."plan_capability" (
    "plan_id"        UUID NOT NULL,
    "capability_id"  UUID NOT NULL,
    "limit_override" BIGINT,
    "created_by"     UUID,
    "created_at"     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_capability_pkey" PRIMARY KEY ("plan_id", "capability_id")
);

CREATE INDEX "idx_iam_pc_plan_id"       ON "iam"."plan_capability"("plan_id");
CREATE INDEX "idx_iam_pc_capability_id" ON "iam"."plan_capability"("capability_id");

ALTER TABLE "iam"."plan_capability"
  ADD CONSTRAINT "plan_capability_capability_id_fkey"
  FOREIGN KEY ("capability_id") REFERENCES "iam"."capability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- ops schema
-- ═══════════════════════════════════════════════════════════════

-- Rename tables (strip platform_ prefix)
ALTER TABLE "ops"."platform_role"            RENAME TO "role";
ALTER TABLE "ops"."platform_admin"           RENAME TO "admin";
ALTER TABLE "ops"."platform_config"          RENAME TO "setting";
ALTER TABLE "ops"."platform_permission"      RENAME TO "permission";
ALTER TABLE "ops"."platform_role_permission" RENAME TO "role_permission";

-- ops.role: merge status BOOLEAN + status_code VARCHAR → status VARCHAR(32)
-- status_code is the authoritative value; fall back to boolean → 'active'/'disabled'
ALTER TABLE "ops"."role"
  ALTER COLUMN "status" TYPE VARCHAR(32)
  USING COALESCE(NULLIF("status_code", ''), CASE WHEN "status" = true THEN 'active' ELSE 'disabled' END);
ALTER TABLE "ops"."role" ALTER COLUMN "status" SET DEFAULT 'active';
ALTER TABLE "ops"."role" DROP COLUMN "status_code";

DROP INDEX "ops"."idx_platform_role_status_code";
DROP INDEX "ops"."idx_platform_role_sort";
DROP INDEX "ops"."idx_platform_role_name_i18n_key";

CREATE INDEX "idx_ops_role_sort"   ON "ops"."role"("sort");
CREATE INDEX "idx_ops_role_status" ON "ops"."role"("status");

-- ops.admin: merge status BOOLEAN + status_code VARCHAR → status VARCHAR(32)
ALTER TABLE "ops"."admin"
  ALTER COLUMN "status" TYPE VARCHAR(32)
  USING COALESCE(NULLIF("status_code", ''), CASE WHEN "status" = true THEN 'active' ELSE 'disabled' END);
ALTER TABLE "ops"."admin" ALTER COLUMN "status" SET DEFAULT 'active';
ALTER TABLE "ops"."admin" DROP COLUMN "status_code";

DROP INDEX "ops"."idx_platform_admin_deleted_at";
DROP INDEX "ops"."idx_platform_admin_email";
DROP INDEX "ops"."idx_platform_admin_phone";
DROP INDEX "ops"."idx_platform_admin_role_id";
DROP INDEX "ops"."idx_platform_admin_sort";
DROP INDEX "ops"."idx_platform_admin_status";
DROP INDEX "ops"."idx_platform_admin_status_code";

-- Add security fields to ops.admin
ALTER TABLE "ops"."admin"
  ADD COLUMN IF NOT EXISTS "login_failure_count" INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "mfa_enabled"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "locked_until"        TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMPTZ(6);

CREATE INDEX "idx_ops_admin_deleted_at" ON "ops"."admin"("deleted_at");
CREATE INDEX "idx_ops_admin_email"      ON "ops"."admin"("email");
CREATE INDEX "idx_ops_admin_phone"      ON "ops"."admin"("phone");
CREATE INDEX "idx_ops_admin_role_id"    ON "ops"."admin"("role_id");
CREATE INDEX "idx_ops_admin_sort"       ON "ops"."admin"("sort");
CREATE INDEX "idx_ops_admin_status"     ON "ops"."admin"("status");

-- ops.permission: rename status → is_active, add is_visible
ALTER TABLE "ops"."permission" RENAME COLUMN "status" TO "is_active";
ALTER TABLE "ops"."permission" ADD COLUMN IF NOT EXISTS "is_visible" BOOLEAN NOT NULL DEFAULT true;

DROP INDEX "ops"."idx_perm_status";
DROP INDEX "ops"."idx_perm_parent_id";
DROP INDEX "ops"."idx_perm_sort";
DROP INDEX "ops"."idx_perm_type";

CREATE INDEX "idx_ops_perm_parent_id" ON "ops"."permission"("parent_id");
CREATE INDEX "idx_ops_perm_sort"      ON "ops"."permission"("sort");
CREATE INDEX "idx_ops_perm_type"      ON "ops"."permission"("perm_type");

-- ops.role_permission: drop update-audit columns (no update semantics on this table)
ALTER TABLE "ops"."role_permission" DROP COLUMN "updated_at";
ALTER TABLE "ops"."role_permission" DROP COLUMN "updated_by";

-- ops.setting: add is_encrypted and validation_rule (from platform_config)
DROP INDEX "ops"."idx_platform_config_group";
DROP INDEX "ops"."uk_platform_config_key";

ALTER TABLE "ops"."setting"
  ADD COLUMN IF NOT EXISTS "is_encrypted"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "validation_rule" VARCHAR(512);

CREATE UNIQUE INDEX "uk_ops_setting_key"     ON "ops"."setting"("config_key");
CREATE INDEX        "idx_ops_setting_group"  ON "ops"."setting"("config_group");

-- ops.governance_record: rename indexes to match new schema prefix
ALTER INDEX "ops"."idx_platform_governance_kind_status"  RENAME TO "idx_ops_governance_kind_status";
ALTER INDEX "ops"."idx_platform_governance_kind_updated" RENAME TO "idx_ops_governance_kind_updated";
ALTER TABLE "ops"."governance_record" RENAME CONSTRAINT "pk_platform_governance_record" TO "pk_ops_governance_record";

-- New ops tables

-- feature_flag
CREATE TABLE "ops"."feature_flag" (
    "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
    "flag_key"            VARCHAR(128) NOT NULL,
    "category"            VARCHAR(64) NOT NULL DEFAULT 'release',
    "environment"         VARCHAR(32) NOT NULL DEFAULT 'all',
    "description"         VARCHAR(512),
    "is_globally_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_archived"         BOOLEAN NOT NULL DEFAULT false,
    "rollout_percentage"  INT NOT NULL DEFAULT 0,
    "tenant_overrides"    JSONB NOT NULL DEFAULT '{}',
    "expires_at"          TIMESTAMPTZ(6),
    "created_by"          UUID,
    "updated_by"          UUID,
    "created_at"          TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ops_feature_flag_key_key" ON "ops"."feature_flag"("flag_key");
CREATE INDEX        "idx_ops_ff_category"      ON "ops"."feature_flag"("category");
CREATE INDEX        "idx_ops_ff_environment"   ON "ops"."feature_flag"("environment");

-- announcement
CREATE TABLE "ops"."announcement" (
    "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
    "announcement_type"   VARCHAR(32) NOT NULL,
    "severity"            VARCHAR(16) NOT NULL DEFAULT 'info',
    "status"              VARCHAR(32) NOT NULL DEFAULT 'draft',
    "lang"                VARCHAR(16) NOT NULL DEFAULT 'zh-CN',
    "title"               VARCHAR(256) NOT NULL,
    "content"             TEXT NOT NULL,
    "cta_label"           VARCHAR(64),
    "cta_url"             VARCHAR(512),
    "target_plans"        VARCHAR(64)[] NOT NULL DEFAULT '{}',
    "target_tenant_types" VARCHAR(32)[] NOT NULL DEFAULT '{}',
    "is_dismissible"      BOOLEAN NOT NULL DEFAULT true,
    "publish_at"          TIMESTAMPTZ(6) NOT NULL,
    "expires_at"          TIMESTAMPTZ(6),
    "meta"                JSONB,
    "created_by"          UUID NOT NULL,
    "created_at"          TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at"          TIMESTAMPTZ(6),

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_ops_ann_publish_at" ON "ops"."announcement"("publish_at");
CREATE INDEX "idx_ops_ann_status"     ON "ops"."announcement"("status");

-- maintenance
CREATE TABLE "ops"."maintenance" (
    "id"                 UUID NOT NULL DEFAULT gen_random_uuid(),
    "severity"           VARCHAR(16) NOT NULL DEFAULT 'minor',
    "status"             VARCHAR(32) NOT NULL DEFAULT 'scheduled',
    "title"              VARCHAR(256) NOT NULL,
    "description"        TEXT,
    "impact_description" TEXT,
    "affected_services"  VARCHAR(64)[] NOT NULL DEFAULT '{}',
    "start_at"           TIMESTAMPTZ(6) NOT NULL,
    "end_at"             TIMESTAMPTZ(6) NOT NULL,
    "actual_end_at"      TIMESTAMPTZ(6),
    "created_by"         UUID NOT NULL,
    "updated_by"         UUID,
    "created_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_ops_maint_start_at" ON "ops"."maintenance"("start_at");
CREATE INDEX "idx_ops_maint_status"   ON "ops"."maintenance"("status");

-- ═══════════════════════════════════════════════════════════════
-- model schema (all new — migrated from ai_gateway)
-- ═══════════════════════════════════════════════════════════════

-- model.provider
CREATE TABLE "model"."provider" (
    "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider_code" VARCHAR(64) NOT NULL,
    "provider_type" VARCHAR(32) NOT NULL DEFAULT 'online',
    "provider_name" VARCHAR(128) NOT NULL,
    "description"   VARCHAR(512),
    "logo_url"      TEXT,
    "homepage_url"  TEXT,
    "console_url"   TEXT,
    "billing_url"   TEXT,
    "is_active"     BOOLEAN NOT NULL DEFAULT true,
    "config"        JSONB,
    "created_by"    UUID,
    "updated_by"    UUID,
    "created_at"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at"    TIMESTAMPTZ(6),

    CONSTRAINT "model_provider_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "model_provider_code_key"      ON "model"."provider"("provider_code");
CREATE INDEX        "idx_model_provider_is_active" ON "model"."provider"("is_active");
CREATE INDEX        "idx_model_provider_type"      ON "model"."provider"("provider_type");

-- model.model (table name is "model", Prisma model name is ModelDefinition)
CREATE TABLE "model"."model" (
    "id"                UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider_id"       UUID,
    "model_code"        VARCHAR(128) NOT NULL,
    "provider"          VARCHAR(64) NOT NULL,
    "model_type"        VARCHAR(32) NOT NULL DEFAULT 'chat',
    "protocol"          VARCHAR(64) NOT NULL,
    "model_name"        VARCHAR(128) NOT NULL,
    "description"       VARCHAR(512),
    "endpoint_url"      TEXT NOT NULL,
    "context_window"    INT,
    "max_output_tokens" INT,
    "capabilities"      VARCHAR[] NOT NULL DEFAULT '{}',
    "supports_streaming" BOOLEAN NOT NULL DEFAULT true,
    "is_active"         BOOLEAN NOT NULL DEFAULT true,
    "sort"              INT NOT NULL DEFAULT 999,
    "config"            JSONB,
    "created_by"        UUID,
    "updated_by"        UUID,
    "created_at"        TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at"        TIMESTAMPTZ(6),

    CONSTRAINT "model_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "model_definition_code_key" ON "model"."model"("model_code");
CREATE INDEX        "idx_model_def_is_active"   ON "model"."model"("is_active");
CREATE INDEX        "idx_model_def_type"        ON "model"."model"("model_type");
CREATE INDEX        "idx_model_def_provider"    ON "model"."model"("provider");
CREATE INDEX        "idx_model_def_provider_id" ON "model"."model"("provider_id");

ALTER TABLE "model"."model"
  ADD CONSTRAINT "model_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES "model"."provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- model.model_grant
CREATE TABLE "model"."model_grant" (
    "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
    "model_id"   UUID NOT NULL,
    "tenant_id"  UUID NOT NULL,
    "agent_id"   UUID,
    "priority"   INT NOT NULL DEFAULT 100,
    "is_active"  BOOLEAN NOT NULL DEFAULT true,
    "reason"     VARCHAR(512),
    "expires_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "model_grant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_model_grant_agent"     ON "model"."model_grant"("agent_id");
CREATE INDEX "idx_model_grant_is_active" ON "model"."model_grant"("is_active");
CREATE INDEX "idx_model_grant_model"     ON "model"."model_grant"("model_id");
CREATE INDEX "idx_model_grant_tenant"    ON "model"."model_grant"("tenant_id");

ALTER TABLE "model"."model_grant"
  ADD CONSTRAINT "model_grant_model_id_fkey"
  FOREIGN KEY ("model_id") REFERENCES "model"."model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- model.model_price_rule
CREATE TABLE "model"."model_price_rule" (
    "id"                 UUID NOT NULL DEFAULT gen_random_uuid(),
    "model_id"           UUID NOT NULL,
    "billing_mode"       VARCHAR(32) NOT NULL DEFAULT 'token',
    "currency"           VARCHAR(16) NOT NULL DEFAULT 'CNY',
    "unit_tokens"        INT NOT NULL DEFAULT 1000000,
    "input_unit_price"   DECIMAL(18,8) NOT NULL DEFAULT 0,
    "output_unit_price"  DECIMAL(18,8) NOT NULL DEFAULT 0,
    "request_unit_price" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "is_active"          BOOLEAN NOT NULL DEFAULT true,
    "effective_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at"         TIMESTAMPTZ(6),
    "created_by"         UUID,
    "updated_by"         UUID,
    "created_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_price_rule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_model_price_effective" ON "model"."model_price_rule"("effective_at");
CREATE INDEX "idx_model_price_is_active" ON "model"."model_price_rule"("is_active");
CREATE INDEX "idx_model_price_model"     ON "model"."model_price_rule"("model_id");

ALTER TABLE "model"."model_price_rule"
  ADD CONSTRAINT "model_price_rule_model_id_fkey"
  FOREIGN KEY ("model_id") REFERENCES "model"."model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- model.model_policy
CREATE TABLE "model"."model_policy" (
    "id"                 UUID NOT NULL DEFAULT gen_random_uuid(),
    "model_id"           UUID NOT NULL,
    "tenant_id"          UUID,
    "name"               VARCHAR(128),
    "priority"           INT NOT NULL DEFAULT 100,
    "max_concurrent"     INT,
    "rate_limit_rpm"     INT,
    "rate_limit_tpm"     BIGINT,
    "rate_limit_tpd"     BIGINT,
    "max_context_tokens" INT,
    "is_active"          BOOLEAN NOT NULL DEFAULT true,
    "effective_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at"         TIMESTAMPTZ(6),
    "created_by"         UUID,
    "updated_by"         UUID,
    "created_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_policy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "model_policy_model_tenant_key" ON "model"."model_policy"("model_id", "tenant_id");
CREATE INDEX        "idx_model_policy_is_active"    ON "model"."model_policy"("is_active");
CREATE INDEX        "idx_model_policy_model"        ON "model"."model_policy"("model_id");
CREATE INDEX        "idx_model_policy_tenant"       ON "model"."model_policy"("tenant_id");

ALTER TABLE "model"."model_policy"
  ADD CONSTRAINT "model_policy_model_id_fkey"
  FOREIGN KEY ("model_id") REFERENCES "model"."model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- commerce schema: new tables
-- ═══════════════════════════════════════════════════════════════

-- tenant_credit: balance snapshot with optimistic lock
CREATE TABLE "commerce"."tenant_credit" (
    "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "currency"       VARCHAR(16) NOT NULL DEFAULT 'CNY',
    "balance"        DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_granted"  DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_consumed" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "version"        INT NOT NULL DEFAULT 0,
    "updated_at"     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_credit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_credit_tenant_id_key" ON "commerce"."tenant_credit"("tenant_id");
CREATE INDEX        "idx_tc_credit_tenant_id"     ON "commerce"."tenant_credit"("tenant_id");

-- tenant_billing_address: invoice title info
CREATE TABLE "commerce"."tenant_billing_address" (
    "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"    UUID NOT NULL,
    "invoice_type" VARCHAR(32) NOT NULL,
    "title"        VARCHAR(256) NOT NULL,
    "tax_no"       VARCHAR(64),
    "phone"        VARCHAR(64),
    "address"      VARCHAR(512),
    "bank_name"    VARCHAR(256),
    "bank_account" VARCHAR(256),
    "is_default"   BOOLEAN NOT NULL DEFAULT false,
    "created_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at"   TIMESTAMPTZ(6),

    CONSTRAINT "tenant_billing_address_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_tba_tenant_id" ON "commerce"."tenant_billing_address"("tenant_id");

-- tenant_payment_method: bound payment methods
CREATE TABLE "commerce"."tenant_payment_method" (
    "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"    UUID NOT NULL,
    "method_type"  VARCHAR(32) NOT NULL,
    "status"       VARCHAR(32) NOT NULL DEFAULT 'active',
    "display_name" VARCHAR(128) NOT NULL,
    "external_id"  VARCHAR(256),
    "is_default"   BOOLEAN NOT NULL DEFAULT false,
    "last_used_at" TIMESTAMPTZ(6),
    "created_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at"   TIMESTAMPTZ(6),

    CONSTRAINT "tenant_payment_method_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_tpm_tenant_id" ON "commerce"."tenant_payment_method"("tenant_id");
CREATE INDEX "idx_tpm_status"    ON "commerce"."tenant_payment_method"("status");

-- ═══════════════════════════════════════════════════════════════
-- support schema: column additions and new tables
-- ═══════════════════════════════════════════════════════════════

-- support.ticket: add account_id, assignee_id, SLA/CSAT/tag fields
ALTER TABLE "support"."ticket"
  ADD COLUMN IF NOT EXISTS "account_id"           UUID,
  ADD COLUMN IF NOT EXISTS "assignee_id"          UUID,
  ADD COLUMN IF NOT EXISTS "tags"                 VARCHAR(64)[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "satisfaction_score"   INT,
  ADD COLUMN IF NOT EXISTS "satisfaction_comment" VARCHAR(512),
  ADD COLUMN IF NOT EXISTS "sla_breach_at"        TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "first_response_at"    TIMESTAMPTZ(6);

-- support.ticket_event: add actor_type
ALTER TABLE "support"."ticket_event"
  ADD COLUMN IF NOT EXISTS "actor_type" VARCHAR(32) NOT NULL DEFAULT 'admin';

-- audit_log: operation audit, append-only, partitioned by month (partition by DDL)
CREATE TABLE "support"."audit_log" (
    "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_type"    VARCHAR(32) NOT NULL,
    "actor_id"      UUID NOT NULL,
    "tenant_id"     UUID,
    "action"        VARCHAR(128) NOT NULL,
    "result"        VARCHAR(32) NOT NULL DEFAULT 'success',
    "resource_type" VARCHAR(64) NOT NULL,
    "resource_id"   VARCHAR(128) NOT NULL,
    "error_code"    VARCHAR(64),
    "before"        JSONB,
    "after"         JSONB,
    "request_id"    VARCHAR(128),
    "duration_ms"   INT,
    "ip_address"    VARCHAR(64),
    "user_agent"    VARCHAR(512),
    "created_at"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_audit_log_actor_id"   ON "support"."audit_log"("actor_id");
CREATE INDEX "idx_audit_log_action"     ON "support"."audit_log"("action");
CREATE INDEX "idx_audit_log_created_at" ON "support"."audit_log"("created_at");
CREATE INDEX "idx_audit_log_request_id" ON "support"."audit_log"("request_id");
CREATE INDEX "idx_audit_log_tenant_id"  ON "support"."audit_log"("tenant_id");

-- notification_log: notification delivery log, append-only
CREATE TABLE "support"."notification_log" (
    "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"           UUID,
    "account_id"          UUID,
    "channel"             VARCHAR(32) NOT NULL,
    "template_code"       VARCHAR(64) NOT NULL,
    "status"              VARCHAR(32) NOT NULL,
    "reference_type"      VARCHAR(64),
    "reference_id"        VARCHAR(128),
    "recipient"           VARCHAR(256) NOT NULL,
    "subject"             VARCHAR(256),
    "provider"            VARCHAR(64),
    "provider_message_id" VARCHAR(256),
    "error_message"       TEXT,
    "retry_count"         INT NOT NULL DEFAULT 0,
    "delivered_at"        TIMESTAMPTZ(6),
    "opened_at"           TIMESTAMPTZ(6),
    "created_at"          TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_notif_log_account_id" ON "support"."notification_log"("account_id");
CREATE INDEX "idx_notif_log_tenant_id"  ON "support"."notification_log"("tenant_id");
CREATE INDEX "idx_notif_log_status"     ON "support"."notification_log"("status");
CREATE INDEX "idx_notif_log_channel"    ON "support"."notification_log"("channel");
CREATE INDEX "idx_notif_log_created_at" ON "support"."notification_log"("created_at");
