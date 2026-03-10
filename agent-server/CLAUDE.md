# CLAUDE.md — agent-studio/

> 继承根 `CLAUDE.md` 全部规则。本文件只记录 Agent Studio 层专属约束。

---

## 层定位

**@layer**: `Presentation`
**产品面**: Agent Studio Surface（AI 产品前端）
**变更频率**: Fast — 每个 agent 由独立产品团队治理，快速迭代

Agent Studio 是**面向终端用户的 AI 产品前端**。每个 agent 是独立的前端应用。

```
agent-studio/agent01/web
agent-studio/agent02/web
agent-studio/agent{N}/web
```

---

## 核心原则：Agent 独立性

每个 agent 必须独立运作：

- 一个 agent 的故障**不影响**其他 agent 或 Platform
- 每个 agent 有自己的路由、状态、API 层
- **禁止** agent 之间互相 import

---

## 部署模式

Agent 前端支持两种模式，**不修改代码库**即可切换：

| 模式           | 描述                                                     | 适用场景                     |
| -------------- | -------------------------------------------------------- | ---------------------------- |
| **Standalone** | 独立 Web 应用，有自己的 URL 和路由                       | 作为独立产品发布的 agent     |
| **Embedded**   | 嵌入 portals/admin 或 portals/tenant 作为 micro-frontend | 作为 portal 功能模块的 agent |

设计代码时需考虑两种模式的兼容性。

---

## 依赖约束

```
agent-studio/*
  ✅ → 专属 BFF（HTTP only）
  ✅ → @vxture/design-system
  ✅ → @vxture/shared
  ❌ → 其他 agent-studio/*（agent 间隔离）
  ❌ → @vxture/service-*
  ❌ → @vxture/core-*
  ❌ → @vxture/ai-sdk
  ❌ → agent-server/*
```

---

## 📁 文件结构规范

```
agent-studio/{name}/web/
├── src/
│   ├── pages/           # 页面组件
│   ├── components/      # Agent 专属组件
│   │   ├── chat/        # 对话界面相关
│   │   ├── canvas/      # 画布 / 工作区
│   │   └── common/      # 通用
│   ├── hooks/           # Agent 业务 Hooks
│   ├── stores/          # Agent 状态管理
│   ├── api/             # BFF 接口调用
│   └── types/           # Agent 专属类型
```

---

## Agent 前端特有要求

1. **流式响应处理**：AI 输出通常是 SSE / Stream，封装在专用 Hook 中
2. **乐观更新**：用户操作需即时反馈，不等待服务端确认
3. **错误边界**：每个主要功能区域必须有 `ErrorBoundary`，防止局部错误扩散
4. **状态持久化**：对话历史等需要持久化的状态明确标注存储策略
5. **性能**：AI 输出渲染场景注意避免不必要的重渲染，关键路径使用 `useMemo` / `useCallback`
