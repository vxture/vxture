# Vxture Monorepo Refactor – Phase Planning

This document tracks the **entire Vxture Monorepo refactor**, broken down by phases and sub-tasks.
Each phase can be tracked for progress and AI execution control.

---

## Phase Legend

- ✅ Done
- 🔲 Pending
- ⛔ Forbidden for AI (do not modify)
- [x] Task completed
- [ ] Task pending

---

## Phase 0 – Initialization

| Sub-Phase | Task | Status |
|-----------|------|--------|
| 0.1 | Clean up old residual packages (`shared/types`, `constants`, `utils`) | ✅ |
| 0.2 | Set up monorepo base structure (`portals/`, `business/`, `services/`, `shared/`, `core-*`, `platform-*`) | ✅ |
| 0.3 | Configure pnpm workspace and TypeScript composite settings | ✅ |
| 0.4 | Establish path aliases (`@vxture/*`) | ✅ |

---

## Phase 1 – Shared Layer Refactor

| Sub-Phase | Task | Status |
|-----------|------|--------|
| 1.1 | Consolidate constants/types/utils into `@vxture/shared` | ✅ |
| 1.2 | Remove all business logic from shared package | ✅ |
| 1.3 | Create `index.ts` for unified exports | ✅ |
| 1.4 | Generate initial `content.types.ts` | ✅ |
| 1.5 | AI Prompt for Phase 1 (`phase1-shared-ai-prompt.txt`) | ✅ |

---

## Phase 2 – Shared Layer Validation & Fix

| Sub-Phase | Task | Status |
|-----------|------|--------|
| 2.1 | Remove redundant `IconName` type, replace with `string` | 🔲 |
| 2.2 | Delete duplicate utility types (`Partial`, `Pick`, `Omit`, `Required`) | 🔲 |
| 2.3 | Add `Shared` prefix or namespace to avoid type conflicts | 🔲 |
| 2.4 | Normalize file header comments according to `claude-coding-comments.md` | 🔲 |
| 2.5 | Provide full export examples in `index.ts` | 🔲 |
| 2.6 | AI check: build, dependency boundaries, and forbidden modifications | 🔲 |

---

## Phase 3 – Core Layer & Platform SDK Integration

| Sub-Phase | Task | Status |
|-----------|------|--------|
| 3.1 | Refactor `core-*` packages, unify TypeScript settings | 🔲 |
| 3.2 | Ensure Core packages only depend on Shared and allowed third-party libs | 🔲 |
| 3.3 | Platform SDK packages integration (`platform-*`) | 🔲 |
| 3.4 | Add example imports for AI guidance | 🔲 |
| 3.5 | AI check: forbid modifications outside Shared and Core boundaries | ⛔ |

---

## Phase 4 – Services Layer Refactor

| Sub-Phase | Task | Status |
|-----------|------|--------|
| 4.1 | Refactor `services/*` packages (`ticket`, `billing`, `subscription`) | 🔲 |
| 4.2 | Ensure services only depend on Shared/Core layers | 🔲 |
| 4.3 | Remove any business logic from Shared layer references | 🔲 |
| 4.4 | AI check: forbid modifying Shared/Core during Service refactor | ⛔ |

---

## Phase 5 – Portals / UI / Design System

| Sub-Phase | Task | Status |
|-----------|------|--------|
| 5.1 | Refactor `portals/*` packages (`website`, `admin`, `tenant`) | 🔲 |
| 5.2 | Integrate Design System (`@vxture/ui-kit`, `@vxture/design-system`) | 🔲 |
| 5.3 | Ensure UI/Portal packages depend only on Shared/Core, not Services | 🔲 |
| 5.4 | AI check: forbid modifying backend logic or Shared/Core types | ⛔ |

---

## Phase 6 – TypeScript, CI, and Build

| Sub-Phase | Task | Status |
|-----------|------|--------|
| 6.1 | Validate TypeScript composite builds for all packages | 🔲 |
| 6.2 | Run linting, formatting, and type checks | 🔲 |
| 6.3 | Setup CI pipelines for Monorepo | 🔲 |
| 6.4 | AI check: forbid changes outside targeted package | ⛔ |

---

## Phase 7 – Documentation & AI Guidelines

| Sub-Phase | Task | Status |
|-----------|------|--------|
| 7.1 | Update `shared-layer.md` & `package-boundaries.md` | 🔲 |
| 7.2 | Update `claude-coding-style.md` & `claude-coding-comments.md` | 🔲 |
| 7.3 | Update `ai-coding-rules.md` | 🔲 |
| 7.4 | Add example usage README per package | 🔲 |
| 7.5 | Store AI prompt templates for future updates (do **not** delete) | ⛔ |

---

**Notes**

- Phases are sequential but can overlap if safe.
- AI is allowed to modify only the targeted package per phase; other packages are marked ⛔ Forbidden.
- Use this MD as a **tracking sheet**; you and AI can mark ✅, 🔲, ⛔ as needed.
- This document can be **copied directly to `docs/architecture/monorepo-phases.md`**.
