# @vxture/shared

> ⚠️ 待大版本重构 | 迁移自 `packages/shared/shared/CLAUDE.md`
> 架构层：`Shared`（见 `docs/architecture/02-package-boundaries.md`）

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/shared` |
| 路径 | `packages/shared/shared/` |
| @layer | `Shared` |

## 职责定位

**仅提供纯工具、类型、常量。**

- ✅ 无业务逻辑 / 无平台逻辑 / 无运行时状态
- ✅ 所有包都可依赖本包
- ✅ 本包不依赖任何内部包

## 目录结构

```
src/
├── utils/        # *.utils.ts   — 纯工具函数
├── types/        # *.types.ts   — 全局通用类型
├── constants/    # *.constants.ts — 全局常量
└── index.ts
```

## 依赖约束

**允许：** `zod` / `dayjs` / 其他轻量无副作用三方库

**禁止：**
- ❌ 任何 `@vxture/*` 内部包
- ❌ NestJS / Next.js / React / Prisma / axios / dotenv
- ❌ 浏览器专用 API（window / document / localStorage）
- ❌ Node.js 专用 API（fs / path / http）

## 现有模块

### 工具函数
| 文件 | 内容 |
|------|------|
| `debug.utils.ts` | 调试工具（开发环境，生产无副作用） |
| `format.utils.ts` | 货币 / 日期 / 数字格式化（基于 Intl API） |

### 类型定义
| 文件 | 内容 |
|------|------|
| `auth.types.ts` | UserInfo / TokenData |
| `locale.types.ts` | Locale / LocaleConfig |
| `theme.types.ts` | Theme / ThemeValue |
| `api.types.ts` | ApiResponse / ApiSuccessResponse / ApiErrorResponse |
| `ui.types.ts` | SemanticColor |
| `common.types.ts` | Link / Action |

### 常量配置
| 文件 | 内容 |
|------|------|
| `auth.constants.ts` | AUTH_CONSTANTS |
| `locale.constants.ts` | SUPPORTED_LOCALES / DEFAULT_LOCALE / LOCALE_INTL_MAP |
| `theme.constants.ts` | THEME_CONSTANTS |
| `ui.constants.ts` | SEMANTIC_COLORS |

## 文件命名规范

| 类型 | 规范 |
|------|------|
| 工具函数 | `*.utils.ts` |
| 类型定义 | `*.types.ts` |
| 常量 | `*.constants.ts` |

禁止：`utils.ts` / `helpers.ts` / `misc.ts` 等泛名。
