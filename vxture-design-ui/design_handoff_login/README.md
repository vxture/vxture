# Handoff: vxture Login Page

## Overview
This is the login/authentication flow for **vxture** — an AI SaaS platform. The design covers three main screens: Login, Register, and Forgot Password, with a slider captcha verification step.

## About the Design Files
The files in this bundle are **high-fidelity HTML prototypes** — design references showing the intended look, layout, and interactive behavior. The task is to **recreate these designs in your existing codebase** (e.g., Next.js / React + TypeScript) using your established component library and patterns. Do not ship the HTML prototype files directly.

Reference file: `Login.html`

---

## Fidelity
**High-fidelity** — pixel-accurate colors, typography, spacing, and interactions. Recreate the UI as close to the reference as possible using your existing design system. If you have a component library (e.g., shadcn/ui, Ant Design), map the components accordingly but match the visual spec.

---

## Page Structure

The page has three fixed sections:

```
┌─────────────────────────────────────┐
│ Header (80px)  — Logo + Brand name  │
├──────────────────┬──────────────────┤
│                  │                  │
│  Left Panel      │  Right Panel     │
│  (45% width)     │  (55% width)     │
│  Tech visual     │  Auth form       │
│  + node graph    │                  │
│                  │                  │
├──────────────────┴──────────────────┤
│ Footer (52px) — Copyright + Links   │
└─────────────────────────────────────┘
```

The center card is **max-width: 960px, height: 560px**, centered in the main area with `align-items: center; justify-content: center`.

---

## Design Tokens

### Colors
```
--bg:             #eef3fc       Page background (or use bg image)
--surface:        #ffffff       Card / form background
--accent:         #2563eb       Primary blue (CTA, active states)
--accent-light:   #3b82f6       Hover blue
--accent-glow:    rgba(37,99,235,0.25)
--accent-bg:      rgba(37,99,235,0.07)
--text-primary:   #0f172a
--text-secondary: #4a5a7a
--text-muted:     #94a3b8
--border:         rgba(37,99,235,0.12)
--border-active:  rgba(37,99,235,0.55)
--error:          #ef4444
--success:        #10b981
```

### Typography
```
Display font:  Barlow 800    — logo/headings (Google Fonts, free)
UI font:       Outfit 400/500/600 — body, labels, buttons (Google Fonts, free)
CJK fallback:  Noto Sans SC  — Chinese character support

Heading (form):        Outfit 22px / weight 700
Body text:             Outfit 13–14px / weight 400
Labels (field):        Outfit 10px / weight 500 / uppercase / tracking 0.12em
Button text:           Outfit 14px / weight 600
Footer / tiny text:    Outfit 10–11px / weight 400
Logo wordmark:         Barlow 36px / weight 800 / uppercase
```

### Spacing
```
Header padding:     0 40px
Footer padding:     0 40px
Card border-radius: 16px
Form panel padding: 36px 44px
Field gap:          20px between fields
Button height:      46px (padding 13px top/bottom)
```

### Shadows
```
Card shadow: 0 20px 60px rgba(15,23,42,0.12), 0 4px 16px rgba(37,99,235,0.08)
Button shadow (accent): 0 4px 20px rgba(37,99,235,0.30)
Button shadow hover:    0 6px 28px rgba(37,99,235,0.45)
```

---

## Screens

### 1. Login Screen (default)

**Layout:** Split card — left visual panel + right form panel.

**Left Panel**
- Background: `linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)`
- Animated node graph canvas (blue nodes + connecting lines, reacts to mouse)
- Subtle CSS grid overlay: `rgba(255,255,255,0.04)` lines, 32px × 32px
- Bottom fade overlay
- Top-left: "ALL SYSTEMS OPERATIONAL" badge with green pulsing dot
- Bottom text block:
  - Heading: "Build intelligence into everything." — Barlow 28px / 800 / white
  - Body: 13px / white 65% opacity
  - Stats row: 40ms / 99.97% / 12B+ — monospaced 15px white

**Right Panel** (white background)
- Greeting: "欢迎回来" — 22px / 700
- Subtitle: "登录您的 vxture 工作区" — 13px / text-secondary
- Email field
- Password field
- Forgot password link (right-aligned, 12px, text-muted, hover → accent)
- Primary CTA button: "登录" (full width, accent blue, hover lifts + glow)
- Divider: "其他方式登录"
- Social buttons row: 微信 / 钉钉 / 飞书 (each with brand color on hover)
- Bottom link: "还没有账号？注册账号" (13px, underline, accent color)

**Social button hover colors:**
```
微信:   #07C160
钉钉:   #1677FF
飞书:   #3370FF
```

---

### 2. Register Screen

Triggered by clicking "注册账号" link. Same split card layout, right panel changes.

**Right Panel fields:**
- Back button "← 返回登录" at top
- Heading: "创建账号" — 22px / 700
- Fields: 姓名 / 邮箱 / 密码 / 确认密码
- CTA: "注册账号"
- Footer: 服务条款 + 隐私政策 links

**Validation rules:**
- Email: must contain `@`
- Password: min 8 characters
- Name: required, non-empty
- Confirm password: must match password

---

### 3. Forgot Password Screen

Triggered by "忘记密码？" link.

**States:**
1. **Input state** — Email field + "发送重置链接" button
2. **Success state** — Green checkmark circle, confirmation message, "Back to sign in" button

---

### 4. Slider Captcha (Modal)

Appears **after** form validation passes, **before** actual login submission. Blocks submission until solved.

**Component:**
- Overlay: `rgba(0,0,0,0.45)` full-screen backdrop
- Modal card: white, 348px wide, border-radius 16px, heavy shadow
- Title: "请完成安全验证" — 13px / 600
- Subtitle: "拖动滑块，将拼图移至缺口处" — 12px
- Canvas area (300×120px): shows background pattern with puzzle-piece hole
- Floating puzzle piece: moves horizontally as user drags
- Slider track (300×40px): rounded, drag handle
- Success state: green fill + "验证成功" text → auto-proceeds after 600ms
- Fail state: red fill + "验证失败，请重试" → auto-regenerates after 1000ms
- "↺ 刷新验证码" text button at bottom
- Tolerance: ±6px from target position counts as success

---

### 5. Post-Login Dashboard (Placeholder)

Shown after successful captcha + login animation (1.4s delay):
- Full-page layout with header
- Centered: "Authentication successful" label + "Welcome to vxture" heading + loading dots
- "Sign out" button

---

## Header

```
Height: 80px
Background: transparent (bg image shows through)
Border-bottom: none
Padding: 0 40px

Contents (left-aligned, flex row, gap 10px):
  - Logo image: 44×44px (assets/vxture-logo-white.png)
  - Brand name: "vxture" — Barlow 36px / 800 / uppercase / #0f172a
  - Badge: "AI PLATFORM" — Outfit 10px / 500 / uppercase / tracking 0.1em
    Background: rgba(37,99,235,0.08), border: 1px solid rgba(37,99,235,0.15)
    Border-radius: 4px, padding: 2px 7px
```

---

## Footer

```
Height: 52px
Background: transparent
Border-top: none
Padding: 0 40px
Layout: space-between

Left:  "© 2026 vxture Inc. All rights reserved." — 10px / text-muted
Right: Links — Privacy Policy / Terms of Service / Security / Status
       10px / text-muted, hover → accent
```

---

## Background

Full-page background image: `assets/login-bg-light.jpg`
- Applied to `#root` as `background: url(...) center/cover no-repeat fixed`
- Light blue abstract fluid gradient — creates unified look across all three sections
- Header and footer are fully transparent to let background show through

---

## Form Fields

```
Label:     Outfit 10px / uppercase / tracking 0.12em
           Default: text-secondary, focused: accent color

Input:
  Background:    #f8faff (default), rgba(37,99,235,0.05) (focused)
  Border:        1px solid rgba(37,99,235,0.12) default
                 1px solid rgba(37,99,235,0.55) focused
                 1px solid #ef4444 error
  Border-radius: 8px
  Padding:       11px 14px
  Box-shadow focused: 0 0 0 3px rgba(37,99,235,0.12)
  Font:          Outfit 14px / #0f172a

Error text:  11px / #ef4444, appears below field
Hint text:   11px / text-muted, appears below field
```

---

## Primary Button

```
Background:    #2563eb (accent)
Border-radius: 8px
Padding:       13px (full width)
Font:          Outfit 14px / 600 / white
Shadow:        0 4px 20px rgba(37,99,235,0.30)
Hover:         translateY(-1px), shadow increases to 0 6px 28px rgba(37,99,235,0.45)
Loading state: opacity 0.5, shows spinner + loading text, cursor not-allowed
Transition:    all 0.2s
```

---

## Animations

```
fadeUp keyframe:
  from: opacity 0, translateY(14px)
  to:   opacity 1, translateY(0)

fadeIn keyframe:
  from: opacity 0
  to:   opacity 1

pulse: opacity oscillates 0.45 → 1 → 0.45, 1.2s ease-in-out infinite
```

> ⚠️ Note: Avoid using `animation-fill-mode: both` with delayed animations and inline `opacity:0` simultaneously — the inline style overrides the animation end state. Either use `forwards` fill mode without the inline style, or use CSS classes instead of inline styles for animated elements.

---

## Assets

| File | Usage |
|------|-------|
| `assets/vxture-logo-white.png` | Header logo icon (44×44px) |
| `assets/login-bg-light.jpg` | Full-page background |

---

## Node Graph Animation

The left panel features an animated canvas:
- Random nodes drift slowly across the canvas
- Nodes within 140px of each other are connected with semi-transparent lines
- Nodes repel from mouse cursor within 100px radius
- Node opacity pulses slowly (sinusoidal)
- All in brand accent color (`#93c5fd` — lighter blue on dark background)

If implementing in production, consider using a library like `tsParticles` or `react-particles` to replicate this effect efficiently.

---

## Tech Stack Recommendation (TypeScript)

```
Framework:     Next.js 14+ (App Router)
Styling:       Tailwind CSS v3 + CSS variables for tokens
Components:    shadcn/ui (for form inputs, buttons)
Animation:     Framer Motion (for page transitions, captcha)
Canvas:        Native HTML5 Canvas API or react-canvas-confetti
Form:          React Hook Form + Zod validation
Fonts:         next/font with Google Fonts (Barlow + Outfit + Noto Sans SC)
```

### Suggested file structure
```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
    forgot-password/page.tsx
  layout.tsx
components/
  auth/
    LoginForm.tsx
    RegisterForm.tsx
    ForgotPasswordForm.tsx
    SliderCaptcha.tsx
    NodeGraph.tsx          ← canvas animation
    SocialLoginButtons.tsx
  layout/
    AuthHeader.tsx
    AuthFooter.tsx
    AuthCard.tsx
```

---

## Instructions for Claude Code

1. Open `Login.html` in a browser to see the full interactive prototype
2. Use this README as the implementation spec
3. Match colors, typography, and spacing exactly as documented
4. The HTML file uses React + Babel (client-side) — translate to proper Next.js/TypeScript components
5. Replace the canvas-based slider captcha with a production-ready solution (e.g., integrate a CAPTCHA service like Cloudflare Turnstile, or keep the custom slider for internal tools)
6. Implement form validation with Zod schemas matching the rules in the Screens section
7. Wire up actual auth API endpoints where the prototype uses `setTimeout` delays
