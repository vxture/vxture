# Console UI Framework

## Purpose

This file defines the intended UI framework layering for `portals/console`.

The goal is to keep shell, page layout, and business modules separate so later pages can be assembled from stable primitives instead of ad-hoc CSS and one-off wrappers.

---

## Layering

### 1. Shell Layer

Path:

```txt
src/layout/shell/
```

Responsibility:

- App shell
- Header
- Sidebar
- Assistant panel
- Cross-page layout structure

Allowed concerns:

- responsive shell behavior
- navigation layout
- assistant docking
- shell-level spacing and panel grammar

Not allowed:

- business-specific copy
- module-specific filters
- table column logic
- object detail semantics

### 2. Page Layout Layer

Path:

```txt
src/layout/page/
```

Responsibility:

- page-level stacking
- action group wrappers
- future list/detail page templates

Current primitives:

- `ConsolePage`
- `PageCluster`
- `PageActions`
- `EntityListPage`
- `SettingsSplitPage`

This layer should become the place for higher-order page templates such as:

- entity list pages
- settings split layouts
- detail workspaces

### 3. Shared Module UI Layer

Path:

```txt
src/modules/shared/
```

Responsibility:

- page-local reusable blocks
- data presentation helpers
- drawer, empty, toolbar, and header primitives

Current primitives:

- `PageHeader`
- `MetricGrid`
- `TableToolbar`
- `EmptyState`
- `EntityTableSection`
- `DetailPanel`
- `DetailDrawer`
- `SectionNav`
- `SectionCard`

Use this layer when the component is:

- reusable across modules
- still page-oriented
- not part of shell navigation chrome

### 4. Module Layer

Path:

```txt
src/modules/*
```

Responsibility:

- business composition only
- route-specific layout assembly
- data mapping into shared/page/shell primitives

Module files should prefer composition over local structure invention.

---

## Import Rules

Recommended import order for module pages:

1. `@/layout`
2. `@/modules/shared`
3. `@vxture/design-system`
4. semantic business components
5. module-local data and helpers

Recommended examples:

```ts
import { DashboardSplit, PageSection, SummaryStrip } from '@/layout';
import { DetailDrawer, EmptyState, PageHeader, TableToolbar } from '@/modules/shared';
import { Button, Input, Icon } from '@vxture/design-system';
```

Avoid importing deep shell files directly from module pages when a barrel export exists.
Do not create or import app-local `components/ui` or `components/primitives`; reusable primitives must be added to `@vxture/design-system` first.

---

## Stable Page Grammar

The current console UI grammar should be assembled in this order:

1. `ConsolePage`
2. `PageHeader`
3. optional `MetricGrid` or `SummaryStrip`
4. optional `DashboardSplit`
5. one or more `PageSection`
6. optional `TableToolbar`
7. optional `EmptyState`
8. optional `DetailDrawer`

This keeps pages visually consistent without forcing identical content.

For higher-order templates:

- `EntityListPage` should own list-page composition order
- `SettingsSplitPage` should own settings navigation + content split
- `SectionNav` should provide local settings or sub-area navigation without reusing sidebar styles
- `EntityTableSection` should standardize table-region structure inside list pages
- `DetailPanel` should standardize fields + supporting context + actions
- `DetailDrawer` should remain a shell for `DetailPanel`, not a separate content grammar

---

## CSS Ownership

CSS tokens and structural classes belong in:

```txt
src/app/globals.css
```

Rules:

- shell tokens should stay tokenized
- page grammar classes should remain generic
- business-specific classes should be reduced over time
- when a class appears in multiple modules, prefer wrapping it in a component

---

## Next Framework Work

The next framework-focused additions should be:

1. adopt `EntityListPage` and `EntityTableSection` in members and future operational list routes
2. adopt `SettingsSplitPage` and `SectionNav` in tenant settings and future configuration routes
3. keep `DetailPanel` as the only detail-content grammar, whether inline or drawer-mounted
4. tighten export discipline so pages import from `@/layout` and `@/modules/shared`

---

End of framework note
