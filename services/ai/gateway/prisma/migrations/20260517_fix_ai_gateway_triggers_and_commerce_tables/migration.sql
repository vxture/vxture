-- Remediation migration: fixes broken triggers and creates missing commerce tables.
-- Run this on servers where 20260425_ai_gateway_control_plane was partially applied.
-- All statements are idempotent (IF NOT EXISTS / OR REPLACE / DROP IF EXISTS).

-- ── 1. ai_gateway.set_updated_at function ────────────────────────────────────
-- The original migration referenced commerce.set_updated_at() which did not exist.
-- We create ai_gateway.set_updated_at() and rewire all 4 triggers to use it.

CREATE OR REPLACE FUNCTION ai_gateway.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── 2. Fix triggers on ai_gateway tables ─────────────────────────────────────

DROP TRIGGER IF EXISTS trg_ai_provider_updated ON ai_gateway.ai_provider;
CREATE TRIGGER trg_ai_provider_updated
BEFORE UPDATE ON ai_gateway.ai_provider
FOR EACH ROW
EXECUTE PROCEDURE ai_gateway.set_updated_at();

DROP TRIGGER IF EXISTS trg_ai_model_updated ON ai_gateway.ai_model;
CREATE TRIGGER trg_ai_model_updated
BEFORE UPDATE ON ai_gateway.ai_model
FOR EACH ROW
EXECUTE PROCEDURE ai_gateway.set_updated_at();

DROP TRIGGER IF EXISTS trg_ai_model_grant_updated ON ai_gateway.ai_model_grant;
CREATE TRIGGER trg_ai_model_grant_updated
BEFORE UPDATE ON ai_gateway.ai_model_grant
FOR EACH ROW
EXECUTE PROCEDURE ai_gateway.set_updated_at();

DROP TRIGGER IF EXISTS trg_ai_model_cost_rate_updated ON ai_gateway.ai_model_cost_rate;
CREATE TRIGGER trg_ai_model_cost_rate_updated
BEFORE UPDATE ON ai_gateway.ai_model_cost_rate
FOR EACH ROW
EXECUTE PROCEDURE ai_gateway.set_updated_at();

-- ── 3. commerce schema and set_updated_at function ───────────────────────────

CREATE SCHEMA IF NOT EXISTS commerce;

CREATE OR REPLACE FUNCTION commerce.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── 4. commerce.tenant_subscription_quota ────────────────────────────────────

CREATE TABLE IF NOT EXISTS commerce.tenant_subscription_quota (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid        NOT NULL,
  subscription_id      uuid,
  max_users            int         NOT NULL DEFAULT 10,
  max_api_keys         int         NOT NULL DEFAULT 5,
  max_workflows        int         NOT NULL DEFAULT 20,
  max_concurrent       int         NOT NULL DEFAULT 5,
  rate_limit_per_minute int        NOT NULL DEFAULT 60,
  period_tokens        bigint      NOT NULL DEFAULT 1000000,
  quota_cycle          varchar(32) NOT NULL DEFAULT 'monthly',
  allowed_models       text[]      NOT NULL DEFAULT '{}',
  allow_custom_model   boolean     NOT NULL DEFAULT false,
  created_by           uuid,
  updated_by           uuid,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  effective_at         timestamptz NOT NULL DEFAULT now(),
  expires_at           timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_subscription_quota_tenant_id_key
  ON commerce.tenant_subscription_quota (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tsq_tenant_id
  ON commerce.tenant_subscription_quota (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tsq_subscription_id
  ON commerce.tenant_subscription_quota (subscription_id)
  WHERE subscription_id IS NOT NULL;

-- ── 5. commerce.tenant_usage_event ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commerce.tenant_usage_event (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid        NOT NULL,
  agent_id    uuid        NOT NULL,
  feature_id  uuid        NOT NULL,
  user_id     uuid,
  used_quota  bigint      NOT NULL DEFAULT 0,
  input_quota bigint               DEFAULT 0,
  output_quota bigint              DEFAULT 0,
  request_id  varchar(128),
  business_id varchar(128),
  usage_type  varchar(32) NOT NULL DEFAULT 'normal',
  cycle_date  date        NOT NULL,
  cycle_month varchar(6)  NOT NULL,
  model_code  varchar(64),
  latency_ms  int,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tue_request_id_not_null
  ON commerce.tenant_usage_event (request_id)
  WHERE request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tue_tenant_id    ON commerce.tenant_usage_event (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tue_agent_id     ON commerce.tenant_usage_event (agent_id);
CREATE INDEX IF NOT EXISTS idx_tue_feature_id   ON commerce.tenant_usage_event (feature_id);
CREATE INDEX IF NOT EXISTS idx_tue_user_id      ON commerce.tenant_usage_event (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tue_cycle_date   ON commerce.tenant_usage_event (cycle_date);
CREATE INDEX IF NOT EXISTS idx_tue_cycle_month  ON commerce.tenant_usage_event (cycle_month);
CREATE INDEX IF NOT EXISTS idx_tue_model_code   ON commerce.tenant_usage_event (model_code) WHERE model_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tue_request_id   ON commerce.tenant_usage_event (request_id) WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tue_business_id  ON commerce.tenant_usage_event (business_id) WHERE business_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tue_tenant_month ON commerce.tenant_usage_event (tenant_id, cycle_month);

-- ── 6. commerce.tenant_usage_summary ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commerce.tenant_usage_summary (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid        NOT NULL,
  feature_id    uuid        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  agent_id      uuid        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  cycle_month   varchar(6)  NOT NULL,
  total_quota   bigint      NOT NULL DEFAULT 0,
  input_quota   bigint      NOT NULL DEFAULT 0,
  output_quota  bigint      NOT NULL DEFAULT 0,
  request_count bigint      NOT NULL DEFAULT 0,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  stat_type     varchar(32) NOT NULL DEFAULT 'detail',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_usage_summary_unique
  ON commerce.tenant_usage_summary (tenant_id, feature_id, agent_id, cycle_month, stat_type);
CREATE INDEX IF NOT EXISTS idx_tus_tenant_id   ON commerce.tenant_usage_summary (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tus_agent_id    ON commerce.tenant_usage_summary (agent_id);
CREATE INDEX IF NOT EXISTS idx_tus_feature_id  ON commerce.tenant_usage_summary (feature_id);
CREATE INDEX IF NOT EXISTS idx_tus_cycle_month ON commerce.tenant_usage_summary (cycle_month);
CREATE INDEX IF NOT EXISTS idx_tus_stat_type   ON commerce.tenant_usage_summary (stat_type);
CREATE INDEX IF NOT EXISTS idx_tus_tenant_month ON commerce.tenant_usage_summary (tenant_id, cycle_month);
