# @vxture/ruyin（Agent Studio）

> 架构层参考：[`docs/architecture/06-agent-server.md`](../../architecture/06-agent-server.md)

---

## 包信息

| 项     | 值                                                           |
| ------ | ------------------------------------------------------------ |
| 包名   | `@vxture/ruyin`                                              |
| 路径   | `business/ruyin/`（注意：在 business/ 层，非 agent-studio/） |
| @layer | `Presentation`                                               |
| 端口   | 3110                                                         |
| 框架   | Next.js                                                      |

## 职责

Ruyin 智能体独立应用（非嵌入式，独立部署）。面向终端用户提供 Ruyin Agent 的交互界面，包括任务提交、进度查看、结果展示。

## 依赖约束

```typescript
✅ @vxture/design-system / @vxture/shared / @vxture/core-locale
✅ ruyin-bff（HTTP only）
❌ @vxture/ai-gateway-client / agent-server/* / @vxture/service-*
```

## 关联包

| 包                    | 关系                                 |
| --------------------- | ------------------------------------ |
| `agent-studio/ruyin/` | Ruyin 前端（另一个入口，待确认定位） |
| `agent-server/ruyin`  | Ruyin 后端（BullMQ 异步任务）        |
| `bff/ruyin-bff`       | Ruyin BFF（HTTP 中间层）             |

## 路径说明

| 路径                          | 定位                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| `business/ruyin/`（本包）     | **独立部署**的 Ruyin 应用，面向最终用户，独立域名（ruyin.vxture.com） |
| `agent-studio/ruyin/`（待建） | **嵌入式** Studio，供 console 内嵌使用（参考 vela-studio 模式）       |

两者均属于 Presentation 层，通过 ruyin-bff HTTP 接入，不共享代码。

## 待实施

- 已实现页面列表（任务提交 / 进度查看 / 结果展示）
