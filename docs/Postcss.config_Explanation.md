# postcss.config.js Configuration Explained

This document explains the structure and options of the `postcss.config.js` file in the Vxture project, focusing on the current monorepo and modern frontend stack.

## What is postcss.config.js?

`postcss.config.js` is the configuration file for PostCSS, a tool for transforming CSS with JavaScript plugins. PostCSS is used to enable features like CSS imports, custom properties (CSS variables), Tailwind CSS, and automatic vendor prefixing.

## Example Configuration

```js
module.exports = {
  plugins: {
    "postcss-import": {},
    "postcss-custom-properties": { preserve: false },
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Plugin Breakdown

Plugins are applied in the order listed:

- **postcss-import**: Enables `@import` in CSS files, allowing modular CSS structure.
- **postcss-custom-properties**: Processes CSS variables. `preserve: false` replaces variables with computed values for better compatibility.
- **tailwindcss**: Processes Tailwind CSS directives and generates utility classes.
- **autoprefixer**: Adds vendor prefixes for cross-browser compatibility.

## Processing Flow

When building the project, CSS files are processed as follows:

1. `postcss-import` merges imported CSS files.
2. `postcss-custom-properties` replaces CSS variables with static values.
3. `tailwindcss` expands Tailwind directives and classes.
4. `autoprefixer` adds necessary vendor prefixes.

## Usage Examples

### CSS Import (postcss-import)

```css
/* styles/variables.css */
:root {
  --color-primary: #3b82f6;
}

/* styles/main.css */
@import "./variables.css";

.button {
  background-color: var(--color-primary);
}
```

### CSS Variables (postcss-custom-properties)

```css
:root {
  --main-color: #ff0000;
  --padding: 10px 15px;
}
.box {
  color: var(--main-color);
  padding: var(--padding);
}
/* After processing with preserve: false: */
.box {
  color: #ff0000;
  padding: 10px 15px;
}
```

### Tailwind CSS

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-primary text-white py-2 px-4 rounded;
  }
}
```

### Autoprefixer

```css
.box {
  display: flex;
  user-select: none;
}
/* After autoprefixer: */
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

## Best Practices

1. **Plugin Order Matters:** Plugins are applied in order. `postcss-import` should come first so imports are processed by all subsequent plugins.
2. **CSS Variable Handling:**
   - `preserve: false` increases compatibility but disables runtime variable changes.
   - Use `preserve: true` if you need dynamic theming at runtime.
3. **SCSS Integration:** If using SCSS, process SCSS before PostCSS (e.g., via Next.js `sassOptions`).
4. **Extending PostCSS:** Add plugins as needed, e.g.:
   ```js
   module.exports = {
     plugins: {
       "postcss-import": {},
       "postcss-nested": {}, // Enable nested CSS syntax
       "postcss-custom-properties": { preserve: false },
       tailwindcss: {},
       autoprefixer: {},
       cssnano:
         process.env.NODE_ENV === "production" ? { preset: "default" } : false, // Minify in production
     },
   };
   ```

## Common Issues & Solutions

1. **CSS Variables Not Working:** Check the `preserve` option. Set to `true` if you need runtime theming.
2. **Import Path Issues:** `postcss-import` resolves paths relative to the current file. Use correct paths or configure as needed.
3. **Combining with Preprocessors:** Always run preprocessors (like SCSS) before PostCSS.
4. **Performance:** For large projects, consider `postcss-preset-env` or `cssnano` for optimization and minification.
