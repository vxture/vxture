# Phase 6 检查清单 — 跨层依赖审计

**Version**: 1.0.0
**Last Updated**: 2026-03-11

---

## 前端层（portals/* / agent-studio/*）

- [ ] 无 import @vxture/service-*
- [ ] 无 import @vxture/core-*
- [ ] 无 import @vxture/ai-sdk
- [ ] 无 import @vxture/bff-*（包引用形式）
- [ ] 无 import agent-server/* 代码
- [ ] 所有后端数据通过 HTTP 请求 BFF 获取

---

## BFF 层（bff/*）

- [ ] 无 import @vxture/ai-sdk
- [ ] 无 import @vxture/design-system
- [ ] 无 import @vxture/platform-*
- [ ] 无跨 BFF 导入（bff-* 之间）
- [ ] 无 React / Next.js / 浏览器 API
- [ ] 无业务逻辑（只有聚合 / 路由 / 认证）

---

## Service 层（services/*/*）

- [ ] 无跨 @vxture/service-* 导入
- [ ] 无 @vxture/bff-* 依赖
- [ ] 无 @vxture/ai-sdk 依赖
- [ ] 无 @vxture/design-system / platform-* 依赖
- [ ] 无 React / Next.js 依赖
- [ ] 只依赖 @vxture/core-* 和 @vxture/shared

---

## Agent Server 层（agent-server/*）

- [ ] 无跨 agent-server/* 导入
- [ ] 无 @vxture/bff-* 依赖
- [ ] 无 @vxture/design-system / platform-* 依赖
- [ ] 无 React / Next.js 依赖
- [ ] 所有 AI 调用通过 @vxture/ai-sdk

---

## Core 层（packages/core/*）

- [ ] 只依赖 @vxture/shared
- [ ] 无 service-* / bff-* / ai-sdk / design-system / platform-* 依赖
- [ ] 无 React / Next.js 依赖
- [ ] 无 Node.js 专用 API（framework-agnostic）

---

## AI SDK（@vxture/ai-sdk）

- [ ] 只依赖 @vxture/shared
- [ ] 无 service-* / bff-* / design-system / platform-* 依赖
- [ ] 无前端包依赖

---

## Shared 层（@vxture/shared）

- [ ] 无任何 @vxture/* 内部包依赖
- [ ] 只依赖第三方轻量库

---

## Design System（@vxture/design-system）

- [ ] 只依赖 @vxture/shared
- [ ] 无 core-* / service-* / bff-* / ai-sdk / platform-* 依赖

---

## Platform SDK（@vxture/platform-*）

- [ ] 只依赖 @vxture/shared 和 @vxture/design-system（可选）
- [ ] 无 core-* / service-* / ai-sdk / bff-* 依赖
- [ ] 无跨 platform-* 导入

---

## Import 路径审计

- [ ] 无相对跨包路径导入（../../../packages/...）
- [ ] 无直接引用 services/commerce/billing/src 域路径
- [ ] 所有跨包引用通过 @vxture/* 别名

---

## tsconfig.base.json

- [ ] 所有 @vxture/* 包有对应 paths 映射
- [ ] @vxture/service-{name} 别名不含域路径
- [ ] 无多余或错误的 paths 条目

---

## pnpm-workspace.yaml

- [ ] services/*/* 两级通配覆盖所有 service 包
- [ ] packages/shared/shared 明确列出
- [ ] packages/core/* / packages/ai/ai-sdk / packages/platform/* / packages/design/design-system 覆盖正确
- [ ] portals/* / agent-studio/* / agent-server/* / bff/* 全部覆盖
- [ ] 无包目录游离于 workspace 之外

---

## 问题汇总模板

| 优先级 | 文件 | 问题描述 | 修复建议 |
|--------|------|------|------|
| P0 | | | |
| P1 | | | |
| P2 | | | |

---

## 输出格式

逐项输出 ✅ / ❌ / ⚠️
❌ 和 ⚠️ 需说明问题与修复建议
最后输出：P0 数 / P1 数 / P2 数 / 总问题数，已修复项，待修复项清单
