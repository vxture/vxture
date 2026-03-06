Read Vxture package boundaries and dependency graph from:

- docs/architecture/package-graph.json
- docs/architecture/package-graph.mmd

When generating code:

- Respect all layer boundaries
- Only import allowed dependencies
- Shared layer must remain domain-agnostic
- Services must remain isolated
- Portal/business apps must call services via platform-sdk

Task:

---

Read all docs under docs/ai/ and docs/architecture/
Follow package boundaries from package-graph.json
Follow coding style from claude-code-style.md
Follow AI coding rules from ai-coding-rules.md

---

我们之间不要过多废话，我自己不写代码，所以我没有要求的时候，你不要给我说怎么做。
我进一步提出明确要求。希望理解我的诉求。
---- 下面时上次的 ai prompt ---
Read all Vxture architecture docs under:

- docs/architecture/shared-layer.md
- docs/architecture/package-boundaries.md
- docs/architecture/package-graph.json
- docs/ai/claude-code-style.md
- docs/ai/ai-coding-rules.md

Task:

- Generate the Shared Layer package for Vxture Monorepo
- Package name: @vxture/shared
- Integrate previous constants, types, and utils
- Keep pure utilities, TS types, and constants only
- No business logic allowed
- Respect allowed dependencies: only third-party libs
- Forbidden dependencies: core, service, UI/Portal
- Use TypeScript composite configuration, path alias: @vxture/shared/\*
- Generate index.ts for unified exports
- Provide example imports for Core, Service, Platform SDK layers
- Follow Claude code style, TS best practices, modular clean code

Output:

- Full directory structure with files
- TypeScript content for each file
- Example usage import statements
- Ensure AI code can be copy-paste directly into packages/shared/src

针对下面三条补充aiprompt，让ai更好的编码1.我们给ai传递的docs，应该已经约束了包的边界，为什么ai会超出，优化 ai prompt 2. 我们的定位时ai完成shared重构即可，但是ai 会build all，导致胡乱区修改其他包，优化3. 注释不统一，我提供一个注释规范，你让ai遵循。claude-code-comments.md 4. prompt提到了ai-coding-rules.md，但docs没有这个文档，有ai-context.md

---

下面是我docs 的全部文档，请记住正确名称，不要搞错。
d:\MyWebSite\vxture\docs\

├── ai/ # AI 相关文档
│ ├── ai-context.md # AI 上下文说明
│ ├── ai-template.md # AI 模板文档
│ └── claude-code-style.md # Claude Code 风格指南
├── standards/ # 空
└── architecture/ # 架构设计文档
├── monorepo.md # Monorepo 架构详细说明
├── typescript.md # TypeScript 架构说明
├── shared-layer.md # 共享层架构说明
├── service-layer.md # 服务层架构说明
├── design-system.md # 设计系统说明
├── ai-coding-rules.md # AI 编码规则
├── package-boundaries.md # 包边界说明
├── package-graph.json # 包依赖图 JSON
└── package-graph.mmd # 包依赖图 Mermaid 图表
