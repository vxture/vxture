# Vxture Platform SDK Architecture

**Version**: 1.2.0
**Last Updated**: 2026-03-10
**TypeScript**: 5.9.3

## Overview

The **Platform SDK Layer** provides **typed wrappers around third-party client SDKs**
used in frontend applications.

Each platform package encapsulates one third-party SDK, exposing React hooks and
components that integrate naturally with the Vxture design system and TypeScript ecosystem.
Frontend code never imports third-party SDKs directly — all access goes through these wrappers.

Platform packages are **browser-only**. They must never be imported in server-side code.

---

# 1. Packages

```
@vxture/platform-amap      # 高德地图 SDK 封装
@vxture/platform-cesium    # Cesium 三维地球 SDK 封装
@vxture/platform-{name}    # 未来扩展
```

Location:

```
packages/platform/
├── amap/                  # @vxture/platform-amap
├── cesium/                # @vxture/platform-cesium
└── {name}/                # @vxture/platform-{name}
```

---

# 2. Purpose of Each Package

## @vxture/platform-amap

封装高德地图（Amap / Gaode）Web SDK。

**核心职责**：
- 地图容器组件与生命周期管理
- 标注、覆盖物、图层的 React 化接口
- 坐标系转换：GCJ-02 ↔ WGS-84
- 高德 SDK 版本隔离（消费方感知不到 SDK 版本变化）

```ts
import { AmapContainer, useAmap, useMarker } from '@vxture/platform-amap';
```

## @vxture/platform-cesium

封装 CesiumJS 三维地球 SDK。

**核心职责**：
- Cesium Viewer 的 React 容器与初始化
- 实体（Entity）与数据源（DataSource）的 React 化接口
- 相机控制 hooks
- Cesium SDK 版本隔离

```ts
import { CesiumViewer, useEntity, useCamera } from '@vxture/platform-cesium';
```

---

# 3. Internal Structure

每个 platform 包遵循统一内部结构：

```
packages/platform/{name}/
├── package.json
├── tsconfig.json
└── src/
    ├── components/       # React 组件（容器、覆盖层等）
    ├── hooks/            # React hooks（useXxx）
    ├── utils/            # 工具函数（坐标转换等）
    ├── types/            # TypeScript 类型定义
    └── index.ts          # 单一公共导出入口
```

---

# 4. Design Principles

**封装，不透传**：消费方不应需要直接接触第三方 SDK 的原始 API。
Platform 包暴露的是 Vxture 风格的 React 接口，而不是 SDK 的直接 re-export。

**版本隔离**：第三方 SDK 的版本升级只影响 platform 包内部，不影响消费方代码。

**数据由外传入**：后端数据（坐标、图层数据等）由前端通过 BFF 获取后作为 props 传入。
Platform 包不发起任何后端请求。

**与 Design System 协调**：Platform 包的 UI 组件（如地图工具栏、图例）应使用
`@vxture/design-system` 的组件和 token，保持视觉一致性。

---

# 5. Dependency Rules

Allowed:

```
@vxture/shared
@vxture/design-system     (可选，用于 UI 组件)
```

Forbidden:

```
@vxture/core-*            (服务端包，禁止在浏览器 SDK 中引入)
@vxture/service-*
@vxture/ai-sdk
@vxture/bff-*
other @vxture/platform-*  (平台包之间不互相依赖)
```

**Critical constraint**: 严格浏览器专用。
禁止在 `bff/*`、`agent-server/*`、`services/*`、`packages/core/*` 中导入。

---

# 6. Consumers

Platform SDK 被以下层消费：

| Consumer          | 用途                             |
| ----------------- | -------------------------------- |
| `portals/*`       | 管理后台中的地图与三维展示功能    |
| `agent-studio/*`  | Agent 产品中的地图与空间数据展示  |

Platform 包不被任何服务端代码消费。

---

# 7. Extension Rules

**新增 platform 包的触发条件**：
- 引入了一个新的大型第三方客户端 SDK（体积大、API 复杂）
- 该 SDK 需要在多个 portal 或 agent-studio 中使用
- 直接使用原始 SDK 会产生版本管理或类型安全问题

**新增步骤**：
1. 在 `packages/platform/{name}/` 创建新包
2. 包名：`@vxture/platform-{name}`
3. 在 `pnpm-workspace.yaml` 已通过 `packages/platform/*` 通配符自动覆盖，无需修改

**不适合创建 platform 包的情况**：
- 轻量级工具库（直接在 `@vxture/shared` 或应用内使用即可）
- 仅一个应用使用的 SDK（直接在该应用内管理依赖）

---

# 8. AI Coding Rules

AI 在操作 `@vxture/platform-*` 时必须：

1. 禁止在任何服务端代码中导入 platform 包
2. 禁止在 platform 包中导入 `@vxture/core-*`、`@vxture/service-*`、`@vxture/ai-sdk`
3. platform 包之间不互相导入
4. 封装第三方 SDK，不直接 re-export 原始 SDK 的 API
5. 所有公共 API 通过 `src/index.ts` 导出
6. 后端数据通过 props 传入组件，platform 包不发起网络请求
7. 不使用 `any` 类型

---

End of document.
