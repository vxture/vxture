-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "account";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "commerce";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "platform";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "product";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "support";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenancy";

-- CreateTable
CREATE TABLE "account"."account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(64) NOT NULL,
    "email" VARCHAR(128),
    "phone" VARCHAR(32),
    "password_hash" VARCHAR(255),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "last_login_ip" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account"."account_identity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "provider_account_id" VARCHAR(255) NOT NULL,
    "provider_account_data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "account_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account"."account_oauth_provider" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "client_id" VARCHAR(255),
    "client_secret" VARCHAR(255),
    "scope" VARCHAR(512),
    "auth_url" VARCHAR(512),
    "token_url" VARCHAR(512),
    "account_info_url" VARCHAR(512),
    "redirect_uri" VARCHAR(512),
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 999,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_oauth_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account"."account_oauth_state" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "state" VARCHAR(128) NOT NULL,
    "provider_code" VARCHAR(64) NOT NULL,
    "redirect_uri" VARCHAR(512) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_oauth_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account"."account_profile" (
    "account_id" UUID NOT NULL,
    "display_name" VARCHAR(96),
    "avatar_url" VARCHAR(512),
    "headline" VARCHAR(128),
    "bio" TEXT,
    "timezone" VARCHAR(64),
    "language" VARCHAR(32),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_profile_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "account"."password_reset_token" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."tenant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_code" VARCHAR(64) NOT NULL,
    "tenant_name" VARCHAR(128) NOT NULL,
    "display_name" VARCHAR(128),
    "tenant_type" VARCHAR(32) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'active',
    "created_by" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "approved_by" UUID,
    "logo_url" VARCHAR(512),
    "description" VARCHAR(1024),
    "language" VARCHAR(16) DEFAULT 'zh-CN',
    "time_zone" VARCHAR(64) DEFAULT 'Asia/Shanghai',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "status_reason" VARCHAR(512),
    "status_at" TIMESTAMPTZ(6),

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."tenant_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "config_key" VARCHAR(128) NOT NULL,
    "config_value" TEXT,
    "is_encrypted" BOOLEAN DEFAULT false,
    "description" VARCHAR(512),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "config_group" VARCHAR(100),
    "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "is_readonly" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "value_type" VARCHAR(20) NOT NULL DEFAULT 'string',

    CONSTRAINT "tenant_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."tenant_domain" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "domain" VARCHAR(256) NOT NULL,
    "domain_type" VARCHAR(32) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "ssl_status" VARCHAR(32) DEFAULT 'none',
    "verification_status" VARCHAR(32) DEFAULT 'pending',
    "verification_token" VARCHAR(128),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "verified_at" TIMESTAMPTZ(6),
    "token_expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "tenant_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."tenant_member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "role" VARCHAR(32) NOT NULL DEFAULT 'member',
    "is_primary_owner" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(32) NOT NULL DEFAULT 'active',
    "nickname" VARCHAR(128),
    "remark" VARCHAR(512),
    "joined_source" VARCHAR(64) DEFAULT 'created',
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "role_id" UUID,

    CONSTRAINT "tenant_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."tenant_organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "company_name" VARCHAR(256) NOT NULL,
    "unified_social_credit_code" VARCHAR(64),
    "business_license_url" VARCHAR(512),
    "industry" VARCHAR(128),
    "scale" VARCHAR(64),
    "contact_name" VARCHAR(128),
    "contact_phone" VARCHAR(64),
    "contact_email" VARCHAR(128),
    "province" VARCHAR(128),
    "city" VARCHAR(128),
    "district" VARCHAR(128),
    "address" VARCHAR(512),
    "verified_status" VARCHAR(32) DEFAULT 'unverified',
    "verified_at" TIMESTAMPTZ(6),
    "verified_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "rejected_reason" VARCHAR(512),
    "country_code" CHAR(2) NOT NULL DEFAULT 'CN',
    "postal_code" VARCHAR(16),

    CONSTRAINT "tenant_organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."tenant_ownership_transfer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "from_account_id" UUID NOT NULL,
    "to_account_id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "transfer_reason" VARCHAR(512),
    "remark" TEXT,
    "transfer_status" VARCHAR(32) DEFAULT 'success',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_ownership_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."tenant_permission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "permission_code" VARCHAR(128) NOT NULL,
    "permission_name" VARCHAR(128) NOT NULL,
    "parent_code" VARCHAR(128),
    "permission_type" VARCHAR(32) DEFAULT 'function',
    "description" VARCHAR(512),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "tenant_id" UUID,
    "permission_scope" VARCHAR(16) NOT NULL DEFAULT 'platform',
    "sort" INTEGER NOT NULL DEFAULT 999,

    CONSTRAINT "tenant_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."tenant_role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "role_code" VARCHAR(64) NOT NULL,
    "role_name" VARCHAR(128) NOT NULL,
    "description" VARCHAR(512),
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "status" VARCHAR(16) NOT NULL DEFAULT 'active',
    "sort" INTEGER NOT NULL DEFAULT 999,

    CONSTRAINT "tenant_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."tenant_role_permission" (
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "product"."agent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_code" VARCHAR(64) NOT NULL,
    "agent_name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "agent_type" VARCHAR(32) DEFAULT 'chat',
    "status" VARCHAR(32) NOT NULL DEFAULT 'draft',
    "visibility" VARCHAR(32) NOT NULL DEFAULT 'public',
    "agent_category" INTEGER DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort" INTEGER DEFAULT 0,
    "icon_url" VARCHAR(512),
    "config_json" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."agent_feature" (
    "agent_id" UUID NOT NULL,
    "feature_id" UUID NOT NULL,
    "is_required" BOOLEAN DEFAULT false,
    "status" BOOLEAN DEFAULT true,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "agent_feature_pkey" PRIMARY KEY ("agent_id","feature_id")
);

-- CreateTable
CREATE TABLE "product"."feature" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "feature_code" VARCHAR(128) NOT NULL,
    "feature_name" VARCHAR(128) NOT NULL,
    "parent_code" VARCHAR(128),
    "feature_type" VARCHAR(32) DEFAULT 'function',
    "description" TEXT,
    "status" BOOLEAN DEFAULT true,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."plan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_code" VARCHAR(64) NOT NULL,
    "plan_name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "plan_type" VARCHAR(32) DEFAULT 'normal',
    "level" INTEGER DEFAULT 0,
    "is_free" BOOLEAN DEFAULT false,
    "is_public" BOOLEAN DEFAULT true,
    "status" BOOLEAN DEFAULT true,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."plan_agent" (
    "plan_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "is_allowed" BOOLEAN DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "plan_agent_pkey" PRIMARY KEY ("agent_id","plan_id")
);

-- CreateTable
CREATE TABLE "product"."plan_feature" (
    "plan_id" UUID NOT NULL,
    "feature_id" UUID NOT NULL,
    "quota_value" BIGINT DEFAULT 0,
    "is_unlimited" BOOLEAN DEFAULT false,
    "config_json" JSONB,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "plan_feature_pkey" PRIMARY KEY ("plan_id","feature_id")
);

-- CreateTable
CREATE TABLE "product"."plan_price" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "price" DECIMAL(18,6) NOT NULL,
    "original_price" DECIMAL(18,6),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'CNY',
    "period_type" VARCHAR(20) NOT NULL,
    "period_value" INTEGER NOT NULL,
    "sort" INTEGER DEFAULT 100,
    "status" BOOLEAN DEFAULT true,
    "is_default" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "plan_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."platform_role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sort" INTEGER NOT NULL DEFAULT 999,
    "role_code" VARCHAR(64) NOT NULL,
    "name_i18n_key" VARCHAR(128) NOT NULL,
    "name_en" VARCHAR(128) NOT NULL,
    "description_i18n_key" VARCHAR(128),
    "description" VARCHAR(255) NOT NULL DEFAULT '',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "status_code" VARCHAR(32) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "platform_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."platform_admin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sort" INTEGER NOT NULL DEFAULT 999,
    "username" VARCHAR(64) NOT NULL,
    "phone" VARCHAR(32),
    "email" VARCHAR(128),
    "password_hash" VARCHAR(255) NOT NULL,
    "role_id" UUID NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "status_code" VARCHAR(32) NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ(6),
    "last_login_ip" VARCHAR(64),
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "updated_by" UUID,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "display_name" VARCHAR(50) NOT NULL DEFAULT '',
    "remark" VARCHAR(255),

    CONSTRAINT "platform_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."platform_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "config_key" VARCHAR(128) NOT NULL,
    "config_group" VARCHAR(64) NOT NULL,
    "config_value" TEXT NOT NULL,
    "description" TEXT,
    "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "is_readonly" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value_type" VARCHAR(20) NOT NULL DEFAULT 'string',
    "created_by" UUID,

    CONSTRAINT "platform_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."platform_permission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_id" UUID,
    "perm_code" VARCHAR(64) NOT NULL,
    "perm_name" VARCHAR(64) NOT NULL,
    "perm_type" VARCHAR(20) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(255) NOT NULL DEFAULT '',
    "icon" VARCHAR(64),
    "sort" INTEGER NOT NULL DEFAULT 999,
    "route_path" VARCHAR(255),
    "component" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_by" UUID NOT NULL,

    CONSTRAINT "platform_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."platform_role_permission" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" UUID,

    CONSTRAINT "platform_role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "platform"."governance_record" (
    "id" VARCHAR(64) NOT NULL,
    "kind" VARCHAR(32) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'normal',
    "scope" VARCHAR(160) NOT NULL,
    "owner" VARCHAR(120) NOT NULL,
    "policy" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source_table" VARCHAR(128),
    "source_id" VARCHAR(128),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_platform_governance_record" PRIMARY KEY ("kind","id")
);

-- CreateTable
CREATE TABLE "support"."ticket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_no" VARCHAR(64) NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" VARCHAR(32) NOT NULL DEFAULT 'open',
    "priority" VARCHAR(16) NOT NULL DEFAULT 'p2',
    "category" VARCHAR(64) NOT NULL DEFAULT 'general',
    "source" VARCHAR(64) NOT NULL DEFAULT 'admin',
    "reporter_name" VARCHAR(100),
    "assignee_name" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMPTZ(6),
    "resolved_at" TIMESTAMPTZ(6),
    "closed_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support"."ticket_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "event_type" VARCHAR(64) NOT NULL,
    "actor_id" UUID,
    "actor_name" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."tenant_invoice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "bill_no" VARCHAR(64) NOT NULL,
    "subscription_id" UUID,
    "bill_cycle" VARCHAR(8) NOT NULL,
    "cycle_start_date" DATE NOT NULL,
    "cycle_end_date" DATE NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) DEFAULT 0,
    "payable_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(12,2) DEFAULT 0,
    "currency" VARCHAR(16) DEFAULT 'CNY',
    "bill_status" VARCHAR(32) NOT NULL DEFAULT 'unpaid',
    "bill_type" VARCHAR(32) DEFAULT 'normal',
    "paid_at" TIMESTAMPTZ(6),
    "payment_method" VARCHAR(64),
    "transaction_no" VARCHAR(128),
    "operator_id" UUID,
    "operate_remark" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tenant_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."tenant_invoice_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bill_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID,
    "feature_id" UUID,
    "subscription_id" UUID,
    "item_name" VARCHAR(128) NOT NULL,
    "item_type" VARCHAR(32) NOT NULL,
    "item_unit" VARCHAR(64),
    "quantity" DECIMAL(12,4) DEFAULT 1,
    "unit_price" DECIMAL(12,4) DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "usage_record_id" UUID,
    "remark" VARCHAR(512),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tenant_invoice_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."tenant_invoice_receipt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "invoice_no" VARCHAR(64) NOT NULL,
    "invoice_type" VARCHAR(32) NOT NULL,
    "invoice_tax_type" VARCHAR(32) NOT NULL,
    "invoice_title" VARCHAR(256) NOT NULL,
    "tax_no" VARCHAR(128),
    "company_info" JSONB NOT NULL,
    "bank_info" JSONB,
    "address_info" JSONB,
    "invoice_amount" DECIMAL(12,2) NOT NULL,
    "tax_amount" DECIMAL(12,2) DEFAULT 0,
    "currency" VARCHAR(16) DEFAULT 'CNY',
    "invoice_status" VARCHAR(32) NOT NULL DEFAULT 'applying',
    "status_remark" TEXT,
    "invoice_code" VARCHAR(64),
    "invoice_electronic_no" VARCHAR(64),
    "invoice_file_url" TEXT,
    "issued_at" TIMESTAMPTZ(6),
    "express_company" VARCHAR(64),
    "express_no" VARCHAR(64),
    "send_at" TIMESTAMPTZ(6),
    "created_by" UUID NOT NULL,
    "auditor_id" UUID,
    "audit_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tenant_invoice_receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."tenant_payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "pay_order_no" VARCHAR(64) NOT NULL,
    "pay_source" VARCHAR(32) NOT NULL DEFAULT 'online',
    "pay_channel" VARCHAR(32),
    "pay_method" VARCHAR(32),
    "offline_pay_type" VARCHAR(32),
    "offline_payer_name" VARCHAR(128),
    "offline_pay_time" TIMESTAMPTZ(6),
    "offline_evidence_url" TEXT,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) DEFAULT 0,
    "currency" VARCHAR(16) DEFAULT 'CNY',
    "pay_status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "status_msg" TEXT,
    "channel_order_no" VARCHAR(128),
    "channel_transaction_no" VARCHAR(128),
    "channel_raw_data" JSONB,
    "pay_expire_at" TIMESTAMPTZ(6),
    "paid_at" TIMESTAMPTZ(6),
    "closed_at" TIMESTAMPTZ(6),
    "operator_id" UUID,
    "operate_remark" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."tenant_refund" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "pay_record_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "refund_no" VARCHAR(64) NOT NULL,
    "refund_amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(16) DEFAULT 'CNY',
    "refund_reason" VARCHAR(512),
    "refund_type" VARCHAR(32) DEFAULT 'normal',
    "audit_status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "audit_remark" TEXT,
    "auditor_id" UUID,
    "audit_at" TIMESTAMPTZ(6),
    "channel_refund_no" VARCHAR(128),
    "refund_status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "refund_at" TIMESTAMPTZ(6),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."tenant_subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "cycle_type" VARCHAR(32) NOT NULL DEFAULT 'monthly',
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6),
    "trial_end_at" TIMESTAMPTZ(6),
    "status" VARCHAR(32) NOT NULL DEFAULT 'active',
    "auto_renew" BOOLEAN DEFAULT true,
    "order_no" VARCHAR(128),
    "pay_amount" DECIMAL(12,2),
    "currency" VARCHAR(16) DEFAULT 'CNY',
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tenant_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."tenant_subscription_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "change_type" VARCHAR(32) NOT NULL,
    "from_plan_id" UUID,
    "to_plan_id" UUID,
    "from_status" VARCHAR(32),
    "to_status" VARCHAR(32),
    "operator_type" VARCHAR(32) NOT NULL DEFAULT 'system',
    "operator_id" UUID,
    "operator_remark" VARCHAR(512),
    "client_ip" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_subscription_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."tenant_subscription_override" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "agent_id" UUID,
    "feature_id" UUID NOT NULL,
    "custom_quota" BIGINT NOT NULL DEFAULT 0,
    "is_unlimited" BOOLEAN DEFAULT false,
    "is_enabled" BOOLEAN DEFAULT true,
    "effective_start_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_end_at" TIMESTAMPTZ(6),
    "reason" VARCHAR(512),
    "operator_remark" TEXT,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tenant_subscription_override_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."tenant_transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "bill_id" UUID,
    "transaction_no" VARCHAR(64) NOT NULL,
    "trade_type" VARCHAR(32) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(16) DEFAULT 'CNY',
    "balance_before" DECIMAL(12,2) NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "trade_status" VARCHAR(32) NOT NULL DEFAULT 'success',
    "related_no" VARCHAR(128),
    "remark" VARCHAR(512),
    "operator_id" UUID,
    "client_ip" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "tenant_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_username_key" ON "account"."account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"."account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_phone_key" ON "account"."account"("phone");

-- CreateIndex
CREATE INDEX "idx_account_email" ON "account"."account"("email");

-- CreateIndex
CREATE INDEX "idx_account_phone" ON "account"."account"("phone");

-- CreateIndex
CREATE INDEX "idx_account_status" ON "account"."account"("status");

-- CreateIndex
CREATE INDEX "idx_account_deleted_at" ON "account"."account"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_account_identities_account_id" ON "account"."account_identity"("account_id");

-- CreateIndex
CREATE INDEX "idx_account_identities_provider" ON "account"."account_identity"("provider");

-- CreateIndex
CREATE INDEX "idx_account_identities_provider_account_id" ON "account"."account_identity"("provider_account_id");

-- CreateIndex
CREATE INDEX "idx_account_identities_deleted_at" ON "account"."account_identity"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "account_identities_account_id_provider_key" ON "account"."account_identity"("account_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "account_identities_provider_provider_account_id_key" ON "account"."account_identity"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_providers_code_key" ON "account"."account_oauth_provider"("code");

-- CreateIndex
CREATE INDEX "oauth_providers_is_enabled_idx" ON "account"."account_oauth_provider"("is_enabled");

-- CreateIndex
CREATE INDEX "oauth_providers_sort_idx" ON "account"."account_oauth_provider"("sort");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_states_state_key" ON "account"."account_oauth_state"("state");

-- CreateIndex
CREATE INDEX "oauth_states_expires_at_idx" ON "account"."account_oauth_state"("expires_at");

-- CreateIndex
CREATE INDEX "oauth_states_provider_code_idx" ON "account"."account_oauth_state"("provider_code");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_token_hash_key" ON "account"."password_reset_token"("token_hash");

-- CreateIndex
CREATE INDEX "idx_password_reset_token_account_id" ON "account"."password_reset_token"("account_id");

-- CreateIndex
CREATE INDEX "idx_password_reset_token_expires_at" ON "account"."password_reset_token"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_tenant_code_key" ON "tenancy"."tenant"("tenant_code");

-- CreateIndex
CREATE INDEX "idx_tenants_created_by" ON "tenancy"."tenant"("created_by");

-- CreateIndex
CREATE INDEX "idx_tenants_deleted_at" ON "tenancy"."tenant"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_tenants_status" ON "tenancy"."tenant"("status");

-- CreateIndex
CREATE INDEX "idx_tenants_tenant_name" ON "tenancy"."tenant"("tenant_name");

-- CreateIndex
CREATE INDEX "idx_tenants_tenant_type" ON "tenancy"."tenant"("tenant_type");

-- CreateIndex
CREATE INDEX "idx_tc_config_key" ON "tenancy"."tenant_config"("config_key");

-- CreateIndex
CREATE INDEX "idx_tc_deleted_at" ON "tenancy"."tenant_config"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_tc_tenant_group" ON "tenancy"."tenant_config"("tenant_id", "config_group");

-- CreateIndex
CREATE INDEX "idx_tc_tenant_id" ON "tenancy"."tenant_config"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_configs_tenant_id_config_key_key" ON "tenancy"."tenant_config"("tenant_id", "config_key");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_domains_domain_key" ON "tenancy"."tenant_domain"("domain");

-- CreateIndex
CREATE INDEX "idx_td_deleted_at" ON "tenancy"."tenant_domain"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_td_domain" ON "tenancy"."tenant_domain"("domain");

-- CreateIndex
CREATE INDEX "idx_td_tenant_id" ON "tenancy"."tenant_domain"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_tm_account_id" ON "tenancy"."tenant_member"("account_id");

-- CreateIndex
CREATE INDEX "idx_tm_deleted_at" ON "tenancy"."tenant_member"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_tm_is_primary_owner" ON "tenancy"."tenant_member"("is_primary_owner");

-- CreateIndex
CREATE INDEX "idx_tm_role" ON "tenancy"."tenant_member"("role");

-- CreateIndex
CREATE INDEX "idx_tm_role_id" ON "tenancy"."tenant_member"("role_id");

-- CreateIndex
CREATE INDEX "idx_tm_status" ON "tenancy"."tenant_member"("status");

-- CreateIndex
CREATE INDEX "idx_tm_tenant_id" ON "tenancy"."tenant_member"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_members_tenant_id_user_id_key" ON "tenancy"."tenant_member"("tenant_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_organizations_tenant_id_key" ON "tenancy"."tenant_organization"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_to_deleted_at" ON "tenancy"."tenant_organization"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_to_tenant_id" ON "tenancy"."tenant_organization"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_to_verified_status" ON "tenancy"."tenant_organization"("verified_status");

-- CreateIndex
CREATE INDEX "idx_tot_from_account_id" ON "tenancy"."tenant_ownership_transfer"("from_account_id");

-- CreateIndex
CREATE INDEX "idx_tot_tenant_id" ON "tenancy"."tenant_ownership_transfer"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_tot_to_account_id" ON "tenancy"."tenant_ownership_transfer"("to_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_permissions_permission_code_key" ON "tenancy"."tenant_permission"("permission_code");

-- CreateIndex
CREATE INDEX "idx_tp_deleted_at" ON "tenancy"."tenant_permission"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_tp_parent_code" ON "tenancy"."tenant_permission"("parent_code");

-- CreateIndex
CREATE INDEX "idx_tp_permission_code" ON "tenancy"."tenant_permission"("permission_code");

-- CreateIndex
CREATE INDEX "idx_tp_sort" ON "tenancy"."tenant_permission"("sort");

-- CreateIndex
CREATE INDEX "idx_tr_deleted_at" ON "tenancy"."tenant_role"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_tr_role_code" ON "tenancy"."tenant_role"("role_code");

-- CreateIndex
CREATE INDEX "idx_tr_sort" ON "tenancy"."tenant_role"("sort");

-- CreateIndex
CREATE INDEX "idx_tr_status" ON "tenancy"."tenant_role"("status");

-- CreateIndex
CREATE INDEX "idx_tr_tenant_id" ON "tenancy"."tenant_role"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_roles_tenant_id_role_code_key" ON "tenancy"."tenant_role"("tenant_id", "role_code");

-- CreateIndex
CREATE INDEX "idx_trp_permission_id" ON "tenancy"."tenant_role_permission"("permission_id");

-- CreateIndex
CREATE INDEX "idx_trp_role_id" ON "tenancy"."tenant_role_permission"("role_id");

-- CreateIndex
CREATE INDEX "idx_trp_tenant_id" ON "tenancy"."tenant_role_permission"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_code_key" ON "product"."agent"("agent_code");

-- CreateIndex
CREATE INDEX "idx_agents_agent_category" ON "product"."agent"("agent_category");

-- CreateIndex
CREATE INDEX "idx_agents_agent_code" ON "product"."agent"("agent_code");

-- CreateIndex
CREATE INDEX "idx_agents_created_by" ON "product"."agent"("created_by");

-- CreateIndex
CREATE INDEX "idx_agents_deleted_at" ON "product"."agent"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_agents_status" ON "product"."agent"("status");

-- CreateIndex
CREATE INDEX "idx_agents_visibility" ON "product"."agent"("visibility");

-- CreateIndex
CREATE INDEX "idx_paf_agent_id" ON "product"."agent_feature"("agent_id");

-- CreateIndex
CREATE INDEX "idx_paf_feature_id" ON "product"."agent_feature"("feature_id");

-- CreateIndex
CREATE INDEX "idx_paf_deleted_at" ON "product"."agent_feature"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "feature_code_key" ON "product"."feature"("feature_code");

-- CreateIndex
CREATE INDEX "idx_features_deleted_at" ON "product"."feature"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_features_feature_code" ON "product"."feature"("feature_code");

-- CreateIndex
CREATE INDEX "idx_features_parent_code" ON "product"."feature"("parent_code");

-- CreateIndex
CREATE UNIQUE INDEX "plan_code_key" ON "product"."plan"("plan_code");

-- CreateIndex
CREATE INDEX "idx_plans_deleted_at" ON "product"."plan"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_plans_plan_code" ON "product"."plan"("plan_code");

-- CreateIndex
CREATE INDEX "idx_plans_status" ON "product"."plan"("status");

-- CreateIndex
CREATE INDEX "idx_ppa_agent_id" ON "product"."plan_agent"("agent_id");

-- CreateIndex
CREATE INDEX "idx_ppa_plan_id" ON "product"."plan_agent"("plan_id");

-- CreateIndex
CREATE INDEX "idx_ppa_deleted_at" ON "product"."plan_agent"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_ppf_plan_id" ON "product"."plan_feature"("plan_id");

-- CreateIndex
CREATE INDEX "idx_ppf_feature_id" ON "product"."plan_feature"("feature_id");

-- CreateIndex
CREATE INDEX "idx_ppf_deleted_at" ON "product"."plan_feature"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_plan_price_plan_id" ON "product"."plan_price"("plan_id");

-- CreateIndex
CREATE INDEX "idx_plan_price_status" ON "product"."plan_price"("status");

-- CreateIndex
CREATE INDEX "idx_plan_price_deleted" ON "product"."plan_price"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "uk_plan_price_period" ON "product"."plan_price"("plan_id", "period_type", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "uk_role_code" ON "platform"."platform_role"("role_code");

-- CreateIndex
CREATE INDEX "idx_platform_role_sort" ON "platform"."platform_role"("sort");

-- CreateIndex
CREATE INDEX "idx_platform_role_status_code" ON "platform"."platform_role"("status_code");

-- CreateIndex
CREATE INDEX "idx_platform_role_name_i18n_key" ON "platform"."platform_role"("name_i18n_key");

-- CreateIndex
CREATE UNIQUE INDEX "uk_admin_username" ON "platform"."platform_admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "uk_admin_phone" ON "platform"."platform_admin"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "uk_admin_email" ON "platform"."platform_admin"("email");

-- CreateIndex
CREATE INDEX "idx_platform_admin_deleted_at" ON "platform"."platform_admin"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_platform_admin_email" ON "platform"."platform_admin"("email");

-- CreateIndex
CREATE INDEX "idx_platform_admin_phone" ON "platform"."platform_admin"("phone");

-- CreateIndex
CREATE INDEX "idx_platform_admin_role_id" ON "platform"."platform_admin"("role_id");

-- CreateIndex
CREATE INDEX "idx_platform_admin_sort" ON "platform"."platform_admin"("sort");

-- CreateIndex
CREATE INDEX "idx_platform_admin_status" ON "platform"."platform_admin"("status");

-- CreateIndex
CREATE INDEX "idx_platform_admin_status_code" ON "platform"."platform_admin"("status_code");

-- CreateIndex
CREATE UNIQUE INDEX "uk_platform_config_key" ON "platform"."platform_config"("config_key");

-- CreateIndex
CREATE INDEX "idx_platform_config_group" ON "platform"."platform_config"("config_group");

-- CreateIndex
CREATE UNIQUE INDEX "uk_perm_code" ON "platform"."platform_permission"("perm_code");

-- CreateIndex
CREATE INDEX "idx_perm_parent_id" ON "platform"."platform_permission"("parent_id");

-- CreateIndex
CREATE INDEX "idx_perm_sort" ON "platform"."platform_permission"("sort");

-- CreateIndex
CREATE INDEX "idx_perm_status" ON "platform"."platform_permission"("status");

-- CreateIndex
CREATE INDEX "idx_perm_type" ON "platform"."platform_permission"("perm_type");

-- CreateIndex
CREATE INDEX "idx_platform_governance_kind_status" ON "platform"."governance_record"("kind", "status");

-- CreateIndex
CREATE INDEX "idx_platform_governance_kind_updated" ON "platform"."governance_record"("kind", "updated_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_support_ticket_no" ON "support"."ticket"("ticket_no");

-- CreateIndex
CREATE INDEX "idx_support_ticket_tenant_status" ON "support"."ticket"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "idx_support_ticket_priority_updated" ON "support"."ticket"("priority", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_support_ticket_deleted_at" ON "support"."ticket"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_support_ticket_event_ticket_created" ON "support"."ticket_event"("ticket_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_bill_bill_no_key" ON "commerce"."tenant_invoice"("bill_no");

-- CreateIndex
CREATE INDEX "idx_tenant_bill_tenant_cycle" ON "commerce"."tenant_invoice"("tenant_id", "bill_cycle");

-- CreateIndex
CREATE INDEX "idx_ti_cycle" ON "commerce"."tenant_invoice"("bill_cycle");

-- CreateIndex
CREATE INDEX "idx_ti_deleted_at" ON "commerce"."tenant_invoice"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_ti_invoice_no" ON "commerce"."tenant_invoice"("bill_no");

-- CreateIndex
CREATE INDEX "idx_ti_status" ON "commerce"."tenant_invoice"("bill_status");

-- CreateIndex
CREATE INDEX "idx_ti_tenant_id" ON "commerce"."tenant_invoice"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_tii_agent_id" ON "commerce"."tenant_invoice_item"("agent_id");

-- CreateIndex
CREATE INDEX "idx_tii_deleted_at" ON "commerce"."tenant_invoice_item"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_tii_invoice_id" ON "commerce"."tenant_invoice_item"("bill_id");

-- CreateIndex
CREATE INDEX "idx_tii_item_type" ON "commerce"."tenant_invoice_item"("item_type");

-- CreateIndex
CREATE INDEX "idx_tii_tenant_id" ON "commerce"."tenant_invoice_item"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_bill_invoice_invoice_no_key" ON "commerce"."tenant_invoice_receipt"("invoice_no");

-- CreateIndex
CREATE INDEX "idx_tbi_invoice_no" ON "commerce"."tenant_invoice_receipt"("invoice_no");

-- CreateIndex
CREATE INDEX "idx_tbi_invoice_status" ON "commerce"."tenant_invoice_receipt"("invoice_status");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_bill_payment_pay_order_no_key" ON "commerce"."tenant_payment"("pay_order_no");

-- CreateIndex
CREATE INDEX "idx_tp_invoice_id" ON "commerce"."tenant_payment"("bill_id");

-- CreateIndex
CREATE INDEX "idx_tp_pay_order_no" ON "commerce"."tenant_payment"("pay_order_no");

-- CreateIndex
CREATE INDEX "idx_tp_pay_status" ON "commerce"."tenant_payment"("pay_status");

-- CreateIndex
CREATE INDEX "idx_tp_tenant_id" ON "commerce"."tenant_payment"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_bill_refund_refund_no_key" ON "commerce"."tenant_refund"("refund_no");

-- CreateIndex
CREATE INDEX "idx_tr_audit_status" ON "commerce"."tenant_refund"("audit_status");

-- CreateIndex
CREATE INDEX "idx_tr_refund_no" ON "commerce"."tenant_refund"("refund_no");

-- CreateIndex
CREATE INDEX "idx_tr_tenant_id" ON "commerce"."tenant_refund"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_ts_deleted_at" ON "commerce"."tenant_subscription"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_ts_end_at" ON "commerce"."tenant_subscription"("end_at");

-- CreateIndex
CREATE INDEX "idx_ts_plan_id" ON "commerce"."tenant_subscription"("plan_id");

-- CreateIndex
CREATE INDEX "idx_ts_status" ON "commerce"."tenant_subscription"("status");

-- CreateIndex
CREATE INDEX "idx_ts_tenant_id" ON "commerce"."tenant_subscription"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_tscl_change_type" ON "commerce"."tenant_subscription_history"("change_type");

-- CreateIndex
CREATE INDEX "idx_tscl_created_at" ON "commerce"."tenant_subscription_history"("created_at");

-- CreateIndex
CREATE INDEX "idx_tscl_subscription_id" ON "commerce"."tenant_subscription_history"("subscription_id");

-- CreateIndex
CREATE INDEX "idx_tscl_tenant_id" ON "commerce"."tenant_subscription_history"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_tsc_agent_id" ON "commerce"."tenant_subscription_override"("agent_id");

-- CreateIndex
CREATE INDEX "idx_tsc_deleted_at" ON "commerce"."tenant_subscription_override"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_tsc_feature_id" ON "commerce"."tenant_subscription_override"("feature_id");

-- CreateIndex
CREATE INDEX "idx_tsc_is_enabled" ON "commerce"."tenant_subscription_override"("is_enabled");

-- CreateIndex
CREATE INDEX "idx_tsc_tenant_id" ON "commerce"."tenant_subscription_override"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_sub_customs_tenant_id_agent_id_feature_id_key" ON "commerce"."tenant_subscription_override"("tenant_id", "agent_id", "feature_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_bill_transaction_transaction_no_key" ON "commerce"."tenant_transaction"("transaction_no");

-- CreateIndex
CREATE INDEX "idx_tt_tenant_id" ON "commerce"."tenant_transaction"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_tt_trade_type" ON "commerce"."tenant_transaction"("trade_type");

-- CreateIndex
CREATE INDEX "idx_tt_transaction_no" ON "commerce"."tenant_transaction"("transaction_no");

-- AddForeignKey
ALTER TABLE "account"."account_identity" ADD CONSTRAINT "account_identity_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"."account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account"."account_profile" ADD CONSTRAINT "account_profile_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"."account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account"."password_reset_token" ADD CONSTRAINT "password_reset_token_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"."account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."tenant_config" ADD CONSTRAINT "tenant_config_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenancy"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."tenant_domain" ADD CONSTRAINT "tenant_domain_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenancy"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."tenant_member" ADD CONSTRAINT "tenant_member_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenancy"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."tenant_member" ADD CONSTRAINT "tenant_member_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "tenancy"."tenant_role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."tenant_organization" ADD CONSTRAINT "tenant_organization_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenancy"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."tenant_ownership_transfer" ADD CONSTRAINT "tenant_ownership_transfer_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenancy"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."tenant_role" ADD CONSTRAINT "tenant_role_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenancy"."tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."tenant_role_permission" ADD CONSTRAINT "tenant_role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "tenancy"."tenant_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."tenant_role_permission" ADD CONSTRAINT "tenant_role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "tenancy"."tenant_permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."agent_feature" ADD CONSTRAINT "agent_feature_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "product"."agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."agent_feature" ADD CONSTRAINT "agent_feature_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "product"."feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."plan_agent" ADD CONSTRAINT "plan_agent_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "product"."plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."plan_agent" ADD CONSTRAINT "plan_agent_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "product"."agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."plan_feature" ADD CONSTRAINT "plan_feature_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "product"."plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."plan_feature" ADD CONSTRAINT "plan_feature_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "product"."feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."plan_price" ADD CONSTRAINT "plan_price_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "product"."plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."platform_admin" ADD CONSTRAINT "platform_admin_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "platform"."platform_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."platform_permission" ADD CONSTRAINT "platform_permission_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "platform"."platform_permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."platform_role_permission" ADD CONSTRAINT "platform_role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "platform"."platform_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."platform_role_permission" ADD CONSTRAINT "platform_role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "platform"."platform_permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support"."ticket_event" ADD CONSTRAINT "ticket_event_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support"."ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce"."tenant_invoice_item" ADD CONSTRAINT "tenant_invoice_item_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "commerce"."tenant_invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce"."tenant_payment" ADD CONSTRAINT "tenant_payment_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "commerce"."tenant_invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce"."tenant_subscription_history" ADD CONSTRAINT "tenant_subscription_history_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "commerce"."tenant_subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

