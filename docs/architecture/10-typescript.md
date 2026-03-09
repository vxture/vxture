# Vxture TypeScript Architecture

**Version**: 1.1.0
**Last Updated**: 2026-03-09
**TypeScript Version**: 5.9.3
**ECMAScript Target**: ES2023

## Overview

Vxture uses **strict TypeScript configuration** across all packages and applications
in the monorepo.

Goals:

- Strong type safety across all layers
- Consistent configuration and build behavior
- Scalable path alias strategy aligned with monorepo structure
- Compatibility with AI-assisted coding

---

# 1. Configuration Architecture

Vxture uses a **two-level tsconfig inheritance** structure:

```
tsconfig.base.json          # Global compiler rules + path aliases (root)
      ↓
{package}/tsconfig.json     # Per-package local config
```

Root-level files:

```
vxture/
├── tsconfig.base.json      # Global config (compiler options + paths)
├── tsconfig.json           # Project references (solution-style)
├── portals/
├── business/
├── services/
└── packages/
```

---

# 2. tsconfig.base.json

Defines global TypeScript compiler rules inherited by all packages and applications.

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",

    "strict": true,
    "useDefineForClassFields": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,

    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

---

# 3. Path Aliases Configuration

Path aliases are defined directly in `tsconfig.base.json`, aligned with the `packages/{group}/{name}/` structure.

Rules:

- Every internal package must have a path alias
- Aliases must follow `@vxture/{group}-{name}` naming
- Cross-package relative imports are **forbidden**

```ts
import { debug } from '@vxture/shared'; // ✅
import { debug } from '../../../shared/shared/src'; // ❌
```

---

# 4. Per-Package tsconfig.json

Every package and application must include a local `tsconfig.json`.

**Packages** (`packages/{group}/{name}/`):

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Applications** (`portals/`, `agent-studio/`, `bff/`, `agent-server/`):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src"]
}
```

Applications set `noEmit: true` because they rely on their bundler (Vite, Next.js)
for compilation — TypeScript is used for type checking only.

---

# 5. Library Build Configuration

Shared packages that are published or consumed as libraries define an additional
`tsconfig.build.json` for producing declaration files:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "emitDeclarationOnly": false
  }
}
```

Applies to: `packages/core/*`, `packages/ai/ai-sdk`, `packages/platform/*`,
`packages/design/design-system`, `packages/shared/shared`.

---

# 6. Layer-Specific Compiler Environment

Different layers have different runtime environments and require adjusted settings:

**Frontend packages** (`portals/`, `agent-studio/`, `design-system`, `platform-*`):

- Include `"lib": ["DOM", "ES2023"]`
- React types via `@types/react`
- `"jsx": "react-jsx"`
- `"noEmit": true` for applications

**Server packages** (`bff/`, `agent-server/`, `services/`, `core-*`, `ai-sdk`):

- Remove or restrict DOM lib
- No React types or JSX
- Must compile cleanly in Node.js environment

**Shared packages** (`@vxture/shared`, `@vxture/core-*`):

- Must compile in both environments
- Avoid DOM-specific and Node.js-specific APIs
- Use runtime checks when environment-specific behavior is needed

---

# 7. Barrel Export Standard

Every package exposes a **single public entry point**:

```
src/index.ts
```

All public APIs exported from this file:

```ts
export * from './client/api-client';
export * from './types/api.types';
export * from './utils/request.utils';
```

Consumers always import from the package root:

```ts
import { apiClient } from '@vxture/core-api'; // ✅
import { apiClient } from '@vxture/core-api/src/client'; // ❌
```

Source code must never import from `dist/`.

---

# 8. File Naming Convention

| Type             | Convention          | Example              |
| ---------------- | ------------------- | -------------------- |
| React components | PascalCase `.tsx`   | `Button.tsx`         |
| React hooks      | camelCase `use*.ts` | `useTheme.ts`        |
| Type definitions | `*.types.ts`        | `user.types.ts`      |
| Constants        | `*.constants.ts`    | `auth.constants.ts`  |
| Utilities        | `*.utils.ts`        | `format.utils.ts`    |
| API clients      | `*.client.ts`       | `api.client.ts`      |
| Context helpers  | `*.context.ts`      | `tenant.context.ts`  |
| Service logic    | `*.service.ts`      | `billing.service.ts` |
| Repository logic | `*.repository.ts`   | `user.repository.ts` |
| Router modules   | `*.router.ts`       | `order.router.ts`    |
| Middleware       | `*.middleware.ts`   | `auth.middleware.ts` |

Avoid generic names: `helpers.ts`, `utils.ts`, `misc.ts`.
Use domain-specific names instead.

---

# 9. Import Order Convention

```ts
// 1. External libraries
import React from 'react';
import { z } from 'zod';

// 2. Internal @vxture packages
import { getTenantId } from '@vxture/core-tenant';
import { Button } from '@vxture/design-system';

// 3. Relative imports (within same package)
import { formatDate } from './utils/format.utils';
import type { UserType } from './types/user.types';
```

Use `import type` for type-only imports.

---

# 10. Strictness Policy

The following compiler options are **mandatory and must never be disabled**:

```
strict: true
noImplicitAny: true
strictNullChecks: true
noUncheckedIndexedAccess: true
exactOptionalPropertyTypes: true
```

Prohibited practices:

```ts
const data: any           // ❌ use unknown and narrow
"strict": false           // ❌ never disable
// @ts-ignore             // ❌ only with written justification comment
```

Cross-package relative imports:

```ts
import { x } from '../../../packages/core/api/src'; // ❌
import { x } from '@vxture/core-api'; // ✅
```

Duplicated type definitions across packages:

```ts
// ❌ define shared types in @vxture/shared, not per-package
export type ID = string;
```

---

# 11. AI Coding Rules

AI generated code must:

1. Always extend `tsconfig.base.json` — never define compiler options from scratch
2. Use three-level path for packages: `"extends": "../../../tsconfig.base.json"`
3. Use two-level path for applications: `"extends": "../../tsconfig.base.json"`
4. Never use `any` — use `unknown` and narrow types explicitly
5. Never disable strict rules — document with a comment if `@ts-ignore` is absolutely required
6. Always add new public APIs to `src/index.ts`
7. Use `@vxture/*` workspace aliases for all cross-package imports — no relative cross-package paths
8. Never import from `dist/`
9. Use `import type` for type-only imports
10. Follow file naming conventions — PascalCase components, camelCase hooks, kebab-case type files

---

End of document.
