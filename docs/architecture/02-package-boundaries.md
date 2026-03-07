# Vxture Package Boundaries

This document defines the **package boundaries and responsibilities** for the Vxture Monorepo.

It is the authoritative guide for:

- AI-assisted coding (Claude / ChatGPT / Copilot)
- Developer onboarding
- Package architecture consistency

---

## 1. Layer Overview

| Layer         | Location                  | Responsibilities                                                | Allowed Dependencies                           | Forbidden Dependencies                                  |
| ------------- | ------------------------- | --------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Portal Web    | `portals/*`               | Platform management UI — stable, ops-facing                     | BFF (HTTP), design-system, platform-\*, shared | service-_, core-_, ai-sdk, bff-\* (as packages)         |
| Agent Web     | `agent-studio/*`          | Agent product UI — fast-changing, customer-facing               | BFF (HTTP), design-system, platform-\*, shared | service-_, core-_, ai-sdk, bff-\* (as packages)         |
| Agent Backend | `agent-server/*`          | Agent-private backend: models, storage, workflows               | ai-sdk, service-_, core-_, shared              | design-system, platform-_, bff-_, other agent-server/\* |
| BFF           | `bff/*` / `@vxture/bff-*` | Auth, tenant resolution, aggregation, response shaping          | agent-server/_, service-_, core-\*, shared     | design-system, platform-_, ai-sdk, other bff-_          |
| Service       | `@vxture/service-*`       | Shared platform domain logic (promoted from agent-server)       | core-\*, shared                                | other service-_, UI, bff-_, platform-\*, ai-sdk         |
| Core          | `@vxture/core-*`          | Platform infrastructure: config, tenant, i18n, auth, API base   | shared                                         | service-_, UI, bff-_, platform-\*, ai-sdk               |
| AI SDK        | `@vxture/ai-sdk`          | Shared AI capabilities: llm, rag, embedding, workflow (modules) | shared (+ core-\* TBD)                         | service-_, UI, bff-_, platform-\*                       |
| Platform SDK  | `@vxture/platform-*`      | Third-party client SDK wrappers — browser-only                  | shared, design-system (optional)               | core-_, service-_, ai-sdk, bff-\*                       |
| Design System | `@vxture/design-system`   | Design tokens, UI components, theme, icons, density             | shared                                         | core-_, service-_, ai-sdk, bff-_, platform-_            |
| Shared        | `@vxture/shared`          | Generic utilities, TypeScript types, constants                  | Third-party libraries only                     | All internal packages                                   |

---

## 2. Shared Layer (`@vxture/shared`)

**Location**: `packages/shared/shared/`

**Responsibilities**: pure utility functions, TypeScript types, global constants, no domain logic.

**Allowed dependencies**: lightweight third-party libraries only.

**Forbidden dependencies**: all internal packages.

```ts
import { debug } from '@vxture/shared';
```

---

## 3. Core Layer (`@vxture/core-*`)

**Location**: `packages/core/{name}/`

**Packages**:

```
@vxture/core-api      # packages/core/api/
@vxture/core-auth     # packages/core/auth/
@vxture/core-config   # packages/core/config/
@vxture/core-locale   # packages/core/locale/
@vxture/core-tenant   # packages/core/tenant/
@vxture/core-utils    # packages/core/utils/
```

**Responsibilities**:

- Configuration management
- Multi-tenant support (tenant ID resolution, context propagation)
- Localization / i18n
- API base / infrastructure (request handling, interceptors, error normalization)
- Authentication primitives (token validation, session helpers)

**Allowed dependencies**: `@vxture/shared` only.

**Forbidden dependencies**: service-_, bff-_, ai-sdk, design-system, platform-\*, any UI framework.

**Constraint**: Must be **framework-agnostic** — runnable in both Node.js and browser.

```ts
import { getConfig } from '@vxture/core-config';
import { validateToken } from '@vxture/core-auth';
import { getTenantId } from '@vxture/core-tenant';
```

---

## 4. AI SDK (`@vxture/ai-sdk`)

**Location**: `packages/ai/ai-sdk/`

**Single package with internal modules**:

```
packages/ai/ai-sdk/
└── src/
    ├── llm/          # Unified LLM client (Doubao, Claude, custom/private models)
    ├── rag/          # Retrieval-augmented generation pipeline
    ├── embedding/    # Embedding and vectorization utilities
    ├── workflow/     # Multi-step agent workflow orchestration
    └── index.ts
```

**Purpose**: Shared AI infrastructure for `agent-server/*` backends.
Each module is independently importable — agents import only the capabilities they need.
New AI capabilities are added as modules inside this package, not as new packages,
unless a capability requires independent versioning or deployment.

**Allowed dependencies**: `@vxture/shared`. Dependency on `@vxture/core-*` to be confirmed.

**Forbidden dependencies**: service-_, bff-_, design-system, platform-\*.

**Constraint**: Server-side only. Must not be imported in any frontend code.

**Agent isolation**: All shared AI logic lives in `@vxture/ai-sdk`.
Agent backends never share logic by importing each other directly.

```ts
// Inside agent-server/* only
import { llmClient } from '@vxture/ai-sdk'; // full import
import { llmClient } from '@vxture/ai-sdk/llm'; // module import
import { createRagPipeline } from '@vxture/ai-sdk/rag';
import { embed } from '@vxture/ai-sdk/embedding';
import { defineWorkflow } from '@vxture/ai-sdk/workflow';
```

---

## 5. Service Layer (`@vxture/service-*`)

**Location**: `services/{name}/`

**Packages**:

```
@vxture/service-ticket
@vxture/service-billing
@vxture/service-subscription
```

**Responsibilities**: shared platform business logic, domain rules, service APIs.

**Promotion path**: Logic that originates in `agent-server/{agent}/` and proves reusable
across multiple agents or portals is extracted and promoted to this layer.

**Allowed dependencies**: `@vxture/core-*`, `@vxture/shared`.

**Forbidden dependencies**: other service-_, bff-_, ai-sdk, design-system, platform-\*, any frontend code.

**Constraint**: Services must remain **isolated from each other**.

```ts
// Inside BFF or agent-server only — never in frontend code
import { createTicket } from '@vxture/service-ticket';
import { getSubscription } from '@vxture/service-subscription';
```

---

## 6. BFF Layer (`@vxture/bff-*`)

**Location**: `bff/{name}-bff/`

**Packages**:

```
@vxture/bff-website        # Serves portals/website
@vxture/bff-admin          # Serves portals/admin
@vxture/bff-tenant         # Serves portals/tenant
@vxture/bff-agent01        # Serves agent-studio/agent01 ↔ agent-server/agent01
@vxture/bff-agent{N}       # Serves agent-studio/agent{N} ↔ agent-server/agent{N}
```

**Responsibilities**:

- Authentication token validation and session management
- Tenant context resolution and propagation
- Aggregation across `agent-server/`, `services/`, and `core-*`
- Response shaping / field projection per consumer
- Domain routing via internal router modules

The BFF is the **only entry point** between a frontend and its backend.
The frontend never knows whether data originates from `agent-server/` or `services/`.

**Internal structure**:

```
bff/{name}-bff/src/
├── routers/          # Domain router modules (user, order, product, billing…)
├── aggregators/      # Cross-domain data composition
├── middleware/       # Auth and tenant middleware
├── types/            # Consumer-facing DTO types
└── index.ts
```

**Router isolation**: Each router module catches its own errors. A failure in one router
must not crash other routers or the BFF process.

**Allowed dependencies**: `agent-server/*` (internal service calls), `@vxture/service-*`,
`@vxture/core-*`, `@vxture/shared`.

**Forbidden dependencies**: other bff-_, design-system, platform-_, ai-sdk, React, browser APIs.

**Critical constraint**: BFF is **server-side only**. Frontend code never imports BFF packages.
All communication is over **HTTP (REST or tRPC)** exclusively.

---

## 7. Agent Backend (`agent-server/*`)

**Location**: `agent-server/{agent}/`

Agent-private backend services. Not shared packages — each agent owns its backend independently.

**Responsibilities**:

- AI model invocations and pipelines via `@vxture/ai-sdk`
- Agent-private storage and data access
- Workflow orchestration via `@vxture/ai-sdk/workflow`
- Consuming platform capabilities via `@vxture/service-*` and `@vxture/core-*`

**Allowed dependencies**: `@vxture/ai-sdk`, `@vxture/service-*`, `@vxture/core-*`, `@vxture/shared`.

**Forbidden dependencies**: other `agent-server/*` directories, bff-_, design-system, platform-_.

**Cross-agent sharing rules**:

- Shared AI capabilities → `@vxture/ai-sdk`
- Shared domain logic → promote to `@vxture/service-*`
- Direct imports between agent backend directories → **forbidden**

**Lifecycle**:

```
agent-server/{agent}/  →  (proven reusable)  →  services/service-{name}/
```

---

## 8. Agent Web (`agent-studio/*`)

**Location**: `agent-studio/{agent}/`

Agent product frontend. Pure frontend — no backend logic. Governed independently per agent team.

**Responsibilities**: agent product UI, user interaction, consuming its own BFF over HTTP.

**Deployment modes**:

- **Standalone**: independent web app with its own URL
- **Embedded**: loaded inside `portals/admin` or `portals/tenant` as a micro-frontend

**Allowed dependencies**: `@vxture/design-system`, `@vxture/platform-*`, `@vxture/shared`,
own BFF over **HTTP only**.

**Forbidden dependencies**: service-_, core-_, ai-sdk, bff-_ (as packages),
`agent-server/_`, other agent-studio directories, portal internals.

---

## 9. Platform SDK Layer (`@vxture/platform-*`)

**Location**: `packages/platform/{name}/`

**Packages**:

```
@vxture/platform-amap      # packages/platform/amap/
@vxture/platform-cesium    # packages/platform/cesium/
@vxture/platform-{name}    # packages/platform/{name}/
```

**Responsibilities**: encapsulate third-party client SDKs, typed React hooks and components,
coordinate system utilities (GCJ-02 ↔ WGS-84), version isolation.

**Allowed dependencies**: `@vxture/shared`, `@vxture/design-system` (optional).

**Forbidden dependencies**: core-_, service-_, ai-sdk, bff-_, other platform-_.

**Critical constraint**: Browser-only. Must not be imported in any server environment.
Backend data must be fetched by the frontend and passed as props.

```ts
import { useAmap, AmapContainer } from '@vxture/platform-amap';
import { CesiumViewer, useEntity } from '@vxture/platform-cesium';
```

---

## 10. Design System (`@vxture/design-system`)

**Location**: `packages/design/design-system/`

**Responsibilities**: design tokens, UI components, theme system (light/dark/system),
icon library (registry pattern), density system (compact/default/comfortable), global styles.

**Allowed dependencies**: `@vxture/shared`.

**Forbidden dependencies**: core-_, service-_, ai-sdk, bff-_, platform-_, portal or agent internals.

```ts
import { Button, Icon, ThemeProvider, useTheme } from '@vxture/design-system';
```

---

## 11. Full Dependency Graph

```
portals/*               agent-studio/*
    │                         │
    │  HTTP                   │  HTTP
    ▼                         ▼
bff/portal-bff          bff/agent{N}-bff
    │                         │
    │                         ├──► agent-server/{agent}
    │                         │         ├──► @vxture/ai-sdk
    │                         │         ├──► @vxture/service-*
    │                         │         └──► @vxture/core-*
    │                         │
    └────────────┬────────────┘
                 ▼
        @vxture/service-*
                 │
                 ▼
         @vxture/core-*
                 │
                 ▼
         @vxture/shared


portals/* and agent-studio/* (frontend only)
    ├──► @vxture/design-system  ──► @vxture/shared
    └──► @vxture/platform-*     ──► @vxture/shared
```

---

## 12. Naming Convention

| Group      | Location                         | Package name                                                        |
| ---------- | -------------------------------- | ------------------------------------------------------------------- |
| `shared`   | `packages/shared/shared/`        | `@vxture/shared`                                                    |
| `core`     | `packages/core/{name}/`          | `@vxture/core-api`, `core-auth`, `core-tenant`, `core-config`       |
| `ai`       | `packages/ai/ai-sdk/`            | `@vxture/ai-sdk`                                                    |
| `service`  | `services/{name}/`               | `@vxture/service-ticket`, `service-billing`, `service-subscription` |
| `bff`      | `bff/{name}-bff/`                | `@vxture/bff-website`, `bff-admin`, `bff-tenant`, `bff-agent{N}`    |
| `platform` | `packages/platform/{name}/`      | `@vxture/platform-amap`, `platform-cesium`, `platform-{name}`       |
| `design`   | `packages/design/design-system/` | `@vxture/design-system`                                             |

---

## 13. AI Coding Rules

1. `portals/` and `agent-studio/` are parallel frontend layers — neither depends on the other
2. `agent-studio/` is frontend only — backend logic belongs in `agent-server/`
3. `agent-server/` and `services/` are both backend but serve different purposes — agent-server is private and fast-changing, services are shared and stable
4. No frontend code imports service, core, or ai-sdk — all backend calls go through BFF over HTTP
5. No frontend code imports BFF packages or agent-server code — HTTP only, no package imports
6. BFF is server-side only — no React, no browser APIs, no design-system, no platform-\*, no ai-sdk
7. `@vxture/ai-sdk` is server-side only — import llm/rag/embedding/workflow modules as needed
8. Agent backends share AI logic via `@vxture/ai-sdk` — never by importing other agent-server directories
9. Agent backends share domain logic by promoting to `services/` — never by cross-agent imports
10. Platform SDK is browser-only — no core-_, service-_, or ai-sdk imports
11. Services must remain isolated — no cross-service imports
12. BFF domain expansion means adding a router module — not creating a new BFF package
13. Core must remain framework-agnostic — no React, no Next.js, no browser-only APIs
14. Shared must remain domain-agnostic — pure utilities, types, constants only
15. All packages export via `src/index.ts` — no deep internal path imports
16. No `any` types — respect strict TypeScript configuration throughout

---

End of document.
