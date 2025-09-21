# package.json Configuration Explained

This document explains each section of the `package.json` file in the Vxture project, focusing on the current tech stack, scripts, dependencies, and best practices for a modern monorepo.
本文档详细解释了 Vxture 项目中 `package.json` 文件的各个部分及其作用，聚焦于当前技术栈、脚本、依赖项和现代单体仓库的最佳实践。

## Basic Info

```json
{
  "name": "vxture",
  "version": "0.1.0",
  "private": true
}
```

| Field     | Description                                                      |
| --------- | ---------------------------------------------------------------- |
| `name`    | Project name, used for package management and deployment         |
| `version` | Project version, follows semantic versioning (major.minor.patch) |
| `private` | Prevents publishing to npm registry if set to `true`             |

## NPM Scripts

Run with `npm run <script>`, e.g. `npm run dev`.

### Core Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

| Script  | Description                       |
| ------- | --------------------------------- |
| `dev`   | Start development server with HMR |
| `build` | Build production bundle           |
| `start` | Start production server           |

### Code Quality Scripts

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:style": "stylelint \"src/**/*.scss\" --fix",
    "lint:ts": "eslint --fix 'src/**/*.{ts,tsx}'",
    "lint:all": "npm run lint && npm run lint:style && npm run type-check"
  }
}
```

| Script       | Description                       |
| ------------ | --------------------------------- |
| `lint`       | Run ESLint for code quality       |
| `lint:style` | Lint and fix SCSS style issues    |
| `lint:ts`    | Lint and fix TypeScript issues    |
| `lint:all`   | Run all lint and type-check tools |

### Code Formatting Scripts

```json
{
  "scripts": {
    "format": "prettier --write '**/*.{js,ts,tsx,json,md,scss}'",
    "format:check": "prettier --check '**/*.{js,ts,tsx,json,md,scss}'"
  }
}
```

| Script         | Description                               |
| -------------- | ----------------------------------------- |
| `format`       | Format all supported files with Prettier  |
| `format:check` | Check formatting compliance with Prettier |

### Type Checking

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

| Script       | Description                                 |
| ------------ | ------------------------------------------- |
| `type-check` | Run TypeScript type check (no output files) |

### Composite & Git Hooks

```json
{
  "scripts": {
    "check": "npm run lint:all && npm run format:check",
    "fix": "npm run lint:all && npm run format",
    "prepare": "husky"
  }
}
```

| Script    | Description                                |
| --------- | ------------------------------------------ |
| `check`   | Run all code quality and formatting checks |
| `fix`     | Auto-fix all code quality and formatting   |
| `prepare` | Install Husky Git hooks                    |

## Project Dependencies

### Runtime Dependencies (`dependencies`)

These packages are required in production:

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "next": "^15.5.3",
    "openai": "^4.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-intersection-observer": "^9.16.0",
    "zod": "^3.25.76"
  }
}
```

| Package                       | Purpose                                  |
| ----------------------------- | ---------------------------------------- |
| `@tanstack/react-query`       | Data fetching, caching, state management |
| `next`                        | Next.js core framework                   |
| `openai`                      | OpenAI API client                        |
| `react`                       | React core library                       |
| `react-dom`                   | React DOM renderer                       |
| `react-intersection-observer` | Detects when elements enter viewport     |
| `zod`                         | TypeScript-first schema validation       |

### Development Dependencies (`devDependencies`)

These packages are only used in development and not included in production builds:

#### TypeScript Type Definitions

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

| Package            | Purpose             |
| ------------------ | ------------------- |
| `@types/node`      | Node.js type defs   |
| `@types/react`     | React type defs     |
| `@types/react-dom` | React DOM type defs |

#### ESLint & Plugins

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.44.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-import": "^2.32.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-prettier": "^5.5.4",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-perf": "^3.3.3",
    "eslint-plugin-security": "^3.0.1",
    "eslint-plugin-sonarjs": "^3.0.5",
    "eslint-plugin-unused-imports": "^4.2.0"
  }
}
```

| Package                            | Purpose                             |
| ---------------------------------- | ----------------------------------- |
| `@typescript-eslint/eslint-plugin` | TypeScript linting rules            |
| `eslint`                           | Code quality linter                 |
| `eslint-config-next`               | Next.js recommended ESLint config   |
| `eslint-config-prettier`           | Integrates ESLint with Prettier     |
| `eslint-plugin-import`             | Lint import/export syntax           |
| `eslint-plugin-jsx-a11y`           | Lint JSX accessibility              |
| `eslint-plugin-prettier`           | Run Prettier as ESLint rules        |
| `eslint-plugin-react-hooks`        | Lint React Hooks rules              |
| `eslint-plugin-react-perf`         | React performance lint rules        |
| `eslint-plugin-security`           | Detect security issues              |
| `eslint-plugin-sonarjs`            | Detect code quality issues          |
| `eslint-plugin-unused-imports`     | Remove unused imports automatically |

#### CSS Tools

```json
{
  "devDependencies": {
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "postcss-custom-properties": "^14.0.6",
    "postcss-import": "^16.1.1",
    "sass": "^1.92.1",
    "stylelint": "^16.24.0",
    "stylelint-config-prettier-scss": "^1.0.0",
    "stylelint-config-standard-scss": "^16.0.0",
    "tailwindcss": "^3.3.0"
  }
}
```

| Package                          | Purpose                            |
| -------------------------------- | ---------------------------------- |
| `autoprefixer`                   | Adds CSS vendor prefixes           |
| `postcss`                        | CSS transformation tool            |
| `postcss-custom-properties`      | CSS custom properties support      |
| `postcss-import`                 | Import CSS files in CSS            |
| `sass`                           | SCSS preprocessor                  |
| `stylelint`                      | CSS/SCSS linter                    |
| `stylelint-config-prettier-scss` | Integrates Stylelint with Prettier |
| `stylelint-config-standard-scss` | Standard SCSS lint rules           |
| `tailwindcss`                    | Utility-first CSS framework        |

#### Formatting & Git Hooks

```json
{
  "devDependencies": {
    "prettier": "^3.6.2",
    "husky": "^9.1.7",
    "lint-staged": "^16.1.6"
  }
}
```

| Package       | Purpose                        |
| ------------- | ------------------------------ |
| `prettier`    | Code formatter                 |
| `husky`       | Git hooks manager              |
| `lint-staged` | Run checks on staged Git files |

#### Other Tools

```json
{
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

| Package      | Purpose             |
| ------------ | ------------------- |
| `typescript` | TypeScript compiler |

## lint-staged Configuration

When files are staged in Git, these commands run before commit to ensure only compliant code is committed:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.scss": ["stylelint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

| File Type           | Commands                              | Description                                           |
| ------------------- | ------------------------------------- | ----------------------------------------------------- |
| `*.{js,jsx,ts,tsx}` | `eslint --fix`, `prettier --write`    | Fix and format JS/TS files with ESLint and Prettier   |
| `*.scss`            | `stylelint --fix`, `prettier --write` | Fix and format SCSS files with Stylelint and Prettier |
| `*.{json,md}`       | `prettier --write`                    | Format JSON and Markdown files with Prettier          |
