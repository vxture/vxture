# Vxture AI Coding Style

**Version**: 1.2.0
**Last Updated**: 2026-03-10

This document defines how AI should generate code for the Vxture project.

---

# General Rules

1. Always use **TypeScript**.
2. Avoid `any` type unless absolutely necessary.
3. Prefer small modular files.
4. Each file should have a single responsibility.

---

# File Structure

Each module should follow this pattern:

```
module/
 ├ index.ts
 ├ types.ts
 ├ constants.ts
 ├ utils.ts
```

---

# Naming Conventions

| Item       | Style      |
| ---------- | ---------- |
| variables  | camelCase  |
| functions  | camelCase  |
| types      | PascalCase |
| interfaces | PascalCase |
| constants  | UPPER_CASE |

Example:

```
getUserProfile()
UserProfile
API_TIMEOUT
```

---

# Export Style

Prefer **named exports**.

Correct:

```ts
export function createUser() {}
```

Avoid:

```ts
export default function createUser() {}
```

---

# TypeScript Rules

Always enable strict typing.

Example:

```ts
type User = {
  id: string
  name: string
}
```

Avoid implicit any.

---

# Function Design

Functions should:

- be pure when possible
- avoid side effects
- be small and composable

Example:

```ts
function formatDate(date: Date): string
```

---

# Comments

Use clear comments when necessary. All comments written in **Chinese**.

Example:

```ts
/**
 * 将日期格式化为 ISO 字符串
 */
```

Avoid unnecessary comments.

---

# Dependency Rules

AI must respect package dependency boundaries defined in `02-package-boundaries.md`.

Allowed:

```
portal      → bff (HTTP only)
bff         → service-*, core-*, agent-server/*
agent-server → ai-sdk, service-*, core-*
service-*   → core-*, shared
core-*      → shared
```

Not allowed:

```
frontend    → service-*, core-*, ai-sdk (server-side packages)
service-*   → other service-*
bff-*       → other bff-*
```

When importing services, always use `@vxture/service-{name}`.
The domain directory path (`services/commerce/billing/`) is never referenced in imports.
