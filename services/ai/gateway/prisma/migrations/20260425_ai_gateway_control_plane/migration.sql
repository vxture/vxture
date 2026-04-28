CREATE SCHEMA IF NOT EXISTS ai_gateway;

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
EXECUTE PROCEDURE commerce.set_updated_at();

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
EXECUTE PROCEDURE commerce.set_updated_at();

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
EXECUTE PROCEDURE commerce.set_updated_at();

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
EXECUTE PROCEDURE commerce.set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS uq_tue_request_id_not_null
  ON commerce.tenant_usage_event (request_id)
  WHERE request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tue_business_id
  ON commerce.tenant_usage_event (business_id)
  WHERE business_id IS NOT NULL;
