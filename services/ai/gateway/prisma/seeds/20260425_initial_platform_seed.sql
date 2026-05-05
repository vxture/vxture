DO $$
DECLARE
  v_system_admin uuid := '00000000-0000-0000-0000-000000000000';
  v_default_account uuid;
  v_personal_tenant uuid;
  v_org_tenant uuid;

  v_provider_doubao uuid := '9d21f5e6-3bcb-4bd2-9e82-bd3667f5d001';
  v_provider_claude uuid := '9d21f5e6-3bcb-4bd2-9e82-bd3667f5d002';
  v_provider_private uuid := '9d21f5e6-3bcb-4bd2-9e82-bd3667f5d003';

  v_model_doubao_lite uuid := '0d7cfe53-4f0c-4ed2-9b2d-7a2841af1001';
  v_model_doubao_pro uuid := '0d7cfe53-4f0c-4ed2-9b2d-7a2841af1002';
  v_model_claude_sonnet uuid := '0d7cfe53-4f0c-4ed2-9b2d-7a2841af1003';
  v_model_private_qwen uuid := '0d7cfe53-4f0c-4ed2-9b2d-7a2841af1004';
  v_model_doubao_code uuid := '0d7cfe53-4f0c-4ed2-9b2d-7a2841af1005';

  v_feature_ai_tokens uuid := '5fa2f2cb-7f3c-4d81-8e3c-900000000001';
  v_feature_online_models uuid := '5fa2f2cb-7f3c-4d81-8e3c-900000000002';
  v_feature_private_model uuid := '5fa2f2cb-7f3c-4d81-8e3c-900000000003';
  v_feature_agents uuid := '5fa2f2cb-7f3c-4d81-8e3c-900000000004';

  v_agent_contract uuid := '2b3158c4-fd0a-4ffc-a5c6-910000000001';
  v_agent_legal uuid := '2b3158c4-fd0a-4ffc-a5c6-910000000002';
  v_agent_ops uuid := '2b3158c4-fd0a-4ffc-a5c6-910000000003';
  v_agent_emergency uuid := '2b3158c4-fd0a-4ffc-a5c6-910000000004';
  v_agent_console uuid := '2b3158c4-fd0a-4ffc-a5c6-910000000005';
  v_agent_ruyin uuid := '2b3158c4-fd0a-4ffc-a5c6-910000000006';

  v_plan_starter uuid := '0bb203b6-7dfb-42d8-a6ad-920000000001';
  v_plan_growth uuid := '0bb203b6-7dfb-42d8-a6ad-920000000002';
  v_plan_enterprise uuid := '0bb203b6-7dfb-42d8-a6ad-920000000003';
BEGIN
  SELECT id INTO v_default_account
  FROM account.account
  WHERE username = 'zhangsan'
  ORDER BY created_at
  LIMIT 1;

  IF v_default_account IS NULL THEN
    SELECT id INTO v_default_account
    FROM account.account
    ORDER BY created_at
    LIMIT 1;
  END IF;

  IF v_default_account IS NULL THEN
    RAISE EXCEPTION 'Seed requires at least one account.account row for created_by fields.';
  END IF;

  SELECT id INTO v_personal_tenant
  FROM tenancy.tenant
  WHERE tenant_code = 'zhangsan-personal'
  LIMIT 1;

  SELECT id INTO v_org_tenant
  FROM tenancy.tenant
  WHERE tenant_code = 'zhangsan-org'
  LIMIT 1;

  INSERT INTO ai_gateway.ai_provider (
    id, provider_code, provider_name, provider_type, homepage_url, console_url, billing_url, config, created_by, updated_by
  ) VALUES
    (
      v_provider_doubao,
      'doubao',
      'Doubao / Volcengine Ark',
      'online',
      'https://www.volcengine.com/product/ark',
      'https://console.volcengine.com/ark',
      'https://console.volcengine.com/finance',
      '{"settlement":"provider-contract","note":"Replace seed cost rates with contract prices before production."}'::jsonb,
      v_system_admin,
      v_system_admin
    ),
    (
      v_provider_claude,
      'claude',
      'Anthropic Claude',
      'online',
      'https://www.anthropic.com/claude',
      'https://console.anthropic.com',
      'https://console.anthropic.com/settings/billing',
      '{"settlement":"provider-contract","note":"Seed uses public-style unit categories only."}'::jsonb,
      v_system_admin,
      v_system_admin
    ),
    (
      v_provider_private,
      'private',
      'Private / Self-hosted Model',
      'private',
      NULL,
      NULL,
      NULL,
      '{"settlement":"infrastructure-cost","note":"Used for Vxture-managed or customer-hosted OpenAI-compatible endpoints."}'::jsonb,
      v_system_admin,
      v_system_admin
    )
  ON CONFLICT (provider_code) DO UPDATE SET
    provider_name = EXCLUDED.provider_name,
    provider_type = EXCLUDED.provider_type,
    homepage_url = EXCLUDED.homepage_url,
    console_url = EXCLUDED.console_url,
    billing_url = EXCLUDED.billing_url,
    config = EXCLUDED.config,
    is_active = true,
    updated_by = EXCLUDED.updated_by,
    updated_at = now(),
    deleted_at = NULL;

  UPDATE ai_gateway.ai_model
  SET
    model_code = 'doubao-seed-2-0-lite-260215',
    model_name = 'Doubao Seed 2.0 Lite',
    updated_by = v_system_admin,
    updated_at = now()
  WHERE id = v_model_doubao_lite
    AND model_code = 'doubao-lite-32k';

  UPDATE ai_gateway.ai_model
  SET
    model_code = 'doubao-seed-2-0-pro-260215',
    model_name = 'Doubao Seed 2.0 Pro',
    updated_by = v_system_admin,
    updated_at = now()
  WHERE id = v_model_doubao_pro
    AND model_code = 'doubao-pro-32k';

  INSERT INTO ai_gateway.ai_model (
    id, provider_id, model_code, model_name, provider, endpoint_url, protocol, capabilities, api_key_env_var, config, created_by, updated_by
  ) VALUES
    (
      v_model_doubao_lite,
      v_provider_doubao,
      'doubao-seed-2-0-lite-260215',
      'Doubao Seed 2.0 Lite',
      'doubao',
      'https://ark.cn-beijing.volces.com/api/v3',
      'openai-compatible',
      ARRAY['text','tool-call'],
      'DOUBAO_API_KEY',
      '{"tier":"economy","vendorModel":"doubao-seed-2-0-lite-260215","customerVisible":false}'::jsonb,
      v_system_admin,
      v_system_admin
    ),
    (
      v_model_doubao_pro,
      v_provider_doubao,
      'doubao-seed-2-0-pro-260215',
      'Doubao Seed 2.0 Pro',
      'doubao',
      'https://ark.cn-beijing.volces.com/api/v3',
      'openai-compatible',
      ARRAY['text','tool-call','reasoning'],
      'DOUBAO_API_KEY',
      '{"tier":"standard","vendorModel":"doubao-seed-2-0-pro-260215","customerVisible":false}'::jsonb,
      v_system_admin,
      v_system_admin
    ),
    (
      v_model_doubao_code,
      v_provider_doubao,
      'doubao-seed-2-0-code-preview-260215',
      'Doubao Seed 2.0 Code',
      'doubao',
      'https://ark.cn-beijing.volces.com/api/v3',
      'openai-compatible',
      ARRAY['text','tool-call','code'],
      'DOUBAO_API_KEY',
      '{"tier":"code","vendorModel":"doubao-seed-2-0-code-preview-260215","customerVisible":false}'::jsonb,
      v_system_admin,
      v_system_admin
    ),
    (
      v_model_claude_sonnet,
      v_provider_claude,
      'claude-sonnet-4-20250514',
      'Claude Sonnet',
      'claude',
      'https://api.anthropic.com',
      'anthropic-messages',
      ARRAY['text','reasoning','long-context'],
      'ANTHROPIC_API_KEY',
      '{"anthropicVersion":"2023-06-01","customerVisible":false}'::jsonb,
      v_system_admin,
      v_system_admin
    ),
    (
      v_model_private_qwen,
      v_provider_private,
      'private-qwen-72b',
      'Private Qwen 72B',
      'private',
      'http://localhost:8008/v1',
      'openai-compatible',
      ARRAY['text','private','tool-call'],
      'PRIVATE_QWEN_API_KEY',
      '{"deployment":"vxture-managed","customerVisible":false}'::jsonb,
      v_system_admin,
      v_system_admin
    )
  ON CONFLICT (model_code) DO UPDATE SET
    provider_id = EXCLUDED.provider_id,
    model_name = EXCLUDED.model_name,
    provider = EXCLUDED.provider,
    endpoint_url = EXCLUDED.endpoint_url,
    protocol = EXCLUDED.protocol,
    capabilities = EXCLUDED.capabilities,
    api_key_env_var = EXCLUDED.api_key_env_var,
    config = EXCLUDED.config,
    is_active = true,
    updated_by = EXCLUDED.updated_by,
    updated_at = now(),
    deleted_at = NULL;

  INSERT INTO ai_gateway.ai_model_cost_rate (
    id, model_id, currency, unit_tokens, input_unit_price, output_unit_price, request_unit_price, billing_mode, effective_at, is_active, created_by, updated_by
  ) VALUES
    ('606eea4d-5fd0-4d21-b6e7-930000000001', v_model_doubao_lite, 'CNY', 1000000, 0.30000000, 0.60000000, 0, 'token', now(), true, v_system_admin, v_system_admin),
    ('606eea4d-5fd0-4d21-b6e7-930000000002', v_model_doubao_pro, 'CNY', 1000000, 0.80000000, 2.00000000, 0, 'token', now(), true, v_system_admin, v_system_admin),
    ('606eea4d-5fd0-4d21-b6e7-930000000003', v_model_claude_sonnet, 'USD', 1000000, 3.00000000, 15.00000000, 0, 'token', now(), true, v_system_admin, v_system_admin),
    ('606eea4d-5fd0-4d21-b6e7-930000000004', v_model_private_qwen, 'CNY', 1000000, 0.00000000, 0.00000000, 0, 'token', now(), true, v_system_admin, v_system_admin),
    ('606eea4d-5fd0-4d21-b6e7-930000000005', v_model_doubao_code, 'CNY', 1000000, 1.00000000, 2.50000000, 0, 'token', now(), true, v_system_admin, v_system_admin)
  ON CONFLICT (id) DO UPDATE SET
    currency = EXCLUDED.currency,
    unit_tokens = EXCLUDED.unit_tokens,
    input_unit_price = EXCLUDED.input_unit_price,
    output_unit_price = EXCLUDED.output_unit_price,
    request_unit_price = EXCLUDED.request_unit_price,
    billing_mode = EXCLUDED.billing_mode,
    is_active = EXCLUDED.is_active,
    updated_by = EXCLUDED.updated_by,
    updated_at = now();

  INSERT INTO product.feature (
    id, feature_code, feature_name, parent_code, feature_type, description, status, created_by, updated_by
  ) VALUES
    (v_feature_ai_tokens, 'ai.tokens', '模型调用额度', NULL, 'quota', '客户套餐内的周期 Token 总额度，实际消耗写入 commerce.tenant_usage_event。', true, v_system_admin, v_system_admin),
    (v_feature_online_models, 'ai.online_models', '在线模型服务', NULL, 'function', '由 Vxture 接入并托管的在线模型能力。', true, v_system_admin, v_system_admin),
    (v_feature_private_model, 'ai.private_model', '自建模型接入', NULL, 'function', '允许接入客户自建或 Vxture 托管的私有模型端点。', true, v_system_admin, v_system_admin),
    (v_feature_agents, 'ai.business_agents', '业务智能体应用', NULL, 'function', '可被套餐授权使用的业务智能体应用。', true, v_system_admin, v_system_admin)
  ON CONFLICT (feature_code) DO UPDATE SET
    feature_name = EXCLUDED.feature_name,
    parent_code = EXCLUDED.parent_code,
    feature_type = EXCLUDED.feature_type,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by,
    updated_at = now(),
    deleted_at = NULL;

  INSERT INTO product.agent (
    id, agent_code, agent_name, description, agent_type, status, visibility, agent_category, tags, sort, icon_url, config_json, version, created_by, updated_by
  ) VALUES
    (v_agent_contract, 'contract-review', '合同审核智能体', '合同条款抽取、风险提示、修订建议。', 'business', 'active', 'public', 10, ARRAY['数字员工','法务'], 10, NULL, '{"defaultModel":"doubao-seed-2-0-pro-260215"}'::jsonb, 1, v_system_admin, v_system_admin),
    (v_agent_legal, 'digital-legal', '数字法务智能体', '法律问答、合规检索、材料生成。', 'business', 'active', 'public', 10, ARRAY['数字员工','法务'], 20, NULL, '{"defaultModel":"claude-sonnet-4-20250514"}'::jsonb, 1, v_system_admin, v_system_admin),
    (v_agent_ops, 'operation-analysis', '经营分析智能体', '指标解释、经营归因、报告生成。', 'business', 'active', 'public', 20, ARRAY['数字员工','经营分析'], 30, NULL, '{"defaultModel":"doubao-seed-2-0-pro-260215"}'::jsonb, 1, v_system_admin, v_system_admin),
    (v_agent_emergency, 'emergency-command', '应急指挥智能体', '面向应急管理场景的态势研判、预案匹配和协同调度。', 'business', 'active', 'private', 30, ARRAY['应急管理','数字孪生','大模型'], 40, NULL, '{"defaultModel":"private-qwen-72b"}'::jsonb, 1, v_system_admin, v_system_admin),
    (v_agent_console, 'console-assistant', 'Console 平台智能助手', '面向 console 平台的对话型智能助手，先用于模型策略和计量链路验证。', 'chat', 'active', 'internal', 5, ARRAY['平台运营','对话'], 5, NULL, '{"defaultModel":"doubao-seed-2-0-lite-260215","modelPolicyMode":"agent-plan-quota"}'::jsonb, 1, v_system_admin, v_system_admin),
    (v_agent_ruyin, 'ruyin', 'Ruyin', '通用对话智能体，验证阶段先以对话智能体接入。', 'chat', 'active', 'public', 5, ARRAY['如荫','对话'], 6, NULL, '{"defaultModel":"doubao-seed-2-0-lite-260215","modelPolicyMode":"agent-plan-quota"}'::jsonb, 1, v_system_admin, v_system_admin)
  ON CONFLICT (agent_code) DO UPDATE SET
    agent_name = EXCLUDED.agent_name,
    description = EXCLUDED.description,
    agent_type = EXCLUDED.agent_type,
    status = EXCLUDED.status,
    visibility = EXCLUDED.visibility,
    agent_category = EXCLUDED.agent_category,
    tags = EXCLUDED.tags,
    sort = EXCLUDED.sort,
    config_json = EXCLUDED.config_json,
    updated_by = EXCLUDED.updated_by,
    updated_at = now(),
    deleted_at = NULL;

  INSERT INTO product.plan (
    id, plan_code, plan_name, description, plan_type, level, is_free, is_public, status, created_by, updated_by
  ) VALUES
    (v_plan_starter, 'starter', '入门版', '适合个人或小团队试用，包含基础在线模型额度。', 'normal', 10, true, true, true, v_system_admin, v_system_admin),
    (v_plan_growth, 'growth', '专业版', '适合组织客户使用通用业务智能体和在线模型。', 'normal', 20, false, true, true, v_system_admin, v_system_admin),
    (v_plan_enterprise, 'enterprise', '企业版', '面向行业客户，支持高额度、自建模型接入和专属方案服务。', 'normal', 30, false, true, true, v_system_admin, v_system_admin)
  ON CONFLICT (plan_code) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    description = EXCLUDED.description,
    plan_type = EXCLUDED.plan_type,
    level = EXCLUDED.level,
    is_free = EXCLUDED.is_free,
    is_public = EXCLUDED.is_public,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by,
    updated_at = now(),
    deleted_at = NULL;

  INSERT INTO product.plan_price (
    id, plan_id, price, original_price, currency, period_type, period_value, sort, status, is_default, created_by, updated_by
  ) VALUES
    ('c211fef4-88ef-45cc-bfe4-940000000001', v_plan_starter, 0.000000, 0.000000, 'CNY', 'monthly', 1, 10, true, true, v_system_admin, v_system_admin),
    ('c211fef4-88ef-45cc-bfe4-940000000002', v_plan_growth, 2999.000000, 3999.000000, 'CNY', 'monthly', 1, 20, true, true, v_system_admin, v_system_admin),
    ('c211fef4-88ef-45cc-bfe4-940000000003', v_plan_growth, 29900.000000, 39990.000000, 'CNY', 'yearly', 1, 21, true, false, v_system_admin, v_system_admin),
    ('c211fef4-88ef-45cc-bfe4-940000000004', v_plan_enterprise, 9999.000000, 12999.000000, 'CNY', 'monthly', 1, 30, true, true, v_system_admin, v_system_admin),
    ('c211fef4-88ef-45cc-bfe4-940000000005', v_plan_enterprise, 99900.000000, 129990.000000, 'CNY', 'yearly', 1, 31, true, false, v_system_admin, v_system_admin)
  ON CONFLICT (id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    currency = EXCLUDED.currency,
    period_type = EXCLUDED.period_type,
    period_value = EXCLUDED.period_value,
    sort = EXCLUDED.sort,
    status = EXCLUDED.status,
    is_default = EXCLUDED.is_default,
    updated_by = EXCLUDED.updated_by,
    updated_at = now(),
    deleted_at = NULL;

  INSERT INTO product.plan_feature (
    plan_id, feature_id, quota_value, is_unlimited, config_json, created_by, updated_by
  ) VALUES
    (v_plan_starter, v_feature_ai_tokens, 1000000, false, '{"period":"monthly","customerFee":"included"}'::jsonb, v_system_admin, v_system_admin),
    (v_plan_starter, v_feature_online_models, 1, false, '{"allowedModels":["doubao-seed-2-0-lite-260215"]}'::jsonb, v_system_admin, v_system_admin),
    (v_plan_starter, v_feature_agents, 2, false, '{"includedAgents":["console-assistant","ruyin"],"modelPolicyMode":"agent-plan-quota","modelPolicies":[{"agentCode":"console-assistant","modelCode":"doubao-seed-2-0-lite-260215","quotaTokens":1000000,"priority":100},{"agentCode":"console-assistant","modelCode":"doubao-seed-2-0-pro-260215","quotaTokens":0,"priority":200},{"agentCode":"ruyin","modelCode":"doubao-seed-2-0-lite-260215","quotaTokens":0,"priority":100}]}'::jsonb, v_system_admin, v_system_admin),
    (v_plan_growth, v_feature_ai_tokens, 20000000, false, '{"period":"monthly","customerFee":"included","overage":"to-be-priced"}'::jsonb, v_system_admin, v_system_admin),
    (v_plan_growth, v_feature_online_models, 1, false, '{"allowedModels":["doubao-seed-2-0-lite-260215","doubao-seed-2-0-pro-260215","doubao-seed-2-0-code-preview-260215","claude-sonnet-4-20250514"]}'::jsonb, v_system_admin, v_system_admin),
    (v_plan_growth, v_feature_agents, 2, false, '{"includedAgents":["console-assistant","ruyin"],"modelPolicyMode":"agent-plan-quota","modelPolicies":[{"agentCode":"console-assistant","modelCode":"doubao-seed-2-0-lite-260215","quotaTokens":5000000,"priority":100},{"agentCode":"console-assistant","modelCode":"doubao-seed-2-0-pro-260215","quotaTokens":10000000,"priority":50},{"agentCode":"ruyin","modelCode":"doubao-seed-2-0-lite-260215","quotaTokens":5000000,"priority":100},{"agentCode":"ruyin","modelCode":"doubao-seed-2-0-pro-260215","quotaTokens":5000000,"priority":60}]}'::jsonb, v_system_admin, v_system_admin),
    (v_plan_enterprise, v_feature_ai_tokens, 100000000, false, '{"period":"monthly","customerFee":"included","overage":"contract"}'::jsonb, v_system_admin, v_system_admin),
    (v_plan_enterprise, v_feature_online_models, 1, true, '{"allowedModels":["doubao-seed-2-0-lite-260215","doubao-seed-2-0-pro-260215","doubao-seed-2-0-code-preview-260215","claude-sonnet-4-20250514"]}'::jsonb, v_system_admin, v_system_admin),
    (v_plan_enterprise, v_feature_private_model, 1, false, '{"customerFee":"implementation-or-hosting-service"}'::jsonb, v_system_admin, v_system_admin),
    (v_plan_enterprise, v_feature_agents, 2, true, '{"includedAgents":["console-assistant","ruyin"],"modelPolicyMode":"agent-plan-quota","modelPolicies":[{"agentCode":"console-assistant","modelCode":"doubao-seed-2-0-pro-260215","quotaTokens":30000000,"priority":50},{"agentCode":"console-assistant","modelCode":"claude-sonnet-4-20250514","quotaTokens":20000000,"priority":30},{"agentCode":"ruyin","modelCode":"doubao-seed-2-0-pro-260215","quotaTokens":30000000,"priority":50},{"agentCode":"ruyin","modelCode":"claude-sonnet-4-20250514","quotaTokens":20000000,"priority":30},{"agentCode":"ruyin","modelCode":"private-qwen-72b","quotaTokens":0,"priority":20}]}'::jsonb, v_system_admin, v_system_admin)
  ON CONFLICT (plan_id, feature_id) DO UPDATE SET
    quota_value = EXCLUDED.quota_value,
    is_unlimited = EXCLUDED.is_unlimited,
    config_json = EXCLUDED.config_json,
    updated_by = EXCLUDED.updated_by,
    updated_at = now(),
    deleted_at = NULL;

  INSERT INTO product.plan_agent (
    plan_id, agent_id, is_allowed, created_by
  ) VALUES
    (v_plan_starter, v_agent_console, true, v_system_admin),
    (v_plan_starter, v_agent_ruyin, true, v_system_admin),
    (v_plan_growth, v_agent_contract, true, v_system_admin),
    (v_plan_growth, v_agent_legal, true, v_system_admin),
    (v_plan_growth, v_agent_ops, true, v_system_admin),
    (v_plan_growth, v_agent_console, true, v_system_admin),
    (v_plan_growth, v_agent_ruyin, true, v_system_admin),
    (v_plan_enterprise, v_agent_contract, true, v_system_admin),
    (v_plan_enterprise, v_agent_legal, true, v_system_admin),
    (v_plan_enterprise, v_agent_ops, true, v_system_admin),
    (v_plan_enterprise, v_agent_emergency, true, v_system_admin),
    (v_plan_enterprise, v_agent_console, true, v_system_admin),
    (v_plan_enterprise, v_agent_ruyin, true, v_system_admin)
  ON CONFLICT (agent_id, plan_id) DO UPDATE SET
    is_allowed = EXCLUDED.is_allowed,
    deleted_at = NULL;

  IF v_personal_tenant IS NOT NULL THEN
    INSERT INTO commerce.tenant_subscription (
      id, tenant_id, plan_id, cycle_type, start_at, end_at, status, auto_renew, order_no, pay_amount, currency, created_by, updated_by
    ) VALUES (
      'f76d68a5-cd82-4a01-b338-950000000001',
      v_personal_tenant,
      v_plan_starter,
      'monthly',
      now(),
      NULL,
      'active',
      true,
      'SEED-SUB-PERSONAL-STARTER',
      0.00,
      'CNY',
      v_default_account,
      v_default_account
    )
    ON CONFLICT (id) DO UPDATE SET
      plan_id = EXCLUDED.plan_id,
      status = EXCLUDED.status,
      auto_renew = EXCLUDED.auto_renew,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL;

    INSERT INTO commerce.tenant_subscription_quota (
      id, tenant_id, subscription_id, max_users, max_api_keys, max_workflows, max_concurrent, rate_limit_per_minute,
      period_tokens, quota_cycle, allowed_models, allow_custom_model, created_by, updated_by, effective_at, expires_at
    ) VALUES (
      'd0d5cd22-8c6b-45c8-b983-960000000001',
      v_personal_tenant,
      'f76d68a5-cd82-4a01-b338-950000000001',
      3,
      2,
      5,
      2,
      30,
      1000000,
      'monthly',
      ARRAY['doubao-seed-2-0-lite-260215'],
      false,
      v_default_account,
      v_default_account,
      now(),
      NULL
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
      subscription_id = EXCLUDED.subscription_id,
      max_users = EXCLUDED.max_users,
      max_api_keys = EXCLUDED.max_api_keys,
      max_workflows = EXCLUDED.max_workflows,
      max_concurrent = EXCLUDED.max_concurrent,
      rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
      period_tokens = EXCLUDED.period_tokens,
      quota_cycle = EXCLUDED.quota_cycle,
      allowed_models = EXCLUDED.allowed_models,
      allow_custom_model = EXCLUDED.allow_custom_model,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      effective_at = EXCLUDED.effective_at,
      expires_at = EXCLUDED.expires_at;

    INSERT INTO ai_gateway.ai_model_grant (
      id, model_id, tenant_id, agent_id, priority, reason, is_active, created_by, updated_by
    ) VALUES (
      'bb99b8f6-095a-4cb8-95c1-970000000001',
      v_model_doubao_lite,
      v_personal_tenant,
      NULL,
      100,
      'Starter tenant default online model.',
      true,
      v_system_admin,
      v_system_admin
    )
    ON CONFLICT (id) DO UPDATE SET
      model_id = EXCLUDED.model_id,
      tenant_id = EXCLUDED.tenant_id,
      agent_id = EXCLUDED.agent_id,
      priority = EXCLUDED.priority,
      reason = EXCLUDED.reason,
      is_active = EXCLUDED.is_active,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL;
  END IF;

  IF v_org_tenant IS NOT NULL THEN
    INSERT INTO commerce.tenant_subscription (
      id, tenant_id, plan_id, cycle_type, start_at, end_at, status, auto_renew, order_no, pay_amount, currency, created_by, updated_by
    ) VALUES (
      'f76d68a5-cd82-4a01-b338-950000000002',
      v_org_tenant,
      v_plan_growth,
      'monthly',
      now(),
      NULL,
      'active',
      true,
      'SEED-SUB-ORG-GROWTH',
      2999.00,
      'CNY',
      v_default_account,
      v_default_account
    )
    ON CONFLICT (id) DO UPDATE SET
      plan_id = EXCLUDED.plan_id,
      status = EXCLUDED.status,
      auto_renew = EXCLUDED.auto_renew,
      pay_amount = EXCLUDED.pay_amount,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL;

    INSERT INTO commerce.tenant_subscription_quota (
      id, tenant_id, subscription_id, max_users, max_api_keys, max_workflows, max_concurrent, rate_limit_per_minute,
      period_tokens, quota_cycle, allowed_models, allow_custom_model, created_by, updated_by, effective_at, expires_at
    ) VALUES (
      'd0d5cd22-8c6b-45c8-b983-960000000002',
      v_org_tenant,
      'f76d68a5-cd82-4a01-b338-950000000002',
      20,
      10,
      50,
      10,
      120,
      20000000,
      'monthly',
      ARRAY['doubao-seed-2-0-lite-260215','doubao-seed-2-0-pro-260215','doubao-seed-2-0-code-preview-260215','claude-sonnet-4-20250514'],
      false,
      v_default_account,
      v_default_account,
      now(),
      NULL
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
      subscription_id = EXCLUDED.subscription_id,
      max_users = EXCLUDED.max_users,
      max_api_keys = EXCLUDED.max_api_keys,
      max_workflows = EXCLUDED.max_workflows,
      max_concurrent = EXCLUDED.max_concurrent,
      rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
      period_tokens = EXCLUDED.period_tokens,
      quota_cycle = EXCLUDED.quota_cycle,
      allowed_models = EXCLUDED.allowed_models,
      allow_custom_model = EXCLUDED.allow_custom_model,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      effective_at = EXCLUDED.effective_at,
      expires_at = EXCLUDED.expires_at;

    INSERT INTO ai_gateway.ai_model_grant (
      id, model_id, tenant_id, agent_id, priority, reason, is_active, created_by, updated_by
    ) VALUES
      ('bb99b8f6-095a-4cb8-95c1-970000000002', v_model_doubao_lite, v_org_tenant, NULL, 50, 'Growth tenant default online lite model.', true, v_system_admin, v_system_admin),
      ('bb99b8f6-095a-4cb8-95c1-970000000003', v_model_claude_sonnet, v_org_tenant, NULL, 80, 'Growth tenant reasoning model.', true, v_system_admin, v_system_admin),
      ('bb99b8f6-095a-4cb8-95c1-970000000004', v_model_private_qwen, v_org_tenant, v_agent_emergency, 20, 'Enterprise/private model demo grant; commerce quota currently blocks private model until allow_custom_model is enabled.', false, v_system_admin, v_system_admin),
      ('bb99b8f6-095a-4cb8-95c1-970000000005', v_model_doubao_pro, v_org_tenant, NULL, 40, 'Growth tenant default online pro model.', true, v_system_admin, v_system_admin),
      ('bb99b8f6-095a-4cb8-95c1-970000000006', v_model_doubao_code, v_org_tenant, NULL, 30, 'Growth tenant code model.', true, v_system_admin, v_system_admin),
      ('bb99b8f6-095a-4cb8-95c1-970000000007', v_model_doubao_pro, v_org_tenant, v_agent_console, 35, 'Console assistant growth policy technical grant.', true, v_system_admin, v_system_admin),
      ('bb99b8f6-095a-4cb8-95c1-970000000008', v_model_doubao_pro, v_org_tenant, v_agent_ruyin, 35, 'Ruyin Agent growth policy technical grant.', true, v_system_admin, v_system_admin)
    ON CONFLICT (id) DO UPDATE SET
      model_id = EXCLUDED.model_id,
      tenant_id = EXCLUDED.tenant_id,
      agent_id = EXCLUDED.agent_id,
      priority = EXCLUDED.priority,
      reason = EXCLUDED.reason,
      is_active = EXCLUDED.is_active,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL;
  END IF;
END $$;

DO $$
DECLARE
  v_system_admin uuid := '00000000-0000-0000-0000-000000000000';
  v_zero uuid := '00000000-0000-0000-0000-000000000000';
  v_cycle_month varchar(8) := to_char(current_date, 'YYYYMM');

  v_feature_ai_tokens uuid := '5fa2f2cb-7f3c-4d81-8e3c-900000000001';
  v_agent_console uuid := '2b3158c4-fd0a-4ffc-a5c6-910000000005';
  v_agent_ruyin uuid := '2b3158c4-fd0a-4ffc-a5c6-910000000006';

  v_model_doubao_lite uuid := '0d7cfe53-4f0c-4ed2-9b2d-7a2841af1001';
  v_model_doubao_pro uuid := '0d7cfe53-4f0c-4ed2-9b2d-7a2841af1002';
  v_model_claude_sonnet uuid := '0d7cfe53-4f0c-4ed2-9b2d-7a2841af1003';

  v_tenant record;
  v_tenant_id uuid;
  v_owner_account_id uuid;
  v_admin_account_id uuid;
  v_member_account_id uuid;
  v_owner_role_id uuid;
  v_admin_role_id uuid;
  v_member_role_id uuid;
  v_plan_id uuid;
  v_subscription_id uuid;
  v_quota_id uuid;
  v_lite_grant_id uuid;
  v_pro_grant_id uuid;
  v_claude_grant_id uuid;
  v_seed_account record;
  v_seed_binding record;
  v_seed_account_id uuid;
  v_seed_tenant_id uuid;
  v_seed_role_id uuid;
  v_owner_username varchar(64);
  v_admin_username varchar(64);
  v_member_username varchar(64);
  v_subscription_status varchar(32);
  v_member_status varchar(32);
  v_allowed_models text[];
BEGIN
  CREATE TABLE IF NOT EXISTS account.account_profile (
    account_id uuid primary key references account.account(id) on delete cascade,
    display_name varchar(96),
    avatar_url varchar(512),
    headline varchar(128),
    bio text,
    timezone varchar(64),
    language varchar(32),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  INSERT INTO tenancy.tenant_permission (
    id, permission_code, permission_name, parent_code, permission_type, description, status, tenant_id, permission_scope, sort
  ) VALUES
    ('7f01c2f9-8010-4a21-a001-980000000001', 'tenant.user.manage', '成员管理', NULL, 'API', '管理租户成员、邀请与状态。', true, NULL, 'platform', 10),
    ('7f01c2f9-8010-4a21-a001-980000000002', 'tenant.role.manage', '角色管理', NULL, 'API', '管理租户角色和权限绑定。', true, NULL, 'platform', 20),
    ('7f01c2f9-8010-4a21-a001-980000000003', 'tenant.subscription.read', '订阅查看', NULL, 'API', '查看租户订阅与发布权益。', true, NULL, 'platform', 30),
    ('7f01c2f9-8010-4a21-a001-980000000004', 'tenant.billing.read', '账务查看', NULL, 'API', '查看账单、付款和收入相关信息。', true, NULL, 'platform', 40),
    ('7f01c2f9-8010-4a21-a001-980000000005', 'tenant.quota.read', '配额查看', NULL, 'API', '查看租户配额和模型用量。', true, NULL, 'platform', 50),
    ('7f01c2f9-8010-4a21-a001-980000000006', 'tenant.model.read', '模型策略查看', NULL, 'API', '查看租户模型授权、配额和路由状态。', true, NULL, 'platform', 60)
  ON CONFLICT (permission_code) DO UPDATE SET
    permission_name = EXCLUDED.permission_name,
    permission_type = EXCLUDED.permission_type,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    permission_scope = EXCLUDED.permission_scope,
    sort = EXCLUDED.sort,
    updated_at = now(),
    deleted_at = NULL;

  FOR v_tenant IN
    SELECT *
    FROM (VALUES
      (1,  'zhangsan-personal',    'Zhangsan Personal Workspace', '张三个人租户',       'individual', 'active',    'verified',   'normal',    '上海', '上海', '个人开发者',     '个人',       'starter',    0.00::numeric,    3,   1000000::bigint,   260000::bigint,   42::bigint,  false, '张三'),
      (2,  'zhangsan-org',         'Zhangsan Organization',        '张三主管理员组织租户', 'company',    'active',    'verified',   'normal',    '上海', '上海', 'AI 平台服务',   '30-100 人',  'growth',  2999.00::numeric,   20,  20000000::bigint,  4200000::bigint,  380::bigint,  false, '张三'),
      (3,  'haicheng-digital',     'Haicheng Digital Tech',        '海澄数字科技',       'company',    'active',    'pending',    'follow_up', '浙江', '杭州', '制造业数字化',   '300-1000 人','growth',  2999.00::numeric,  100,  24000000::bigint, 22100000::bigint, 1680::bigint, false, '王舟'),
      (4,  'ruyin-lab',            'Ruyin Lab',                    '如因智能实验室',     'company',    'trial',     'unverified', 'normal',    '北京', '北京', '智能体应用',     '30-100 人',  'growth',  1999.00::numeric,   30,  14000000::bigint,  6200000::bigint,  520::bigint,  false, '殷若'),
      (5,  'northstar-emergency',  'Northstar Emergency',          '北极星应急平台',     'company',    'suspended', 'verified',   'high',   '四川', '成都', '应急管理',       '1000+ 人',   'enterprise', 0.00::numeric,  300,         0::bigint,        0::bigint,    0::bigint,   true,  '高明'),
      (6,  'yuntu-medical',        'Yuntu Medical AI',             '云图医疗智能',       'company',    'active',    'verified',   'normal',    '广东', '深圳', '医疗健康',       '300-1000 人','enterprise',9999.00::numeric, 500, 100000000::bigint, 28400000::bigint, 2400::bigint, true,  '林雨'),
      (7,  'lingxi-education',     'Lingxi Education',             '灵犀教育科技',       'company',    'active',    'pending',    'follow_up', '江苏', '南京', '教育科技',       '100-300 人', 'growth',  2999.00::numeric,   80,  20000000::bigint,  9800000::bigint,  820::bigint,  false, '周灵'),
      (8,  'tuopu-manufacturing',  'Tuopu Manufacturing',          '拓普智能制造',       'company',    'active',    'verified',   'normal',    '山东', '青岛', '智能制造',       '1000+ 人',   'enterprise',9999.00::numeric, 800, 100000000::bigint, 45100000::bigint, 3900::bigint, true,  '赵拓'),
      (9,  'qiming-finance',       'Qiming Finance',               '启明金融科技',       'company',    'active',    'verified',   'follow_up', '上海', '上海', '金融科技',       '300-1000 人','enterprise',9999.00::numeric, 400, 100000000::bigint, 68000000::bigint, 5200::bigint, false, '秦明'),
      (10, 'changhe-energy',       'Changhe Energy',               '长河新能源',         'company',    'active',    'verified',   'normal',    '湖北', '武汉', '新能源',         '100-300 人', 'growth',  2999.00::numeric,  120,  20000000::bigint, 12100000::bigint,  960::bigint,  false, '何川'),
      (11, 'xiaoman-retail',       'Xiaoman Retail',               '小满零售',           'company',    'trial',     'unverified', 'normal',    '浙江', '杭州', '零售电商',       '30-100 人',  'starter',    0.00::numeric,   10,   1000000::bigint,   430000::bigint,   66::bigint,  false, '满小'),
      (12, 'jiahe-logistics',      'Jiahe Logistics',              '嘉禾物流供应链',     'company',    'active',    'pending',    'follow_up', '河南', '郑州', '物流供应链',     '300-1000 人','growth',  2999.00::numeric,  160,  20000000::bigint, 17000000::bigint, 1300::bigint, false, '贾和'),
      (13, 'shanhai-culture',      'Shanhai Culture',              '山海文旅',           'company',    'active',    'verified',   'normal',    '福建', '厦门', '文旅',           '100-300 人', 'growth',  2999.00::numeric,   60,  20000000::bigint,  7200000::bigint,  640::bigint,  false, '海山'),
      (14, 'nebula-game',          'Nebula Game Studio',           '星云互动游戏',       'company',    'active',    'unverified', 'follow_up', '广东', '广州', '游戏互动',       '30-100 人',  'starter',    0.00::numeric,   15,   1000000::bigint,   920000::bigint,  102::bigint,  false, '星云'),
      (15, 'aurora-design',        'Aurora Design',                '极光设计协作',       'company',    'active',    'verified',   'normal',    '北京', '北京', '设计协作',       '30-100 人',  'growth',  2999.00::numeric,   50,  20000000::bigint,  5100000::bigint,  430::bigint,  false, '安若'),
      (16, 'lighthouse-law',       'Lighthouse Law',               '灯塔法律服务',       'company',    'active',    'verified',   'normal',    '上海', '上海', '法律服务',       '100-300 人', 'growth',  2999.00::numeric,   70,  20000000::bigint,  8600000::bigint,  710::bigint,  false, '律航'),
      (17, 'pinecone-biotech',     'Pinecone Biotech',             '松果生物科技',       'company',    'active',    'pending',    'follow_up', '浙江', '杭州', '生物科技',       '100-300 人', 'enterprise',9999.00::numeric, 220, 100000000::bigint, 19200000::bigint, 1500::bigint, true,  '松果'),
      (18, 'rivercloud-government','Rivercloud Government',        '江云政务服务',       'company',    'active',    'verified',   'high',   '江苏', '苏州', '政务服务',       '1000+ 人',   'enterprise',9999.00::numeric, 600, 100000000::bigint, 81000000::bigint, 6100::bigint, false, '江云'),
      (19, 'chen-personal',        'Chen Personal Workspace',      '陈一个人租户',       'individual', 'active',    'verified',   'normal',    '广东', '深圳', '个人开发者',     '个人',       'starter',    0.00::numeric,    1,   1000000::bigint,   120000::bigint,   18::bigint,  false, '陈一'),
      (20, 'muxi-startup',         'Muxi Startup',                 '木西初创团队',       'company',    'cancelled', 'rejected',   'high',   '广东', '深圳', '初创团队',       '10-30 人',   'starter',    0.00::numeric,    5,         0::bigint,        0::bigint,    0::bigint,   false, '木西')
    ) AS seed(
      idx, tenant_code, tenant_name, display_name, tenant_type, tenant_status, verified_status, risk_level,
      province, city, industry, scale, plan_code, pay_amount, max_users, period_tokens, used_tokens, request_count,
      allow_custom_model, owner_display_name
    )
  LOOP
    v_owner_username := CASE
      WHEN v_tenant.tenant_code IN ('zhangsan-personal', 'zhangsan-org') THEN 'zhangsan'
      ELSE replace(v_tenant.tenant_code, '-', '_') || '_owner'
    END;
    v_admin_username := replace(v_tenant.tenant_code, '-', '_') || '_admin';
    v_member_username := replace(v_tenant.tenant_code, '-', '_') || '_member';
    v_subscription_status := CASE
      WHEN v_tenant.tenant_status = 'trial' THEN 'trial'
      WHEN v_tenant.tenant_status = 'suspended' THEN 'suspended'
      WHEN v_tenant.tenant_status = 'cancelled' THEN 'cancelled'
      ELSE 'active'
    END;
    v_member_status := CASE
      WHEN v_tenant.tenant_status = 'suspended' THEN 'banned'
      WHEN v_tenant.tenant_status = 'cancelled' THEN 'inactive'
      ELSE 'active'
    END;
    v_allowed_models := CASE
      WHEN v_tenant.plan_code = 'enterprise' THEN ARRAY['doubao-seed-2-0-lite-260215','doubao-seed-2-0-pro-260215','doubao-seed-2-0-code-preview-260215','claude-sonnet-4-20250514','private-qwen-72b']
      WHEN v_tenant.plan_code = 'growth' THEN ARRAY['doubao-seed-2-0-lite-260215','doubao-seed-2-0-pro-260215','doubao-seed-2-0-code-preview-260215','claude-sonnet-4-20250514']
      ELSE ARRAY['doubao-seed-2-0-lite-260215']
    END;

    INSERT INTO account.account (username, email, phone, password_hash, status)
    VALUES (
      v_owner_username,
      CASE WHEN v_owner_username = 'zhangsan' THEN 'zhangsan@local.vxture' ELSE replace(v_tenant.tenant_code, '-', '.') || '.owner@tenant.example' END,
      '1398' || lpad((v_tenant.idx * 10 + 1)::text, 7, '0'),
      '123456',
      true
    )
    ON CONFLICT (username) DO UPDATE SET
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      password_hash = EXCLUDED.password_hash,
      status = true,
      updated_at = now(),
      deleted_at = NULL
    RETURNING id INTO v_owner_account_id;

    INSERT INTO account.account_profile (account_id, display_name, headline, bio, timezone, language, created_at, updated_at)
    VALUES (
      v_owner_account_id,
      v_tenant.owner_display_name,
      'Tenant Owner',
      '租户测试数据 owner，用于平台运营管理联调。',
      'Asia/Shanghai',
      'zh-CN',
      now(),
      now()
    )
    ON CONFLICT (account_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      headline = EXCLUDED.headline,
      bio = EXCLUDED.bio,
      timezone = EXCLUDED.timezone,
      language = EXCLUDED.language,
      updated_at = now();

    INSERT INTO account.account_identity (account_id, provider, provider_account_id, provider_account_data)
    VALUES (v_owner_account_id, 'password', v_owner_username, jsonb_build_object('seed', 'admin-tenant-test', 'tenantCode', v_tenant.tenant_code))
    ON CONFLICT DO NOTHING;

    INSERT INTO tenancy.tenant (
      tenant_code, tenant_name, display_name, tenant_type, status, created_by, approved_at, approved_by,
      description, language, time_zone, status_reason, status_at, tenant_owner, created_at, updated_at, deleted_at
    ) VALUES (
      v_tenant.tenant_code,
      v_tenant.tenant_name,
      v_tenant.display_name,
      v_tenant.tenant_type,
      v_tenant.tenant_status,
      v_owner_account_id,
      CASE WHEN v_tenant.verified_status = 'verified' THEN now() - (v_tenant.idx || ' days')::interval ELSE NULL END,
      NULL,
      v_tenant.industry || '测试租户，用于 admin 租户管理、订阅、计量和模型策略联调。',
      'zh-CN',
      'Asia/Shanghai',
      CASE WHEN v_tenant.tenant_status IN ('suspended', 'cancelled') THEN '测试状态：' || v_tenant.tenant_status ELSE NULL END,
      now() - (v_tenant.idx || ' days')::interval,
      v_owner_account_id,
      now() - (v_tenant.idx || ' days')::interval,
      now(),
      NULL
    )
    ON CONFLICT (tenant_code) DO UPDATE SET
      tenant_name = EXCLUDED.tenant_name,
      display_name = EXCLUDED.display_name,
      tenant_type = EXCLUDED.tenant_type,
      status = EXCLUDED.status,
      created_by = COALESCE(tenancy.tenant.created_by, EXCLUDED.created_by),
      approved_at = EXCLUDED.approved_at,
      description = EXCLUDED.description,
      language = EXCLUDED.language,
      time_zone = EXCLUDED.time_zone,
      status_reason = EXCLUDED.status_reason,
      status_at = EXCLUDED.status_at,
      tenant_owner = EXCLUDED.tenant_owner,
      updated_at = now(),
      deleted_at = NULL
    RETURNING id INTO v_tenant_id;

    INSERT INTO tenancy.tenant_organization (
      tenant_id, company_name, unified_social_credit_code, industry, scale, contact_name, contact_phone, contact_email,
      province, city, district, address, verified_status, verified_at, rejected_reason, country_code, postal_code,
      created_at, updated_at, deleted_at
    ) VALUES (
      v_tenant_id,
      v_tenant.display_name,
      '91310000MA' || lpad(v_tenant.idx::text, 8, '0'),
      v_tenant.industry,
      v_tenant.scale,
      v_tenant.owner_display_name,
      '1398' || lpad((v_tenant.idx * 10 + 1)::text, 7, '0'),
      CASE WHEN v_owner_username = 'zhangsan' THEN 'zhangsan@local.vxture' ELSE replace(v_tenant.tenant_code, '-', '.') || '.owner@tenant.example' END,
      v_tenant.province,
      v_tenant.city,
      NULL,
      v_tenant.province || v_tenant.city || '测试地址 ' || v_tenant.idx || ' 号',
      v_tenant.verified_status,
      CASE WHEN v_tenant.verified_status = 'verified' THEN now() - (v_tenant.idx || ' days')::interval ELSE NULL END,
      CASE WHEN v_tenant.verified_status = 'rejected' THEN '测试数据：认证资料缺失。' ELSE NULL END,
      'CN',
      '200000',
      now(),
      now(),
      NULL
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      unified_social_credit_code = EXCLUDED.unified_social_credit_code,
      industry = EXCLUDED.industry,
      scale = EXCLUDED.scale,
      contact_name = EXCLUDED.contact_name,
      contact_phone = EXCLUDED.contact_phone,
      contact_email = EXCLUDED.contact_email,
      province = EXCLUDED.province,
      city = EXCLUDED.city,
      address = EXCLUDED.address,
      verified_status = EXCLUDED.verified_status,
      verified_at = EXCLUDED.verified_at,
      rejected_reason = EXCLUDED.rejected_reason,
      updated_at = now(),
      deleted_at = NULL;

    INSERT INTO tenancy.tenant_domain (
      tenant_id, domain, domain_type, is_primary, ssl_status, verification_status, verification_token, verified_at, token_expires_at, deleted_at
    ) VALUES (
      v_tenant_id,
      v_tenant.tenant_code || '.local.vxture.ai',
      'subdomain',
      true,
      CASE WHEN v_tenant.tenant_status IN ('active', 'trial') THEN 'active' ELSE 'none' END,
      CASE WHEN v_tenant.verified_status = 'verified' THEN 'verified' ELSE 'pending' END,
      'vx-' || v_tenant.tenant_code,
      CASE WHEN v_tenant.verified_status = 'verified' THEN now() - (v_tenant.idx || ' days')::interval ELSE NULL END,
      now() + interval '30 days',
      NULL
    )
    ON CONFLICT (domain) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      is_primary = EXCLUDED.is_primary,
      ssl_status = EXCLUDED.ssl_status,
      verification_status = EXCLUDED.verification_status,
      verification_token = EXCLUDED.verification_token,
      verified_at = EXCLUDED.verified_at,
      token_expires_at = EXCLUDED.token_expires_at,
      updated_at = now(),
      deleted_at = NULL;

    INSERT INTO tenancy.tenant_config (
      tenant_id, config_key, config_value, config_group, value_type, is_sensitive, is_readonly, description, created_by, updated_by, deleted_at
    ) VALUES
      (v_tenant_id, 'feature.assistant_enabled', CASE WHEN v_tenant.tenant_status IN ('active','trial') THEN 'true' ELSE 'false' END, 'feature', 'boolean', false, false, '是否允许租户使用智能助手。', v_owner_account_id, v_owner_account_id, NULL),
      (v_tenant_id, 'ops.risk_level', v_tenant.risk_level, 'ops', 'string', false, false, '平台运营侧风险等级。', v_owner_account_id, v_owner_account_id, NULL),
      (v_tenant_id, 'billing.plan_code', v_tenant.plan_code, 'billing', 'string', false, true, '测试订阅套餐编码。', v_owner_account_id, v_owner_account_id, NULL)
    ON CONFLICT (tenant_id, config_key) DO UPDATE SET
      config_value = EXCLUDED.config_value,
      config_group = EXCLUDED.config_group,
      value_type = EXCLUDED.value_type,
      is_sensitive = EXCLUDED.is_sensitive,
      is_readonly = EXCLUDED.is_readonly,
      description = EXCLUDED.description,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL;

    INSERT INTO tenancy.tenant_role (
      tenant_id, role_code, role_name, description, is_system, status, sort, created_by, updated_by, deleted_at
    ) VALUES (
      v_tenant_id, 'owner', '所有者', '租户主所有者，拥有全部租户管理权限。', true, 'active', 1, v_owner_account_id, v_owner_account_id, NULL
    )
    ON CONFLICT (tenant_id, role_code) DO UPDATE SET
      role_name = EXCLUDED.role_name,
      description = EXCLUDED.description,
      is_system = EXCLUDED.is_system,
      status = EXCLUDED.status,
      sort = EXCLUDED.sort,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL
    RETURNING id INTO v_owner_role_id;

    INSERT INTO tenancy.tenant_role (
      tenant_id, role_code, role_name, description, is_system, status, sort, created_by, updated_by, deleted_at
    ) VALUES (
      v_tenant_id, 'admin', '管理员', '负责成员、订阅、配额和运营协同。', true, 'active', 2, v_owner_account_id, v_owner_account_id, NULL
    )
    ON CONFLICT (tenant_id, role_code) DO UPDATE SET
      role_name = EXCLUDED.role_name,
      description = EXCLUDED.description,
      is_system = EXCLUDED.is_system,
      status = EXCLUDED.status,
      sort = EXCLUDED.sort,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL
    RETURNING id INTO v_admin_role_id;

    INSERT INTO tenancy.tenant_role (
      tenant_id, role_code, role_name, description, is_system, status, sort, created_by, updated_by, deleted_at
    ) VALUES (
      v_tenant_id, 'member', '成员', '普通成员，可查看基础订阅和配额信息。', true, 'active', 3, v_owner_account_id, v_owner_account_id, NULL
    )
    ON CONFLICT (tenant_id, role_code) DO UPDATE SET
      role_name = EXCLUDED.role_name,
      description = EXCLUDED.description,
      is_system = EXCLUDED.is_system,
      status = EXCLUDED.status,
      sort = EXCLUDED.sort,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL
    RETURNING id INTO v_member_role_id;

    INSERT INTO tenancy.tenant_role_permission (tenant_id, role_id, permission_id, created_by)
    SELECT v_tenant_id, v_owner_role_id, id, v_owner_account_id
    FROM tenancy.tenant_permission
    WHERE permission_code IN ('tenant.user.manage','tenant.role.manage','tenant.subscription.read','tenant.billing.read','tenant.quota.read','tenant.model.read')
    ON CONFLICT DO NOTHING;

    INSERT INTO tenancy.tenant_role_permission (tenant_id, role_id, permission_id, created_by)
    SELECT v_tenant_id, v_admin_role_id, id, v_owner_account_id
    FROM tenancy.tenant_permission
    WHERE permission_code IN ('tenant.user.manage','tenant.subscription.read','tenant.billing.read','tenant.quota.read','tenant.model.read')
    ON CONFLICT DO NOTHING;

    INSERT INTO tenancy.tenant_role_permission (tenant_id, role_id, permission_id, created_by)
    SELECT v_tenant_id, v_member_role_id, id, v_owner_account_id
    FROM tenancy.tenant_permission
    WHERE permission_code IN ('tenant.subscription.read','tenant.quota.read')
    ON CONFLICT DO NOTHING;

    INSERT INTO tenancy.tenant_member (
      tenant_id, account_id, role, role_id, is_primary_owner, status, nickname, remark, joined_source, joined_at, last_active_at, created_by, updated_by, deleted_at
    ) VALUES (
      v_tenant_id, v_owner_account_id, 'owner', v_owner_role_id, true, v_member_status, v_tenant.owner_display_name,
      '测试租户主所有者。', 'created', now() - (v_tenant.idx || ' days')::interval, now() - (v_tenant.idx || ' hours')::interval, v_owner_account_id, v_owner_account_id, NULL
    )
    ON CONFLICT (tenant_id, account_id) DO UPDATE SET
      role = EXCLUDED.role,
      role_id = EXCLUDED.role_id,
      is_primary_owner = EXCLUDED.is_primary_owner,
      status = EXCLUDED.status,
      nickname = EXCLUDED.nickname,
      remark = EXCLUDED.remark,
      last_active_at = EXCLUDED.last_active_at,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL;

    IF v_tenant.tenant_type = 'company' THEN
      INSERT INTO account.account (username, email, phone, password_hash, status)
      VALUES (v_admin_username, replace(v_tenant.tenant_code, '-', '.') || '.admin@tenant.example', '1398' || lpad((v_tenant.idx * 10 + 2)::text, 7, '0'), '123456', true)
      ON CONFLICT (username) DO UPDATE SET
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        password_hash = EXCLUDED.password_hash,
        status = true,
        updated_at = now(),
        deleted_at = NULL
      RETURNING id INTO v_admin_account_id;

      INSERT INTO account.account (username, email, phone, password_hash, status)
      VALUES (v_member_username, replace(v_tenant.tenant_code, '-', '.') || '.member@tenant.example', '1398' || lpad((v_tenant.idx * 10 + 3)::text, 7, '0'), '123456', true)
      ON CONFLICT (username) DO UPDATE SET
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        password_hash = EXCLUDED.password_hash,
        status = true,
        updated_at = now(),
        deleted_at = NULL
      RETURNING id INTO v_member_account_id;

      INSERT INTO account.account_profile (account_id, display_name, headline, bio, timezone, language, created_at, updated_at)
      VALUES
        (v_admin_account_id, v_tenant.display_name || ' 管理员', 'Tenant Admin', '租户测试数据管理员。', 'Asia/Shanghai', 'zh-CN', now(), now()),
        (v_member_account_id, v_tenant.display_name || ' 成员', 'Tenant Member', '租户测试数据成员。', 'Asia/Shanghai', 'zh-CN', now(), now())
      ON CONFLICT (account_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        timezone = EXCLUDED.timezone,
        language = EXCLUDED.language,
        updated_at = now();

      INSERT INTO account.account_identity (account_id, provider, provider_account_id, provider_account_data)
      VALUES
        (v_admin_account_id, 'password', v_admin_username, jsonb_build_object('seed', 'admin-tenant-test', 'tenantCode', v_tenant.tenant_code)),
        (v_member_account_id, 'password', v_member_username, jsonb_build_object('seed', 'admin-tenant-test', 'tenantCode', v_tenant.tenant_code))
      ON CONFLICT DO NOTHING;

      INSERT INTO tenancy.tenant_member (
        tenant_id, account_id, role, role_id, is_primary_owner, status, nickname, remark, joined_source, joined_at, last_active_at, created_by, updated_by, deleted_at
      ) VALUES
        (v_tenant_id, v_admin_account_id, 'admin', v_admin_role_id, false, v_member_status, v_tenant.display_name || ' 管理员', '测试租户管理员。', 'invited', now() - (v_tenant.idx || ' days')::interval, now() - ((v_tenant.idx + 2) || ' hours')::interval, v_owner_account_id, v_owner_account_id, NULL),
        (v_tenant_id, v_member_account_id, 'member', v_member_role_id, false, v_member_status, v_tenant.display_name || ' 成员', '测试租户成员。', 'invited', now() - (v_tenant.idx || ' days')::interval, now() - ((v_tenant.idx + 4) || ' hours')::interval, v_owner_account_id, v_owner_account_id, NULL)
      ON CONFLICT (tenant_id, account_id) DO UPDATE SET
        role = EXCLUDED.role,
        role_id = EXCLUDED.role_id,
        is_primary_owner = EXCLUDED.is_primary_owner,
        status = EXCLUDED.status,
        nickname = EXCLUDED.nickname,
        remark = EXCLUDED.remark,
        last_active_at = EXCLUDED.last_active_at,
        updated_by = EXCLUDED.updated_by,
        updated_at = now(),
        deleted_at = NULL;
    END IF;

    SELECT id INTO v_plan_id
    FROM product.plan
    WHERE plan_code = v_tenant.plan_code
      AND deleted_at IS NULL
    LIMIT 1;

    IF v_plan_id IS NULL THEN
      RAISE EXCEPTION 'Plan % is required before tenant test seed can run.', v_tenant.plan_code;
    END IF;

    v_subscription_id := CASE
      WHEN v_tenant.idx = 1 THEN 'f76d68a5-cd82-4a01-b338-950000000001'::uuid
      WHEN v_tenant.idx = 2 THEN 'f76d68a5-cd82-4a01-b338-950000000002'::uuid
      ELSE ('f76d68a5-cd82-4a01-b338-98' || lpad(v_tenant.idx::text, 10, '0'))::uuid
    END;
    v_quota_id := CASE
      WHEN v_tenant.idx = 1 THEN 'd0d5cd22-8c6b-45c8-b983-960000000001'::uuid
      WHEN v_tenant.idx = 2 THEN 'd0d5cd22-8c6b-45c8-b983-960000000002'::uuid
      ELSE ('d0d5cd22-8c6b-45c8-b983-98' || lpad(v_tenant.idx::text, 10, '0'))::uuid
    END;

    INSERT INTO commerce.tenant_subscription (
      id, tenant_id, plan_id, cycle_type, start_at, end_at, trial_end_at, status, auto_renew, order_no, pay_amount, currency, created_by, updated_by, deleted_at
    ) VALUES (
      v_subscription_id,
      v_tenant_id,
      v_plan_id,
      'monthly',
      now() - (v_tenant.idx || ' days')::interval,
      CASE WHEN v_subscription_status = 'cancelled' THEN now() - interval '2 days' ELSE NULL END,
      CASE WHEN v_subscription_status = 'trial' THEN now() + interval '14 days' ELSE NULL END,
      v_subscription_status,
      v_subscription_status IN ('active', 'trial'),
      'SEED-TENANT-' || upper(replace(v_tenant.tenant_code, '-', '-')),
      v_tenant.pay_amount,
      'CNY',
      v_owner_account_id,
      v_owner_account_id,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      plan_id = EXCLUDED.plan_id,
      cycle_type = EXCLUDED.cycle_type,
      end_at = EXCLUDED.end_at,
      trial_end_at = EXCLUDED.trial_end_at,
      status = EXCLUDED.status,
      auto_renew = EXCLUDED.auto_renew,
      order_no = EXCLUDED.order_no,
      pay_amount = EXCLUDED.pay_amount,
      currency = EXCLUDED.currency,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL;

    INSERT INTO commerce.tenant_subscription_quota (
      id, tenant_id, subscription_id, max_users, max_api_keys, max_workflows, max_concurrent, rate_limit_per_minute,
      period_tokens, quota_cycle, allowed_models, allow_custom_model, created_by, updated_by, effective_at, expires_at
    ) VALUES (
      v_quota_id,
      v_tenant_id,
      v_subscription_id,
      v_tenant.max_users,
      GREATEST(2, v_tenant.max_users / 10),
      GREATEST(5, v_tenant.max_users / 2),
      GREATEST(2, v_tenant.max_users / 20),
      CASE WHEN v_tenant.plan_code = 'enterprise' THEN 300 WHEN v_tenant.plan_code = 'growth' THEN 120 ELSE 30 END,
      v_tenant.period_tokens,
      'monthly',
      v_allowed_models,
      v_tenant.allow_custom_model,
      v_owner_account_id,
      v_owner_account_id,
      now() - (v_tenant.idx || ' days')::interval,
      CASE WHEN v_subscription_status = 'cancelled' THEN now() - interval '1 day' ELSE NULL END
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
      subscription_id = EXCLUDED.subscription_id,
      max_users = EXCLUDED.max_users,
      max_api_keys = EXCLUDED.max_api_keys,
      max_workflows = EXCLUDED.max_workflows,
      max_concurrent = EXCLUDED.max_concurrent,
      rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
      period_tokens = EXCLUDED.period_tokens,
      quota_cycle = EXCLUDED.quota_cycle,
      allowed_models = EXCLUDED.allowed_models,
      allow_custom_model = EXCLUDED.allow_custom_model,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      effective_at = EXCLUDED.effective_at,
      expires_at = EXCLUDED.expires_at;

    INSERT INTO commerce.tenant_usage_summary (
      tenant_id, feature_id, agent_id, cycle_month, total_quota, input_quota, output_quota, request_count, stat_type
    ) VALUES (
      v_tenant_id,
      v_zero,
      v_zero,
      v_cycle_month,
      v_tenant.used_tokens,
      (v_tenant.used_tokens * 0.62)::bigint,
      v_tenant.used_tokens - (v_tenant.used_tokens * 0.62)::bigint,
      v_tenant.request_count,
      'summary'
    )
    ON CONFLICT (tenant_id, feature_id, agent_id, cycle_month, stat_type) DO UPDATE SET
      total_quota = EXCLUDED.total_quota,
      input_quota = EXCLUDED.input_quota,
      output_quota = EXCLUDED.output_quota,
      request_count = EXCLUDED.request_count,
      last_synced_at = now(),
      updated_at = now();

    INSERT INTO commerce.tenant_usage_summary (
      tenant_id, feature_id, agent_id, cycle_month, total_quota, input_quota, output_quota, request_count, stat_type
    ) VALUES
      (v_tenant_id, v_feature_ai_tokens, v_agent_console, v_cycle_month, (v_tenant.used_tokens * 0.55)::bigint, (v_tenant.used_tokens * 0.34)::bigint, (v_tenant.used_tokens * 0.21)::bigint, (v_tenant.request_count * 0.55)::bigint, 'detail'),
      (v_tenant_id, v_feature_ai_tokens, v_agent_ruyin, v_cycle_month, v_tenant.used_tokens - (v_tenant.used_tokens * 0.55)::bigint, (v_tenant.used_tokens * 0.28)::bigint, v_tenant.used_tokens - (v_tenant.used_tokens * 0.55)::bigint - (v_tenant.used_tokens * 0.28)::bigint, v_tenant.request_count - (v_tenant.request_count * 0.55)::bigint, 'detail')
    ON CONFLICT (tenant_id, feature_id, agent_id, cycle_month, stat_type) DO UPDATE SET
      total_quota = EXCLUDED.total_quota,
      input_quota = EXCLUDED.input_quota,
      output_quota = EXCLUDED.output_quota,
      request_count = EXCLUDED.request_count,
      last_synced_at = now(),
      updated_at = now();

    INSERT INTO commerce.tenant_usage_event (
      id, tenant_id, agent_id, feature_id, user_id, used_quota, input_quota, output_quota, request_id, business_id,
      usage_type, cycle_date, cycle_month, model_code, latency_ms
    ) VALUES
      (
        ('eeeeeeee-eeee-4eee-8eee-98' || lpad((v_tenant.idx * 10 + 1)::text, 10, '0'))::uuid,
        v_tenant_id,
        v_agent_console,
        v_feature_ai_tokens,
        v_owner_account_id,
        (v_tenant.used_tokens * 0.55)::bigint,
        (v_tenant.used_tokens * 0.34)::bigint,
        (v_tenant.used_tokens * 0.55)::bigint - (v_tenant.used_tokens * 0.34)::bigint,
        'seed-' || v_tenant.tenant_code || '-console',
        'seed-business-' || v_tenant.tenant_code || '-console',
        'test',
        current_date - v_tenant.idx,
        v_cycle_month,
        'doubao-seed-2-0-lite-260215',
        420 + v_tenant.idx
      ),
      (
        ('eeeeeeee-eeee-4eee-8eee-98' || lpad((v_tenant.idx * 10 + 2)::text, 10, '0'))::uuid,
        v_tenant_id,
        v_agent_ruyin,
        v_feature_ai_tokens,
        v_owner_account_id,
        v_tenant.used_tokens - (v_tenant.used_tokens * 0.55)::bigint,
        (v_tenant.used_tokens * 0.28)::bigint,
        v_tenant.used_tokens - (v_tenant.used_tokens * 0.55)::bigint - (v_tenant.used_tokens * 0.28)::bigint,
        'seed-' || v_tenant.tenant_code || '-ruyin',
        'seed-business-' || v_tenant.tenant_code || '-ruyin',
        'test',
        current_date - v_tenant.idx,
        v_cycle_month,
        CASE WHEN v_tenant.plan_code = 'enterprise' THEN 'doubao-seed-2-0-pro-260215' ELSE 'doubao-seed-2-0-lite-260215' END,
        520 + v_tenant.idx
      )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      agent_id = EXCLUDED.agent_id,
      feature_id = EXCLUDED.feature_id,
      user_id = EXCLUDED.user_id,
      used_quota = EXCLUDED.used_quota,
      input_quota = EXCLUDED.input_quota,
      output_quota = EXCLUDED.output_quota,
      request_id = EXCLUDED.request_id,
      business_id = EXCLUDED.business_id,
      usage_type = EXCLUDED.usage_type,
      cycle_date = EXCLUDED.cycle_date,
      cycle_month = EXCLUDED.cycle_month,
      model_code = EXCLUDED.model_code,
      latency_ms = EXCLUDED.latency_ms;

    v_lite_grant_id := CASE
      WHEN v_tenant.idx = 1 THEN 'bb99b8f6-095a-4cb8-95c1-970000000001'::uuid
      WHEN v_tenant.idx = 2 THEN 'bb99b8f6-095a-4cb8-95c1-970000000002'::uuid
      ELSE ('bb99b8f6-095a-4cb8-95c1-98' || lpad((v_tenant.idx * 10 + 1)::text, 10, '0'))::uuid
    END;

    INSERT INTO ai_gateway.ai_model_grant (
      id, model_id, tenant_id, agent_id, priority, reason, is_active, created_by, updated_by
    ) VALUES (
      v_lite_grant_id,
      v_model_doubao_lite,
      v_tenant_id,
      NULL,
      100,
      'Admin tenant test seed default lite model.',
      v_tenant.tenant_status IN ('active', 'trial'),
      v_system_admin,
      v_system_admin
    )
    ON CONFLICT (id) DO UPDATE SET
      model_id = EXCLUDED.model_id,
      tenant_id = EXCLUDED.tenant_id,
      agent_id = EXCLUDED.agent_id,
      priority = EXCLUDED.priority,
      reason = EXCLUDED.reason,
      is_active = EXCLUDED.is_active,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL;

    IF v_tenant.plan_code IN ('growth', 'enterprise') THEN
      v_pro_grant_id := CASE
        WHEN v_tenant.idx = 2 THEN 'bb99b8f6-095a-4cb8-95c1-970000000007'::uuid
        ELSE ('bb99b8f6-095a-4cb8-95c1-98' || lpad((v_tenant.idx * 10 + 2)::text, 10, '0'))::uuid
      END;

      INSERT INTO ai_gateway.ai_model_grant (
        id, model_id, tenant_id, agent_id, priority, reason, is_active, created_by, updated_by
      ) VALUES (
        v_pro_grant_id,
        v_model_doubao_pro,
        v_tenant_id,
        v_agent_console,
        60,
        'Admin tenant test seed console assistant pro model.',
        v_tenant.tenant_status IN ('active', 'trial'),
        v_system_admin,
        v_system_admin
      )
      ON CONFLICT (id) DO UPDATE SET
        model_id = EXCLUDED.model_id,
        tenant_id = EXCLUDED.tenant_id,
        agent_id = EXCLUDED.agent_id,
        priority = EXCLUDED.priority,
        reason = EXCLUDED.reason,
        is_active = EXCLUDED.is_active,
        updated_by = EXCLUDED.updated_by,
        updated_at = now(),
        deleted_at = NULL;
    END IF;

    IF v_tenant.plan_code = 'enterprise' THEN
      v_claude_grant_id := CASE
        WHEN v_tenant.idx = 2 THEN 'bb99b8f6-095a-4cb8-95c1-970000000003'::uuid
        ELSE ('bb99b8f6-095a-4cb8-95c1-98' || lpad((v_tenant.idx * 10 + 3)::text, 10, '0'))::uuid
      END;

      INSERT INTO ai_gateway.ai_model_grant (
        id, model_id, tenant_id, agent_id, priority, reason, is_active, created_by, updated_by
      ) VALUES (
        v_claude_grant_id,
        v_model_claude_sonnet,
        v_tenant_id,
        v_agent_ruyin,
        40,
        'Admin tenant test seed enterprise reasoning model.',
        v_tenant.tenant_status IN ('active', 'trial'),
        v_system_admin,
        v_system_admin
      )
      ON CONFLICT (id) DO UPDATE SET
        model_id = EXCLUDED.model_id,
        tenant_id = EXCLUDED.tenant_id,
        agent_id = EXCLUDED.agent_id,
        priority = EXCLUDED.priority,
        reason = EXCLUDED.reason,
        is_active = EXCLUDED.is_active,
        updated_by = EXCLUDED.updated_by,
        updated_at = now(),
      deleted_at = NULL;
    END IF;
  END LOOP;

  FOR v_seed_account IN
    SELECT *
    FROM (VALUES
      ('account_ops_multi',       '周航', 'zhou.hang@accounts.example',  '13870001001', true,   3::int,    '101.33.68.12',   '跨租户运营负责人', '同时归属于个人租户和多个组织租户，用于验证账号管理的混合租户视角。'),
      ('account_cross_admin',     '李澈', 'li.che@accounts.example',     '13870001002', true,   7::int,    '112.93.45.88',   '组织账号管理员',   '归属于多个组织租户，用于验证组织数量、最高权限和跨组织筛选。'),
      ('account_single_org',      '许宁', 'xu.ning@accounts.example',    '13870001003', true,   16::int,   '111.206.145.21', '普通成员账号',     '单组织成员账号，用于验证组织租户单一标注。'),
      ('account_invited_pending', '苏晚', 'su.wan@accounts.example',     '13870001004', true,   NULL::int, NULL::varchar,   '待激活账号',       '已邀请但尚未激活，用于验证待激活状态。'),
      ('account_locked_temp',     '郑岩', 'zheng.yan@accounts.example',  '13870001005', true,   504::int,  '119.29.66.70',   '临时锁定账号',     '成员状态被限制，用于验证临时锁定状态。'),
      ('account_disabled_idle',   '林舟', 'lin.zhou@accounts.example',   '13870001006', false,  2880::int, '58.247.88.9',    '长期停用账号',     '账号已停用，用于验证长期未用和停用状态。')
    ) AS seed(username, display_name, email, phone, account_enabled, last_login_hours, last_login_ip, headline, bio)
  LOOP
    INSERT INTO account.account (
      username, email, phone, password_hash, status, last_login_at, last_login_ip
    ) VALUES (
      v_seed_account.username,
      v_seed_account.email,
      v_seed_account.phone,
      '123456',
      v_seed_account.account_enabled,
      CASE
        WHEN v_seed_account.last_login_hours IS NULL THEN NULL
        ELSE now() - (v_seed_account.last_login_hours || ' hours')::interval
      END,
      v_seed_account.last_login_ip
    )
    ON CONFLICT (username) DO UPDATE SET
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      password_hash = EXCLUDED.password_hash,
      status = EXCLUDED.status,
      last_login_at = EXCLUDED.last_login_at,
      last_login_ip = EXCLUDED.last_login_ip,
      updated_at = now(),
      deleted_at = NULL
    RETURNING id INTO v_seed_account_id;

    INSERT INTO account.account_profile (
      account_id, display_name, headline, bio, timezone, language, created_at, updated_at
    ) VALUES (
      v_seed_account_id,
      v_seed_account.display_name,
      v_seed_account.headline,
      v_seed_account.bio,
      'Asia/Shanghai',
      'zh-CN',
      now(),
      now()
    )
    ON CONFLICT (account_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      headline = EXCLUDED.headline,
      bio = EXCLUDED.bio,
      timezone = EXCLUDED.timezone,
      language = EXCLUDED.language,
      updated_at = now();

    INSERT INTO account.account_identity (
      account_id, provider, provider_account_id, provider_account_data
    ) VALUES (
      v_seed_account_id,
      'password',
      v_seed_account.username,
      jsonb_build_object('seed', 'admin-account-management', 'accountCode', v_seed_account.username)
    )
    ON CONFLICT (account_id, provider) DO UPDATE SET
      provider_account_id = EXCLUDED.provider_account_id,
      provider_account_data = EXCLUDED.provider_account_data,
      updated_at = now(),
      deleted_at = NULL;
  END LOOP;

  FOR v_seed_binding IN
    SELECT *
    FROM (VALUES
      ('account_ops_multi',       'chen-personal',     'owner',  'active',   false, 'api',     38::int,  3::int,    '个人租户 Owner 角色，用于混合租户验证。'),
      ('account_ops_multi',       'haicheng-digital',  'admin',  'active',   false, 'sso',     31::int,  4::int,    '海澄数字跨租户管理员。'),
      ('account_ops_multi',       'yuntu-medical',     'admin',  'active',   false, 'invited', 25::int,  6::int,    '云图医疗跨租户管理员。'),
      ('account_ops_multi',       'qiming-finance',    'member', 'active',   false, 'invited', 11::int,  8::int,    '启明金融跨租户成员。'),
      ('account_cross_admin',     'haicheng-digital',  'admin',  'active',   false, 'sso',     44::int,  7::int,    '海澄数字管理员。'),
      ('account_cross_admin',     'lingxi-education',  'admin',  'active',   false, 'sso',     33::int,  11::int,   '灵犀教育管理员。'),
      ('account_cross_admin',     'jiahe-logistics',   'member', 'active',   false, 'invited', 13::int,  15::int,   '嘉禾物流成员。'),
      ('account_single_org',      'aurora-design',     'member', 'active',   false, 'invited',  8::int,  16::int,   '极光设计普通成员。'),
      ('account_invited_pending', 'ruyin-lab',         'member', 'inactive', false, 'invited',  2::int,  NULL::int, '如因实验室待激活邀请。'),
      ('account_locked_temp',     'nebula-game',       'member', 'banned',   false, 'invited', 19::int,  504::int,  '星云互动临时锁定成员。'),
      ('account_locked_temp',     'shanhai-culture',   'member', 'active',   false, 'invited', 40::int,  96::int,   '山海文旅历史成员关系。'),
      ('account_disabled_idle',   'lighthouse-law',    'member', 'active',   false, 'invited',180::int, 2880::int,  '灯塔法律长期未用成员。'),
      ('account_disabled_idle',   'muxi-startup',      'member', 'inactive', false, 'invited',172::int, NULL::int,  '木西初创停用成员关系。')
    ) AS seed(username, tenant_code, role_code, member_status, is_primary_owner, joined_source, joined_days, active_hours, remark)
  LOOP
    SELECT id INTO v_seed_account_id
    FROM account.account
    WHERE username = v_seed_binding.username
      AND deleted_at IS NULL
    LIMIT 1;

    SELECT id INTO v_seed_tenant_id
    FROM tenancy.tenant
    WHERE tenant_code = v_seed_binding.tenant_code
      AND deleted_at IS NULL
    LIMIT 1;

    IF v_seed_account_id IS NULL THEN
      RAISE EXCEPTION 'Seed account % is required before account binding seed can run.', v_seed_binding.username;
    END IF;

    IF v_seed_tenant_id IS NULL THEN
      RAISE EXCEPTION 'Tenant % is required before account binding seed can run.', v_seed_binding.tenant_code;
    END IF;

    SELECT id INTO v_seed_role_id
    FROM tenancy.tenant_role
    WHERE tenant_id = v_seed_tenant_id
      AND role_code = v_seed_binding.role_code
      AND deleted_at IS NULL
    LIMIT 1;

    IF v_seed_role_id IS NULL THEN
      RAISE EXCEPTION 'Tenant role % is required for tenant % before account binding seed can run.', v_seed_binding.role_code, v_seed_binding.tenant_code;
    END IF;

    INSERT INTO tenancy.tenant_member (
      tenant_id, account_id, role, role_id, is_primary_owner, status, nickname, remark, joined_source, joined_at, last_active_at, created_by, updated_by, deleted_at
    )
    SELECT
      v_seed_tenant_id,
      v_seed_account_id,
      v_seed_binding.role_code,
      v_seed_role_id,
      v_seed_binding.is_primary_owner,
      v_seed_binding.member_status,
      coalesce(profile.display_name, account.username),
      v_seed_binding.remark,
      v_seed_binding.joined_source,
      now() - (v_seed_binding.joined_days || ' days')::interval,
      CASE
        WHEN v_seed_binding.active_hours IS NULL THEN NULL
        ELSE now() - (v_seed_binding.active_hours || ' hours')::interval
      END,
      v_seed_account_id,
      v_seed_account_id,
      NULL
    FROM account.account account
    LEFT JOIN account.account_profile profile
      ON profile.account_id = account.id
    WHERE account.id = v_seed_account_id
    ON CONFLICT (tenant_id, account_id) DO UPDATE SET
      role = EXCLUDED.role,
      role_id = EXCLUDED.role_id,
      is_primary_owner = EXCLUDED.is_primary_owner,
      status = EXCLUDED.status,
      nickname = EXCLUDED.nickname,
      remark = EXCLUDED.remark,
      joined_source = EXCLUDED.joined_source,
      joined_at = EXCLUDED.joined_at,
      last_active_at = EXCLUDED.last_active_at,
      updated_by = EXCLUDED.updated_by,
      updated_at = now(),
      deleted_at = NULL;
  END LOOP;
END $$;
