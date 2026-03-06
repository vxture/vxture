# Vxture Core Layer Architecture

## Overview

The **Core Layer** in the Vxture Monorepo is the **platform infrastructure layer**.

It provides reusable, framework-agnostic utilities and services that are **consumed by Service, Platform SDK, and Portal layers**, but **does not contain business logic or UI components**.

The Core Layer ensures:

- **Consistency** across multi-tenant applications
- **Type safety** and modular architecture
- **Centralized platform services** for authentication, locale, configuration, and API handling

Core packages represent **stable platform primitives** that higher layers rely on.

---

# Responsibilities

The Core Layer is responsible for the following platform capabilities.

## 1. API Infrastructure

Provide standardized tools for API communication.

Responsibilities:

- Centralized API request handling
- Standardized request/response types
- Authentication token support
- Request interceptors
- Error normalization
- Retry / timeout helpers

This ensures **all services communicate with APIs consistently**.

---

## 2. Tenant & Multi-Tenant Context

Support multi-tenant platform architecture.

Responsibilities:

- Tenant ID resolution
- Tenant context propagation
- Tenant configuration lookup
- Tenant-specific data isolation

This allows services and portals to operate within **tenant-aware environments**.

---

## 3. Locale & Internationalization

Provide reusable internationalization utilities.

Responsibilities:

- Locale resolution
- Translation helpers
- Formatting utilities
- Locale context propagation

This ensures **consistent multilingual support across portals**.

---

## 4. Authentication & Authorization

Provide platform-level authentication utilities.

Responsibilities:

- Token validation
- Session helpers
- Role-based access utilities
- Authorization helpers

The Core Layer **does not implement business permissions**, only **platform primitives**.

---

## 5. Core Utilities

Provide reusable platform utilities.

Examples:

- Logging helpers
- Environment utilities
- Type guards
- Generic helpers

These utilities support both **server and frontend environments**.

---

# Core Package Structure

Core functionality is divided into focused packages.

```
packages/
│
├─ core-api/          # API infrastructure
├─ core-tenant/       # Tenant context
├─ core-locale/       # Locale and i18n
├─ core-auth/         # Authentication helpers
└─ core-utils/        # Platform utilities
```

Example structure:

```
packages/core-api
│
├─ src/
│   ├─ client/
│   │   └─ api-client.ts
│   │
│   ├─ types/
│   │   └─ api.types.ts
│   │
│   ├─ utils/
│   │   └─ request.utils.ts
│   │
│   └─ index.ts
```

Each package must follow **single-responsibility principles**.

---

# Layer Dependency Rules

Vxture follows a **strict layered architecture**.

```
Shared
   ↑
Core
   ↑
Services
   ↑
Portals
```

Dependency rules:

| Layer    | Allowed Imports          |
| -------- | ------------------------ |
| Shared   | none                     |
| Core     | Shared                   |
| Services | Core + Shared            |
| Portals  | Services + Core + Shared |

Forbidden dependencies:

```
core → services
core → portals
core → UI libraries
core → framework-specific packages
```

The Core Layer must remain **independent and reusable**.

---

# Core Layer Principles

## 1. Shared Dependencies Only

Core packages may depend only on:

```
@vxture/shared
```

Forbidden dependencies:

```
services/*
portals/*
UI frameworks
```

---

## 2. Framework Agnostic

Core must run in both environments:

- Node.js
- Browser

Therefore Core **must not import**:

```
react
next
vue
angular
```

---

## 3. Type Safety

All Core APIs must be **fully typed**.

Guidelines:

- Strict TypeScript configuration
- Public interfaces exported
- No `any` types

---

## 4. Modularity

Each core package must have a **clear single responsibility**.

Example:

```
core-api
core-auth
core-tenant
```

Avoid creating **large "misc" modules**.

---

# Public Export Rules

Each core package must expose **one public entry**:

```
src/index.ts
```

All public APIs must be exported from this file.

Example:

```ts
export * from './client/api-client';
export * from './types/api.types';
```

Consumers must import only from the package root:

```ts
import { apiClient } from '@vxture/core-api';
```

Forbidden import pattern:

```
@vxture/core-api/src/client/api-client
```

This rule protects **internal implementation details**.

---

# File Structure Convention

Recommended folder layout inside each package:

```
src/
│
├─ client/        # API clients
├─ context/       # Context utilities
├─ types/         # TypeScript definitions
├─ utils/         # Reusable helpers
│
└─ index.ts
```

Benefits:

- Predictable structure
- Easier AI code generation
- Improved maintainability

---

# Naming Convention

To maintain consistency across the monorepo:

| Type             | Naming           |
| ---------------- | ---------------- |
| Type definitions | `*.types.ts`     |
| Constants        | `*.constants.ts` |
| Utilities        | `*.utils.ts`     |
| API clients      | `*.client.ts`    |
| Context helpers  | `*.context.ts`   |

Avoid generic filenames like:

```
helpers.ts
utils.ts
misc.ts
```

Prefer **domain-specific naming**.

---

# Example Usage

Example usage across the platform:

```ts
import { apiClient } from '@vxture/core-api';
import { getTenantId } from '@vxture/core-tenant';
import { translate } from '@vxture/core-locale';
import { validateToken } from '@vxture/core-auth';
import { log } from '@vxture/core-utils';

// Fetch data for current tenant
const tenantId = getTenantId();

const response = await apiClient.get(`/users?tenant=${tenantId}`);

log('Fetched users:', response);

// Translate a label
const label = translate('welcome_message');
```

---

# AI Modification Rules

When AI tools modify Core Layer code they must follow these rules.

AI **must not**:

```
Add business logic
Add UI components
Add React or Next.js dependencies
Change layer dependencies
Move files across packages
```

AI **must**:

```
Respect package boundaries
Export public APIs via index.ts
Follow coding standards
Preserve architecture integrity
```

---

# Notes

The Core Layer is **platform infrastructure only**.

It should remain:

- Stable
- Framework-agnostic
- Highly reusable

Business logic must reside in the **Service Layer**, not in Core.

Core packages should remain **small, focused, and maintainable**.
