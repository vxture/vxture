# Vxture Phase 4 – Services Layer Refactor

Path Example: D:\MyWebSite\vxture\services

---

# AI Prompt

## Context
- Target Packages: `@vxture/service-*`
- Location: `D:\MyWebSite\vxture\services\*`
- Services layer provides **business services and application logic**

Services MUST:
- Depend only on **Shared/Core** layers
- Expose reusable APIs for Portal and Platform SDK layers
- Avoid UI, page logic, or framework-specific code

Services MUST NOT:
- Modify `@vxture/core-*` or `@vxture/shared-*`
- Introduce circular dependencies
- Contain frontend/UI code

## Reference Architecture & Standards

docs/architecture/07-service-layer.md  
docs/architecture/02-package-boundaries.md  
docs/architecture/03-package-graph.json  
docs/ai/claude-coding-comments.md  
docs/ai/claude-coding-rules.md  
docs/ai/claude-coding-style.md  
docs/standards/vx-TsconfigConfig.md  
docs/ai/ai-context.md  

## Objective

1. Refactor Service Packages

- service-ticket
- service-billing
- service-subscription

2. Ensure Correct Layer Dependencies

Allowed:
- `@vxture/core-*`
- `@vxture/shared-*`

Forbidden:
- `@vxture/portal-*`
- `@vxture/platform-*`

3. Maintain High-Quality TypeScript

- Composite tsconfig
- Strict typing
- Path aliases `@vxture/service-*/*`
- Public APIs exported via `index.ts`

4. Follow Claude Coding Standards

File headers must include:

- `@package`
- `@layer`
- `@category`

Comments should explain **WHY**, not WHAT.

5. Provide Example Usage

Show usage in:

- Portal layer
- Platform SDK
- Other services

---

Example file header:

/**
 * filename.ts - Short description
 * @package @vxture/[package-name]
 *
 * Description: Detailed explanation of the file's functionality
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @layer Services
 * @category Business Services
 */

---

# Execution Checklist

## 4.1 Refactor services packages

Navigate to services directory:

cd D:\MyWebSite\vxture\services

Expected structure:

service-name/
src/
index.ts
types/
utils/
modules/
package.json
tsconfig.json

Actions:

- Standardize folder structure
- Ensure `index.ts` exports public APIs
- Remove unnecessary dependencies
- Enforce strict typing
- Remove `any` usage

---

## 4.2 Ensure Services depend only on Core / Shared

Search imports:

grep -R "from '@vxture" src/

Allowed imports:

@vxture/core-*  
@vxture/shared-*

Forbidden imports:

@vxture/portal-*  
@vxture/platform-*

If found:

- Move logic to correct layer
- Replace illegal imports with service-local modules

---

## 4.3 Remove business logic from Shared references

Scan usage:

grep -R "@vxture/shared" src/

Rules:

Shared may contain only:

- utilities
- types
- constants

If business logic appears:

- move it into the service package

---

## 4.4 AI Protection Rule — Do NOT modify Core or Shared

Before refactor:

git update-index --assume-unchanged packages/core-*/**/*
git update-index --assume-unchanged packages/shared-*/**/*

CI rule:

- Any change to Core or Shared fails build

After Phase 4 complete:

git update-index --no-assume-unchanged packages/core-*/**/*
git update-index --no-assume-unchanged packages/shared-*/**/*

---

# Recommended Execution Order

Step 1 — Refactor services structure (4.1)

Step 2 — Verify dependency correctness (4.2)

Step 3 — Ensure Shared contains no business logic (4.3)

Step 4 — Protect Core / Shared via AI checks (4.4)
