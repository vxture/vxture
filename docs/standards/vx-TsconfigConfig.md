# Vxture Monorepo TypeScript Configuration Refactor Task

## Objective

Refactor the TypeScript configuration across the **Vxture monorepo** to establish a **consistent, minimal, and scalable configuration standard** aligned with the current repository architecture.

The refactor must follow the **principle of minimal necessary configuration**, avoid duplication, and ensure that all applications, services, and shared packages inherit from a unified base configuration.

The repository structure is:

```
vxture/
│
├── portals/
│   ├── website/
│   ├── admin/
│   └── tenant/
│
├── business/
│   └── ruinagent/
│
├── services/
│   ├── gateway/
│   ├── auth/
│   ├── billing/
│   └── workers/
│
├── packages/
│   ├── core/
│   ├── design/
│   │   └── design-system/
│   ├── platform/
│   └── shared/
│       └── shared/
│
├── tools/
├── scripts/
└── docs/
```

---

## Goals

The TypeScript configuration refactor must achieve the following goals:

### 1. Global Configuration Consistency

All projects must inherit from a single root configuration:

```
tsconfig.base.json
```

This file defines the **global TypeScript standard** for the entire repository.

It must include:

- `target: ES2022`
- `module: ESNext`
- `moduleResolution: Bundler`
- `strict: true`
- shared compiler options
- shared path aliases

No project should redefine these settings unless strictly necessary.

---

### 2. Minimal Configuration per Project

Each application, service, or package must contain only the **minimum required configuration**.

Typical per-project `tsconfig.json` should only include:

- `extends`
- `rootDir`
- `outDir` (for libraries and services)
- `noEmit` (for frontend apps)

Avoid redundant configuration across projects.

---

### 3. Clear Separation of Runtime Targets

Different runtime environments require slightly different settings:

#### Web Applications

Location:

```
portals/*
business/*
```

Rules:

- `noEmit: true`
- compiled by framework bundlers (Next.js / Vite)

#### Backend Services

Location:

```
services/*
```

Rules:

- Node.js runtime
- `outDir: dist`
- no DOM libraries

#### Shared Libraries

Location:

```
packages/*
```

Rules:

- buildable packages
- `composite: true`
- `declaration: true`
- `outDir: dist`

These packages are consumed by both services and portals.

---

### 4. Monorepo Import Stability

Define path aliases in the root configuration to ensure consistent imports.

Examples:

```
@vxture/shared
@vxture/core-*
@vxture/platform-*
@vxture/design-system
```

These aliases must map to the correct source directories inside `packages`.

This prevents deep relative imports and improves maintainability.

---

### 5. Support for Scalable Package Growth

The configuration must support future expansion of the following groups:

```
packages/core/*
packages/platform/*
packages/design/*
packages/shared/*
```

Adding new packages must require **minimal configuration effort**.

---

### 6. Compatibility with Modern Tooling

The configuration must be compatible with modern build tools such as:

- Next.js
- Vite
- Turbopack
- Turborepo
- pnpm workspaces

For this reason the configuration must use:

```
moduleResolution: Bundler
```

---

### 7. Avoid Over-Engineering

The refactor must **not introduce unnecessary complexity**.

Avoid:

- multiple base configs
- unnecessary build configs
- duplicated path mappings
- redundant compiler options

The goal is **clarity and long-term maintainability**, not excessive abstraction.

---

## Expected Result

After the refactor:

- All projects inherit from **one global TypeScript standard**
- Configuration duplication is removed
- Imports across the monorepo are stable
- The structure supports **long-term SaaS platform growth**
- New packages or services can be added with minimal setup

The result should be a **clean, maintainable TypeScript foundation** for the Vxture platform.
