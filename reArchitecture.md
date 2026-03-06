# Vxture Monorepo Architecture (Stable 10+ Years)

This document defines the **long-term stable architecture** for the Vxture platform repository.

Goals:

- Clear separation of **Portals / Business Apps / Services / Packages**
- Scalable **SaaS platform architecture**
- Compatible with **pnpm + turborepo**
- Maintainable for **10+ years without structural refactor**

---

# 1 Repository Root Structure

Repository root:

```
D:/vxture
│
├ portals                 # Platform portals (user entry systems)
│
├ business                # SaaS business applications
│
├ services                # Backend microservices
│
├ packages                # Shared libraries and platform SDKs
│
├ tools                   # Engineering toolchains
│
├ scripts                 # Automation scripts
│
├ docs                    # Architecture documentation
│
├ .github                 # CI/CD
│
├ pnpm-workspace.yaml
├ turbo.json
├ tsconfig.base.json
└ package.json
```

---

# 2 Portals (Platform Entry Systems)

Portals are **platform-level user interfaces**.

```
portals
│
├ website                 # Public company website
│
├ admin                   # Platform admin console
│
└ tenant                  # Tenant portal
```

Each portal is an independent application:

```
portals/<portal-name>
└ package.json
```

---

# 3 Business Applications

Business applications are **domain SaaS products** built on top of the platform.

```
business
│
└ ruinagent               # AI Agent application
```

Business apps **may be split into separate repositories in the future**.

---

# 4 Backend Services

Backend services provide **platform APIs and infrastructure capabilities**.

```
services
│
├ gateway                 # API Gateway / BFF
│
├ auth                    # Authentication service
│
├ billing                 # Billing service
│
└ workers                 # Background jobs / async processing
```

Each service:

```
services/<service-name>
└ package.json
```

---

# 5 Shared Libraries (packages)

All reusable libraries live under **packages/**.

Structure:

```
packages
│
├ shared
│
├ core
│
├ platform
│
└ design
```

---

# 6 Shared Layer (Lowest Level)

Reusable utilities and primitives with **no platform, framework, or business dependencies**.
This layer provides the most fundamental capabilities used across the entire monorepo.

The following existing packages must be **merged into a single package**:

- `@vxture/shared-types`
- `@vxture/shared-constants`
- `@vxture/shared-utils`

After consolidation, they become **one unified package** located under a **grouped directory**:

```
packages/shared/shared
```

Package name:

```
@vxture/shared
```

Directory structure:

```
packages
└── shared                # Layer group name
    │
    └── shared            # Package name
        │
        ├── package.json
        ├── tsconfig.json
        └── src
            │
            ├── types
            │   └── Global shared TypeScript types
            │
            ├── constants
            │   └── Global constants and enums
            │
            ├── utils
            │   └── Generic utility functions (string, object, array, date, etc.)
            │
            ├── guards
            │   └── Type guards and validation helpers
            │
            └── index.ts
                └── Unified public exports
```

Rules:

- The **Shared Layer must not depend on any other internal packages**.
- Only minimal external dependencies are allowed (e.g. `zod`, `dayjs`) when absolutely necessary.
- All public APIs must be **exported through `src/index.ts`** to maintain a stable package interface.
- The `packages/shared` directory acts as the **layer group**, while `shared` is the **actual package**.

---

# 7 Core Layer (Platform Infrastructure)

Core infrastructure used across the platform.

```
packages/core
│
├ env
│
├ config
│
├ api
│
├ locale
│
└ tenant
```

Package names:

```
@vxture/core-env
@vxture/core-config
@vxture/core-api
@vxture/core-locale
@vxture/core-tenant
```

---

# 8 Platform SDK Layer

Platform capabilities exposed as SDK libraries.

```
packages/platform
│
├ auth
│
├ billing
│
└ tenant
```

Package names:

```
@vxture/platform-auth
@vxture/platform-billing
@vxture/platform-tenant
```

Purpose:

Expose platform features for:

- portals
- business apps
- services

---

# 9 Design System

The design system remains **a single package**.

Directory:

```
packages/design/design-system
```

Package name:

```
@vxture/design-system
```

Internal structure:

```
src
├ icons
├ components
├ theme
├ density
├ tokens
├ styles
├ hooks
├ utils
└ index.ts
```

The design system **should not be split into multiple packages at this stage**.

---

# 10 Tools

Engineering tools shared across the monorepo.

```
tools
│
├ eslint-config
│
├ tsconfig
│
└ build
```

Package names:

```
@vxture/eslint-config
@vxture/tsconfig
@vxture/build
```

---

# 11 pnpm Workspace Configuration

```
packages:
  - portals/*
  - business/*
  - services/*
  - packages/*/*
  - tools/*
```

---

# 12 Package Naming Convention

All packages must follow:

```
@vxture/<group>-<name>
```

Examples:

```
@vxture/shared-utils
@vxture/core-api
@vxture/platform-auth
@vxture/design-system
```

---

# 13 Dependency Rules (Architecture Constraint)

Dependency direction must follow:

```
shared
  ↑
core
  ↑
platform
  ↑
portals / business / services
```

Forbidden:

```
core -> portals
shared -> services
```

This rule prevents architecture coupling.

---

# 14 Future Extensions

Future directories may include:

```
infra
plugins
sdk
```

Example:

```
infra
├ docker
├ k8s
└ terraform
```

These are not required in the initial stage.

---

# 15 Architecture Principles

The Vxture repository follows these principles:

- **Layered architecture**
- **Platform-first design**
- **SaaS extensibility**
- **Monorepo maintainability**
- **Minimal coupling between applications**

This structure is designed to remain stable for **10+ years**.
