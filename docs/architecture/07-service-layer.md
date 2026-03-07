# Vxture Service Layer Architecture

## Overview

The **service layer** contains domain services that implement business logic.

Each service is packaged independently.

---

# Location

```
packages/services
```

Example:

```
packages/services/
    service-ticket
    service-billing
    service-subscription
```

---

# Naming Rule

All services follow:

```
@vxture/service-{name}
```

Examples:

```
@vxture/service-ticket
@vxture/service-billing
```

---

# Service Structure

```
service-name
├── package.json
├── tsconfig.json
└── src
    ├── service
    ├── repository
    ├── types
    └── index.ts
```

---

# Responsibilities

Service layer handles:

* business logic
* domain rules
* workflow coordination

Service layer must NOT handle:

* UI
* direct HTTP framework logic

---

# Dependency Rules

Allowed dependencies:

```
shared
database
external APIs
```

Not allowed:

```
UI components
design system
```

---

# Example Import

```
import { createTicket } from "@vxture/service-ticket"
```

---

# AI Coding Rules

AI must:

* keep services independent
* avoid cross-service imports
* use shared utilities

---

End of document.
