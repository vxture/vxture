# Vxture TypeScript Architecture

## Overview

Vxture uses **strict TypeScript configuration** across all packages in the monorepo.

Goals:

- Strong type safety
- Consistent configuration
- Fast incremental builds
- Compatibility with AI-assisted coding

---

# Base Configuration

The monorepo defines a **root tsconfig.base.json**.

All packages must extend it.

Example:

```
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

---

# Required TypeScript Settings

The following rules are mandatory.

```
strict: true
noImplicitAny: true
noUncheckedIndexedAccess: true
exactOptionalPropertyTypes: true
```

These settings ensure:

- safer code
- better AI type inference
- fewer runtime bugs

---

# Path Alias Rules

Path aliases are defined in the root tsconfig.

Example:

```
@vxture/shared/*
@vxture/design/*
@vxture/service/*
```

Example usage:

```
import { debug } from "@vxture/shared/utils"
```

Never use deep relative imports like:

```
../../../../utils
```

---

# Package Structure

Each package must contain:

```
package/
├── package.json
├── tsconfig.json
└── src/
```

---

# Barrel Export

Each package must export a single entry.

```
src/index.ts
```

Example:

```
export * from "./utils"
export * from "./types"
```

---

# Build Output

Compiled output goes to:

```
dist/
```

Source code must never import from `dist`.

---

# AI Coding Rules

AI generated code must:

- respect existing tsconfig
- avoid `any`
- avoid disabling strict rules
- maintain barrel exports

---

End of document.
