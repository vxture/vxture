# AI 工作规范总览

> AI agent 在本项目工作时的完整规范体系。

---

## 规范文档

| 文件 | 内容 | 优先级 |
|------|------|--------|
| [`coding-rules.md`](coding-rules.md) | AI 编码行为规则（操作范围 / 层边界 / 输出质量） | 必读 |
| [`coding-style.md`](coding-style.md) | TypeScript 约定 / 命名规则 / 导出风格 | 必读 |
| [`coding-comments.md`](coding-comments.md) | 文件头模板 / JSDoc 格式 / 分区注释 / 中文注释要求 | 必读 |
| [`port-allocation.md`](port-allocation.md) | 全局端口表 / 3NNX 规则 / 新服务登记流程 | 按需 |

## AI 审计规则

| 文件 | 内容 |
|------|------|
| [`audit/index.md`](audit/index.md) | 审计规则入口 |
| [`audit/scope.md`](audit/scope.md) | 审计范围定义 |
| [`audit/prompt.md`](audit/prompt.md) | 审计 Prompt 模板 |
| [`audit/ci-gate.md`](audit/ci-gate.md) | CI 门控配置 |
| [`audit/report-template.md`](audit/report-template.md) | 报告模板 |
| [`audit/severity.md`](audit/severity.md) | 问题严重级别定义 |
| [`audit/run.md`](audit/run.md) | 运行审计操作手册 |
| `audit/rules/` | 10 个具体规则检查文件（01-10） |

---

## 文档层级关系

```
根目录 CLAUDE.md（全局强制规则，G1-G6）
    │
    └── docs/ai/（详细规范文档）
            ├── coding-rules.md（AI 行为约束细则）
            ├── coding-style.md（代码风格细则）
            └── coding-comments.md（注释格式细则）
```

规则冲突时，以根目录 `CLAUDE.md` 为准。
