# CLAUDE.md — bff/

> 继承根 `CLAUDE.md` 全部规则。本文件只记录 BFF 层专属约束。

---

## 层定位

**@layer**: `Application`
**路径规则**: `bff/{portal-name}-bff` 或 `bff/{agent-name}-bff`
**变更频率**: Medium

BFF（Backend For Frontend）是**前端与后端之间的唯一通道**。
每个 Portal / Agent 有且只有一个专属 BFF。

---

## BFF 只做这四件事

1. **鉴权**：验证 token，管理 session
2. **租户解析**：解析并传播租户上下文
3. **数据聚合**：从多个后端（agent-server、service-_、core-_）获取数据并组合
4. **响应塑形**：按前端消费需求裁剪、格式化响应

---

## ❌ BFF 绝对不做的事

- 包含**业务逻辑**（属于 service-\* 或 agent-server）
- 调用**AI 模型**（属于 agent-server）
- 引入 `design-system`、`platform-*` 等 UI 包
- 与**其他 BFF** 通信
- 直接访问数据库（通过 service-\* 间接访问）

---

## 依赖约束

```
bff/*
  ✅ → agent-server/*（HTTP 调用）
  ✅ → @vxture/service-*
  ✅ → @vxture/core-*
  ✅ → @vxture/shared
  ❌ → 其他 bff-*
  ❌ → @vxture/design-system
  ❌ → @vxture/platform-*
  ❌ → @vxture/ai-sdk
```

---

## 📁 文件结构规范

```
bff/{name}-bff/
├── src/
│   ├── routes/          # 路由模块，按业务域分文件
│   │   ├── auth.route.ts
│   │   └── {domain}.route.ts
│   ├── middleware/      # 鉴权、租户解析等中间件
│   ├── aggregators/     # 数据聚合逻辑
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 编写 BFF 的要求

1. 路由处理函数保持**薄**：验证入参 → 调用聚合器 → 返回响应
2. 聚合逻辑抽到 `aggregators/` 中，不写在路由函数里
3. 错误统一由中间件处理，路由函数中不写 try/catch 的展示逻辑
4. 所有对外接口必须有**入参校验**（zod 或类似方案）
