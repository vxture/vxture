# Vxture Monorepo Architecture

This document defines the **monorepo architecture of the Vxture platform**.

Vxture is designed as a **TypeScript-based enterprise SaaS platform** using a **pnpm workspace monorepo**.

The architecture focuses on:

- modular design
- clear dependency boundaries
- scalable package organization
- AI-assisted development

---

# 1. Repository Structure

The top-level repository structure is organized by **application type and architectural layer**.

```
vxture/
├ portals/          # Frontend portals
├ business/         # Business applications
├ services/         # Domain service packages
├ packages/         # Shared platform packages
├ docs/             # Architecture & development documentation
└ package.json
```

---

# 2. Portals Layer

The `portals` directory contains **frontend applications**.

Examples:

```
portals/
├ website
├ admin
└ tenant
```

Responsibilities:

- UI rendering
- user interaction
- calling backend services
- integrating design system components

Portals **must not contain domain logic**.

---

# 3. Business Layer

The `business` directory contains **business-level applications**.

Example:

```
business/
└ ruinagent
```

Responsibilities:

- AI agents
- business orchestration
- higher-level workflows

Business applications may consume **services and platform packages**.

---

# 4. Services Layer

The `services` directory contains **domain services**.

Examples:

```
services/
├ ticket
├ billing
└ subscription
```

Each service represents an **independent domain module**.

Responsibilities:

- business logic
- domain models
- service APIs
- workflow orchestration

Services should remain **independent from each other**.

---

# 5. Packages Layer

The `packages` directory contains **reusable libraries and platform modules**.

Examples:

```
packages/
├ shared
├ core/
│  ├ api
│  ├ auth
│  ├ config
│  ├ locale
│  ├ tenant
│  └ utils
└ design/
   └ design-system
```

These packages provide **infrastructure and shared functionality**.

---

# 6. Package Naming Convention

All internal packages must follow the naming rule:

```
@vxture/{group}-{package}
```

Example packages:

```
@vxture/core-api
@vxture/core-config
@vxture/core-locale
@vxture/core-tenant
@vxture/core-auth
@vxture/core-utils

@vxture/service-ticket
@vxture/service-billing
@vxture/service-subscription

@vxture/design-system

@vxture/shared
```

Naming rules:

- lowercase only
- hyphen-separated
- group prefix required
- descriptive module names

---

# 7. Package Groups

Vxture packages are grouped by **architectural responsibility**.

## core

Platform infrastructure modules.

Examples:

```
@vxture/core-api
@vxture/core-config
@vxture/core-locale
@vxture/core-tenant
```

Responsibilities:

- API infrastructure
- configuration management
- localization
- tenant management

---

## service

Domain service modules.

Examples:

```
@vxture/service-ticket
@vxture/service-billing
@vxture/service-subscription
```

Responsibilities:

- business logic
- service APIs
- domain workflows

---

## design

Design system packages.

Examples:

```
@vxture/design-system
```

Responsibilities:

- visual tokens
- UI components
- theme system
- icon library
- density system

---

## shared

Generic shared utilities.

Example:

```
@vxture/shared
```

Responsibilities:

- generic utilities
- shared TypeScript types
- cross-project constants

Restrictions:

Shared must remain **domain-agnostic**.

It must not include:

- business logic
- service-specific code
- UI components

---

# 8. Dependency Direction

Dependencies must follow a **strict top-down architecture**.

```
Portals
   ↓
Business
   ↓
Services
   ↓
Core
   ↓
Shared
```

Lower layers **must not depend on higher layers**.

Allowed:

```
portal → services
portal → packages

business → services
business → packages

services → core
services → shared

core → shared
```

Not allowed:

```
service → service
core → service
shared → core
shared → service
```

---

# 9. Import Rules

Internal imports should use **workspace package names**.

Correct:

```
import { createApi } from "@vxture/core-api"
import { formatDate } from "@vxture/shared"
```

Avoid relative imports across packages:

```
../../../../shared/utils
```

---

# 10. Workspace Management

Vxture uses **pnpm workspace**.

Example workspace configuration:

```
pnpm-workspace.yaml
```

```
packages:
  - portals/*
  - business/*
  - services/*
  - packages/*
```

This allows:

- unified dependency management
- faster installs
- shared build tooling

---

# 11. TypeScript Configuration

All packages should extend the **root TypeScript configuration**.

Example:

```
tsconfig.base.json
```

Each package should include:

```
tsconfig.json
```

extending the base configuration.

---

# 12. AI Development Guidelines

When AI tools generate code for this repository, they must:

1. respect package boundaries
2. follow the naming convention
3. maintain dependency direction
4. avoid cross-service dependencies
5. keep packages modular and focused

AI should read the following documents before generating code:

```
docs/architecture/*
docs/standards/*
docs/ai/*
```

---

# 13. Architecture Goals

The Vxture monorepo architecture aims to achieve:

- clear module boundaries
- scalable SaaS platform architecture
- strong TypeScript type safety
- reusable platform modules
- efficient AI-assisted development

---

End of document.
