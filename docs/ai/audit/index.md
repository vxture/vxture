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

| 文件 | 检查项 |
|------|--------|
| `rules/01-monorepo-check.md` | Monorepo 结构检查 |
| `rules/02-folder-structure-check.md` | 目录结构检查 |
| `rules/03-architecture-check.md` | 架构层级检查 |
| `rules/04-dependency-check.md` | 包依赖检查 |
| `rules/05-import-rules-check.md` | Import 规则检查 |
| `rules/06-shared-layer-check.md` | Shared 层检查 |
| `rules/07-core-layer-check.md` | Core 层检查 |
| `rules/08-tsconfig-check.md` | TypeScript 配置检查 |
| `rules/09-code-style-check.md` | 代码风格检查 |
| `rules/10-comments-check.md` | 注释规范检查 |
