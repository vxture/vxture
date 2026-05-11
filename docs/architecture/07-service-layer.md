# Vxture Service Layer Architecture

**Version**: 1.3.0
**Last Updated**: 2026-05-12

## Overview

The **Service Layer** contains **shared platform domain services**.

Domain directories represent bounded contexts in the platform's
domain-driven architecture.

These are stable, reusable domain modules consumed by the BFF Layer and Agent Server Layer.
They represent business logic that has been **proven and promoted** from agent-server backends,
or platform capabilities that are shared across multiple consumers from the start.

Service directories are grouped by domain for organizational clarity,
but package names remain flat.

---

```
Example:

Directory:
services/commerce/billing

Package name:
@vxture/service-billing
```

---

# 1. Location

```
services/
├── ai/                     # AI domain
│   └── gateway/            # @vxture/service-ai-gateway
├── commerce/               # Commerce domain
│   ├── billing/            # @vxture/service-billing
│   └── subscription/       # @vxture/service-subscription
├── identity/               # Identity domain
│   └── iam/                # @vxture/service-iam
├── notification/           # Notification domain
│   ├── mail/               # @vxture/service-mail
│   └── sms/                # @vxture/service-sms
├── support/                # Support domain
│   ├── ticket/             # @vxture/service-ticket
│   └── workers/            # @vxture/workers
└── tenant/                 # Tenant domain
    └── organization/       # @vxture/service-organization
```

Services live at the top level of the monorepo, not inside `packages/`,
because they are independent deployable domain modules rather than shared libraries.

The two-level structure `services/{domain}/{name}/` organizes services by business domain.
This makes domain ownership and navigability clear as the number of services grows.

---

# 2. Naming Convention

**Package names** follow a flat convention regardless of domain grouping:

```
@vxture/service-{name}
```

Examples:

```
@vxture/service-ai-gateway
@vxture/service-billing
@vxture/service-subscription
@vxture/service-iam
@vxture/service-mail
@vxture/service-sms
@vxture/service-ticket
@vxture/workers
@vxture/service-organization
```

The domain directory (`commerce/`, `support/`) is for **organization only**.
It does not appear in the package name. Consumers always import using `@vxture/service-{name}`.

---

# 3. Current Domain Groups

| Domain         | Directory                | Services                                                                  |
| -------------- | ------------------------ | ------------------------------------------------------------------------- |
| `ai`           | `services/ai/`           | `@vxture/service-ai-gateway`                                              |
| `commerce`     | `services/commerce/`     | `@vxture/service-billing`, `@vxture/service-subscription`                 |
| `identity`     | `services/identity/`     | `@vxture/service-iam`                                                     |
| `notification` | `services/notification/` | `@vxture/service-mail`, `@vxture/service-sms`                             |
| `support`      | `services/support/`      | `@vxture/service-ticket`, `@vxture/workers`                               |
| `tenant`       | `services/tenant/`       | `@vxture/service-organization`                                            |

**Adding a new service**:

1. Identify the appropriate business domain
2. Create `services/{domain}/{name}/`
3. Set `"name": "@vxture/service-{name}"` in `package.json`
4. No workspace config change needed — `services/*/*` already covers all domains

**Adding a new domain**:

1. Create `services/{new-domain}/` directory
2. Add first service inside it
3. No workspace config change needed

---

# 4. Internal Structure

```
services/{domain}/{name}/
├── package.json
├── tsconfig.json
└── src/
    ├── module/         # NestJS 模块定义 (*.module.ts)
    ├── service/        # Business logic and use cases (*.service.ts)
    ├── repository/     # Data access layer (*.repository.ts)
    ├── types/          # Domain types (*.types.ts)
    └── index.ts        # Single public export entry
```

---

# 5. Responsibilities

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

# 6. Promotion Lifecycle

Service Layer packages originate in two ways:

**Promoted from agent-server**: Logic that starts in `agent-server/{agent}/` and proves
reusable across multiple agents or portals is extracted and promoted here.

```
Stage 1  agent-server/{agent}/              Agent-private, fast iteration
          ↓ proven reusable
Stage 2  services/{domain}/{name}/          Shared platform service with stability guarantees
          ↓ consumed via BFF
Stage 3  Any portal or agent accesses it through its own BFF
```

**Born shared**: Capabilities that are platform-wide from the start (billing, subscription, etc.)
are authored directly in `services/` without an agent-server stage.

---

# 7. Dependency Rules

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

# 8. Consumers

Services are consumed by:

| Consumer         | Access pattern                             |
| ---------------- | ------------------------------------------ |
| `bff/*`          | Direct package import inside BFF server    |
| `agent-server/*` | Direct package import inside agent backend |

Services are **never imported directly by frontend code** (`portals/`, `agent-studio/`).
Frontend layers access service data through their BFF over HTTP.

---

# 9. Example Usage

```ts
// Inside bff/* or agent-server/* only
import { createTicket } from '@vxture/service-ticket';
import { getBillingStatus } from '@vxture/service-billing';
import { getSubscription } from '@vxture/service-subscription';
```

Import paths use the package name `@vxture/service-{name}` only.
The domain directory path is never referenced in import statements.

---

# 10. Workspace Configuration

The `pnpm-workspace.yaml` entry for services:

```yaml
- services/*/*
```

This single glob covers all current and future domain subdirectories.
No workspace config change is needed when adding new services or domains.

---

# 11. AI Coding Rules

AI must:

- Keep services independent — no cross-service imports under any circumstance
- Never import from bff, ai-sdk, design-system, or platform packages
- Never expose services directly to frontend code
- Place cross-domain logic in BFF aggregators, not in services
- Promote agent-server logic to services only when it is proven reusable
- Place new services in `services/{domain}/{name}/` — identify the correct domain first
- Use `@vxture/service-{name}` as the package name — domain is directory-only
- Export all public APIs via `src/index.ts`
- Use domain-specific file naming: `*.types.ts`, `*.service.ts`, `*.repository.ts`
- No `any` types

---

End of document.
