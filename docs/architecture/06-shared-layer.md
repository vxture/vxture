# Vxture Shared Layer Architecture

## Overview

The **Shared Layer** provides reusable utilities, types, and constants used across
the entire Vxture platform — portals, agent-studio, agent-server, bff, services, and packages.

It must remain:

- Lightweight
- Dependency-safe
- Framework-agnostic
- Domain-agnostic

---

# 1. Package

```
@vxture/shared
```

Location:

```
packages/shared/shared/
```

---

# 2. Internal Structure

```
packages/shared/shared/
├── package.json
├── tsconfig.json
└── src/
    ├── constants/    # Global configuration constants
    ├── types/        # Shared TypeScript types
    ├── utils/        # Pure utility functions
    └── index.ts      # Barrel export
```

---

# 3. constants/

Global configuration constants. No runtime logic — configuration objects only.

Examples:

```
authConfig.ts       # Auth-related constants
i18nConfig.ts       # Locale and language constants
themeConfig.ts      # Theme-related constants
```

Rules:

- No runtime logic
- No function calls
- Configuration objects and string/number literals only

---

# 4. types/

Shared TypeScript type definitions. No runtime imports — type definitions only.

Examples:

```
auth.types.ts       # Shared auth-related types
content.types.ts    # Shared content types
theme.types.ts      # Theme and density types
pagination.types.ts # Shared pagination types
```

Rules:

- No runtime imports (`import type` only where needed)
- No class definitions with logic
- Pure type and interface definitions

---

# 5. utils/

Pure utility functions with no side effects and no framework dependencies.

Examples:

```
debug.ts            # Debug and logging utilities
format.ts           # String / number formatting helpers
scroll.ts           # Scroll utilities
date.ts             # Date manipulation helpers
```

Rules:

- Pure functions only
- No side effects
- No framework dependencies (no React, no Node.js APIs)
- Must run in both browser and Node.js environments

---

# 6. Dependency Rules

`@vxture/shared` must not depend on any internal package.

Allowed:

```
Lightweight third-party utility libraries
```

Forbidden:

```
@vxture/core-*
@vxture/service-*
@vxture/bff-*
@vxture/ai-sdk
@vxture/platform-*
@vxture/design-system
React, Next.js, Node.js frameworks
Database libraries
```

---

# 7. Export Pattern

Single barrel export from `src/index.ts`:

```ts
export * from './constants';
export * from './types';
export * from './utils';
```

---

# 8. Usage

```ts
import { debug } from '@vxture/shared';
import type { AuthConfig } from '@vxture/shared';
import { formatDate } from '@vxture/shared';
```

---

# 9. AI Coding Rules

AI must:

- Keep the shared package minimal — only genuinely cross-cutting concerns belong here
- Never add domain logic, business rules, or service-specific code
- Never add UI components or React-dependent code
- Place new code in the correct subfolder: `constants/`, `types/`, or `utils/`
- Avoid adding heavy third-party dependencies
- Ensure all utilities work in both browser and Node.js environments
- No `any` types

---

End of document.
