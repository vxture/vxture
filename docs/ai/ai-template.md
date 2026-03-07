# Vxture AI Full Audit Runner

This document is the entry point for running a full AI compliance audit for the Vxture repository.

The AI must follow the steps defined here to execute all audit rules.

# Step 1 — Load Audit Configuration

Load the following configuration files:

docs/ai-audit/ai-audit-scope.md
docs/ai-audit/ai-issue-severity.md
docs/ai-audit/ai-audit-report-template.md

These files define:

- which packages must be audited
- severity classification rules
- report format

# Step 2 — Load Architecture Documentation

The AI must follow repository architecture rules defined in:

docs/architecture/01-monorepo.md
docs/architecture/05-core-layer.md
docs/architecture/06-shared-layer.md
docs/architecture/07-service-layer.md
docs/architecture/02-package-boundaries.md
docs/architecture/03-package-graph.json
docs/architecture/09-typescript.md

# Step 3 — Load AI Coding Standards

docs/ai/claude-coding-comments.md
docs/ai/claude-coding-rules.md
docs/ai/claude-coding-style.md

# Step 4 — Load All AI Rule Prompts

The AI must load and execute all rule prompts located in:

docs/ai-rules-check/

Rules include:

03-architecture-check.md
09-code-style-check.md
10-comments-check.md
07-core-layer-check.md
04-dependency-check.md
02-folder-structure-check.md
05-import-rules-check.md
01-monorepo-check.md
06-shared-layer-check.md
08-tsconfig-check.md

# Step 5 — Execute Rule Checks

For each rule prompt:

1. read the rule prompt
2. execute the rule against repository files
3. collect violations
4. classify severity using ai-issue-severity.md

# Step 6 — Respect Audit Scope

Audit scope is defined in:

docs/ai-audit/ai-audit-scope.md

Rules:

- only scan completed packages
- ignore incomplete packages
- ignore directories listed in ignore rules

# Step 7 — Generate Audit Report

The AI must generate a Markdown report using:

docs/ai-audit/ai-audit-report-template.md

File naming rule:

ai-rules-audit-YYYY-MM-DD.md

# Step 8 — Important Constraints

This is a read-only audit.

The AI must NOT:

- modify code
- refactor files
- create packages
- change folder structure
- generate replacement code

# Final Goal

Ensure the Vxture repository complies with:

- Vxture architecture rules
- monorepo structure rules
- dependency boundaries
- TypeScript standards
- coding style standards
- comment standards
