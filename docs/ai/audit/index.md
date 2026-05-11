# AI 审计规则索引

> 迁移自 `docs/ai-audit/` + `docs/ai-audit-rules/`。原目录已弃用。

## 审计清单

| 文件 | 内容 |
|------|------|
| [`checklist-core.md`](checklist-core.md) | Core 层包检查清单（依赖边界 / 导出结构 / NestJS 规范 / TS 严格模式） |
| [`checklist-ds.md`](checklist-ds.md) | Design System 合规审计记录（存量债务 / 已收敛基线） |

## 操作文档

| 文件 | 内容 |
|------|------|
| [`run.md`](run.md) | 如何运行 AI 审计 |
| [`scope.md`](scope.md) | 审计范围定义 |
| [`prompt.md`](prompt.md) | 审计用 Prompt |
| [`ci-gate.md`](ci-gate.md) | CI 门控集成 |
| [`report-template.md`](report-template.md) | 审计报告模板 |
| [`severity.md`](severity.md) | 问题严重级别（P0-P3） |

## 规则检查文件（rules/）

> 规则列表、执行顺序、加载逻辑见 → [`rules/index.md`](rules/index.md)
