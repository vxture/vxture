# Vxture Platform SDK Architecture

**Version**: 1.3.0
**Last Updated**: 2026-05-13
**TypeScript**: 5.9.3

## Overview

The **Platform SDK Layer** provides **typed wrappers around third-party client SDKs and browser APIs**
used in frontend applications.

Each platform package encapsulates one concern, exposing React hooks and utilities that integrate
naturally with the Vxture design system and TypeScript ecosystem.
Frontend code never imports third-party SDKs directly — all access goes through these wrappers.

Platform packages are **browser-only**. They must never be imported in server-side code.

---

# 1. Packages

```
packages/platform/
├── browser/            # @vxture/platform-browser（已实现）
├── amap/               # @vxture/platform-amap（计划中，尚未实现）
├── cesium/             # @vxture/platform-cesium（计划中，尚未实现）
└── {name}/             # @vxture/platform-{name}（扩展槽）
```

---

# 2. @vxture/platform-browser（已实现）

浏览器端通用工具集，为所有 portal 和 agent 前端提供通用的浏览器操作封装。

**已实现模块**：

```
src/utils/
├── portal-entry.utils.ts   # Portal 入口工具（页面初始化 / 环境检测）
├── preferences.utils.ts    # 用户偏好持久化（localStorage 封装）
└── resetScrollTop.utils.ts # 滚动位置重置工具
```

```ts
import { resetScrollTop, getPreference, setPreference } from '@vxture/platform-browser';
```

---

# 3. 计划中的包

## @vxture/platform-amap（计划中）

封装高德地图（Amap / Gaode）Web SDK。

**设计意图**：
- 地图容器组件与生命周期管理
- 标注、覆盖物、图层的 React 化接口
- 坐标系转换：GCJ-02 ↔ WGS-84
- 高德 SDK 版本隔离

**触发条件**：多个 portal / agent 前端需要嵌入高德地图时实现。

## @vxture/platform-cesium（计划中）

封装 CesiumJS 三维地球 SDK。

**设计意图**：
- Cesium Viewer 的 React 容器与初始化
- 实体（Entity）与数据源（DataSource）的 React 化接口
- 相机控制 hooks
- Cesium SDK 版本隔离

**触发条件**：三维地理可视化需求落地时实现。

---

# 4. Internal Structure

每个 platform 包遵循统一内部结构：

```
packages/platform/{name}/
├── package.json
├── tsconfig.json
└── src/
    ├── components/       # React 组件（可选）
    ├── hooks/            # React hooks（useXxx）
    ├── utils/            # 工具函数
    ├── types/            # TypeScript 类型定义
    └── index.ts          # 单一公共导出入口
```

---

# 5. Design Principles

**封装，不透传**：消费方不应需要直接接触第三方 SDK 的原始 API。

**版本隔离**：第三方 SDK 的版本升级只影响 platform 包内部，不影响消费方代码。

**数据由外传入**：后端数据（坐标、图层数据等）由前端通过 BFF 获取后作为 props 传入。
Platform 包不发起任何后端请求。

**与 Design System 协调**：Platform 包的 UI 组件应使用 `@vxture/design-system` 的组件和 token。

---

# 6. Dependency Rules

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

# 7. Consumers

| Consumer              | 用途                               |
| --------------------- | ---------------------------------- |
| `portals/*`           | portal 前端通用浏览器操作          |
| `agent-studio/*`      | agent 内嵌前端通用浏览器操作       |
| `business/*`          | 独立商业应用（如 ruyin 前端）      |

Platform 包不被任何服务端代码消费。

---

# 8. Extension Rules

**新增 platform 包的触发条件**：
- 引入了一个新的大型第三方客户端 SDK（体积大、API 复杂）
- 该 SDK 需要在多个前端中使用
- 直接使用原始 SDK 会产生版本管理或类型安全问题

**新增步骤**：
1. 在 `packages/platform/{name}/` 创建新包
2. 包名：`@vxture/platform-{name}`
3. `pnpm-workspace.yaml` 已通过 `packages/platform/*` 通配符覆盖，无需修改

---

# 9. AI Coding Rules

AI 在操作 `@vxture/platform-*` 时必须：

1. 禁止在任何服务端代码中导入 platform 包
2. 禁止在 platform 包中导入 `@vxture/core-*`、`@vxture/service-*`、`@vxture/ai-sdk`
3. platform 包之间不互相导入
4. 不使用 `any` 类型
5. 所有公共 API 通过 `src/index.ts` 导出
6. **不得新建 platform-amap 或 platform-cesium 的实现代码**，直到需求明确落地

---

End of document.
