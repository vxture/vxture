-- ═══════════════════════════════════════════════════════════════
-- Migration: 20260518_ai_gateway_to_model_schema
-- Migrates all data from the legacy ai_gateway schema into the
-- model schema tables created by:
--   packages/core/database/prisma/migrations/0001_schema_migration
-- and then drops the ai_gateway schema.
--
-- Column mapping summary:
--   ai_gateway.ai_provider       → model.provider
--   ai_gateway.ai_model          → model.model  (api_key_env_var merged into config.apiKeyEnvVar)
--   ai_gateway.ai_model_grant    → model.model_grant
--   ai_gateway.ai_model_cost_rate → model.model_price_rule
--
-- Prerequisites:
--   packages/core/database 0001_schema_migration must already be applied —
--   it creates the model.provider / model.model / model.model_grant /
--   model.model_price_rule tables that this migration writes into.
--
-- Idempotent: ON CONFLICT DO NOTHING on every INSERT; wrapped in an
--   existence check so a re-run against an already-migrated database is a
--   no-op.
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- Guard: skip entirely if ai_gateway schema is already gone.
  IF NOT EXISTS (
    SELECT FROM information_schema.schemata
    WHERE schema_name = 'ai_gateway'
  ) THEN
    RAISE NOTICE 'ai_gateway schema not found — migration already applied or not needed.';
    RETURN;
  END IF;

  -- ── Step 1: model.provider ────────────────────────────────────
  -- Direct mapping; new columns description and logo_url default NULL.
  INSERT INTO "model"."provider" (
    id,
    provider_code,
    provider_type,
    provider_name,
    description,
    logo_url,
    homepage_url,
    console_url,
    billing_url,
    is_active,
    config,
    created_by,
    updated_by,
    created_at,
    updated_at,
    deleted_at
  )
  SELECT
    id,
    provider_code,
    provider_type,
    provider_name,
    NULL::VARCHAR(512)  AS description,
    NULL::TEXT          AS logo_url,
    homepage_url,
    console_url,
    billing_url,
    is_active,
    config,
    created_by,
    updated_by,
    created_at,
    updated_at,
    deleted_at
  FROM "ai_gateway"."ai_provider"
  ON CONFLICT (provider_code) DO NOTHING;

  -- ── Step 2: model.model ───────────────────────────────────────
  -- api_key_env_var is removed as a dedicated column and folded into
  -- the config JSONB under the key "apiKeyEnvVar", matching the runtime
  -- resolution logic in GatewayService.resolveApiKey().
  -- New columns: model_type ('chat'), supports_streaming (true), sort (999),
  --              description / context_window / max_output_tokens (NULL).
  INSERT INTO "model"."model" (
    id,
    provider_id,
    model_code,
    provider,
    model_type,
    protocol,
    model_name,
    description,
    endpoint_url,
    context_window,
    max_output_tokens,
    capabilities,
    supports_streaming,
    is_active,
    sort,
    config,
    created_by,
    updated_by,
    created_at,
    updated_at,
    deleted_at
  )
  SELECT
    id,
    provider_id,
    model_code,
    provider,
    'chat'              AS model_type,
    protocol,
    model_name,
    NULL::VARCHAR(512)  AS description,
    endpoint_url,
    NULL::INT           AS context_window,
    NULL::INT           AS max_output_tokens,
    capabilities::VARCHAR[],
    true                AS supports_streaming,
    is_active,
    999                 AS sort,
    -- Merge api_key_env_var into config JSONB; preserve any existing config keys.
    CASE
      WHEN api_key_env_var <> ''
        THEN COALESCE(config, '{}'::JSONB) || JSONB_BUILD_OBJECT('apiKeyEnvVar', api_key_env_var)
      ELSE config
    END                 AS config,
    created_by,
    updated_by,
    created_at,
    updated_at,
    deleted_at
  FROM "ai_gateway"."ai_model"
  ON CONFLICT (model_code) DO NOTHING;

  -- ── Step 3: model.model_grant ─────────────────────────────────
  -- Direct mapping; model_id UUIDs are unchanged from step 2.
  INSERT INTO "model"."model_grant" (
    id,
    model_id,
    tenant_id,
    agent_id,
    priority,
    is_active,
    reason,
    expires_at,
    created_by,
    updated_by,
    created_at,
    updated_at,
    deleted_at
  )
  SELECT
    id,
    model_id,
    tenant_id,
    agent_id,
    priority,
    is_active,
    reason,
    expires_at,
    created_by,
    updated_by,
    created_at,
    updated_at,
    deleted_at
  FROM "ai_gateway"."ai_model_grant"
  ON CONFLICT (id) DO NOTHING;

  -- ── Step 4: model.model_price_rule ───────────────────────────
  -- ai_gateway.ai_model_cost_rate → model.model_price_rule
  -- Column names are identical; model_id UUIDs unchanged from step 2.
  INSERT INTO "model"."model_price_rule" (
    id,
    model_id,
    billing_mode,
    currency,
    unit_tokens,
    input_unit_price,
    output_unit_price,
    request_unit_price,
    is_active,
    effective_at,
    expires_at,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    id,
    model_id,
    billing_mode,
    currency,
    unit_tokens,
    input_unit_price,
    output_unit_price,
    request_unit_price,
    is_active,
    effective_at,
    expires_at,
    created_by,
    updated_by,
    created_at,
    updated_at
  FROM "ai_gateway"."ai_model_cost_rate"
  ON CONFLICT (id) DO NOTHING;

  -- ── Step 5: Drop ai_gateway schema ───────────────────────────
  -- CASCADE drops all tables, indexes, triggers, and constraints inside
  -- the schema in one statement.
  DROP SCHEMA "ai_gateway" CASCADE;

  RAISE NOTICE 'ai_gateway → model schema migration complete.';
END $$;
