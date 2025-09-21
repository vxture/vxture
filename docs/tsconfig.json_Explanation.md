# tsconfig.json Configuration Explained

This document explains each section of the `tsconfig.json` file in the Vxture project, focusing on the current monorepo, TypeScript configuration, and best practices for a modern Next.js/TypeScript setup.
本文档详细解释了 Vxture 项目中 `tsconfig.json` 文件的各个部分及其作用，聚焦于当前单体仓库、TypeScript 配置和现代 Next.js/TypeScript 最佳实践。

## What is tsconfig.json?

`tsconfig.json` is the configuration file for a TypeScript project. It defines the project root, compiler options, and controls how TypeScript checks and compiles code.

## Compiler Options (`compilerOptions`)

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "target": "ES2017"
  }
}
```

### Base Libraries & Environment

| Option         | Value                               | Description                                               |
| -------------- | ----------------------------------- | --------------------------------------------------------- |
| `lib`          | `["dom", "dom.iterable", "esnext"]` | Include DOM, DOM iterable, and latest ECMAScript features |
| `allowJs`      | `true`                              | Allow JavaScript files in the project                     |
| `skipLibCheck` | `true`                              | Skip type checking of declaration files for faster builds |

### Strict Type Checking

| Option                         | Value  | Description                                                |
| ------------------------------ | ------ | ---------------------------------------------------------- |
| `strict`                       | `true` | Enable all strict type checking options                    |
| `noImplicitAny`                | `true` | Disallow implicit `any` types                              |
| `strictNullChecks`             | `true` | Enforce strict null/undefined checks                       |
| `strictFunctionTypes`          | `true` | Enable strict function type variance                       |
| `strictPropertyInitialization` | `true` | Ensure class properties are initialized in the constructor |

### Output & Build Options

| Option        | Value    | Description                                        |
| ------------- | -------- | -------------------------------------------------- |
| `noEmit`      | `true`   | Do not emit output files, only type check          |
| `incremental` | `true`   | Enable incremental builds for faster recompilation |
| `target`      | `ES2017` | Target ECMAScript 2017 output                      |

### Module Resolution

| Option              | Value    | Description                                                            |
| ------------------- | -------- | ---------------------------------------------------------------------- |
| `module`            | `esnext` | Use latest ES module syntax                                            |
| `esModuleInterop`   | `true`   | Allow default imports from CommonJS modules                            |
| `moduleResolution`  | `node`   | Use Node.js module resolution strategy                                 |
| `resolveJsonModule` | `true`   | Allow importing JSON files as modules                                  |
| `isolatedModules`   | `true`   | Ensure each file can be transpiled independently (important for Babel) |

### React & JSX

| Option    | Value                  | Description                                                  |
| --------- | ---------------------- | ------------------------------------------------------------ |
| `jsx`     | `preserve`             | Preserve JSX for further processing by Next.js or Babel      |
| `plugins` | `[{ "name": "next" }]` | Use Next.js TypeScript plugin for extra type checks/features |

### Paths & Imports

| Option    | Value                  | Description                                                               |
| --------- | ---------------------- | ------------------------------------------------------------------------- |
| `baseUrl` | `.`                    | Set base directory for non-relative imports                               |
| `paths`   | `{ "@/*": ["src/*"] }` | Path alias: use `@/` for `src/` (e.g., `@/components` → `src/components`) |

## Include & Exclude

```json
{
  "include": ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

| Option    | Value              | Description                                                            |
| --------- | ------------------ | ---------------------------------------------------------------------- |
| `include` | Array              | Files to include: Next.js env types, generated types, all TS/TSX files |
| `exclude` | `["node_modules"]` | Exclude node_modules from type checking                                |

## Notes & Best Practices

1. **Strict Mode**: All strict type checks are enabled to catch more potential bugs, but may require more explicit type annotations.
2. **Path Aliases**: Use `@/` as a shortcut for `src/` to simplify imports and avoid deep relative paths. Example:

   ```typescript
   // Using alias
   import { Button } from "@/components/ui/Button";

   // Instead of
   import { Button } from "../../../components/ui/Button";
   ```

3. **TypeScript Version**: This config is designed for TypeScript 5.0+. Adjust if using a different version.
4. **Incremental Builds**: Enabled for faster development; creates a `.tsbuildinfo` file in the project root.
5. **ESNext Features**: Allows use of the latest JavaScript features, which are transpiled by Next.js/Babel for compatibility.
