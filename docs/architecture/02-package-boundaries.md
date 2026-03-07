# Vxture Package Boundaries

This document defines the **package boundaries and responsibilities** for Vxture Monorepo.

It is the authoritative guide for:

- AI-assisted coding (Claude / ChatGPT / Copilot)
- Developer onboarding
- Package architecture consistency

---

## 1. Layer Overview

| Layer            | Packages     | Responsibilities                                        | Allowed Dependencies     | Forbidden Dependencies   |
| ---------------- | ------------ | ------------------------------------------------------- | ------------------------ | ------------------------ |
| Backend Services | `service-*`  | Domain logic, API, persistence                          | Shared Layer, Core Layer | Other services, UI layer |
| Shared Layer     | `shared`     | Generic utilities, types, constants                     | Third-party libraries    | Core, Service, UI        |
| Core Layer       | `core-*`     | Platform infrastructure: config, tenant, i18n, API base | Shared Layer             | Service, UI              |
| Platform SDK     | `platform-*` | SDK wrappers for Core & Service                         | Shared, Core, Service    | Portal internal          |

---

## 2. Shared Layer (`@vxture/shared`)

**Responsibilities**:

- Pure functions
- TypeScript types
- Constants
- No domain logic

**Allowed dependencies**:

- Lightweight third-party libraries

**Forbidden dependencies**:

- Core packages
- Service packages
- UI/Portal code

**Usage**:

```ts
import { debug } from '@vxture/shared';
```

---

## 3. Core Layer (`@vxture/core-*`)

**Responsibilities**:

- Configuration management
- Multi-tenant support
- Localization/i18n
- API base/infrastructure
- Encapsulated reusable logic

**Allowed dependencies**:

- Shared Layer

**Forbidden dependencies**:

- Services
- UI

**Usage**:

```ts
import { getConfig } from '@vxture/core-config';
```

---

## 4. Backend Services (`@vxture/service-*`)

**Responsibilities**:

- Business logic
- Domain rules
- Workflow orchestration
- Service APIs

**Allowed dependencies**:

- Shared Layer
- Core Layer

**Forbidden dependencies**:

- Other services
- UI/Portal code

**Usage**:

```ts
import { createTicket } from '@vxture/service-ticket';
```

---

## 5. Platform SDK Layer (`@vxture/platform-*`)

**Responsibilities**:

- Wrap Core and Service APIs for client consumption
- Type-safe SDK
- Simplified developer interface

**Allowed dependencies**:

- Shared Layer
- Core Layer
- Service Layer

**Forbidden dependencies**:

- Portal internal

**Usage**:

```ts
import { ticketClient } from '@vxture/platform-sdk';
```

---

## 6. Dependency Direction

**Strict top-down architecture**:

```text
Portal / Business
   ↓
Platform SDK
   ↓
Backend Services
   ↓
Core Layer
   ↓
Shared Layer
```

- Lower layers **must not depend** on higher layers
- AI must enforce these rules when generating code

---

## 7. Naming Convention

- Package names follow: `@vxture/{group}-{package}`
- Directory structure mirrors group logically:

```
packages/
├ shared
├ core/
│  ├ api
│  ├ config
│  ├ locale
│  └ tenant
├ service/
│  ├ ticket
│  ├ billing
│  └ subscription
├ platform/
│  ├ sdk
│  └ client
```

---

## 8. AI Coding Rules

1. Respect package boundaries
2. Only use allowed dependencies per layer
3. Shared Layer must remain domain-agnostic
4. Core Layer encapsulates platform features
5. SDK Layer only wraps Core + Service for clients
6. Services must remain isolated from each other
7. Portal / Business apps must call services via SDK or Core

---

End of document.
