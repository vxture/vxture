CREATE SCHEMA IF NOT EXISTS ai_gateway;

-- ai_gateway schema owns its own updated_at trigger function
CREATE OR REPLACE FUNCTION ai_gateway.set_updated_at()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS ai_gateway.ai_provider (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_code varchar(64) NOT NULL UNIQUE,
  provider_name varchar(128) NOT NULL,
  provider_type varchar(32) NOT NULL DEFAULT 'online',
  homepage_url text,
  console_url text,
  billing_url text,
  is_active boolean NOT NULL DEFAULT true,
  config jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT chk_ai_provider_type CHECK (provider_type IN ('online', 'private', 'proxy'))
);

COMMENT ON TABLE ai_gateway.ai_provider IS 'Upstream model service provider controlled by Vxture.';
COMMENT ON COLUMN ai_gateway.ai_provider.provider_code IS 'Provider code such as doubao, claude, openai, private.';
COMMENT ON COLUMN ai_gateway.ai_provider.provider_type IS 'online=public provider, private=self-hosted/provider in customer or Vxture environment, proxy=compatible proxy.';
COMMENT ON COLUMN ai_gateway.ai_provider.config IS 'Non-sensitive provider config. API keys must stay in environment variables or secret manager.';

CREATE INDEX IF NOT EXISTS idx_ai_provider_type ON ai_gateway.ai_provider (provider_type);
CREATE INDEX IF NOT EXISTS idx_ai_provider_is_active ON ai_gateway.ai_provider (is_active);

DROP TRIGGER IF EXISTS trg_ai_provider_updated ON ai_gateway.ai_provider;
CREATE TRIGGER trg_ai_provider_updated
BEFORE UPDATE ON ai_gateway.ai_provider
FOR EACH ROW
EXECUTE PROCEDURE ai_gateway.set_updated_at();

CREATE TABLE IF NOT EXISTS ai_gateway.ai_model (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES ai_gateway.ai_provider(id),
  model_code varchar(128) NOT NULL UNIQUE,
  model_name varchar(128) NOT NULL,
  provider varchar(64) NOT NULL,
  endpoint_url text NOT NULL,
  protocol varchar(64) NOT NULL,
  capabilities text[] NOT NULL DEFAULT '{}',
  api_key_env_var varchar(128) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  config jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

COMMENT ON TABLE ai_gateway.ai_model IS 'Vxture internal model access registry. Not a customer-facing product or billing table.';
COMMENT ON COLUMN ai_gateway.ai_model.model_code IS 'Stable model code used by gateway and commerce usage events.';
COMMENT ON COLUMN ai_gateway.ai_model.endpoint_url IS 'Provider or self-hosted model endpoint.';
COMMENT ON COLUMN ai_gateway.ai_model.api_key_env_var IS 'Environment variable name for the API key. Never store API key plaintext here.';
COMMENT ON COLUMN ai_gateway.ai_model.config IS 'Non-sensitive model config such as versions and adapter hints.';

CREATE INDEX IF NOT EXISTS idx_ai_model_provider ON ai_gateway.ai_model (provider);
CREATE INDEX IF NOT EXISTS idx_ai_model_provider_id ON ai_gateway.ai_model (provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_is_active ON ai_gateway.ai_model (is_active);

DROP TRIGGER IF EXISTS trg_ai_model_updated ON ai_gateway.ai_model;
CREATE TRIGGER trg_ai_model_updated
BEFORE UPDATE ON ai_gateway.ai_model
FOR EACH ROW
EXECUTE PROCEDURE ai_gateway.set_updated_at();

CREATE TABLE IF NOT EXISTS ai_gateway.ai_model_grant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES ai_gateway.ai_model(id),
  tenant_id uuid NOT NULL,
  agent_id uuid,
  priority integer NOT NULL DEFAULT 100,
  reason varchar(512),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT chk_ai_model_grant_priority CHECK (priority >= 0)
);

COMMENT ON TABLE ai_gateway.ai_model_grant IS 'Technical model allowlist or gray-release control. Commercial quota and customer billing remain in commerce schema.';
COMMENT ON COLUMN ai_gateway.ai_model_grant.agent_id IS 'NULL means the model grant applies to all agents under the tenant.';
COMMENT ON COLUMN ai_gateway.ai_model_grant.priority IS 'Lower number has higher priority when multiple grants match.';

CREATE INDEX IF NOT EXISTS idx_ai_model_grant_tenant ON ai_gateway.ai_model_grant (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_grant_model ON ai_gateway.ai_model_grant (model_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_grant_agent ON ai_gateway.ai_model_grant (agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_grant_is_active ON ai_gateway.ai_model_grant (is_active);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_model_grant_scope
  ON ai_gateway.ai_model_grant (model_id, tenant_id, COALESCE(agent_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_ai_model_grant_updated ON ai_gateway.ai_model_grant;
CREATE TRIGGER trg_ai_model_grant_updated
BEFORE UPDATE ON ai_gateway.ai_model_grant
FOR EACH ROW
EXECUTE PROCEDURE ai_gateway.set_updated_at();

CREATE TABLE IF NOT EXISTS ai_gateway.ai_model_cost_rate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES ai_gateway.ai_model(id),
  currency varchar(16) NOT NULL DEFAULT 'CNY',
  unit_tokens integer NOT NULL DEFAULT 1000000,
  input_unit_price numeric(18,8) NOT NULL DEFAULT 0,
  output_unit_price numeric(18,8) NOT NULL DEFAULT 0,
  request_unit_price numeric(18,8) NOT NULL DEFAULT 0,
  billing_mode varchar(32) NOT NULL DEFAULT 'token',
  effective_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_ai_model_cost_rate_unit CHECK (unit_tokens > 0),
  CONSTRAINT chk_ai_model_cost_rate_price CHECK (input_unit_price >= 0 AND output_unit_price >= 0 AND request_unit_price >= 0),
  CONSTRAINT chk_ai_model_cost_rate_mode CHECK (billing_mode IN ('token', 'request', 'fixed', 'free'))
);

COMMENT ON TABLE ai_gateway.ai_model_cost_rate IS 'Upstream provider cost rate for Vxture internal gross-margin and provider settlement analysis.';
COMMENT ON COLUMN ai_gateway.ai_model_cost_rate.unit_tokens IS 'Price unit, usually 1000 or 1000000 tokens.';
COMMENT ON COLUMN ai_gateway.ai_model_cost_rate.input_unit_price IS 'Upstream input token price per unit_tokens.';
COMMENT ON COLUMN ai_gateway.ai_model_cost_rate.output_unit_price IS 'Upstream output token price per unit_tokens.';
COMMENT ON COLUMN ai_gateway.ai_model_cost_rate.request_unit_price IS 'Upstream per-request price when billing_mode=request.';

CREATE INDEX IF NOT EXISTS idx_ai_model_cost_rate_model ON ai_gateway.ai_model_cost_rate (model_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_cost_rate_effective ON ai_gateway.ai_model_cost_rate (effective_at);
CREATE INDEX IF NOT EXISTS idx_ai_model_cost_rate_is_active ON ai_gateway.ai_model_cost_rate (is_active);

DROP TRIGGER IF EXISTS trg_ai_model_cost_rate_updated ON ai_gateway.ai_model_cost_rate;
CREATE TRIGGER trg_ai_model_cost_rate_updated
BEFORE UPDATE ON ai_gateway.ai_model_cost_rate
FOR EACH ROW
EXECUTE PROCEDURE ai_gateway.set_updated_at();

-- commerce tables owned by ai-gateway (excluded from core schema)
CREATE SCHEMA IF NOT EXISTS commerce;

CREATE OR REPLACE FUNCTION commerce.set_updated_at()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS commerce.tenant_subscription_quota (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  subscription_id uuid,
  max_users integer NOT NULL DEFAULT 10,
  max_api_keys integer NOT NULL DEFAULT 5,
  max_workflows integer NOT NULL DEFAULT 20,
  max_concurrent integer NOT NULL DEFAULT 5,
  rate_limit_per_minute integer NOT NULL DEFAULT 60,
  period_tokens bigint NOT NULL DEFAULT 1000000,
  quota_cycle varchar(32) NOT NULL DEFAULT 'monthly',
  allowed_models text[] NOT NULL DEFAULT '{}',
  allow_custom_model boolean NOT NULL DEFAULT false,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  effective_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tsq_tenant_id ON commerce.tenant_subscription_quota (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tsq_subscription_id ON commerce.tenant_subscription_quota (subscription_id);

DROP TRIGGER IF EXISTS trg_tsq_updated ON commerce.tenant_subscription_quota;
CREATE TRIGGER trg_tsq_updated
BEFORE UPDATE ON commerce.tenant_subscription_quota
FOR EACH ROW
EXECUTE PROCEDURE commerce.set_updated_at();

CREATE TABLE IF NOT EXISTS commerce.tenant_usage_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  agent_id uuid NOT NULL,
  feature_id uuid NOT NULL,
  user_id uuid,
  used_quota bigint NOT NULL DEFAULT 0,
  input_quota bigint DEFAULT 0,
  output_quota bigint DEFAULT 0,
  request_id varchar(128),
  business_id varchar(128),
  usage_type varchar(32) NOT NULL DEFAULT 'normal',
  cycle_date date NOT NULL,
  cycle_month varchar(6) NOT NULL,
  model_code varchar(64),
  latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tue_tenant_id ON commerce.tenant_usage_event (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tue_agent_id ON commerce.tenant_usage_event (agent_id);
CREATE INDEX IF NOT EXISTS idx_tue_feature_id ON commerce.tenant_usage_event (feature_id);
CREATE INDEX IF NOT EXISTS idx_tue_user_id ON commerce.tenant_usage_event (user_id);
CREATE INDEX IF NOT EXISTS idx_tue_request_id ON commerce.tenant_usage_event (request_id);
CREATE INDEX IF NOT EXISTS idx_tue_cycle_date ON commerce.tenant_usage_event (cycle_date);
CREATE INDEX IF NOT EXISTS idx_tue_cycle_month ON commerce.tenant_usage_event (cycle_month);
CREATE INDEX IF NOT EXISTS idx_tue_model_code ON commerce.tenant_usage_event (model_code);
CREATE INDEX IF NOT EXISTS idx_tue_tenant_month ON commerce.tenant_usage_event (tenant_id, cycle_month);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tue_request_id_not_null
  ON commerce.tenant_usage_event (request_id)
  WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tue_business_id
  ON commerce.tenant_usage_event (business_id)
  WHERE business_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS commerce.tenant_usage_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  feature_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  agent_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  cycle_month varchar(6) NOT NULL,
  total_quota bigint NOT NULL DEFAULT 0,
  input_quota bigint NOT NULL DEFAULT 0,
  output_quota bigint NOT NULL DEFAULT 0,
  request_count bigint NOT NULL DEFAULT 0,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  stat_type varchar(32) NOT NULL DEFAULT 'detail',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_usage_summary_unique
  ON commerce.tenant_usage_summary (tenant_id, feature_id, agent_id, cycle_month, stat_type);
CREATE INDEX IF NOT EXISTS idx_tus_tenant_id ON commerce.tenant_usage_summary (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tus_feature_id ON commerce.tenant_usage_summary (feature_id);
CREATE INDEX IF NOT EXISTS idx_tus_agent_id ON commerce.tenant_usage_summary (agent_id);
CREATE INDEX IF NOT EXISTS idx_tus_cycle_month ON commerce.tenant_usage_summary (cycle_month);
CREATE INDEX IF NOT EXISTS idx_tus_stat_type ON commerce.tenant_usage_summary (stat_type);
CREATE INDEX IF NOT EXISTS idx_tus_tenant_month ON commerce.tenant_usage_summary (tenant_id, cycle_month);

DROP TRIGGER IF EXISTS trg_tus_updated ON commerce.tenant_usage_summary;
CREATE TRIGGER trg_tus_updated
BEFORE UPDATE ON commerce.tenant_usage_summary
FOR EACH ROW
EXECUTE PROCEDURE commerce.set_updated_at();
