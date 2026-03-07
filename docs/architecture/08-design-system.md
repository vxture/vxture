# Vxture Design System Architecture

## Overview

The Vxture design system provides consistent UI components across all portals.

It follows a **token → system → components** architecture.

---

# Packages

```
@vxture/design-tokens
@vxture/design-system
@vxture/ui-kit
@vxture/icons
```

---

# design-tokens

Contains raw design tokens.

Examples:

```
colors
spacing
font-size
radius
```

Tokens are implemented as:

```
CSS variables
```

---

# design-system

Defines global themes.

Includes:

```
light theme
dark theme
typography
layout rules
```

---

# ui-kit

Reusable UI components.

Examples:

```
Button
Card
Modal
Tabs
```

Built using:

```
React
shadcn/ui
Tailwind
```

---

# icons

Icon component library.

Provides:

```
SVG icons
React icon components
```

---

# Usage

```
import { Button } from "@vxture/ui-kit"
```

---

# AI Coding Rules

AI must:

- use existing UI components
- avoid creating duplicate components
- respect design tokens

---

End of document.
