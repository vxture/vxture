# Vxture AI Coding Rules

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
  - `docs/architecture/06-shared-layer.md`
  - `docs/architecture/03-package-graph.json`
- Only include allowed types, constants, or utils for the current package.
- Forbidden dependencies:
  - Core packages (`@vxture/core-*`)
  - Service packages (`@vxture/service-*`)
  - UI/Portal packages (`@vxture/ui-*`, `portals/*`)

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
- Use path aliases (e.g., `@vxture/shared/*`) for imports.
- Modular and clean code; keep each file focused on one responsibility.
- Export all public symbols via `index.ts`.

---

## 6. Comment and Documentation Standards

- Follow **claude-code-comments.md** strictly.
- All files must include:
  - `@package` – package name
  - `@layer` – layer (Presentation, Application, Domain, Infrastructure, Shared)
  - `@category` – optional, submodule or feature category
- Use **section comments** to organize types, constants, and utils.
- Prefer **“why” explanations**, not “what” explanations.
- Keep comments up-to-date whenever code changes.

---

## 7. AI Behavior Rules

1. **Copy-Paste Ready**
   - All generated code must be immediately usable.
2. **Do not generate unrelated packages or features.**
3. **Respect file and folder structure** as outlined in architecture docs.
4. **Preserve all existing documentation and prompt files**.
5. **Provide example import statements** for other layers if relevant.
6. **Follow Claude code style** (`claude-code-style.md`) and TypeScript best practices.

---

## 8. Output Guidelines

- Output full directory structure with files.
- Provide TypeScript content for each file.
- Include example usage import statements.
- Ensure AI output is **modular, maintainable, and aligned with package boundaries**.

---

## 9. Notes

- Treat each task as **layer-specific and scoped**.
- Do not introduce feature-specific logic into shared/core packages.
- Merge previous code if present; do not overwrite blindly.
- This document is **permanent** and should not be deleted automatically by AI.

--- end of file ---
