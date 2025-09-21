# tailwind.config.js Configuration Explained

This document explains the structure and options of the `tailwind.config.js` file in the Vxture project, focusing on the current monorepo and modern frontend stack.

## What is tailwind.config.js?

`tailwind.config.js` is the configuration file for Tailwind CSS. It allows you to customize Tailwind’s behavior, theme, plugins, and more, enabling a consistent and scalable design system for your project.

## Example Configuration

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit", // Enable Just-In-Time mode for fast builds and small CSS
  darkMode: "class", // Enable dark mode via the .dark class
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], // Files to scan for class usage
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        "primary-dark": "var(--color-primary-dark)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
      },
      transitionDuration: {
        2000: "2000ms",
      },
      // Add more custom theme settings as needed
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled", "hover"],
      backgroundColor: ["active", "group-hover"],
      textColor: ["active", "group-hover"],
      transform: ["hover", "focus"],
    },
  },
  plugins: [], // Add official or custom plugins here
};
```

## Key Options Explained

- **mode: 'jit'** — Enables Just-In-Time compilation for faster builds and smaller CSS output.
- **darkMode: 'class'** — Activates dark mode via the `.dark` class on a parent element.
- **content** — Specifies which files Tailwind should scan for class names.
- **theme.extend** — Extends the default theme (colors, spacing, etc.) using CSS variables for dynamic theming.
- **variants.extend** — Adds extra state variants (e.g., `disabled`, `group-hover`).
- **plugins** — List of Tailwind plugins to use (e.g., forms, typography, aspect-ratio).

## Best Practices

1. **Use CSS Variables for Theming:**
   Define color variables in your CSS for easy theme switching:
   ```css
   :root {
     --color-primary: #3b82f6;
     --color-primary-light: #60a5fa;
     --color-primary-dark: #2563eb;
     --color-secondary: #10b981;
     --color-accent: #f59e0b;
   }
   .dark {
     --color-primary: #60a5fa;
     --color-primary-light: #93c5fd;
     --color-primary-dark: #3b82f6;
     --color-secondary: #34d399;
     --color-accent: #fbbf24;
   }
   ```
2. **Extend the Theme as Needed:**
   Add custom fonts, spacing, border radius, etc., in `theme.extend` to match your design system.
3. **Leverage Variants:**
   Use variants like `group-hover`, `disabled`, and `active` to build interactive UI components.
4. **Add Plugins for Advanced Features:**
   Install and configure official plugins as needed:
   ```js
   // npm install @tailwindcss/forms
   plugins: [require('@tailwindcss/forms')],
   ```
5. **Responsive Design:**
   Use Tailwind’s responsive prefixes (`sm:`, `md:`, `lg:`, etc.) to build mobile-first layouts.
6. **@apply for Complex Styles:**
   Use `@apply` in your CSS to compose utility classes for reusable component styles.

## Example Usage

```jsx
// Button with custom color and transition
<button className="bg-primary text-white hover:bg-primary-dark transition-all duration-2000">
  Primary Button
</button>

// Responsive text size
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Group hover effect
<div className="group">
  <img className="transition-transform group-hover:scale-110" src="..." alt="..." />
  <div className="opacity-0 group-hover:opacity-100">Details</div>
</div>
```

## Notes

- This configuration is tailored for a Next.js + TailwindCSS frontend in a monorepo setup.
- Use CSS variables and theme extension for scalable, maintainable design systems.
- Add or adjust plugins and theme settings as your project grows.
