你是 Vxture 平台的高级 TypeScript 架构师。请对 @vxture/core-config 包进行全面检查。

## 检查范围

### 0. 目录文件完整性检查
在开始详细检查前，先进行基线完整性检查：

- [ ] **文件齐备性检查**
  - 确认以下核心文件必须存在：
    - `src/schemas/app.schema.ts`
    - `src/schemas/database.schema.ts`
    - `src/schemas/redis.schema.ts`
    - `src/schemas/auth.schema.ts`
    - `src/schemas/ai.schema.ts`
    - `src/schemas/index.ts`
    - `src/types/config.types.ts`
    - `src/types/index.ts`
    - `src/module/config.module.ts`
    - `src/module/index.ts`
    - `src/service/config.service.ts`
    - `src/service/index.ts`
    - `src/utils/object.utils.ts`
    - `src/utils/index.ts`
    - `src/index.ts`
    - `package.json`
    - `tsconfig.json`
    - `tsup.config.ts`
    - `CLAUDE.md`
    - `CHECKALL.md`（本文档）

- [ ] **命名规范性检查**
  - 所有 schema 文件以 `.schema.ts` 结尾
  - 所有类型文件以 `.types.ts` 结尾
  - 所有工具文件以 `.utils.ts` 结尾
  - 目录名使用小写复数形式（schemas、types、module、service、utils）
  - 文件名使用 kebab-case（如 `object.utils.ts`）

- [ ] **目录结构检查**
  ```
  src/
  ├── schemas/          # Zod schemas
  ├── types/            # TypeScript 类型定义
  ├── module/           # NestJS 模块
  ├── service/          # NestJS 服务
  ├── utils/            # 纯工具函数（无副作用）
  └── index.ts          # 公共入口
  ```

- [ ] **无意外文件检查**
  - 确认没有 `.spec.ts` / `.test.ts` 测试文件混入 src（应在根目录或 tests/）
  - 确认没有临时文件（`.tmp`、`.backup`、`.old`）
  - 确认没有 `.DS_Store`、`Thumbs.db` 等系统文件

### 1. 详细文件检查

请逐一检查以下文件：
- src/schemas/app.schema.ts
- src/schemas/database.schema.ts
- src/schemas/redis.schema.ts
- src/schemas/auth.schema.ts
- src/schemas/ai.schema.ts
- src/schemas/index.ts
- src/types/config.types.ts
- src/types/index.ts
- src/module/config.module.ts
- src/module/index.ts
- src/service/config.service.ts
- src/service/index.ts
- src/utils/object.utils.ts
- src/utils/index.ts
- src/index.ts
- package.json
- tsconfig.json
- tsup.config.ts
- CLAUDE.md

## 检查维度

### 1. TypeScript 正确性
- 严格模式合规（无 any、无 @ts-ignore）
- import type 用于纯类型导入
- export type 用于类型导出
- 所有公共 API 有明确类型签名
- enum 是否用 as const 替代

### 2. 架构边界
- 是否引入了禁止的依赖（service-*、bff-*、ai-sdk、design-system、platform-*）
- 是否有浏览器 API（localStorage、window、document）
- 是否有运行时可变配置（set/remove/clear）
- 是否有事件系统或订阅机制
- core-config 唯一运行时依赖只能是 zod
- **utils 目录检查**：
  - utils 目录下只能是纯函数、无副作用的工具
  - 不能引入 NestJS 相关装饰器或依赖注入
  - 不能读取 process.env（那是 schema 的职责）
  - 工具函数必须可独立测试，不依赖 NestJS 上下文

### 3. NestJS 模块设计
- VxConfigModule.register() 是否正确实现 DynamicModule
- @Global() 装饰器是否正确使用
- CONFIG_TOKEN 是否使用 Symbol 避免冲突
- VxConfigService 中 @Optional() 注入是否正确
- assertLoaded 保护是否覆盖所有 getter
- process.exit(1) 的 strict 模式是否正确触发

### 4. Zod Schema 质量
- 每个 schema 是否覆盖了对应域的所有必要环境变量
- z.coerce 是否正确用于需要类型转换的字段（如 PORT）
- 默认值是否合理（生产安全）
- 错误信息是否清晰（.min(32, '...')）
- DATABASE_URL 与分项参数的互斥逻辑是否正确

### 5. 导出结构
- src/index.ts 是否是唯一公共入口
- 各子目录 index.ts 是否正确聚合
- value export 和 type export 是否分开
- 是否有循环依赖风险
- 任何跨目录的导入，必须且只能从目标目录的 index.ts 导入，禁止跳过 index.ts 直接引用内部文件

### 6. 构建配置
- tsconfig.json extends 路径是否正确（../../../tsconfig.base.json）
- experimentalDecorators 和 emitDecoratorMetadata 是否开启
- tsup.config.ts 是否输出 cjs + esm 双格式
- package.json exports 字段是否正确配置

### 7. 文件头注释规范
- 每个源文件是否包含符合规范的文件头注释
- Simple Style 格式是否正确（适用于 core-config 包）：
  ```
  /**
   * {filename} - {简短描述}
   * @package @vxture/core-config
   * @description {可选，详细描述}
   */
  ```
- 是否使用中文注释
- 超过 80 行的文件是否有分区注释（`// ========== {分区名} ==========`）

### 8. 可扩展性
- 新增配置域是否只需要改 4 个地方（schema + types + module + service + index）
- CLAUDE.md 中的新增域标准流程是否准确
- 新增工具函数是否只需在 `src/utils/` 新增文件并在 `src/utils/index.ts` 导出
- utils 函数是否遵循纯函数原则（无副作用、可测试）

## 输出格式

对每个问题按以下格式报告：

**[严重程度]** 文件路径 → 问题描述
- 严重：必须修复，影响运行
- 警告：建议修复，影响质量
- 建议：可选优化

最后给出：
1. 必须修复的问题清单
2. 整体评分（满分 10 分）
3. 是否可以进入下一个包的开发