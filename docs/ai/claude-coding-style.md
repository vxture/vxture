# Vxture AI Coding Style

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

```
export function createUser() {}
```

Avoid:

```
export default function createUser() {}
```

---

# TypeScript Rules

Always enable strict typing.

Example:

```
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

```
function formatDate(date: Date): string
```

---

# Comments

Use clear comments when necessary.

Example:

```
/**
 * Format a date into ISO string
 */
```

Avoid unnecessary comments.

---

# Dependency Rules

AI must respect package dependency boundaries.

Allowed:

```
portal → services
service → core
service → shared
```

Not allowed:

```
service → portal
service → service
```
