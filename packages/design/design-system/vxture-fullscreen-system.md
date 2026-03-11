# Vxture Design System — Enterprise Dual Fullscreen Infrastructure

You are a senior React + TypeScript + Design System architect.

Your task is to implement a **Fullscreen Infrastructure** inside the **Vxture Design System**.

The system must support both:

1. Pseudo Fullscreen (CSS-based)
2. Native Fullscreen (Browser Fullscreen API)

The infrastructure must also include:

- Portal support
- Scroll lock
- Z-index layer management
- ESC exit support
- Unified React API

This system will be used in a **large enterprise web platform**.

---

# 1. Project Context

The project uses a **monorepo architecture**.

Target package:

@vxture/design-system

The design system provides:

- UI components
- layout primitives
- UI behavior infrastructure

Fullscreen belongs to:

Layout Behavior Infrastructure

Not business logic.

---

# 2. Design Goals

The system must provide:

1. Dual fullscreen modes
2. Unified API
3. React friendly architecture
4. Portal support
5. Scroll locking
6. Z-index layer management
7. ESC exit support
8. TypeScript strict typing
9. Tree-shakable exports

---

# 3. Fullscreen Modes

The system must support two modes.

## Mode 1 — Pseudo Fullscreen

Implementation uses CSS:

position: fixed
inset: 0
z-index: fullscreen-layer

Characteristics:

- stays inside React DOM tree
- layout remains intact
- stable in enterprise applications

Typical usage:

- charts
- tables
- editors
- dashboards
- AI workspace panels

---

## Mode 2 — Native Fullscreen

Use the browser Fullscreen API:

element.requestFullscreen()
document.exitFullscreen()
document.fullscreenElement

Characteristics:

- hides browser UI
- hides OS taskbar
- occupies the entire monitor

Typical usage:

- map systems
- 3D visualization
- video
- presentation mode
- command centers
- data walls

---

# 4. Folder Structure

Implement inside:

packages/design-system/src

Structure:

components/
  layout/
    fullscreen/
      FullscreenContainer.tsx
      FullscreenToggle.tsx
      FullscreenPortal.tsx
      FullscreenProvider.tsx
      index.ts

hooks/
  useFullscreen.ts

types/
  fullscreen.ts

styles/
  fullscreen.css

layers/
  zIndex.ts

---

# 5. Z-Index Layer System

Create a central z-index management system.

File:

layers/zIndex.ts

Example:

export const Z_INDEX = {
  dropdown: 1000,
  modal: 1100,
  popover: 1200,
  overlay: 1300,
  fullscreen: 1400,
  toast: 1500
} as const

Fullscreen must use:

Z_INDEX.fullscreen

This ensures layer ordering consistency.

---

# 6. Fullscreen Types

Create:

types/fullscreen.ts

Example:

export type FullscreenMode = "pseudo" | "native"

export interface FullscreenState {
  isFullscreen: boolean
  targetId?: string
  mode: FullscreenMode
}

---

# 7. Fullscreen Provider

Create:

FullscreenProvider

Responsibilities:

- manage fullscreen state
- track active target
- manage ESC exit
- manage scroll locking

Context state:

isFullscreen
targetId
mode

Context actions:

enterFullscreen(id, element, mode)
exitFullscreen()
toggleFullscreen(id, element, mode)

---

# 8. Scroll Lock

When fullscreen is active:

document.body.style.overflow = "hidden"

When exiting fullscreen:

document.body.style.overflow = ""

This prevents background scrolling.

---

# 9. Portal Support

Create component:

FullscreenPortal

Purpose:

Allow fullscreen content to escape layout constraints.

Implementation:

ReactDOM.createPortal(children, document.body)

Used when fullscreen content must escape parent layout.

Example:

- map canvas
- 3D renderer
- video player

---

# 10. Hook

Create hook:

useFullscreen()

Return:

{
  isFullscreen
  targetId
  mode
  enterFullscreen
  exitFullscreen
  toggleFullscreen
}

The hook must access the FullscreenProvider context.

---

# 11. FullscreenContainer

Component responsible for defining a fullscreen target.

Props:

id: string
mode?: "pseudo" | "native"
portal?: boolean
className?: string
children: ReactNode

Behavior:

If pseudo mode:

apply class:

vx-fullscreen-active

If native mode:

call:

element.requestFullscreen()

---

# 12. CSS Implementation

Create:

styles/fullscreen.css

Example:

.vx-fullscreen-active {
  position: fixed;
  inset: 0;
  z-index: 1400;
  width: 100vw;
  height: 100vh;
  background: var(--vx-color-background);
}

---

# 13. ESC Handling

Provider must listen to keydown events.

If key is Escape:

exitFullscreen()

Note:

Native fullscreen also exits automatically.

---

# 14. Fullscreen Toggle

Create component:

FullscreenToggle

Props:

targetId: string
mode?: "pseudo" | "native"

Example usage:

<FullscreenToggle targetId="map-view" mode="native" />

---

# 15. Example Usage

Chart fullscreen:

<FullscreenContainer id="chart" mode="pseudo">
  <Chart />
  <FullscreenToggle targetId="chart" />
</FullscreenContainer>

Map fullscreen:

<FullscreenContainer id="map" mode="native" portal>
  <MapView />
  <FullscreenToggle targetId="map" mode="native" />
</FullscreenContainer>

---

# 16. Export API

Export from:

components/layout/fullscreen/index.ts

Exports:

FullscreenProvider
FullscreenContainer
FullscreenToggle
FullscreenPortal
useFullscreen

---

# 17. Quality Requirements

The implementation must:

- use React functional components
- use TypeScript strict mode
- avoid external dependencies
- support tree-shaking
- work in React + Vite environment
- follow clean architecture

---

# 18. Deliverables

The AI must generate:

1. Full source code for all files
2. TypeScript types
3. Context implementation
4. Hook implementation
5. CSS styles
6. Z-index layer system
7. Example usage
8. Export definitions