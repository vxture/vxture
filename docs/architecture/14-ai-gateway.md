# Vxture AI Gateway - Architecture And Phase 1 Implementation

**Version**: 1.1.0
**Updated**: 2026-04-25
**Scope**: AI model access, routing, technical authorization, quota check, usage metering, and provider cost tracking.

---

## 1. Positioning

AI Gateway is Vxture's platform-level model access layer. It solves one narrow but important problem: Vxture needs to connect many upstream or self-hosted models, while agents and business applications should call one stable interface.

The customer does not buy "Doubao tokens" or "Claude SDKs" directly from Vxture. The customer buys Vxture product plans, quotas, private-model access, and business agents. Vxture then pays upstream model providers according to provider contracts and tracks those costs internally.

The system is therefore split into three layers:

| Layer | Owner | Main Question | Data Location |
| --- | --- | --- | --- |
| Upstream provider | Doubao, Claude, private/self-hosted endpoint | Which model endpoint does Vxture call and what does Vxture pay? | `ai_gateway` |
| Vxture platform | Vxture | Which models are connected, routed, authorized, and costed? | `ai_gateway` + `product` |
| Customer tenant | Vxture customer | Which plan, quota, agent, and fee does the customer see? | `product` + `commerce` |

No business-domain data is stored in AI Gateway. Business records stay in their own domains. Gateway metering only writes technical usage facts such as tenant, agent, feature, model code, token counts, latency, request id, and business id.

---

## 2. Runtime Flow

```text
business agent / app
  -> @vxture/ai-sdk
  -> services/ai/gateway
     -> model registry
     -> technical grant check
     -> commerce quota check
     -> provider adapter
     -> commerce usage event + usage summary
  -> upstream provider or self-hosted model
```

The agent only needs the SDK request contract. It should not know provider API keys, provider billing rules, or routing details.

---

## 3. Package Layout

```text
packages/ai/ai-sdk
  src/llm/client.ts
  src/llm/types.ts

services/ai/gateway
  prisma/schema.prisma
  prisma/migrations/20260425_ai_gateway_control_plane/migration.sql
  prisma/seeds/20260425_initial_platform_seed.sql
  scripts/db-seed.mjs
  src/gateway
  src/metering
  src/providers
  src/quota
  src/registry
  src/router
  src/types
```

Platform operations management is exposed through:

```text
bff/admin-bff/src/routers/ai-gateway.router.ts
portals/admin/src/modules/ai/ModelGatewayPage.tsx
```

---

## 4. Database Split

### 4.1 `ai_gateway`

`ai_gateway` is the model control-plane schema. It stores platform-managed technical configuration.

| Table | Purpose |
| --- | --- |
| `ai_gateway.ai_provider` | Upstream provider registry, for example `doubao`, `claude`, `private`. |
| `ai_gateway.ai_model` | Vxture model registry. Stores model code, endpoint URL, protocol, capabilities, API-key env var name, and non-sensitive config. |
| `ai_gateway.ai_model_grant` | Technical allowlist / gray release. Controls whether a tenant or tenant-agent scope may call a model. |
| `ai_gateway.ai_model_cost_rate` | Vxture upstream provider cost rate for gross-margin and provider settlement analysis. |

Important boundaries:

- API keys are not stored in database plaintext. `ai_model.api_key_env_var` stores only the environment variable name.
- Customer quota is not stored in `ai_model_grant`.
- Customer billing is not stored in `ai_gateway`.
- Failed gateway attempts are not written as customer usage events.

### 4.2 `product`

`product` describes what Vxture sells or exposes.

| Table | AI Gateway Usage |
| --- | --- |
| `product.feature` | Features such as `ai.tokens`, `ai.online_models`, `ai.private_model`, `ai.business_agents`. |
| `product.agent` | Customer-facing business agents such as contract review, digital legal, operation analysis, emergency command. |
| `product.plan` | Customer plan definition, for example starter/growth/enterprise. |
| `product.plan_price` | Customer-facing plan price. |
| `product.plan_feature` | Feature quota and plan capability. |
| `product.plan_agent` | Which agents are included in a plan. |

### 4.3 `commerce`

`commerce` is the customer subscription, quota, usage, and billing domain.

| Table | AI Gateway Usage |
| --- | --- |
| `commerce.tenant_subscription` | Customer's active subscription and plan. |
| `commerce.tenant_subscription_quota` | Effective tenant quota, allowed models, rate limits, and whether private models are allowed. |
| `commerce.tenant_usage_event` | Append-only usage events for successful calls. |
| `commerce.tenant_usage_summary` | Aggregated usage cache for quota checks and dashboards. |

Current quota check reads `tenant_usage_summary` summary rows for the current cycle. Metering writes both detailed and tenant-level summary rows after successful model calls.

---

## 5. Cost And Fee Model

There are two different prices and they must not be mixed:

| Topic | Meaning | Stored In |
| --- | --- | --- |
| Provider cost | What Vxture pays to Doubao, Claude, or another provider. | `ai_gateway.ai_model_cost_rate` |
| Customer fee | What the customer pays Vxture for plans, quotas, private model access, and agent applications. | `product.plan_price`, `product.plan_feature`, `commerce.tenant_subscription` |

Customer-visible fees are expected to include:

- Base plan fee: monthly/yearly SaaS subscription.
- Included model quota: token quota included in the plan.
- Overage or expansion fee: later priced through commerce rules or custom contract.
- Private/self-hosted model access: implementation, hosting, maintenance, or private deployment service fee.
- Business agent fee: included agents, add-on agents, or industry solution packages.
- Optional service fee: industry implementation, data governance, integration, and support.

The phase-1 seed only provides initial product and provider cost records. Contract-specific prices should replace seed values before production.

---

## 6. Request Contract

`@vxture/ai-sdk` sends a normalized request to AI Gateway:

```ts
export interface ChatRequest {
  modelCode: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  tenantId: string;
  agentId?: string;
  userId?: string;
  featureId?: string;
  requestId?: string;
  businessId?: string;
  usageType?: 'normal' | 'retry' | 'test';
}
```

`requestId` is used for idempotent usage-event protection when provided. `businessId` is retained for business-side traceability and duplicate analysis.

---

## 7. Authorization And Quota

Gateway checks two independent gates:

1. Technical grant: `ai_gateway.ai_model_grant`
   - Is the model enabled for this tenant?
   - Is there a tenant-wide grant or an agent-specific grant?
   - Is the grant active and not expired?

2. Business quota: `commerce.tenant_subscription_quota`
   - Is the quota effective for the tenant?
   - Is the requested model allowed by `allowed_models`?
   - If it is a private model, is `allow_custom_model` enabled?
   - Is the current cycle usage still under `period_tokens`?

This keeps platform routing control separate from what the customer purchased.

---

## 8. Metering

Successful calls write:

- `commerce.tenant_usage_event`: one append-only usage record.
- `commerce.tenant_usage_summary`: detail row and tenant summary row for the current month.

The usage event stores:

- `tenant_id`
- `agent_id`
- `feature_id`
- `user_id`
- `used_quota`
- `input_quota`
- `output_quota`
- `request_id`
- `business_id`
- `usage_type`
- `cycle_date`
- `cycle_month`
- `model_code`
- `latency_ms`

Gateway does not persist prompt content or response content in these commerce usage tables.

---

## 9. Phase 1 Seed

Seed file:

```text
services/ai/gateway/prisma/seeds/20260425_initial_platform_seed.sql
```

Run:

```bash
pnpm --filter @vxture/service-ai-gateway db:seed
```

The seed currently initializes:

- Providers: `doubao`, `claude`, `private`.
- Models: `doubao-seed-2-0-lite-260215`, `doubao-seed-2-0-pro-260215`, `doubao-seed-2-0-code-preview-260215`, `claude-sonnet-4-20250514`, `private-qwen-72b`.
- Upstream model cost rates.
- Product features for AI quotas, online models, private model access, and business agents.
- Initial product agents: contract review, digital legal, operation analysis, emergency command.
- Plans: starter, growth, enterprise.
- Demo subscriptions, quotas, and model grants for local `zhangsan-personal` and `zhangsan-org` tenants when those tenants exist.

The seed is idempotent.

---

## 10. Implementation Status

Completed in phase 1:

- `ai_gateway` schema and migration.
- Gateway Prisma schema with `ai_gateway` and `commerce` models.
- Model registry, routing, quota, metering, provider adapters, and HTTP controller.
- SDK gateway client.
- Console BFF model-management proxy.
- Console model gateway management page.
- Initial seed data for provider/model/product/commerce control data.

Next recommended work:

- Secret management for provider credentials instead of plain environment-only deployment.
- Real provider contract prices and currency conversion rules.
- Customer-facing billing rules for overage, add-on agents, private deployment, and implementation service.
- Streaming response support.
- Provider retry/fallback policy.
- Usage dashboard and provider cost dashboard.
