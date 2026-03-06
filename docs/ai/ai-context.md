# Vxture AI Context

## Project Overview

Vxture is a **SaaS platform architecture** built with a **TypeScript Monorepo**.

The project is designed for:

- Enterprise portal systems
- SaaS service platforms
- AI agent services

Architecture goals:

- High modularity
- Clear domain boundaries
- Scalable monorepo structure
- AI-friendly code organization

---

# Monorepo Structure

```
vxture
├ portals       # Frontend portals (website / admin / tenant)
├ business      # Business-level applications (agents etc.)
├ services      # Domain services
├ packages      # Shared libraries and platform modules
├ docs          # Architecture and AI documentation
```

---

# Layered Architecture

Vxture follows a **layered architecture**.

```
Presentation Layer
    ↓
Application Layer
    ↓
Domain / Service Layer
    ↓
Core Platform Layer
    ↓
Foundation Utilities
```

Responsibilities:

| Layer      | Responsibility        |
| ---------- | --------------------- |
| Portals    | UI applications       |
| Business   | Business applications |
| Services   | Domain services       |
| Packages   | Shared libraries      |
| Foundation | Low-level utilities   |

---

# Key Architecture Principles

## 1. Domain Isolation

Each service must maintain clear domain boundaries.

Services must not depend on other services directly.

Allowed:

```
service → shared
service → core
```

Not allowed:

```
service → service
```

---

## 2. Shared Package Rule

The `shared` package must remain **domain-agnostic**.

Shared packages may contain:

- Generic utilities
- Cross-project TypeScript types
- Universal constants

Shared packages must NOT contain:

- Business logic
- Service-specific code
- UI logic

---

## 3. Core Platform Modules

Core packages provide **platform capabilities** such as:

- API infrastructure
- localization
- configuration
- tenant management

Examples:

```
@vxture/core-api
@vxture/core-locale
@vxture/core-tenant
```

---

## 4. Design System

UI components must come from the **design system layer**.

Example packages:

```
@vxture/design-tokens
@vxture/design-system
@vxture/ui-kit
@vxture/icons
```

---

## 5. AI Coding Guidelines

All AI-generated code must follow:

- TypeScript strict typing
- clear module boundaries
- small focused files
- explicit exports

AI must read the following documents before implementing code:

```
docs/architecture/*
docs/standards/*
docs/ai/*
```

---

# Coding Philosophy

Vxture follows these engineering principles:

- **Modular architecture**
- **Type safety**
- **Clear dependency direction**
- **Scalable monorepo design**
- **AI-assisted development**

---

# AI Usage Rules

When generating code:

1. Respect package boundaries
2. Do not introduce cross-service dependencies
3. Keep shared packages domain-neutral
4. Follow TypeScript strict mode
5. Use clear file naming conventions

If architecture rules conflict, follow the documentation in:

```
docs/architecture/*
```
