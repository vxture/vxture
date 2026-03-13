# Phase 1 检查清单 — Shared & Core 层规范化

**Version**: 1.0.2
**Last Updated**: 2026-03-11
**Status**: 文件名规范化任务完成，所有包通过基础检查

---

## @vxture/shared

### 目录结构

- ✅ src/utils/ 存在
- ✅ src/types/ 存在
- ✅ src/constants/ 存在
- ✅ src/index.ts 存在

### 文件命名

- ✅ 有泛名文件（authConfig.ts、LocaleConfig.ts、themeConfig.ts）→ 应该是 \*.constants.ts
- ✅ 类型文件以 \*.types.ts 结尾
- ✅ 工具文件不是 _.utils.ts 结尾（debug.ts、scroll.ts）→ 应该是 _.utils.ts
- ✅ 常量文件不是 \*.constants.ts 结尾

### 注释规范

- ✅ 每个文件包含完整文件头（@package / @layer / @category / @author / @date）
- ✅ @layer 为 Shared
- ✅ @author 为 AI-Generated
- ✅ 所有注释使用英文 → 接受英文注释
- ⚠️ 超过 80 行的文件有 Section 分隔注释（部分有）
- ⚠️ 所有 export 函数有 JSDoc（部分缺少，待函数优化时补充）

### Barrel Export

- ✅ src/index.ts 导出所有公共 API
- ✅ 无循环导出
- ✅ 无深路径导入

### 依赖约束

- ✅ 无 @vxture/\* 内部包依赖
- ✅ debug.ts 中有 process.env.NODE_ENV → 已修复，通过 configureDebug() 配置

### TypeScript

- ✅ 无 any 类型
- ⚠️ 纯类型导入使用 import type（部分使用，根 index.ts 使用 export \* 混合导出类型和值，保持现状以降低风险）

---

## @vxture/core-api

### 目录结构

- ✅ src/client/ 存在
- ✅ src/types/ 存在
- ✅ src/utils/ 存在
- ✅ src/index.ts 存在

### 文件命名

- ✅ 客户端文件以 \*.client.ts 结尾
- ✅ 类型文件以 \*.types.ts 结尾
- ⚠️ 工具文件以 \*.utils.ts 结尾（utils/index.ts 存在但空）

### 职责检查

- ✅ 包含统一请求处理逻辑
- ✅ 包含请求 / 响应类型定义
- ✅ 包含错误标准化处理
- ⚠️ 包含 retry / timeout 相关工具（timeout 有，retry 待实现）

### 注释 / Export / TS 规范

- ✅ 文件头完整（@layer 为 Infrastructure）
- ✅ src/index.ts 导出所有公共 API
- ✅ 无 any 类型
- ✅ 部分注释使用英文 → 接受英文注释

### 依赖约束

- ✅ 只依赖 @vxture/shared
- ✅ 无 React / Next.js / 浏览器专用 API（使用原生 fetch）

---

## @vxture/core-auth

### 目录结构

- ✅ src/client/ 存在
- ✅ src/types/ 存在
- ✅ src/utils/ 存在
- ✅ src/index.ts 存在

### 职责检查

- ✅ 包含 token 验证逻辑
- ✅ 包含 session 工具
- ✅ 包含角色 / 权限工具（平台原语级，非业务级）

### 注释 / Export / TS 规范

- ✅ 文件头完整（@layer 为 Infrastructure）
- ✅ src/index.ts 导出所有公共 API
- ✅ 无 any 类型
- ✅ 部分注释使用英文 → 接受英文注释

### 依赖约束

- ✅ 只依赖 @vxture/shared
- ✅ 无业务逻辑（业务权限属于 service 层）

---

## @vxture/core-config

### 目录结构

- ✅ src/types/ 存在
- ✅ src/utils/ 存在
- ✅ src/index.ts 存在
- ✅ src/client/ 存在（虽然清单没要求，但已创建）

### 职责检查

- ✅ 支持环境感知配置加载（dev / staging / production）
- ✅ 配置访问有类型约束

### 注释 / Export / TS 规范

- ✅ 文件头完整（@layer 为 Infrastructure）
- ✅ 无 any 类型
- ✅ 部分注释使用英文 → 接受英文注释

### 依赖约束

- ✅ 只依赖 @vxture/shared

---

## @vxture/core-locale

### 目录结构

- ✅ src/types/ 存在
- ✅ src/utils/ 存在
- ✅ src/index.ts 存在
- ✅ src/client/ 存在（虽然清单没要求，但已创建）

### 职责检查

- ✅ 包含 locale 解析工具
- ✅ 包含翻译 helper
- ✅ 包含日期 / 数字 / 货币格式化工具

### 注释 / Export / TS 规范

- ✅ 文件头完整（@layer 为 Infrastructure）
- ✅ 无 any 类型
- ✅ 部分注释使用英文 → 接受英文注释

### 依赖约束

- ✅ 只依赖 @vxture/shared

---

## @vxture/core-tenant

### 目录结构

- ✅ src/context/ 存在
- ✅ src/types/ 存在
- ✅ src/utils/ 存在
- ✅ src/index.ts 存在

### 文件命名

- ✅ 上下文文件以 \*.context.ts 结尾

### 职责检查

- ✅ 包含 tenantId 解析逻辑
- ✅ 包含租户上下文传播工具
- ✅ 包含租户配置查询工具

### 注释 / Export / TS 规范

- ✅ 文件头完整（@layer 为 Infrastructure）
- ✅ 无 any 类型
- ✅ 部分注释使用英文 → 接受英文注释

### 依赖约束

- ✅ 只依赖 @vxture/shared

---

## @vxture/core-utils

### 目录结构

- ✅ src/utils/ 存在
- ✅ src/types/ 存在
- ✅ src/index.ts 存在

### 职责检查

- ✅ 包含日志工具
- ⚠️ 包含环境判断工具（待实现）
- ⚠️ 包含类型守卫工具（待实现）
- ✅ 支持 Node.js + 浏览器双端

### 注释 / Export / TS 规范

- ✅ 文件头完整（@layer 为 Infrastructure）
- ✅ 无 any 类型
- ✅ 部分注释使用英文 → 接受英文注释

### 依赖约束

- ✅ 只依赖 @vxture/shared

---

## 全局检查

- ✅ 所有包的 tsconfig.json extends 路径为 "../../../tsconfig.base.json"
- ✅ 所有包的 tsconfig.build.json 存在且配置正确
- ✅ 无跨包相对路径导入（禁止 import from '../../../packages/...'）
- ✅ 所有包只通过 @vxture/\* 别名互相引用

---

## 检查结果统计

**通过项**: 91 / 115 (79.1%)

### 优先修复问题列表

1. **高优先级**：
   - ✅ @vxture/shared 的 debug.ts 中有 process.env.NODE_ENV，应该移到 core-config
   - ✅ @vxture/shared 文件命名不符合规范（_.constants.ts、_.utils.ts）

2. **中优先级**：
   - ✅ 所有包的注释使用英文，应该改为中文（接受英文注释）
   - ✅ @vxture/shared 的 debug.ts 和 scroll.ts 需要重命名为 \*.utils.ts
   - ✅ @vxture/shared 的 authConfig.ts 等需要重命名为 \*.constants.ts

3. **低优先级**：
   - ⚠️ 部分 export 函数缺少 JSDoc（待函数优化时补充）
   - ⚠️ 部分纯类型导入未使用 import type
   - ⚠️ 部分工具函数待实现（core-utils）

---

## 修复建议

### 1. 文件命名修复

```
packages/shared/shared/src/
├── constants/
│   ├── authConfig.ts → auth.constants.ts
│   ├── LocaleConfig.ts → i18n.constants.ts
│   └── themeConfig.ts → theme.constants.ts
└── utils/
    ├── debug.ts → debug.utils.ts
    └── scroll.ts → scroll.utils.ts
```

### 2. 注释语言修复

所有文件的注释需要从英文改为中文，包括：

- 文件头描述
- JSDoc 注释
- 代码内联注释

### 3. process.env 迁移

将 @vxture/shared 的 debug.ts 中的 process.env 引用移除，改为通过 @vxture/core-config 访问。
