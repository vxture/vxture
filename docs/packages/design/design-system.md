# @vxture/design-system

> 架构层参考：[`docs/architecture/08-design-system.md`](../../architecture/08-design-system.md)
> 使用规范：[`docs/standards/design-system.md`](../../standards/design-system.md)

---

## 包信息

| 项 | 值 |
|----|-----|
| 包名 | `@vxture/design-system` |
| 路径 | `packages/design/design-system/` |
| @layer | `Presentation` |
| 消费方 | `portals/*` · `agent-studio/*` · `business/*` |

## 目录结构

```
src/
├── tokens/       ← CSS 变量 + TS 常量（颜色/间距/圆角/阴影/字体）
├── styles/       ← globals.css / tokens.css / auth.css / fullscreen.css
├── theme/        ← ThemeProvider / useTheme（亮色/暗色/系统）
├── density/      ← DensityProvider（compact/default/comfortable）
├── icons/        ← Icon Registry（Phosphor 隔离层）
├── components/
│   ├── ui/       ← 基础 UI 原语（Button/Input/Dialog 等）
│   ├── auth/     ← 统一认证模板组件
│   ├── shell/    ← 跨应用 Chrome 原语（Shell/Sidebar/Header）
│   └── layout/   ← 布局原语
└── index.ts      ← 唯一公共出口
```

## 依赖约束

```typescript
✅ @vxture/shared（类型 / 常量）
❌ @vxture/core-*（服务端专用，禁止引入）
❌ @vxture/service-* / bff-* / ai-sdk
❌ @vxture/platform-*（platform-browser 等运行时适配层不属于 DS）
❌ 任何 Portal / Agent Studio 内部模块
```

## 开发约束

**图标系统**：
- 所有图标通过 `<Icon name="..." />` 使用，禁止直接 `import @phosphor-icons/react`
- 新图标必须先加入 `icon-dictionary.ts` 白名单，再在 `icon-registry.ts` 注册

**Token 系统**：
- CSS 变量是运行时唯一值源（`--vx-*` 前缀）
- TS token 文件是 CSS 变量的只读引用，禁止包含原始 hex/px/shadow 值
- 禁止在 DS 内部组件中直接消费 `--vx-component-metric-*`（必须先提升为语义 token）

**组件开发**：
- 所有组件使用 `forwardRef`
- class 合并统一用 `cn()`
- 默认 `variant="default"` / `size="default"`

**出口管理**：
- 所有公共符号通过 `src/index.ts` 导出，禁止从内部路径导入
- 服务端安全符号通过子入口导出（`@vxture/design-system/tokens` / `/types`）

## 验收门控

```bash
pnpm lint:design          # 检查应用侧违规：内联样式 / 自建 UI / 直接色值
pnpm --filter @vxture/design-system build
pnpm --filter @vxture/design-system type-check
```

存量债务基线：`scripts/guardrails/design-system-baseline.json`，迁移后从基线移除，禁止新增。
