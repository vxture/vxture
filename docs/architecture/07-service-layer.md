# Vxture Service Layer Architecture

## Overview

The **Service Layer** contains **shared platform domain services**.

These are stable, reusable domain modules consumed by the BFF Layer and Agent Server Layer.
They represent business logic that has been **proven and promoted** from agent-server backends,
or platform capabilities that are shared across multiple consumers from the start.

---

# 1. Location

```
services/
├── ticket/
├── billing/
└── subscription/
```

Services live at the top level of the monorepo, not inside `packages/`,
because they are independent deployable domain modules rather than shared libraries.

---

# 2. Naming Convention

All services follow:

```
@vxture/service-{name}
```

Examples:

```
@vxture/service-ticket
@vxture/service-billing
@vxture/service-subscription
```

---

# 3. Internal Structure

```
services/{name}/
├── package.json
├── tsconfig.json
└── src/
    ├── service/      # Business logic and use cases
    ├── repository/   # Data access layer
    ├── types/        # Domain types (*.types.ts)
    └── index.ts      # Single public export entry
```

---

# 4. Responsibilities

Service Layer handles:

- Shared business logic and domain rules
- Domain models and value objects
- Workflow orchestration within a domain
- Service APIs consumed by BFFs and agent backends

Service Layer must not handle:

- UI rendering or components
- Direct HTTP framework routing (belongs in BFF)
- AI model invocations (belongs in agent-server or ai-sdk)
- Cross-service orchestration (belongs in BFF aggregators)

---

# 5. Promotion Lifecycle

Service Layer packages originate in two ways:

**Promoted from agent-server**: Logic that starts in `agent-server/{agent}/` and proves
reusable across multiple agents or portals is extracted and promoted here.

```
Stage 1  agent-server/{agent}/    Agent-private, fast iteration
          ↓ proven reusable
Stage 2  services/service-{name}/ Shared platform service with stability guarantees
          ↓ consumed via BFF
Stage 3  Any portal or agent accesses it through its own BFF
```

**Born shared**: Capabilities that are platform-wide from the start (billing, subscription, etc.)
are authored directly in `services/` without an agent-server stage.

---

# 6. Dependency Rules

Allowed:

```
@vxture/core-*
@vxture/shared
Database clients
External APIs
```

Forbidden:

```
Other @vxture/service-*   (no cross-service imports)
@vxture/bff-*
@vxture/ai-sdk
@vxture/design-system
@vxture/platform-*
Any frontend code
```

Services must remain **isolated from each other**.
Cross-domain orchestration belongs in the BFF aggregator layer, not in services.

---

# 7. Consumers

Services are consumed by:

| Consumer         | Access pattern                             |
| ---------------- | ------------------------------------------ |
| `bff/*`          | Direct package import inside BFF server    |
| `agent-server/*` | Direct package import inside agent backend |

Services are **never imported directly by frontend code** (`portals/`, `agent-studio/`).
Frontend layers access service data through their BFF over HTTP.

---

# 8. Example Usage

```ts
// Inside bff/* or agent-server/* only
import { createTicket } from '@vxture/service-ticket';
import { getBillingStatus } from '@vxture/service-billing';
import { getSubscription } from '@vxture/service-subscription';
```

---

# 9. AI Coding Rules

AI must:

- Keep services independent — no cross-service imports under any circumstance
- Never import from bff, ai-sdk, design-system, or platform packages
- Never expose services directly to frontend code
- Place cross-domain logic in BFF aggregators, not in services
- Promote agent-server logic to services only when it is proven reusable
- Export all public APIs via `src/index.ts`
- Use domain-specific file naming: `*.types.ts`, `*.service.ts`, `*.repository.ts`
- No `any` types

---

End of document.
