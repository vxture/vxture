# Vxture Design System Architecture

## Overview

The Vxture design system provides **consistent UI components and visual language** across
all portals and agent frontends.

It follows a **token → system → components** architecture within a single package,
shared by both `portals/` and `agent-studio/`.

---

# 1. Package

```
@vxture/design-system
```

Location:

```
packages/design/design-system/
```

Single package containing all design system functionality organized as internal modules.

---

# 2. Internal Structure

```
packages/design/design-system/
├── package.json
├── tsconfig.json
└── src/
    ├── tokens/           # Design tokens (colors, spacing, radius, shadow, typography)
    ├── styles/           # Global styles and CSS variables
    ├── theme/            # Theme system (light/dark/system) + DensityProvider
    ├── density/          # Density system (compact/default/comfortable)
    ├── icons/            # Icon system (Registry pattern)
    ├── components/
    │   └── ui/           # UI components
    ├── hooks/            # Internal custom hooks
    ├── utils/            # Internal utility functions
    └── index.ts          # Unified export entry
```

---

# 3. tokens/

Raw design tokens. Implemented as TypeScript constants + CSS variables (`--vx-*` prefix).

```
colors.ts
spacing.ts
radius.ts
shadow.ts
typography.ts
```

Rules: Tokens must be readonly, contain only design values, no logic.

---

# 4. styles/

Global styles and CSS variables.

```
globals.css      # Global reset
variables.css    # CSS custom properties (--vx-* prefix)
tailwind.css     # Tailwind directives
```

---

# 5. theme/

Unified theme and density management.

```
ThemeProvider.tsx    # Wraps next-themes, includes DensityProvider
useTheme.ts          # useTheme() hook
theme.types.ts       # Theme type definitions
```

Context return value:

```ts
{
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: Theme) => void
  density: 'compact' | 'default' | 'comfortable'
  setDensity: (density: Density) => void
}
```

---

# 6. density/

UI density management system. Supports three levels:

| Level         | Scale  | Use case                          |
| ------------- | ------ | --------------------------------- |
| `compact`     | 0.875x | Small screens, high-density data  |
| `default`     | 1x     | Default, balanced display         |
| `comfortable` | 1.125x | Comfortable reading, more spacing |

Affects: spacing, component height, padding, typography scale.
Persistence: `localStorage` key `vx-density`.

---

# 7. icons/

Icon component library using Registry pattern to isolate Phosphor Icons dependency.

```
icon-dictionary.ts    # Icon whitelist with business grouping
icon-registry.ts      # Single file importing @phosphor-icons/react
Icon.tsx              # <Icon /> component — uses registry
types.ts              # Complete icon type definitions
```

Business groups:

- General Interaction — Navigation
- General Interaction — Actions
- General Interaction — Status
- Cloud Service / Agent — Platform
- Cloud Service / Agent — Data
- User / Organization
- Communication / Contact
- Time / Calendar
- Map / Location
- Theme / Display

Usage rule: Never import Phosphor Icons directly. Always use `<Icon name="user" />`.

---

# 8. components/ui/

Reusable UI components (current: 16 components):

```
Avatar, Badge, Breadcrumb, Button, Card, Checkbox,
Dialog, DropdownMenu, Input, Label, Popover, Select,
Separator, Tabs, Tooltip
```

Built with:

```
React 19 + TypeScript
Radix UI primitives
TailwindCSS 4
shadcn/ui patterns
```

Component rules:

- Use `forwardRef` for all components
- Use `cn()` to merge class names
- Default `variant="default"`, default `size="default"`
- No direct Phosphor icon imports — use `<Icon />`

---

# 9. Dependency Rules

Allowed:

```
@vxture/shared
```

Forbidden:

```
@vxture/core-*
@vxture/service-*
@vxture/bff-*
@vxture/ai-sdk
@vxture/platform-*
Portal or agent internals
```

---

# 10. Consumers

`@vxture/design-system` is consumed by:

- `portals/*` — all platform portals
- `agent-studio/*` — all agent frontends
- `packages/platform/*` — optionally, for platform SDK UI components

It is **never imported by server-side code** (bff, services, agent-server, core).

---

# 11. Usage

```ts
import {
  Button,
  Card,
  Dialog,
  Icon,
  ThemeProvider,
  useTheme,
  colors,
  spacing,
} from '@vxture/design-system';
```

Never import from internal paths:

```ts
import { Button } from '@vxture/design-system/src/components/ui/button'; // ❌
import { Button } from '@vxture/design-system'; // ✅
```

---

# 12. Technical Stack

| Category   | Technology                           |
| ---------- | ------------------------------------ |
| Core       | React 19 + TypeScript 5.9            |
| Styles     | TailwindCSS 4                        |
| Icons      | @phosphor-icons/react (via registry) |
| Theme      | next-themes                          |
| Components | Radix UI + shadcn/ui patterns        |
| Utilities  | clsx, tailwind-merge                 |
| Animations | tailwindcss-animate                  |

---

# 13. Why Single Package

The design system remains a single package because:

- Strong internal dependencies: tokens → theme → components cannot be used independently
- Single import entry for all consumers — better DX
- Low maintenance cost: single `package.json`, single build config
- Clear internal structure organized by subdirectory

Future splitting is appropriate if: multiple independent consumers emerge,
component count exceeds 50, or separate team ownership becomes necessary.

---

# 14. AI Coding Rules

AI must:

- Use existing components — never create duplicate components
- Respect design tokens — no hardcoded color or spacing values
- Import only from `@vxture/design-system` — never from internal paths
- Never add `@vxture/core-*`, `service-*`, or `ai-sdk` dependencies
- Never use Phosphor icons directly — always use `<Icon name="..." />`
- Follow component rules: `forwardRef`, `cn()`, default variants
- No `any` types

---

End of document.
