# Vxture Shared Layer Architecture

## Overview

The **shared layer** provides reusable utilities, types, and constants used across the entire Vxture platform.

It must remain:

- lightweight
- dependency-safe
- framework-agnostic

---

# Package

```
@vxture/shared
```

Location:

```
packages/shared
```

---

# Internal Structure

```
packages/shared
└── src
    ├── constants
    ├── types
    ├── utils
    └── index.ts
```

---

# constants

Contains global configuration constants.

Examples:

```
authConfig.ts
i18nConfig.ts
themeConfig.ts
```

Rules:

- no runtime logic
- only configuration objects

---

# types

Contains shared TypeScript types.

Examples:

```
auth.types.ts
content.types.ts
theme.types.ts
```

Rules:

- no runtime imports
- only type definitions

---

# utils

Reusable utility functions.

Examples:

```
debug.ts
scroll.ts
```

Rules:

- pure functions
- no side effects
- no framework dependencies

---

# Dependency Rules

Shared layer **must NOT depend on**:

```
React
Next.js
Node frameworks
Database libraries
```

Allowed:

```
small utility libraries
```

---

# Export Pattern

Use barrel export.

Example:

```
export * from "./constants"
export * from "./types"
export * from "./utils"
```

---

# Import Example

```
import { debug } from "@vxture/shared"
```

---

# AI Coding Rules

AI must:

- keep shared package minimal
- avoid adding heavy dependencies
- place logic in the correct folder

---

End of document.
