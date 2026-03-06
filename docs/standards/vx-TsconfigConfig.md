# Vxture TypeScript Configuration Standard

## 1. Purpose

This document defines the **unified TypeScript configuration strategy** for the Vxture Monorepo.

Goals:

- Ensure consistent TypeScript behavior across all packages
- Improve type safety and maintainability
- Standardize build output for libraries and applications
- Provide a clear inheritance structure for tsconfig files

All packages **must follow this standard**.

---

# 2. Configuration Architecture

Vxture uses a **three-level tsconfig architecture**.

Root configuration provides **global rules**.
Packages inherit configuration using **extends**.

Structure:

vxture/
├─ tsconfig.base.json
├─ tsconfig.paths.json
├─ portals/
├─ business/
├─ services/
├─ packages/

Configuration hierarchy:

tsconfig.base.json
↓
package tsconfig.json
↓
tsconfig.build.json (optional)

---

# 3. Root Configuration Files

## 3.1 tsconfig.base.json

Defines the **global TypeScript compiler rules**.

Responsibilities:

- strict type rules
- module resolution
- JSX configuration
- build compatibility
- developer experience improvements

Example:

{
"compilerOptions": {
"target": "ES2022",
"lib": ["DOM", "ES2022"],
"module": "ESNext",
"moduleResolution": "Bundler",

```
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true,

"skipLibCheck": true,
"forceConsistentCasingInFileNames": true,

"resolveJsonModule": true,
"isolatedModules": true,

"esModuleInterop": true,
"allowSyntheticDefaultImports": true,

"jsx": "react-jsx",

"types": ["node"]
```

}
}

---

## 3.2 tsconfig.paths.json

Defines **monorepo path aliases**.

Purpose:

- simplify imports
- avoid deep relative paths
- improve refactoring

Example:

{
"compilerOptions": {
"baseUrl": ".",
"paths": {
"@vxture/core-utils": ["packages/core-utils/src"],
"@vxture/core-env": ["packages/core-env/src"],
"@vxture/core-config": ["packages/core-config/src"],

```
  "@vxture/design-system": ["packages/design-system/src"],
  "@vxture/ui-kit": ["packages/ui-kit/src"]
}
```

}
}

Rules:

- Every package must have a **path alias**
- Aliases must follow the **@vxture/** namespace
- Direct relative cross-package imports are **forbidden**

Correct:

import { env } from "@vxture/core-env"

Incorrect:

import { env } from "../../../core-env/src"

---

# 4. Package tsconfig Standard

Every package must include a **local tsconfig.json**.

Responsibilities:

- inherit global rules
- define package root
- control compilation scope

Example:

{
"extends": "../../tsconfig.base.json",
"compilerOptions": {
"rootDir": "src",
"outDir": "dist"
},
"include": ["src"],
"exclude": ["node_modules", "dist"]
}

Rules:

- Source code must live in **src/**
- Build output must be **dist/**
- Do not override strict rules from base config

---

# 5. Library Build Configuration

Libraries may define an additional build configuration:

tsconfig.build.json

Example:

{
"extends": "./tsconfig.json",
"compilerOptions": {
"declaration": true,
"declarationMap": true,
"sourceMap": true,
"emitDeclarationOnly": false
}
}

Purpose:

- generate declaration files
- support package publishing
- improve IDE navigation

---

# 6. Application Configuration

Applications (portals / admin / tenant) may include additional settings.

Example:

{
"extends": "../../tsconfig.base.json",
"compilerOptions": {
"noEmit": true
},
"include": ["src"]
}

Applications typically rely on **bundlers** for build:

- Vite
- Next.js
- Webpack

Therefore TypeScript only performs **type checking**.

---

# 7. Strictness Policy

Vxture enforces **strict TypeScript mode**.

Mandatory rules:

strict = true
noImplicitAny = true
strictNullChecks = true

These rules **must never be disabled**.

If a package requires exceptions, use:

// eslint-disable-next-line
// @ts-ignore

But such usage must be **documented**.

---

# 8. Import Rules

Recommended import order:

1. external libraries
2. @vxture internal packages
3. relative imports

Example:

import React from "react"

import { env } from "@vxture/core-env"
import { config } from "@vxture/core-config"

import { Button } from "../components/Button"

---

# 9. File Naming

TypeScript file naming rules:

Component files

PascalCase

Example:

Button.tsx
ModalDialog.tsx

Utility files

camelCase

Example:

formatDate.ts
createLogger.ts

Type files

kebab-case + .types.ts

Example:

user.types.ts
api.types.ts

---

# 10. Prohibited Practices

The following practices are **not allowed**:

Cross-package relative imports

../../../core-utils/src

Duplicated type definitions

export type ID = string

Using "any" without justification

const data: any

Disabling strict mode

"strict": false

---

# 11. IDE Requirements

Recommended developer tools:

Editor

Visual Studio Code

Extensions

ESLint
TypeScript
Prettier

Developers should enable:

TypeScript "strict mode hints"

---

# 12. CI Validation

CI should run the following checks:

pnpm typecheck

pnpm lint

pnpm build

Type errors must **block merging**.

---

# 13. Summary

Vxture TypeScript configuration ensures:

- strict typing
- consistent builds
- scalable monorepo architecture
- clean cross-package imports

All contributors must follow this standard.

Failure to follow the standard may cause:

- type conflicts
- build failures
- architecture violations

This document is part of the **Vxture Engineering Standards**.
