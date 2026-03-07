# Vxture Design System Architecture

## Overview

The Vxture design system provides consistent UI components across all portals.

It follows a **token → system → components** architecture within a single package.

---

## Package Structure

```
@vxture/design-system
```

This single package contains all design system functionality organized as internal modules.

---

## Internal Module Structure

```
@vxture/design-system/
├── src/
│   ├── icons/                    # Icon system (Registry pattern)
│   ├── components/ui/            # UI components (16 components)
│   ├── theme/                    # Theme system (light/dark/system)
│   ├── density/                  # Density system (compact/default/comfortable)
│   ├── tokens/                   # Design tokens
│   ├── styles/                   # Global styles
│   ├── hooks/                    # Custom hooks (internal)
│   ├── utils/                    # Utility functions (internal)
│   └── index.ts                  # Unified export entry
```

---

## tokens

Contains raw design tokens.

Examples:

```
colors
spacing
radius
shadow
typography
```

Tokens are implemented as:

```
TypeScript constants + CSS variables
```

**Rules**: Tokens must be readonly, contain only design values, no logic.

---

## styles

Global styles and CSS variables.

Includes:

```
globals.css           # Global reset
variables.css         # CSS variables (--vx-* prefix)
tailwind.css          # Tailwind directives
```

---

## density

UI density management system, supports three levels:

| Level         | Scale  | Use Case                          |
| ------------- | ------ | --------------------------------- |
| `compact`     | 0.875x | Small screens, high-density data  |
| `default`     | 1x     | Default, balanced display         |
| `comfortable` | 1.125x | Comfortable reading, more spacing |

**Affected**: spacing, component height, padding, typography scale
**Persistence**: localStorage key `vx-density`

---

## theme

Unified theme and density management.

Includes:

```
ThemeProvider.tsx     # Wraps next-themes, built-in DensityProvider
useTheme.ts           # Export useTheme() hook
theme.types.ts        # Theme type definitions
```

**Context return value**:

```typescript
{
  theme: "light" | "dark" | "system"
  setTheme: (theme: Theme) => void
  density: "compact" | "default" | "comfortable"
  setDensity: (density: Density) => void
}
```

---

## icons

Icon component library, using Registry pattern to isolate third-party dependencies.

Provides:

```
icon-dictionary.ts    # Icon whitelist with business grouping
icon-registry.ts      # Unique file importing @phosphor-icons/react
Icon.tsx              # Icon component, uses registry
types.ts              # Complete type definitions
```

**Business Groups**:

- General Interaction - Navigation
- General Interaction - Actions
- General Interaction - Status
- Cloud Service/Agent - Platform
- Cloud Service/Agent - Data
- User/Organization
- Communication/Contact
- Time/Calendar
- Map/Location
- Theme/Display

**Usage Rule**: No direct use of Phosphor Icons, must use `<Icon name="user" />`

---

## components/ui

Reusable UI components (16 components).

Examples:

```
Avatar, Badge, Breadcrumb, Button, Card, Checkbox,
Dialog, DropdownMenu, Input, Label, Popover, Select,
Separator, Tabs, Tooltip
```

Built using:

```
React + TypeScript
shadcn/ui ideas
Radix UI primitives
TailwindCSS
```

**Component Rules**:

- forwardRef
- use cn() to merge classes
- default variant="default", default size="default"

---

## Usage

```typescript
import { Button, Icon, ThemeProvider, useTheme, colors } from '@vxture/design-system';
```

---

## AI Coding Rules

AI must:

- use existing UI components
- avoid creating duplicate components
- respect design tokens
- import only from unified entry @vxture/design-system
- never import from internal modules directly

---

## Technical Stack

| Category       | Technology                           |
| -------------- | ------------------------------------ |
| **Core**       | React 19 + TypeScript 5.9            |
| **Styles**     | TailwindCSS 4                        |
| **Icons**      | @phosphor-icons/react (via registry) |
| **Theme**      | next-themes                          |
| **Components** | shadcn/ui ideas + Radix UI           |
| **Utilities**  | clsx, tailwind-merge                 |
| **Animations** | tailwindcss-animate                  |

---

## Why Single Package?

The design system remains a single package because:

1. **Strong internal dependencies** - tokens → theme → components, cannot be used independently
2. **Small current scale** - 16 UI components, 1 consumer
3. **Low maintenance cost** - single package.json, single build config
4. **Better DX** - one import entry for everything
5. **Clear internal structure** - organized by subdirectories

Future splitting possible if: multiple independent consumers, component count > 50, team collaboration needs.

---

End of document.
