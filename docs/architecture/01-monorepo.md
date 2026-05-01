# Vxture Monorepo Architecture

**Version**: 1.2.0
**Last Updated**: 2026-05-01
**TypeScript**: 5.9.3
**ECMAScript**: ES2023

This document defines the **monorepo architecture of the Vxture platform**.

Vxture is designed as a **TypeScript-based enterprise SaaS platform** using a **pnpm workspace monorepo**.

The architecture focuses on:

- modular design
- clear dependency boundaries
- scalable package organization
- team autonomy per business domain
- AI-assisted development

---

# 1. Repository Structure

```
vxture/
├── portals/                    # Platform frontend applications (stable, ops-facing)
│   ├── website/
│   ├── admin/
│   └── console/
│
├── agent-studio/               # Agent frontend applications (fast-changing, customer-facing)
│   ├── ruyinagent/
│   ├── vela/
│   └── agent{N}/
│
├── agent-server/               # Agent backend services (fast-changing, private per agent)
│   ├── ruyinagent/
│   ├── vela/
│   └── agent{N}/
│
├── bff/                        # Backend For Frontend — all BFFs in one place
│   ├── website-bff/
│   ├── admin-bff/
│   ├── console-bff/
│   ├── vela-bff/
│   ├── agent01-bff/
│   └── agent{N}-bff/
│
├── services/                   # Shared platform domain services (stable, promoted from agent-server)
│   ├── commerce/               # Commerce domain
│   │   ├── billing/            # @vxture/service-billing
│   │   └── subscription/       # @vxture/service-subscription
│   └── support/                # Support domain
│       └── ticket/             # @vxture/service-ticket
│
├── packages/                   # Shared platform packages
│   ├── shared/
│   │   └── shared/             # @vxture/shared
│   ├── core/
│   │   ├── api/                # @vxture/core-api
│   │   ├── auth/               # @vxture/core-auth
│   │   ├── config/             # @vxture/core-config
│   │   ├── locale/             # @vxture/core-locale
│   │   ├── tenant/             # @vxture/core-tenant
│   │   └── utils/              # @vxture/core-utils
│   ├── ai/
│   │   └── ai-sdk/             # @vxture/ai-sdk
│   ├── platform/
│   │   ├── amap/               # @vxture/platform-amap
│   │   ├── cesium/             # @vxture/platform-cesium
│   │   └── {name}/             # @vxture/platform-{name}
│   └── design/
│       └── design-system/      # @vxture/design-system
│
├── docs/                       # Architecture & development documentation
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

All shared packages follow a consistent two-level structure: `packages/{group}/{name}/`.
This ensures uniform organization and clear room for future expansion within each group.

`services/` uses a two-level domain structure: `services/{domain}/{name}/`.
Package names remain `@vxture/service-{name}` — the domain directory is for organization only.

`portals/` and `agent-studio/` are co-located to reflect their shared nature as frontend
business applications with different governance cadence.

`agent-studio/` and `agent-server/` are the frontend and backend halves of each agent product,
kept separate due to different governance, deployment, and dependency rules.
The BFF layer acts as the aggregation point between them.

---

# 2. Application Layer

`portals/` and `agent-studio/` are both **frontend business applications** at the same
architectural level. They consume the same platform capabilities and are co-located in
the repository to reflect this relationship.

The separation exists purely for **governance and team autonomy** — not for technical layering.

```
portals/        Platform-type applications — stable, slow-changing, operations-facing
agent-studio/   Agent product applications — fast-changing, innovation-driven, customer-facing
```

| Dimension       | portals/                          | agent-studio/                              |
| --------------- | --------------------------------- | ------------------------------------------ |
| Change velocity | Slow, stable                      | Fast, continuous iteration                 |
| Audience        | Platform operators, tenant admins | End customers (paying users)               |
| Team ownership  | Platform team                     | Independent product teams, one per agent   |
| Nature          | Back-office tools, CRUD-oriented  | AI-driven apps, conversational, generative |

Both layers consume the **same platform capabilities**:

```
auth, tenant, billing, subscription, theme, locale,
design-system, platform-* (maps, 3D)
```

`agent-studio/` additionally has a paired backend in `agent-server/` that consumes
**AI capabilities** from `@vxture/ai-sdk`:

```
llm, rag, embedding, workflow  (modules within @vxture/ai-sdk)
```

---

# 3. Portals Layer

The `portals` directory contains **platform-type frontend applications**.

Stable, robust, and slow-changing. They form the operational backbone of the platform.

```
portals/
├── website/          # Public marketing site
├── admin/            # Platform operations portal (for platform operators)
└── console/          # Tenant console (for tenant admins)
```

All portals, including `website`, have a dedicated BFF for server-side concerns
such as authentication, subscription state, and messaging.

Responsibilities:

- UI rendering and user interaction for platform management
- Optionally hosting embedded agent UIs (micro-frontend)
- Calling its own dedicated BFF over HTTP
- Integrating design system and platform SDK packages

Restrictions:

- Must not contain domain or business logic
- Must not directly import service, core, or ai-sdk packages
- All backend communication goes through its own BFF over HTTP

---

# 4. Agent Studio Layer

The `agent-studio` directory contains **agent product frontend applications**.
Each agent frontend is independently governed and deployed.

```
agent-studio/
├── ruyinagent/       # Example standalone/agent product frontend
├── vela/             # Embedded Vela assistant frontend
└── agent{N}/
```

Each agent frontend:

- Is independently deployable as a standalone web application
- Is optionally embeddable inside `portals/admin` or `portals/console` as a micro-frontend
- Calls its own BFF (`bff/agent{N}-bff`) over HTTP
- Uses `@vxture/design-system` and `@vxture/platform-*` from the platform
- Has no knowledge of its paired backend — all backend interaction goes through BFF

Restrictions:

- Must not contain backend logic
- Must not directly import service, core, ai-sdk, or bff packages
- All backend communication goes through its own BFF over HTTP

---

# 5. Agent Server Layer

The `agent-server` directory contains **agent backend services**.
Each agent has its own private backend, governed and deployed independently.

```
agent-server/
├── ruyinagent/       # Backend for agent-studio/ruyinagent
├── vela/             # Backend for embedded Vela assistant
└── agent{N}/
```

Each agent backend:

- Contains agent-private logic: AI model invocations, storage, workflow orchestration
- Accesses data sources: private data, public platform data, open network data
- Calls `@vxture/ai-sdk` for shared AI capabilities (llm, rag, embedding, workflow)
- Calls `@vxture/service-*` for platform capabilities (billing, subscription, ticket)
- Is consumed by its paired BFF (`bff/agent{N}-bff`) — never directly by the frontend

**Platform capabilities consumed by agent backends**:

```
Authentication & session     → @vxture/core-auth
Tenant context               → @vxture/core-tenant
Billing & subscription       → @vxture/service-billing, @vxture/service-subscription
LLM / RAG / embedding        → @vxture/ai-sdk (llm, rag, embedding modules)
Workflow orchestration       → @vxture/ai-sdk (workflow module)
```

**Cross-agent sharing rules**:

- Shared AI capabilities → `@vxture/ai-sdk`
- Shared domain logic → promote to `@vxture/service-*`
- Direct imports between agent backend directories → **forbidden**

**Lifecycle — agent-server promotes to services/**:

```
Stage 1  agent-server/{agent}/              Agent-private, fast iteration
          ↓ proven reusable across multiple agents
Stage 2  services/{domain}/{name}/          Promoted to shared platform domain service
```

---

# 6. BFF Layer

The `bff` directory contains **all Backend For Frontend services** — for both portals and agents —
in one place for unified governance.

The BFF is the aggregation point between frontends and backends.
Each portal and each agent has its own dedicated BFF.

```
bff/
├── website-bff/            # BFF for portals/website
│   └── src/
│       ├── routers/
│       ├── middleware/
│       └── index.ts
│
├── admin-bff/              # BFF for portals/admin
│   └── src/
│       ├── routers/
│       │   ├── user.router.ts
│       │   ├── order.router.ts
│       │   ├── product.router.ts
│       │   └── billing.router.ts
│       ├── aggregators/
│       ├── middleware/
│       └── index.ts
│
├── console-bff/            # BFF for portals/console
│   └── src/
│       ├── routers/
│       ├── aggregators/
│       ├── middleware/
│       └── index.ts
│
├── vela-bff/               # BFF for agent-studio/vela ↔ agent-server/vela
│   └── src/
│       ├── routers/
│       ├── aggregators/
│       ├── middleware/
│       └── index.ts
│
├── agent01-bff/            # BFF for agent-studio/agent01 ↔ agent-server/agent01
│   └── src/
│       ├── routers/
│       ├── aggregators/
│       ├── middleware/
│       └── index.ts
│
└── agent{N}-bff/
```

BFF design principles:

- Each BFF serves **exactly one frontend consumer** (one portal or one agent frontend)
- The BFF aggregates data from `agent-server/`, `services/`, and `core-*` as needed
- Domain isolation within a BFF via **router modules** — one module per business domain
- Each router module handles its own errors independently
- BFFs are **server-side only** — frontends communicate over HTTP only, never via package import
- When a router grows large enough, it can be extracted into a standalone BFF service

---

# 7. Services Layer

The `services` directory contains **shared platform domain services**.

```
services/
├── commerce/               # Commerce domain
│   ├── billing/            # @vxture/service-billing
│   └── subscription/       # @vxture/service-subscription
└── support/                # Support domain
    └── ticket/             # @vxture/service-ticket
```

**Directory structure**: Two-level domain grouping `services/{domain}/{name}/`.
This organizes services by business domain while keeping package names flat and stable.

**Package naming**: Package names follow `@vxture/service-{name}` — the domain prefix
appears only in the directory path, not in the package name.
Consumers (`bff/*`, `agent-server/*`) import using `@vxture/service-{name}` as always.

**Adding a new service**:
1. Identify the business domain (e.g. `commerce`, `support`, `identity`)
2. Create `services/{domain}/{name}/`
3. Name the package `@vxture/service-{name}`
4. Register in `pnpm-workspace.yaml` — already covered by `services/*/*`

Stable and reusable. Shared across portals and agents via BFF.

Responsibilities:

- Shared business logic and domain rules
- Domain models and service APIs
- Workflow orchestration within a domain

Services must remain **independent from each other**.
Consumed by BFFs and agent backends — never directly by any frontend code.

---

# 8. Packages Layer

The `packages` directory contains **all shared platform libraries**.

All packages follow a consistent structure: `packages/{group}/{name}/`.

```
packages/
│
├── shared/
│   └── shared/                  # @vxture/shared — utilities, types, constants
│
├── core/                        # Platform infrastructure
│   ├── api/                     # @vxture/core-api
│   ├── auth/                    # @vxture/core-auth
│   ├── config/                  # @vxture/core-config
│   ├── locale/                  # @vxture/core-locale
│   ├── tenant/                  # @vxture/core-tenant
│   └── utils/                   # @vxture/core-utils
│
├── ai/
│   └── ai-sdk/                  # @vxture/ai-sdk — LLM, RAG, embedding, workflow
│
├── platform/                    # Third-party client SDK wrappers (browser-only)
│   ├── amap/                    # @vxture/platform-amap
│   ├── cesium/                  # @vxture/platform-cesium
│   └── {name}/                  # @vxture/platform-{name}
│
└── design/
    └── design-system/           # @vxture/design-system
```

The `ai/` group uses a single package `ai-sdk` with internal modules for each capability.
New AI capabilities are added as modules inside `ai-sdk`, not as new packages,
unless a capability is large enough to warrant independent versioning and deployment.

---

# 9. Package Naming Convention

All internal packages follow:

```
@vxture/{group}-{name}
```

Examples:

```
@vxture/shared

@vxture/core-api
@vxture/core-auth
@vxture/core-config
@vxture/core-locale
@vxture/core-tenant
@vxture/core-utils

@vxture/ai-sdk

@vxture/service-billing
@vxture/service-subscription
@vxture/service-ticket

@vxture/bff-website
@vxture/bff-admin
@vxture/bff-console
@vxture/bff-vela
@vxture/bff-agent01
@vxture/bff-agent{N}

@vxture/platform-amap
@vxture/platform-cesium
@vxture/platform-{name}

@vxture/design-system
```

---

# 10. Package Groups

## shared

Generic utilities. Domain-agnostic. No internal dependencies.

```
@vxture/shared
```

## core

Platform infrastructure. Framework-agnostic. Depends on `shared` only.

```
@vxture/core-api, core-auth, core-config, core-locale, core-tenant, core-utils
```

## ai

Single SDK package with internal modules for each AI capability.
Primarily consumed by `agent-server/*`. Each module is independently importable.
New AI capabilities are added as modules inside `ai-sdk`, not as new top-level packages,
unless a capability requires independent versioning or deployment.

```
@vxture/ai-sdk
  └── modules: llm, rag, embedding, workflow
```

## service

Shared platform domain services. Organized by business domain in the directory tree.
Package names remain `@vxture/service-{name}` regardless of domain grouping.

```
commerce domain:  @vxture/service-billing, service-subscription
support domain:   @vxture/service-ticket
```

## bff

Backend For Frontend. One per consumer. Domain-split internally via router modules.

```
@vxture/bff-website, bff-admin, bff-console, bff-vela, bff-agent01, bff-agent{N}
```

## platform

Third-party client SDK wrappers. Browser-only.

```
@vxture/platform-amap, platform-cesium, platform-{name}
```

## design

Design system. All UI primitives in a single package.

```
@vxture/design-system
```

---

# 11. Dependency Direction

```
portals/{name}            agent-studio/{agent}
      │                          │
      │  HTTP                    │  HTTP
      ▼                          ▼
bff/portal-bff            bff/agent{N}-bff
      │                          │
      │                          ├──► agent-server/{agent}
      │                          │         ├──► @vxture/ai-sdk
      │                          │         ├──► @vxture/service-*
      │                          │         └──► @vxture/core-*
      │                          │
      └──────────────┬───────────┘
                     ▼
             @vxture/service-*
                     │
                     ▼
              @vxture/core-*
                     │
                     ▼
              @vxture/shared


portals/* and agent-studio/* (frontend)
      ├──► @vxture/design-system  ──► @vxture/shared
      └──► @vxture/platform-*     ──► @vxture/shared
```

Allowed:

```
portals/*               → bff/* (HTTP only)
portals/*               → design-system, platform-*, shared

agent-studio/*          → bff/* (HTTP only)
agent-studio/*          → design-system, platform-*, shared

agent-server/*          → ai-sdk, service-*, core-*, shared

bff/*                   → agent-server/*, service-*, core-*, shared

service-*               → core-*, shared
core-*                  → shared
ai-sdk                  → shared
platform-*              → shared, design-system (optional)
design-system           → shared
```

Forbidden:

```
any frontend            → service-*, core-*, ai-sdk (server-side only)
any frontend            → bff-* as package import (HTTP only)
any frontend            → agent-server/* (server-side only)
agent-server/*          → other agent-server/* (cross-agent imports)
service-*               → service-*
bff-*                   → bff-*
bff-*                   → design-system, platform-*, ai-sdk
platform-*              → core-*, service-*, ai-sdk
shared                  → any internal package
```

---

# 12. Agent Lifecycle: agent-server → services

```
Stage 1 — Prototype
  agent-server/{agent}/
  Agent-private backend. Fast iteration, no stability requirements.

Stage 2 — Proven & Reusable
  Logic identified as needed by multiple agents or portals.
  Extracted and promoted to:
  services/{domain}/{name}/
  Shared platform domain service with stability guarantees.
  Package name: @vxture/service-{name}

Stage 3 — Platform Capability
  Consumed by any agent or portal via its BFF.
```

Cross-agent code sharing must go through this promotion path.
Direct imports between `agent-server/` directories are forbidden.

---

# 13. Agent Deployment Modes

Agent frontends (`agent-studio/{agent}/`) support two deployment modes:

**Standalone**: Deployed as an independent web application with its own URL.
Suitable for agents marketed as separate products.

**Embedded (micro-frontend)**: Loaded inside `portals/admin` or `portals/console`
as a module, sharing the portal's navigation shell, auth session, and theme.
Suitable for agents that are integral features of a portal.

Both modes share the same codebase. Deployment mode is a configuration concern,
not a code structure concern.

---

# 14. API Gateway

Vxture **does not use an API Gateway at this stage**.

Current approach: Nginx / CDN for static assets and reverse proxy.
BFF handles per-consumer authentication, routing, and aggregation.

Introduce an API Gateway (e.g. Kong, APISIX) when:

- Number of deployed BFF/service instances requires unified rate limiting
- Deployment moves to Kubernetes and requires centralized traffic management
- External API exposure requires a unified public gateway

---

# 15. Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - portals/*
  - agent-studio/*
  - agent-server/*
  - bff/*
  - services/*/*
  - packages/shared/shared
  - packages/core/*
  - packages/ai/ai-sdk
  - packages/platform/*
  - packages/design/design-system
```

Note: `services/*/*` covers the two-level domain structure `services/{domain}/{name}/`.

---

# 16. TypeScript Configuration

All packages extend the root base configuration `tsconfig.base.json`.
Each package includes its own `tsconfig.json` extending the base.

See `12-typescript.md` for full TypeScript configuration details.

---

# 17. AI Development Guidelines

When AI tools generate code for this repository:

1. `portals/` and `agent-studio/` are parallel frontend layers — neither depends on the other
2. `agent-studio/` is frontend only — backend logic belongs in `agent-server/`
3. `agent-server/` and `services/` are both backend but serve different purposes — agent-server is private and fast-changing, services are shared and stable
4. Never import service, core, or ai-sdk packages inside any frontend code
5. Route all frontend-to-backend calls through the BFF over HTTP — no exceptions
6. BFF is server-side only — no React, no browser APIs, no design-system, no platform-\*, no ai-sdk
7. `@vxture/ai-sdk` is server-side only — import llm/rag/embedding/workflow modules from it as needed
8. Agent backends share AI logic via `@vxture/ai-sdk` — never by importing other agent-server directories
9. Agent backends share domain logic by promoting to `services/` — never by cross-agent imports
10. Platform SDK is browser-only — no core-\*, service-\*, or ai-sdk imports
11. Services must remain isolated — no cross-service imports
12. BFF domain expansion means adding a router module — not creating a new BFF package
13. Core must remain framework-agnostic — no React, no Next.js, no browser-only APIs
14. Shared must remain domain-agnostic — pure utilities, types, constants only
15. All packages export via `src/index.ts` — no deep internal path imports
16. No `any` types — respect strict TypeScript configuration throughout
17. New services go into `services/{domain}/{name}/` — identify the correct domain before creating
18. Service package names are always `@vxture/service-{name}` — the domain is directory-only

---

# 18. Architecture Goals

- Clear separation of frontend (`agent-studio/`) and backend (`agent-server/`) for agent products
- `portals/` and `agent-studio/` as parallel, independently-governed frontend layers
- BFF as the single aggregation point — frontend never knows whether data comes from agent-server or services
- Shared AI capabilities via `@vxture/ai-sdk` — modular, used by those who need it, invisible to those who don't
- Business domain autonomy — each agent team owns its full stack independently
- Fault isolation — one agent or BFF failure does not affect the platform or other agents
- Proven-before-shared — agent logic promoted to platform services only when ready
- Flexible agent deployment — standalone or embedded in portal
- Strong TypeScript type safety throughout
- Service domain organization — services grouped by business domain for navigability and team ownership

---

End of document.
