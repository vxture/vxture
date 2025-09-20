# package.json 配置文件详解

本文档详细解释了 Vxture 项目中 `package.json` 文件的各个部分及其作用，帮助开发者理解项目配置。

## 基本信息

```json
{
  "name": "vxture",
  "version": "0.1.0",
  "private": true
}
```

| 字段      | 说明                                                   |
| --------- | ------------------------------------------------------ |
| `name`    | 项目名称，用于包管理和部署标识                         |
| `version` | 项目版本号，遵循语义化版本控制规范 (major.minor.patch) |
| `private` | 设置为 `true` 表示该包不会被发布到 npm 仓库            |

## NPM 脚本命令

这些命令可以通过 `npm run <命令名>` 执行，例如 `npm run dev`

### 核心开发命令

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

| 命令    | 说明                       |
| ------- | -------------------------- |
| `dev`   | 启动开发服务器，支持热重载 |
| `build` | 构建生产环境版本           |
| `start` | 启动生产环境服务器         |

### 代码质量检查命令

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

| 命令         | 说明                           |
| ------------ | ------------------------------ |
| `lint`       | 运行 ESLint 检查代码质量       |
| `lint:style` | 检查并修复 SCSS 样式问题       |
| `lint:ts`    | 检查并修复 TypeScript 代码问题 |
| `lint:all`   | 运行所有检查工具               |

### 代码格式化命令

```json
{
  "scripts": {
    "format": "prettier --write '**/*.{js,ts,tsx,json,md,scss}'",
    "format:check": "prettier --check '**/*.{js,ts,tsx,json,md,scss}'"
  }
}
```

| 命令           | 说明                               |
| -------------- | ---------------------------------- |
| `format`       | 使用 Prettier 格式化所有支持的文件 |
| `format:check` | 检查文件格式是否符合规范           |

### 类型检查

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

| 命令         | 说明                                     |
| ------------ | ---------------------------------------- |
| `type-check` | 运行 TypeScript 类型检查，不生成输出文件 |

### 组合命令和 Git Hooks

```json
{
  "scripts": {
    "check": "npm run lint:all && npm run format:check",
    "fix": "npm run lint:all && npm run format",
    "prepare": "husky"
  }
}
```

| 命令      | 说明                       |
| --------- | -------------------------- |
| `check`   | 检查所有代码质量和格式问题 |
| `fix`     | 修复所有代码质量和格式问题 |
| `prepare` | 安装 Husky Git hooks       |

## 项目依赖

### 运行依赖 (dependencies)

这些包在生产环境中也会被使用：

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

| 包名                          | 用途                         |
| ----------------------------- | ---------------------------- |
| `@tanstack/react-query`       | 用于数据获取、缓存和状态管理 |
| `next`                        | Next.js 框架核心             |
| `openai`                      | OpenAI API 客户端            |
| `react`                       | React 核心库                 |
| `react-dom`                   | React DOM 渲染器             |
| `react-intersection-observer` | 用于检测元素进入视口的工具   |
| `zod`                         | TypeScript 优先的数据验证库  |

### 开发依赖 (devDependencies)

这些包只在开发环境中使用，不会包含在生产构建中：

#### TypeScript 类型定义

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

| 包名               | 用途               |
| ------------------ | ------------------ |
| `@types/node`      | Node.js 类型定义   |
| `@types/react`     | React 类型定义     |
| `@types/react-dom` | React DOM 类型定义 |

#### ESLint 及其插件

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

| 包名                               | 用途                             |
| ---------------------------------- | -------------------------------- |
| `@typescript-eslint/eslint-plugin` | TypeScript ESLint 插件           |
| `eslint`                           | 代码质量检查工具                 |
| `eslint-config-next`               | Next.js 推荐的 ESLint 配置       |
| `eslint-config-prettier`           | 让 ESLint 和 Prettier 配合使用   |
| `eslint-plugin-import`             | 用于检查 import/export 语法      |
| `eslint-plugin-jsx-a11y`           | 检查 JSX 中的可访问性问题        |
| `eslint-plugin-prettier`           | 将 Prettier 作为 ESLint 规则运行 |
| `eslint-plugin-react-hooks`        | 检查 React Hooks 规则            |
| `eslint-plugin-react-perf`         | React 性能优化相关规则           |
| `eslint-plugin-security`           | 检测代码中的安全问题             |
| `eslint-plugin-sonarjs`            | 检测代码质量问题                 |
| `eslint-plugin-unused-imports`     | 自动删除未使用的导入             |

#### CSS 相关工具

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

| 包名                             | 用途                              |
| -------------------------------- | --------------------------------- |
| `autoprefixer`                   | 自动添加 CSS 浏览器前缀           |
| `postcss`                        | CSS 转换工具                      |
| `postcss-custom-properties`      | 支持 CSS 自定义属性               |
| `postcss-import`                 | 支持在 CSS 中导入其他 CSS 文件    |
| `sass`                           | SCSS 预处理器                     |
| `stylelint`                      | CSS/SCSS 代码质量检查工具         |
| `stylelint-config-prettier-scss` | 让 Stylelint 与 Prettier 配合使用 |
| `stylelint-config-standard-scss` | SCSS 标准规则集                   |
| `tailwindcss`                    | 实用优先的 CSS 框架               |

#### 代码格式化与 Git Hooks

```json
{
  "devDependencies": {
    "prettier": "^3.6.2",
    "husky": "^9.1.7",
    "lint-staged": "^16.1.6"
  }
}
```

| 包名          | 用途                      |
| ------------- | ------------------------- |
| `prettier`    | 代码格式化工具            |
| `husky`       | Git Hooks 工具            |
| `lint-staged` | 对暂存的 Git 文件运行检查 |

#### 其他工具

```json
{
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

| 包名         | 用途              |
| ------------ | ----------------- |
| `typescript` | TypeScript 编译器 |

## lint-staged 配置

当文件被 Git 暂存时，在提交前自动运行这些命令，确保只有符合规范的代码才能被提交：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.scss": ["stylelint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

| 文件类型            | 运行命令                                | 说明                                                                        |
| ------------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| `*.{js,jsx,ts,tsx}` | `eslint --fix`<br>`prettier --write`    | 对 JavaScript/TypeScript 文件先运行 ESLint 修复问题，然后用 Prettier 格式化 |
| `*.scss`            | `stylelint --fix`<br>`prettier --write` | 对 SCSS 样式文件先运行 Stylelint 修复问题，然后用 Prettier 格式化           |
| `*.{json,md}`       | `prettier --write`                      | 对 JSON 和 Markdown 文件使用 Prettier 格式化                                |
