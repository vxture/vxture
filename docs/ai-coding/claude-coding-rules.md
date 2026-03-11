# Vxture AI Coding Rules

**Version**: 1.2.0
**Last Updated**: 2026-03-11

This document defines the **AI coding rules** for all tasks in the Vxture Monorepo.
It ensures consistent, high-quality, and maintainable code generation.

---

## 1. Scope

- AI should only modify **explicitly targeted packages or files**.
- Do **not** touch other packages, directories, or docs unless explicitly requested.
- Phase-specific tasks must only operate on the current package (e.g., `@vxture/shared` in Phase 2).
- Do **not delete or move prompt files** or existing documentation.

---

## 2. Package Boundaries

- Respect boundaries defined in:
  - `docs/architecture/02-package-boundaries.md`
  - `docs/architecture/04-shared-layer.md`
  - `docs/architecture/03-package-graph.json`
- Only include allowed types, constants, or utils for the current package.
- Forbidden dependencies vary by layer - refer to `02-package-boundaries.md` for detailed rules

---

## 3. Allowed Code Types

- **Shared layer (`@vxture/shared`)**: utilities, constants, TypeScript types only.
- **Core layer (`@vxture/core-*`)**: platform infrastructure, API clients, base types.
- **Service layer (`@vxture/service-*`)**: business logic services.
- **UI/Portal layers**: components, pages, hooks, layouts.

> AI must not mix layer responsibilities.

---

## 4. Dependencies

- Allowed: third-party libraries (e.g., lodash, dayjs).
- Forbidden: any other internal Vxture packages outside the target layer.
- Avoid circular dependencies.

---

## 5. TypeScript Practices

- Use **composite tsconfig** where applicable.
- Use path aliases (e.g., `@vxture/shared`, `@vxture/service-billing`) for all cross-package imports.
- Modular and clean code; keep each file focused on one responsibility.
- Export all public symbols via `src/index.ts`.
- **Type Imports/Exports**:
  - Always use `import type` for importing types-only: `import type { UserInfo } from '@vxture/shared';`
  - Always use `export type` for exporting types-only in index files: `export type { UserInfo } from './types';`
  - Never use `export *` for type-only files; explicitly list exports with `export type`
  - Value exports (functions, constants, classes) use regular `export`

---

## 6. Comment and Documentation Standards

- Follow **claude-coding-comments.md** strictly.
- All files must include:
  - `@package` – package name
  - `@layer` – layer (Presentation, Application, Domain, Infrastructure, Shared)
  - `@category` – optional, submodule or feature category
- Use **section comments** to organize types, constants, and utils.
- Prefer **"why" explanations**, not "what" explanations.
- Keep comments up-to-date whenever code changes.
- All comments written in **Chinese**.

---

## 7. AI Behavior Rules

1. **Copy-Paste Ready** — All generated code must be immediately usable.
2. **Do not generate unrelated packages or features.**
3. **Respect file and folder structure** as outlined in architecture docs.
4. **Preserve all existing documentation and prompt files**.
5. **Provide example import statements** for other layers if relevant.
6. **Follow Claude code style** (`claude-coding-style.md`) and TypeScript best practices.

---

## 8. Service Layer Rules

- New services always go in `services/{domain}/{name}/` — identify the domain first.
- Package name is always `@vxture/service-{name}` — domain prefix never appears in package name.
- Import services using `@vxture/service-{name}` — never reference domain path in imports.
- Existing service package names (`@vxture/service-billing`, etc.) must not be changed.
- Current domains: `commerce` (billing, subscription), `support` (ticket).
- When adding a new domain, create the domain directory — no workspace config changes needed.

---

## 9. Output Guidelines

- Output full directory structure with files.
- Provide TypeScript content for each file.
- Include example usage import statements.
- Ensure AI output is **modular, maintainable, and aligned with package boundaries**.

---

## 10. Notes

- Treat each task as **layer-specific and scoped**.
- Do not introduce feature-specific logic into shared/core packages.
- Merge previous code if present; do not overwrite blindly.
- This document is **permanent** and should not be deleted automatically by AI.

---

End of document.
