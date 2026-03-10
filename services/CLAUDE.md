# CLAUDE.md — services/ (service-\*)

> 继承根 `CLAUDE.md` 全部规则。本文件只记录 Service 层专属约束。

---

## 层定位

**@layer**: `Domain`
**包名前缀**: `@vxture/service-*`
**变更频率**: Slow — 服务层是已验证的共享业务逻辑

Service 层是**跨 Agent、跨 Portal 共享的稳定业务服务**。
每个服务包封装一个独立的业务领域（账单、订阅、工单等）。

---

## Promote-When-Ready 原则

Service 层的内容来源于 `agent-server/*`，**只有满足以下条件才能晋升**：

```
agent-server/{agent}/    →    (验证可复用性)    →    services/service-{name}/
```

晋升条件（需全部满足）：

- [ ] 被 2 个以上 agent 或 portal 需要
- [ ] 业务逻辑稳定，不再频繁变动
- [ ] 领域边界清晰，职责单一
- [ ] 已有测试覆盖

> **禁止提前晋升**。将实验性逻辑放入 service 层会制造虚假的稳定性承诺。

---

## 依赖约束

```
service-*
  ✅ → @vxture/core-*
  ✅ → @vxture/shared
  ✅ → 第三方库
  ❌ → 其他 service-* 包（服务间不得互相依赖）
  ❌ → ai-sdk, bff-*, 任何 UI 包
  ❌ → agent-server/*
```

> **服务之间禁止互相依赖**。共用逻辑下沉到 `core-*` 或 `shared`。

---

## 📁 文件结构规范

```
services/service-{name}/
├── src/
│   ├── types.ts         # 领域类型定义
│   ├── constants.ts     # 领域常量
│   ├── {name}.service.ts  # 服务主逻辑
│   ├── {name}.repository.ts  # 数据访问（如有）
│   └── index.ts         # 公共导出
├── package.json
└── tsconfig.json
```

---

## 编写 Service 的要求

1. 服务类 / 函数必须**无状态**或明确管理状态生命周期
2. 数据访问逻辑与业务逻辑分离（Repository 模式）
3. 所有公共方法必须有完整 JSDoc（含 `@throws`）
4. 错误处理：抛出**具名错误类**，不抛裸字符串
5. 写明该服务从哪个 agent 晋升而来（文件头注释）
