# Vxture Platform Architecture Overview

**Version**: 1.0.0
**Last Updated**: 2026-03-09
**TypeScript**: 5.9.3
**ECMAScript**: ES2023

This document provides a **complete architectural overview** of the Vxture platform.

It is the entry point for understanding how the system is structured, how layers relate
to each other, and what principles govern the entire platform.

Read this document first. Refer to layer-specific documents for deeper detail.

---

# 1. What is Vxture

Vxture is a **TypeScript-based enterprise SaaS platform** built as a pnpm workspace monorepo.

It has two distinct product surfaces:

**Platform** — the operational backbone. Stable, slow-changing infrastructure for
operators and tenant administrators (portals, services, packages).

**Agent Studio** — the customer-facing product surface. Fast-moving AI-powered
applications delivered to end users (agent-studio, agent-server).

Both surfaces share the same platform infrastructure and are governed independently.

---

# 2. Architectural Layers at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER                                              │
│                                                                 │
│   portals/              agent-studio/                          │
│   (platform UI)         (agent product UI)                     │
│   website               agent01/web                            │
│   admin                 agent02/web          Frontend only      │
│   tenant                agent{N}/web                           │
└──────────────┬──────────────────┬───────────────────────────────┘
               │ HTTP              │ HTTP
               ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  BFF LAYER                                                      │
│                                                                 │
│   bff/website-bff       bff/agent01-bff                        │
│   bff/admin-bff         bff/agent{N}-bff    Server-side only   │
│   bff/tenant-bff                                               │
│                                                                 │
│   Auth · Tenant resolution · Aggregation · Response shaping    │
└──────────┬──────────────────────┬───────────────────────────────┘
           │                      │
           │               ┌──────▼──────────────────────────┐
           │               │  AGENT SERVER LAYER             │
           │               │                                 │
           │               │  agent-server/agent01           │
           │               │  agent-server/agent{N}          │
           │               │                                 │
           │               │  Private backend per agent      │
           │               │  Models · Storage · Workflows   │
           │               └──────┬──────────────────────────┘
           │                      │
           └──────────┬───────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVICE LAYER                                                  │
│                                                                 │
│   @vxture/service-ticket                                       │
│   @vxture/service-billing        Shared · Stable · Reusable   │
│   @vxture/service-subscription                                 │
│                                                                 │
│   Promoted from agent-server when proven reusable              │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  CORE LAYER                                                     │
│                                                                 │
│   @vxture/core-api      @vxture/core-auth                      │
│   @vxture/core-config   @vxture/core-locale   Framework-       │
│   @vxture/core-tenant   @vxture/core-utils    agnostic         │
│                                                                 │
│   Platform infrastructure primitives                           │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  SHARED LAYER                                                   │
│                                                                 │
│   @vxture/shared                                               │
│                                                                 │
│   Pure utilities · TypeScript types · Constants                │
└─────────────────────────────────────────────────────────────────┘


FRONTEND-ONLY BRANCHES (parallel, not in server chain)

portals/* and agent-studio/*
   ├──► @vxture/design-system  (UI components, tokens, theme, icons)
   ├──► @vxture/platform-amap  (Amap SDK wrapper)
   └──► @vxture/platform-cesium (Cesium 3D wrapper)


SERVER-ONLY BRANCH (agent backends)

agent-server/*
   └──► @vxture/ai-sdk
           ├── llm       (Doubao, Claude, custom models)
           ├── rag       (retrieval-augmented generation)
           ├── embedding (vectorization)
           └── workflow  (multi-step orchestration)
```

---

# 3. Layer Summary

| Layer         | Location              | Nature                    | Change Velocity |
| ------------- | --------------------- | ------------------------- | --------------- |
| Portal Web    | `portals/*`           | Platform management UI    | Slow            |
| Agent Web     | `agent-studio/*`      | Agent product UI          | Fast            |
| Agent Server  | `agent-server/*`      | Agent-private backend     | Fast            |
| BFF           | `bff/*`               | Frontend ↔ backend bridge | Medium          |
| Services      | `services/*`          | Shared domain logic       | Slow            |
| Core          | `packages/core/*`     | Platform infrastructure   | Very slow       |
| AI SDK        | `packages/ai/ai-sdk`  | Shared AI capabilities    | Medium          |
| Platform SDK  | `packages/platform/*` | 3rd-party SDK wrappers    | Low             |
| Design System | `packages/design/*`   | UI primitives             | Slow            |
| Shared        | `packages/shared/*`   | Utilities and types       | Very slow       |

---

# 4. Two Product Surfaces

## Platform Surface (`portals/`)

Stable operational applications serving **platform operators and tenant admins**.

```
portals/website    Public marketing site
portals/admin      Platform operations — manage tenants, billing, config
portals/tenant     Tenant management — manage users, subscriptions, settings
```

- Governed by the platform team
- Slow iteration cadence
- Back-office tools, CRUD-oriented workflows
- Each portal backed by its own BFF

## Agent Studio Surface (`agent-studio/` + `agent-server/`)

Fast-moving AI-powered products serving **end customers**.

```
agent-studio/{agent}   Agent frontend (standalone or embedded in portal)
agent-server/{agent}   Agent backend (models, storage, workflows)
```

- Each agent governed independently by its own product team
- Fast iteration cadence
- AI-driven, conversational, generative in nature
- Frontend and backend kept separate, connected through dedicated BFF
- Agent backends promote proven logic to `services/` over time

---

# 5. BFF — The Central Bridge

The BFF (Backend For Frontend) layer is the **only communication path** between
frontend applications and backend services.

Every portal and every agent has exactly one dedicated BFF.

```
One portal / agent  →  One BFF  →  Multiple backends
```

What the BFF does:

- Validates authentication tokens and manages sessions
- Resolves and propagates tenant context
- Aggregates data from multiple sources (`agent-server/`, `services/`, `core-*`)
- Shapes responses for the specific needs of its frontend consumer
- Routes requests to domain-specific router modules internally

What the BFF does not do:

- Contain business logic (belongs in `services/` or `agent-server/`)
- Import UI or platform SDK packages
- Call AI models directly (belongs in `agent-server/`)
- Communicate with other BFFs

---

# 6. Package Architecture

All shared code lives in `packages/` under a consistent two-level structure:

```
packages/{group}/{name}/   →   @vxture/{group}-{name}
```

| Group      | Purpose                              | Key packages                                                                       |
| ---------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| `shared`   | Cross-cutting utilities and types    | `@vxture/shared`                                                                   |
| `core`     | Platform infrastructure primitives   | `core-api`, `core-auth`, `core-tenant`, `core-locale`, `core-config`, `core-utils` |
| `ai`       | Shared AI capabilities (server-side) | `@vxture/ai-sdk` (llm, rag, embedding, workflow)                                   |
| `service`  | Shared domain services               | `service-billing`, `service-subscription`, `service-ticket`                        |
| `platform` | 3rd-party client SDK wrappers        | `platform-amap`, `platform-cesium`                                                 |
| `design`   | UI design system                     | `@vxture/design-system`                                                            |

Dependency direction within packages is strict:

```
design-system  →  shared
platform-*     →  shared
core-*         →  shared
ai-sdk         →  shared
service-*      →  core-*  →  shared
```

---

# 7. Dependency Rules — One Page Summary

```
FRONTEND (portals/*, agent-studio/*)
  ✅ → BFF (HTTP only, never package import)
  ✅ → design-system, platform-*, shared
  ❌ → service-*, core-*, ai-sdk, agent-server/*

BFF (bff/*)
  ✅ → agent-server/*, service-*, core-*, shared
  ❌ → other bff-*, design-system, platform-*, ai-sdk

AGENT SERVER (agent-server/*)
  ✅ → ai-sdk, service-*, core-*, shared
  ❌ → other agent-server/*, bff-*, design-system, platform-*

SERVICES (service-*)
  ✅ → core-*, shared
  ❌ → other service-*, bff-*, ai-sdk, UI

CORE (core-*)
  ✅ → shared
  ❌ → everything else

AI SDK (ai-sdk)
  ✅ → shared
  ❌ → service-*, bff-*, UI, platform-*

PLATFORM SDK (platform-*)
  ✅ → shared, design-system (optional)
  ❌ → core-*, service-*, ai-sdk, bff-*

DESIGN SYSTEM (design-system)
  ✅ → shared
  ❌ → everything else

SHARED
  ✅ → third-party utility libs only
  ❌ → all internal packages
```

---

# 8. Agent Lifecycle

Agent-server logic follows a **promote-when-ready** path toward the platform:

```
agent-server/{agent}/          Fast, private, experimental
        │
        │  (proven reusable across 2+ agents or portals,
        │   stable, domain boundary clearly defined)
        ▼
services/service-{name}/       Shared, stable, platform-owned
        │
        ▼
Consumed by any BFF            Available to all portals and agents
```

AI capabilities follow a parallel path inside `@vxture/ai-sdk`:

```
agent-server uses ai-sdk modules selectively
        │
        │  (new AI capability needed by multiple agents)
        ▼
New module added to @vxture/ai-sdk
        │
        ▼
All agents can import the module independently
```

---

# 9. Agent Deployment Modes

Agent frontends support two deployment modes without changing their codebase:

**Standalone** — deployed as an independent web application with its own URL and routing.
Suitable for agents marketed as separate products.

**Embedded** — loaded inside `portals/admin` or `portals/tenant` as a micro-frontend module,
sharing the portal's shell, auth session, and theme.
Suitable for agents that are integral features of a portal experience.

---

# 10. Infrastructure Decisions

**Monorepo**: pnpm workspace. Unified dependency management, shared build tooling,
cross-package TypeScript path aliases.

**No API Gateway** at this stage. Nginx / CDN handles static assets and reverse proxy.
BFF handles per-consumer authentication and routing. Introduce an API Gateway
(Kong, APISIX) when centralized rate limiting, K8s traffic management,
or external API exposure is required.

**TypeScript**: Strict mode enforced across all packages. Three-level tsconfig inheritance
(`tsconfig.base.json` → `tsconfig.paths.json` → per-package `tsconfig.json`).
Path aliases aligned with `packages/{group}/{name}/` structure.

---

# 11. Architecture Principles

**Separation of concerns** — each layer has one clear job. Business logic in services,
infrastructure in core, AI in ai-sdk, UI in design-system.

**Dependency direction is law** — lower layers never depend on higher layers.
Violations break the architecture regardless of short-term convenience.

**BFF is the only door** — no frontend code reaches services or core directly.
The BFF is the enforced boundary between frontend and backend.

**Proven before shared** — agent-server logic is private until it proves reusable.
Premature promotion creates false stability guarantees.

**Agent independence** — each agent team owns its full stack. One agent's failure
must not affect other agents or the platform.

**Frontend/backend separation for agents** — `agent-studio/` and `agent-server/`
are kept apart by design. Different governance, deployment cadence, and dependency rules.

---

# 12. Document Map

| File                       | Contents                                            |
| -------------------------- | --------------------------------------------------- |
| `00-overview.md`           | This document — full platform architecture overview |
| `01-monorepo.md`           | Repository structure, layers, workspace config      |
| `02-package-boundaries.md` | Per-layer dependency rules and constraints          |
| `03-package-graph.json`    | Machine-readable package graph                      |
| `05-core-layer.md`         | Core package architecture and responsibilities      |
| `06-shared-layer.md`       | Shared layer architecture                           |
| `07-service-layer.md`      | Service layer architecture and promotion lifecycle  |
| `08-design-system.md`      | Design system architecture                          |
| `09-agent-server.md`       | Agent server layer architecture                     |
| `10-typescript.md`         | TypeScript configuration and engineering standards  |

---

End of document.
