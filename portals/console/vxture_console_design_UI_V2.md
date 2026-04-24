# Vxture Console UI Design Specification V2

## 1. Purpose

This document defines the UI direction for `portals/console`.

It is not a marketing site.
It is not a data-heavy BI product.
It is not a generic admin template.

It is a unified console for:

- Platform operations
- Workspace administration
- Commerce and subscription management
- AI-assisted operational workflows

The UI must feel like a modern cloud control panel with calm SaaS polish.

---

## 2. Product Character

### 2.1 Keywords

- Light
- Quiet
- Precise
- Modern
- Operational
- Structured
- AI-ready

### 2.2 Desired Impression

The first impression should be:

- closer to Vercel / Stripe / cloud console UI
- lighter than Microsoft-style enterprise backends
- more restrained than full Material Design visuals
- more tool-like than dashboard-like

### 2.3 Explicitly Avoid

- Generic admin template appearance
- Dense ERP-style tables as the whole page
- Heavy top bars
- Thick borders everywhere
- Dark left sidebar by default
- Card walls with no hierarchy
- Over-decorated dashboard widgets
- Color-heavy KPI screens
- Marketing-style gradients and large hero sections

---

## 3. Design Principles

### 3.1 Visual Principles

- Use background layers and spacing before using borders
- Keep the palette controlled and mostly neutral
- Make typography hierarchy do the heavy lifting
- Prefer calm emphasis over loud emphasis
- Use shadow only for lift, never for decoration
- Keep component language stable across modules

### 3.2 Interaction Principles

- Content is primary
- Navigation is supportive
- Assistant is secondary
- Details should open near the current context whenever possible
- Primary actions should always be obvious
- Every async action must have visible feedback

### 3.3 Structural Principles

- One shell for all console roles
- Capability controls visibility, not separate app branding
- Page layout should remain stable while content changes
- The same layout grammar should work for tenant and platform views

---

## 4. Layout Philosophy

### 4.1 Primary Layout Modes

Default:

```txt
[ Sidebar ] [ Content ]
```

Extended:

```txt
[ Sidebar ] [ Content ] [ Assistant ]
```

Compact / narrow routes:

```txt
[ Content ] [ Assistant ]
```

### 4.2 Ownership of Space

- Sidebar owns navigation only
- Header owns lightweight global controls only
- Content owns task completion
- Assistant owns suggestions, shortcuts, drafts, and contextual AI actions

### 4.3 Layout Priorities

When space is limited, collapse in this order:

1. Assistant panel
2. Sidebar labels / sidebar width
3. Secondary toolbar content
4. Non-critical metadata inside tables

Main content width must be protected first.

---

## 5. Shell Specification

### 5.1 App Shell Model

```tsx
<AppShell>
  <Sidebar />
  <Main>
    <Header />
    <Body>
      <Content />
      <AssistantPanel />
    </Body>
  </Main>
</AppShell>
```

### 5.2 Recommended Shell Sizing

These are implementation targets, not arbitrary values:

- Header height: `64px` to `72px`
- Sidebar width: `248px` to `272px`
- Collapsed sidebar width: icon-only or hidden
- Assistant width: `320px` to `360px`
- Page horizontal padding: `20px` to `24px`
- Section gap: `16px`
- Card / panel radius: `16px` to `24px`

### 5.3 Shell Behavior

- Sidebar is persistent on desktop
- Sidebar is collapsible
- Assistant is route-aware and optional
- Assistant opens without reflow shock
- Main content must remain scroll-stable
- Header should remain visually lightweight at all times

---

## 6. Header Rules

### 6.1 Header Structure

```txt
[☰] [Page Context / Breadcrumb]                 [Search] [Assistant] [User]
```

Optional additions:

- Workspace switcher
- Notification entry
- Environment / preset chip

### 6.2 Header Requirements

- Background should stay near white or very light neutral
- Use subtle separation from body, not a heavy bar
- The left side should hold context
- The right side should hold tools and identity
- Never overload the header with page-specific actions

### 6.3 Header Anti-Patterns

- Thick dark strip across the top
- Too many action buttons
- Long explanatory text
- Full filter bars inside the header

Page-level actions belong in the content header, not the shell header.

---

## 7. Sidebar Rules

### 7.1 Sidebar Purpose

Sidebar exists for module navigation only.

It is not for:

- metrics
- announcements
- large account summaries
- secondary settings trees

### 7.2 Sidebar Structure

```txt
Overview

Workspace
- Members
- Roles
- Organization

Commerce
- Subscription
- Billing
- Quotas

Platform
- Tenants
- Products
- Pricing
- Models

Settings
```

### 7.3 Sidebar Rules

- Group count should stay controlled
- Each item = icon + label
- No subtitles
- No descriptions
- Active state must be clear but light
- Group labels should be small and quiet
- The sidebar should visually blend into the shell, not become a dark panel

### 7.4 Collapsed Sidebar

Collapsed mode should keep:

- icons
- hover tooltip
- current active indicator

Collapsed mode should remove:

- long labels
- group header noise

---

## 8. Assistant Panel Rules

### 8.1 Purpose

Assistant panel is a contextual productivity surface.

Its role is to help the user:

- understand current page context
- trigger suggested actions
- draft repetitive tasks
- access AI assistance without leaving the workflow

### 8.2 Default Behavior

- Hidden by default on most routes
- Open by default only on routes where AI adds clear value
- Independently scrollable
- Route-aware content
- Dismissible without side effects

### 8.3 Assistant Structure

```txt
Assistant Header
- route context
- close button

Suggestions
- context-aware prompts

Quick Actions
- create / summarize / explain / compare

Drafts or History
- recent assistant outputs

Chat / Tool Surface
- optional
```

### 8.4 Assistant Design Rules

- It should feel secondary, not dominant
- The visual style should be quieter than page content
- Avoid chat-app styling taking over the whole console
- Avoid making the assistant look like a separate product

---

## 9. Content Area Structure

### 9.1 Standard Page Stack

```txt
Breadcrumbs
Page Header
Optional Summary Row
Toolbar / Filters / Tabs
Primary Content
Contextual Detail Layer
```

### 9.2 Page Header Rules

Page header should contain:

- Title
- Short description
- One primary action at most
- Optional secondary actions

Page header should not contain:

- dense filter controls
- many badges
- long explanatory paragraphs

### 9.3 Toolbar Rules

Toolbars are for:

- Search
- Filters
- Tabs
- Sort
- Lightweight batch actions

Rules:

- Search first
- Most common filters visible
- Secondary filters can collapse into menus
- Toolbar must wrap cleanly on smaller widths

---

## 10. Page Templates

### 10.1 Dashboard

Recommended structure:

```txt
Title + compact context

Quick actions

Key metrics (3 to 5 only)

Operational signals

Recent activity / shortcuts / suggested actions
```

Rules:

- Dashboard is an entry point, not an analytics wall
- Metrics must be high signal
- Prefer short lists over chart-heavy modules
- If a chart exists, it must answer one obvious question

Avoid:

- card wall layout
- many equal-weight modules
- decorative trend charts with no action value

### 10.2 List Page

This is the most important page type.

```txt
Title + main action
Tabs / segmented context
Filter bar
Table / structured list
Row click -> Drawer
```

Rules:

- Prefer list/table over cards for operational objects
- Keep the core columns between `5` and `7`
- Use row click for detail access
- Keep row actions compact and predictable
- Put long explanations into drawer/detail layer, not the row

### 10.3 Detail Experience

Preferred pattern:

```txt
List page remains visible
Right drawer opens
```

Use full-page details only when:

- the object is complex
- the task is multi-step
- editing requires broad context

### 10.4 Settings Page

```txt
Page title + description

[ Local settings nav ] [ Settings content ]
```

Rules:

- Left side for internal settings categories
- Right side for forms and explanatory text
- Group related controls into sections
- Forms should breathe; do not stack all controls in one block

### 10.5 Billing / Subscription Page

Recommended order:

```txt
Current plan summary
Quota / usage summary
Upgrade / manage actions
Recent invoices / payments
Billing history
```

Rules:

- Lead with current state
- Put history after summary
- Avoid showing finance tables before subscription context

---

## 11. Visual System

### 11.1 Color Model

Use a restrained palette:

- App background: very light gray-blue or neutral
- Surface: white or near-white
- Primary: clear technology blue
- Text: dark slate, not pure black
- Muted text: cool neutral
- Semantic colors: minimal and consistent

Recommended direction:

- Background: near `#F5F7FB` to `#F8FAFC`
- Surface: `#FFFFFF`
- Primary: around `#2F6FED` to `#3B82F6`
- Border: low-contrast neutral

### 11.2 Surface Strategy

There should be clear separation between:

- page background
- section surface
- floating layer
- overlay

Prefer:

- soft surface contrast
- subtle blur or elevation only when necessary

Avoid:

- identical white on every layer
- heavy container outlines
- shadow stacking

### 11.3 Border and Shadow Strategy

Use:

- light borders for structure
- small shadow for menus, dialogs, assistant, sticky panels

Avoid:

- dark border grids
- strong shadows on every card
- multiple simultaneous elevation signals

### 11.4 Radius and Geometry

Rules:

- Use one stable radius family
- Controls slightly round
- Panels moderately round
- Avoid extremely soft consumer-app rounding

Recommended:

- Small controls: `10px` to `14px`
- Panels/cards: `18px` to `24px`
- Pills/badges: full rounded

---

## 12. Typography Rules

### 12.1 Hierarchy

The typography system must make scanning easy.

At minimum, establish stable levels for:

- Page title
- Section title
- Card title
- Body text
- Secondary text
- Labels / helper text

### 12.2 Tone

- Titles should feel firm and operational
- Secondary text should be calm, not faded into invisibility
- Small text should remain readable
- Avoid overly large decorative headings

### 12.3 Practical Guidance

- Page titles should be visibly stronger than section titles
- Helper copy should usually stay within `1` to `2` lines
- Long descriptions should be rare
- Use uppercase sparingly, mainly for subtle grouping labels

---

## 13. Core Components

### 13.1 Buttons

Rules:

- One strong primary button per page region
- Secondary actions use outline or ghost styling
- Dangerous actions should be visually restrained until confirmation
- Icon buttons should remain compact and predictable

### 13.2 Inputs and Selects

Rules:

- Unified height
- Stable radius
- Quiet background
- Clear focus treatment
- No thick neon focus ring

Search fields should visually fit toolbars, not dominate them.

### 13.3 Tabs

Rules:

- Tabs should be compact and light
- Current state should be obvious
- Prefer color + background or underline, not thick pills everywhere
- Too many tabs should switch to segmented groups or internal nav

### 13.4 Tables

Rules:

- Modern operational table style
- Calm header
- Moderate row height
- Light separators
- Hover feedback
- Empty state
- Loading state
- Batch selection only when it solves a real workflow

Avoid:

- dense spreadsheet look
- too many visible columns
- forcing all object detail into the table

### 13.5 Cards and Sections

Cards should be used for:

- summary modules
- settings groups
- bounded content regions

Cards should not be used to replace every list row.

### 13.6 Drawer and Dialog

Use drawer for:

- detail view
- light editing
- contextual review

Use dialog for:

- confirmation
- destructive action approval
- short focused forms

---

## 14. State Design

Every core page must define:

- Loading state
- Empty state
- Error state
- No-permission state
- Partial-data state where applicable

### 14.1 Loading

- Use skeletons or structured placeholders
- Preserve page layout during loading
- Avoid spinner-only screens for in-page fetches

### 14.2 Empty

Empty state should answer:

- what is missing
- why it matters
- what to do next

### 14.3 Error

Errors should:

- explain the failure in plain language
- preserve user context
- expose retry where useful

### 14.4 Permission

Permission-denied states should:

- be explicit
- not look like generic errors
- explain whether the issue is role, capability, or context

---

## 15. Motion and Feedback

### 15.1 Motion Rules

- Keep transitions short and practical
- Use motion for continuity, not decoration
- Sidebar collapse should feel smooth
- Assistant open/close should feel stable
- Drawer transitions should feel immediate

### 15.2 Timing Guidance

- Hover/focus transitions: `120ms` to `180ms`
- Panel open/close: `180ms` to `240ms`
- Avoid slow easing on core workflows

### 15.3 Feedback

Must exist for:

- save success
- action failure
- loading
- destructive confirmation
- inline validation

---

## 16. Responsive Rules

### 16.1 Desktop First

This console is desktop-first, but must remain usable on tablet and mobile.

### 16.2 Breakpoint Behavior

On smaller widths:

- Assistant collapses first
- Sidebar becomes overlay or hidden
- Toolbars wrap
- Tables degrade into stacked rows or simplified columns
- Drawers expand to full width if needed

### 16.3 Mobile Constraints

On mobile:

- protect primary action visibility
- reduce concurrent information
- do not preserve full desktop table density

---

## 17. Accessibility Rules

- Color contrast must remain comfortable and compliant
- Focus states must always be visible
- Icon-only actions need accessible labels
- Drawer and dialog focus handling must be correct
- Active navigation state must not rely on color alone
- Disabled, read-only, and unavailable states must be distinguishable

---

## 18. Capability-Driven Navigation and Views

The console is one app with multiple views.

Rules:

- Navigation is capability-filtered
- Route access is capability-guarded
- Page actions are permission-gated
- Platform and tenant experiences share shell language
- Visibility changes must not break layout stability

This means the UI specification must work for:

- platform operator
- tenant administrator
- tenant member

without creating different visual systems.

---

## 19. Design System Enforcement

All shell and page layout primitives must come from the shared design system direction.

Required ownership:

```txt
@vxture/design-system
  layout/
    AppShell
    Sidebar
    Header
    AssistantPanel
    ContentLayout
```

Rules:

- Do not build a separate visual language inside `portals/*`
- Do not hardcode many one-off spacing, color, or radius values in pages
- Prefer shared tokens and layout primitives
- Business modules should compose shell primitives rather than redefine them

---

## 20. Implementation Guidance for Current Console

To align with the current `portals/console` direction:

- keep the shell light with a near-white header
- keep the sidebar light, not dark
- support route-aware assistant enablement
- prioritize list + drawer workflows for operational entities
- use soft gray-blue backgrounds and white surfaces
- keep shadows subtle and not ubiquitous

Current first-class page types:

- Dashboard
- Members
- Roles & Permissions
- Subscription
- Billing
- Quotas
- Settings

These pages should define the reusable grammar for later modules.

---

## 21. Non-Negotiable Anti-Patterns

Strictly forbidden:

- Card-heavy fake dashboard everywhere
- Thick enterprise borders
- Dark permanent sidebar as default brand statement
- More than one dominant CTA in the same page header
- Very dense tables with 10+ visible columns
- Full-page detail navigation for simple row inspection
- Decorative gradients as main background language
- Loud semantic colors used as general emphasis
- AI panel visually competing with core content

---

## 22. Final Direction Summary

This console should feel like:

- a cloud operations workspace
- a modern SaaS management product
- a system prepared for AI assistance

It should not feel like:

- a legacy backend
- an ERP dashboard
- a template-driven admin starter

In one sentence:

**Build a quiet, precise, light cloud console where content and workflow stay primary, and AI remains a contextual assistant rather than the center of the interface.**

---

End of specification
