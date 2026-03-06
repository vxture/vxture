# Vxture AI Coding Comment Guidelines

This document defines the **code commenting standards** for the Vxture Monorepo.
It is intended for developers and AI tools to ensure readability, maintainability, and consistent style.

---

## 1. General Principles

- **Explain "why", not "what"** – Code is self-explanatory for _what_ it does. Comments should explain the reasoning, constraints, or trade-offs behind a decision.
- **No noise** – Omit comments that restate the code. A comment that adds no information is worse than no comment.
- **Stay in sync** – A comment that contradicts the code is actively harmful. Update comments as part of every code change, not as an afterthought.
- **Be consistent** – Follow this standard across all layers, packages, and languages. Inconsistency erodes readability over time.

> **Project-wide constraints:**
>
> - Comment language: **Chinese** (internal standard; identifiers remain in English).
> - Every core file must declare a `@package` tag in its file header — see Section 2.

---

## 2. File Header Comment

All core files should start with a standardized header:

```typescript
/**
 * filename.ts - Short description
 * @package @vxture/[package-name]
 *
 * Description: Detailed explanation of the file's functionality and responsibilities
 *
 * @author ${USER}           // AI-generated files: use "AI-Generated"
 * @date ${DATE} ${TIME}
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Presentation | Application | Domain | Infrastructure | Shared
 * @category Components - Common
 */
```

| Field       | Description                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| `@package`  | Package name, format: `@vxture/[package-name]`                                  |
| `@layer`    | Architecture layer — see Section 3. Must match the file's actual responsibility |
| `@category` | Functional category, e.g. `Components - Common` / `Hooks` / `Utils`             |
| `@author`   | Use `${USER}`; AI-generated files use `AI-Generated`                            |
| `@version`  | Start at `1.0`; increment on major refactors                                    |

---

## 3. Layer (@layer) Values

> **Selection rule: choose based on the file's primary responsibility. If a file spans multiple layers, split it into separate files.**

| Layer            | Responsibility                                         | Examples                                            |
| ---------------- | ------------------------------------------------------ | --------------------------------------------------- |
| `Presentation`   | UI components, pages, visual display                   | Portals, React components, layout containers        |
| `Application`    | Application logic, service orchestration, Hooks        | Data-fetching Hooks, workflow coordination          |
| `Domain`         | Core business logic, type definitions, domain rules    | Business models, domain services, type system       |
| `Infrastructure` | External services, APIs, storage, platform integration | API clients, database access, caching services      |
| `Shared`         | Cross-layer utilities, constants, common types         | Validation functions, theme constants, shared types |

---

## 4. Section Comments

Use section separators to organize code in files longer than 80 lines:

```typescript
// ============================================================================
// Types
// ============================================================================

// ============================================================================
// Constants
// ============================================================================

// ============================================================================
// Components / Hooks Implementation
// ============================================================================
```

Common section names: `Types` / `Constants` / `Helpers` / `Components` / `Hooks Implementation` / `Exports`

---

## 5. Interface / Type Comments

```typescript
/**
 * Interface description
 */
interface ExampleProps {
  /** Property description */
  readonly property?: Type;
}
```

---

## 6. Function Comments

```typescript
/**
 * Function description
 *
 * @param param - Parameter description
 * @returns Description of the return value
 * @throws {ErrorType} When and why this error is thrown
 */
export function functionName(param: Type): ReturnType {
  // Implementation...
}
```

> Functions with `throw` statements must declare `@throws`.

---

## 7. Enum Comments

```typescript
/**
 * Enum description
 */
export enum EExample {
  /** Member description */
  MEMBER = 'value',
}
```

---

## 8. Python Backend Docstring

```python
def function_name(param: str) -> Optional[ReturnType]:
    """
    Function description

    Args:
        param: Description of the parameter

    Returns:
        Description of the return value

    Raises:
        ErrorType: When and why this error is raised
    """
    # Implementation...
```

---

## 9. AI Usage Notes

### Mandatory

- All new files must include a complete file header — `@package`, `@layer`, `@category` are required.
- `@layer` must reflect the file's actual architectural role — do not guess or default.
- Set `@author` to `AI-Generated` and `@date` to the actual generation date.
- All exported functions require JSDoc with `@param` and `@returns`; add `@throws` when exceptions exist.
- Files longer than 80 lines must use section comments.
- When modifying existing code, update all affected comments.

### Prohibited

- Do not generate comments that merely restate the code (e.g. `// loop`, `// define variable`).
- Do not omit `@throws` when a function has known exception paths.
- Do not use a `@layer` value that does not match the file's actual position in the Monorepo.

### Self-Check Checklist

Before completing any file, verify:

- [ ] File header contains `@package` / `@layer` / `@category` / `@author` / `@date`
- [ ] `@layer` matches the file's actual role in the Monorepo
- [ ] All exported functions have `@param` / `@returns`
- [ ] Functions with `throw` statements have `@throws`
- [ ] Files over 80 lines have section separators
- [ ] All comments are written in Chinese
- [ ] No trivial or redundant comments
