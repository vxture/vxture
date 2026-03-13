# @vxture/shared 包详细审查 Prompt

> 将此文件内容完整粘贴给 AI，让其对 `packages/shared/shared/` 做全面检查。

---

## 上下文

你正在审查 Vxture 平台 monorepo 中的 `@vxture/shared` 包。

**平台概要**：
- TypeScript 5.9.3 / ES2023 / Node.js 22 LTS
- pnpm workspace monorepo
- 后端统一使用 NestJS，前端使用 Next.js 15 + React 19
- 打包工具：tsup

**包的定位**：
`@vxture/shared` 是整个平台最底层的包，被所有层消费（portals、agent-studio、agent-server、bff、services、core-\*）。它必须保持：轻量、无内部依赖、框架无关、领域无关。

**当前目录结构**：
```
packages/shared/shared/
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.build.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts
    ├── constants/
    │   ├── auth.constants.ts
    │   ├── locale.constants.ts
    │   ├── theme.constants.ts
    │   └── index.ts
    ├── types/
    │   ├── auth.types.ts
    │   ├── content.types.ts
    │   ├── locale.types.ts
    │   ├── theme.types.ts
    │   └── index.ts
    └── utils/
        ├── debug.utils.ts
        ├── locale.utils.ts
        └── index.ts
```

---

## 架构约束（检查时严格遵守）

### 依赖规则
- ✅ 允许：轻量第三方工具库（无框架）
- ❌ 禁止：所有 `@vxture/*` 内部包
- ❌ 禁止：React、Next.js、NestJS、任何 Node.js 专用 API
- ❌ 禁止：数据库库、HTTP 客户端

### constants/ 规则
- 只允许：配置对象、字符串/数字字面量
- 禁止：运行时逻辑、函数调用、动态计算

### types/ 规则
- 只允许：纯 TypeScript 类型和接口定义
- 禁止：运行时 import（只能用 `import type`）
- 禁止：带逻辑的 class 定义

### utils/ 规则
- 只允许：纯函数，无副作用
- 必须：在 browser 和 Node.js 双环境均可运行
- 禁止：框架依赖、DOM 专用 API（如 `window`、`document`）、Node.js 专用 API（如 `fs`、`path`）

### TypeScript 规则
- 禁止 `any` 类型
- 类型导入必须使用 `import type`
- 类型导出必须使用 `export type`
- 禁止 `export *` 用于纯类型文件，需显式列出导出项

### 导出规则
- 所有公共 API 必须通过 `src/index.ts` → 子目录 `index.ts` 逐层导出
- 消费方只从 `@vxture/shared` 根路径导入，不允许深层路径导入

---

## 请执行以下检查项

### 1. package.json 检查
- [ ] `name` 是否为 `@vxture/shared`
- [ ] `exports` 字段是否正确配置（main、module、types 三条路径）
- [ ] `exports` 是否有 `"."` 入口，且指向 tsup 的输出目录（通常 `dist/`）
- [ ] `files` 字段是否只包含 `["dist", "src"]`（或仅 `dist`）
- [ ] `sideEffects` 是否设为 `false`（纯工具库，利于 tree-shaking）
- [ ] 是否有不必要的运行时依赖（dependencies 应尽量为空或只有轻量工具库）
- [ ] `devDependencies` 中 TypeScript、tsup 版本是否与平台锁定版本一致（TS 5.9.3）
- [ ] 是否缺少 `private: false`（shared 包需要被 workspace 内其他包消费）

### 2. tsconfig.json 检查
- [ ] 是否通过 `extends` 继承 `../../../tsconfig.base.json`（三级路径，因为 `packages/shared/shared/`）
- [ ] 是否设置了 `rootDir: "src"` 和 `outDir: "dist"`
- [ ] 是否包含 `"include": ["src"]`
- [ ] 是否排除了 `node_modules` 和 `dist`
- [ ] 是否未设置 `noEmit: true`（shared 是 library，需要 emit）
- [ ] 不得覆盖 `strict: false` 或其他严格检查项

### 3. tsconfig.build.json 检查
- [ ] 是否 `extends: "./tsconfig.json"`
- [ ] 是否开启了 `declaration: true`、`declarationMap: true`、`sourceMap: true`
- [ ] 是否未重复定义已在 base 中定义的选项

### 4. tsup.config.ts 检查
- [ ] `entry` 是否指向 `src/index.ts`
- [ ] 是否同时输出 `esm` 和 `cjs` 两种格式（`format: ['esm', 'cjs']`）
- [ ] 是否开启 `dts: true`（生成类型声明文件）
- [ ] 是否开启 `clean: true`（每次构建前清理 dist）
- [ ] 是否开启 `splitting: false` 或按需设置（shared 包通常不需要 code splitting）
- [ ] 是否未引入不必要的 external 排除（shared 无内部依赖，external 应为空或仅第三方）
- [ ] 是否设置了 `treeshake: true`

### 5. src/index.ts 检查
- [ ] 是否只做三行桶导出：`export * from './constants'`、`export * from './types'`、`export * from './utils'`（或等效写法）
- [ ] types 的导出是否使用 `export type *`（纯类型子目录）
- [ ] 是否没有直接的业务逻辑或具体实现

### 6. constants/ 目录检查

**auth.constants.ts**
- [ ] 检查是否只含常量（字符串、数字、对象字面量），无函数调用
- [ ] 内容是否真正跨层共用（不是某个 core-auth 专用的常量）
- [ ] 是否有重复定义（与 `core-auth` 中的常量是否冲突）

**locale.constants.ts**
- [ ] 语言列表、默认 locale 等是否合理
- [ ] 是否只是常量，没有运行时的 locale 解析逻辑（解析逻辑应在 `core-locale`）

**theme.constants.ts**
- [ ] 主题枚举值是否与 `design-system` 中的定义一致（不能各定义一套）
- [ ] 是否只是常量，没有 CSS 变量或 DOM 操作

**constants/index.ts**
- [ ] 是否显式 `export` 每个常量文件（`export *` 对常量文件可以接受，但确认无冲突）

### 7. types/ 目录检查

**auth.types.ts**
- [ ] 是否只有 `type` / `interface` 定义，无运行时代码
- [ ] 是否使用了 `import type`（如果有跨文件引用）
- [ ] 类型是否足够通用（适合所有层使用，非 NestJS 或 Next.js 专用）

**content.types.ts**
- [ ] "content" 是否真的是跨层共用的概念，还是某个 agent 专用的类型
- [ ] 如果是 agent 专用类型，应移至对应 `agent-server/` 或 `agent-studio/`

**locale.types.ts**
- [ ] Locale / Language 类型是否与 `locale.constants.ts` 中的常量对齐（类型与常量双向一致）

**theme.types.ts**
- [ ] Theme / Density 类型是否与 `design-system` 中的定义一致，不能有两套不兼容的类型

**types/index.ts**
- [ ] 是否使用 `export type { ... }` 而非 `export * from`（纯类型文件推荐显式导出）

### 8. utils/ 目录检查

**debug.utils.ts**
- [ ] 是否只用了 `console.*`（跨环境安全）
- [ ] 是否没有使用 `process.env` 直接判断（Node.js 专用，browser 不安全）
- [ ] 如果有环境判断，是否用了兼容写法（如 `typeof process !== 'undefined'`）

**locale.utils.ts**
- [ ] 是否只做格式化（数字、日期、货币），没有 locale 解析或 i18n 消息查找
- [ ] 使用 `Intl` API 是安全的（Node 22 完整支持），但需确认没有浏览器专用 API
- [ ] 是否没有依赖 `window.navigator.language`（DOM 专用）

**utils/index.ts**
- [ ] 是否正确 re-export 所有工具函数

### 9. 缺失文件检查（可能需要补充的内容）
- [ ] `utils/` 下是否缺少 `format.utils.ts`（字符串/数字格式化）？架构文档中提到此文件
- [ ] `types/` 下是否缺少 `pagination.types.ts`？架构文档中提到此类型
- [ ] 是否需要补充 `error.types.ts`（标准化错误类型，跨层共用）

### 10. CLAUDE.md 内容检查
- [ ] 是否包含了上述所有约束规则的简洁版本
- [ ] 是否明确说明了哪些类型的代码**不应该**放入 shared
- [ ] 是否说明了与其他包的边界（例如：locale 格式化 vs locale 解析的分工）
- [ ] 内容是否与本文档保持同步（如有规则变化，两处均需更新）

---

## 检查输出格式

请按以下格式输出检查结果：

```
## 检查结果

### ✅ 通过项
- （逐项列出）

### ⚠️ 建议优化项
- 文件：{filename}
  问题：{描述}
  建议：{具体修改建议}

### ❌ 必须修复项
- 文件：{filename}
  问题：{描述}
  修复：{具体修改内容或代码示例}

### ❓ 需要人工决策项
- （需要业务判断、无法自动确定的问题）
```

---

## 附：与其他包的边界说明（检查时参考）

| 能力 | 属于 shared | 属于其他包 |
|------|-------------|------------|
| Theme 类型枚举 | ✅ `types/theme.types.ts` | design-system 复用此类型 |
| Locale 语言列表常量 | ✅ `constants/locale.constants.ts` | — |
| Locale 消息翻译/查找 | ❌ | `@vxture/core-locale` |
| Auth token 校验逻辑 | ❌ | `@vxture/core-auth` |
| Auth token 相关类型/常量 | ✅ 通用部分 | 平台专用部分归 core-auth |
| 纯字符串/日期格式化 | ✅ `utils/` | — |
| HTTP 请求工具 | ❌ | `@vxture/core-api` |
| 业务领域类型（Order、User） | ❌ | 对应 service 包 |
| React hooks / 组件 | ❌ | design-system 或各应用 |
