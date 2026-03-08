# Vxture 门户网站架构一致性分析报告

## 1. 概述

**分析对象**: `portals/website` 包代码
**分析基准**: `/docs/architecture/*` 文档
**分析时间**: 2026-03-09

### 1.1 执行摘要

**外部依赖一致性**: ✅ 通过
- 仅使用了架构允许的内部包：@vxture/design-system 和 @vxture/shared
- 未使用任何禁止的内部包：service-*、core-*、ai-sdk、bff-*、agent-server/

**内部架构一致性**: ⚠️ 存在问题
- 发现重复的架构实现（DDD 架构 + 旧架构并存）
- 实际生产代码使用 DDD 架构，但旧架构代码仍存在于代码库中

**总体评分**: 85/100

---

## 2. 架构一致性检查结果

### 2.1 依赖关系检查

**允许的依赖**: ✓ 通过
**禁止的依赖**: ✓ 通过

#### 2.1.1 外部依赖使用情况

```typescript
// 实际使用的内部包依赖
import { Icon } from '@vxture/design-system';   // 符合要求 ✔
import { debugLog } from '@vxture/shared';      // 符合要求 ✔
import { debugError } from '@vxture/shared';    // 符合要求 ✔
```

**结论**: 仅使用了架构允许的依赖包

#### 2.1.2 禁止的内部包导入检查

```
未发现禁止的内部包导入 ✔
- 无 service-* 包导入
- 无 core-* 包导入
- 无 ai-sdk 包导入
- 无 bff-* 包导入
- 无 agent-server/ 代码导入
```

### 2.2 文件组织架构检查

#### 2.2.1 当前项目结构

```
portals/website/src/
├── app/                          # Next.js 应用路由
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   └── (main)/
├── application/                  # 应用层
│   ├── hooks/
│   │   ├── homepage/
│   │   ├── layout/
│   │   ├── shared/
│   │   └── useContent.ts        # ⚠️ 重复的 Hook
│   └── usecases/
├── domain/                       # 领域层
│   ├── homepage/
│   ├── layout/
│   └── shared/
├── infrastructure/               # 基础设施层
│   ├── adapters/
│   │   ├── json/                # DDD 架构适配器
│   │   ├── auth/
│   │   ├── content/
│   │   ├── i18n/
│   │   └── theme/
│   ├── cache/
│   ├── clients/
│   │   ├── contentClient.ts      # ⚠️ 重复的内容客户端
│   │   └── adapters/
│   │       └── jsonAdapter.ts   # ⚠️ 重复的 JSON 适配器
│   ├── constants/
│   ├── mappers/
│   └── repositories/            # DDD 架构仓储实现
├── presentation/                 # 表示层
│   ├── components/
│   └── providers/
├── shared/                       # 共享代码
└── stores/                       # 状态管理
```

#### 2.2.2 内部架构不一致问题

**发现重复的代码实现和架构模式混用**：

| 位置 | 问题 | 严重程度 |
|-----|-----|---------|
| `infrastructure/clients/` | 存在重复的基础设施层实现，与 `infrastructure/adapters/` 和 `infrastructure/repositories/` 功能重叠 | 🔴 高 |
| `application/hooks/useContent.ts` | 存在重复的 Hook 层，与 `application/hooks/homepage/` 和 `layout/` 功能重叠 | 🟡 中 |
| 代码混用 | 部分组件使用 DDD 架构 Hook，部分使用旧架构 Hook | 🟡 中 |

#### 2.2.2 架构规范对比

| 架构规范位置 | 实际项目位置 | 一致性 | 说明 |
|------------|------------|--------|------|
| `portals/` | `portals/website` | ✔ 一致 | 位于正确的 portals 目录 |
| 前端应用位置 | `src/app/` | ✔ 一致 | 使用 Next.js App Router |
| 应用逻辑层 | `src/application/` | ✔ 一致 | 包含 hooks 和 usecases |
| 领域模型层 | `src/domain/` | ✔ 一致 | 包含聚合根、模型和值对象 |
| 基础设施层 | `src/infrastructure/` | ✔ 一致 | 包含适配器、缓存、客户端等 |
| 表示层 | `src/presentation/` | ✔ 一致 | 包含 UI 组件和提供者 |
| 共享代码 | `src/shared/` | ✔ 一致 | 包含常量、类型和工具 |
| 状态管理 | `src/stores/` | ✔ 一致 | 使用 zustand 进行状态管理 |

### 2.3 架构边界检查

#### 2.3.1 业务逻辑边界

```typescript
// ✓ 领域层无框架依赖 (pure TypeScript)
// ✓ 应用层无直接数据源访问
// ✓ 表示层与领域层分离
// ✓ 基础设施层负责外部系统交互
```

#### 2.3.2 代码分层实现

**领域层实现**:
- `domain/homepage/`: 包含业务逻辑和模型定义
- `domain/shared/valueObjects/`: 领域值对象 (email, locale, slug, theme)
- `domain/shared/exceptions/`: 领域特定异常

**应用层实现**:
- `application/usecases/`: 包含应用层业务逻辑
- `application/hooks/homepage/`: 使用场景特定的 React hooks (DDD 架构)
- `application/hooks/layout/`: 布局相关的 React hooks (DDD 架构)
- `application/hooks/useContent.ts`: 非 DDD 架构的通用 Hook (⚠️ 混用)

**基础设施层实现**:
- `infrastructure/adapters/json/`: DDD 架构的 JSON 文件适配器
- `infrastructure/adapters/content/`: 内容服务适配器
- `infrastructure/repositories/`: DDD 架构的数据访问接口实现
- `infrastructure/clients/contentClient.ts`: 非 DDD 架构的内容客户端 (⚠️ 重复)
- `infrastructure/clients/adapters/jsonAdapter.ts`: 非 DDD 架构的 JSON 适配器 (⚠️ 重复)
- `infrastructure/cache/`: 缓存管理

**表示层实现**:
- `presentation/components/`: React UI 组件
- `presentation/providers/`: React Context 提供者

#### 2.3.3 具体不一致问题详情

**问题 1: 重复的基础设施层实现**

```
DDD 架构实现 (推荐):
  infrastructure/adapters/json/JsonAdapter.ts
  infrastructure/repositories/homepage/HomepageRepository.ts
  infrastructure/repositories/layout/LayoutRepository.ts

旧架构实现 (应废弃):
  infrastructure/clients/adapters/jsonAdapter.ts
  infrastructure/clients/contentClient.ts
```

**问题 2: 重复的应用层 Hook**

```
DDD 架构实现 (推荐):
  application/hooks/homepage/useHero.ts
  application/hooks/homepage/useFeatures.ts
  application/hooks/homepage/useHomepage.ts
  application/hooks/layout/useHeader.ts
  application/hooks/layout/useFooter.ts
  application/hooks/layout/useLayout.ts

旧架构实现 (应废弃):
  application/hooks/useContent.ts
  application/hooks/useMultiContent.ts
```

**问题 3: 实际使用的架构**

好消息是，当前实际使用的是 DDD 架构：
- ✅ `presentation/components/home/HeroSection.tsx` 使用 `useHero()`
- ✅ `presentation/components/home/FeaturesSection.tsx` 使用 `useFeatures()`
- ✅ `presentation/components/home/SolutionSection.tsx` 使用 `useSolutions()`
- ✅ `presentation/components/home/CaseSection.tsx` 使用 `useCasesData()`
- ✅ `presentation/components/home/CTASection.tsx` 使用 `useCTA()`

⚠️ `useContent.ts` 和 `infrastructure/clients/` 目录下的代码仅在示例文件和文档中被引用，未在实际生产组件中使用。

### 2.4 技术栈使用检查

#### 2.4.1 框架和库使用

| 技术 | 使用位置 | 架构一致性 |
|-----|---------|----------|
| Next.js | `src/app/` | ✔ 一致 | 标准的 Next.js 应用 |
| React | 整个项目 | ✔ 一致 | 符合架构要求 |
| TypeScript | 整个项目 | ✔ 一致 | 严格类型检查 |
| zustand | `src/stores/` | ✔ 一致 | 轻量级状态管理 |
| TailwindCSS | 样式 | ✔ 一致 | 现代化 CSS 框架 |

#### 2.4.2 架构禁止的技术

```
未发现架构禁止的技术使用 ✔
```

## 3. 架构一致性评估

### 3.1 优点

1. **依赖关系严格遵守架构规范**：仅使用 @vxture/design-system 和 @vxture/shared 两个允许的内部包
2. **文件组织结构清晰**：分层架构清晰，各层职责明确
3. **领域驱动设计实现**：实现了完整的 DDD 架构模式
4. **业务逻辑与技术实现分离**：领域层完全与技术框架分离
5. **代码质量高**：TypeScript 严格类型检查，无 any 类型

### 3.2 架构不一致问题

#### 3.2.1 内部架构模式混用

**严重程度**: 🔴 高

**问题描述**:
- 项目中存在两种不同的架构模式实现：
  1. **DDD 架构**（推荐，实际在使用）：领域层、应用层、基础设施层、表示层
  2. **旧架构**（应废弃）：contentClient、useContent 等

**具体文件**:
- `infrastructure/clients/` - 整个目录应废弃
- `infrastructure/adapters/content/contentService.ts` - 依赖旧架构的 contentClient
- `application/hooks/useContent.ts` - 应废弃

#### 3.2.2 BFF 层通信方式

**严重程度**: 🟡 中

**问题描述**:
- 目前使用本地 JSON 文件读取，未通过 BFF 层进行 HTTP 通信
- 架构建议：所有后端通信应通过 BFF 层 HTTP 调用

#### 3.2.3 API 边界不明确

**严重程度**: 🟡 中

**问题描述**:
- 目前使用内部方法访问数据，未明确 API 边界
- 架构建议：引入 BFF 层作为数据通信边界

### 3.3 架构一致性评分

```
综合评分: 85/100

一致性维度评分:
- 依赖关系: 100分 (仅使用允许的内部包)
- 文件组织: 75分 (存在重复架构实现)
- 架构边界: 75分 (内部架构混用)
- 技术栈使用: 95分 (符合要求)
- 代码质量: 95分 (TypeScript 严格类型检查)
```

## 4. 结论

**门户网站架构与 Vxture 架构规范基本一致，但存在内部架构混用问题 ⚠️**

网站代码在外部依赖层面严格遵循了架构规范：
- ✅ 正确的依赖导入规则（仅使用 @vxture/design-system 和 @vxture/shared）
- ✅ 没有使用禁止的内部包（service-*、core-*、ai-sdk、bff-*、agent-server/）
- ✅ 清晰的文件组织结构
- ✅ 实际使用的是 DDD 架构（领域层、应用层、基础设施层、表示层）

但存在以下内部架构不一致问题：
- ❌ 存在重复的基础设施层实现（DDD 架构 + 旧架构并存）
- ❌ 存在重复的应用层 Hook（useHomepage 等 + useContent 并存）
- ❌ 未使用 BFF 层进行 HTTP 通信（目前使用本地 JSON 文件）

## 5. 建议

### 5.1 立即执行的清理

1. **删除旧架构代码**：
   - 删除 `infrastructure/clients/` 目录（重复的基础设施层实现）
   - 删除 `application/hooks/useContent.ts`（重复的 Hook）
   - 删除 `infrastructure/adapters/content/contentService.ts`（依赖旧架构）
   - 删除 `presentation/components/examples/ContentUsageExamples.tsx`（使用旧架构的示例）

2. **清理文档**：
   - 更新或删除引用旧架构的文档

### 5.2 中期架构优化

3. **引入 BFF 层**：
   - 创建 `bff/website-bff/` 包（按照架构规范）
   - 将数据访问逻辑迁移到 BFF 层
   - 前端通过 HTTP 调用 BFF API

4. **明确 API 边界**：
   - 定义清晰的 REST API 或 tRPC 接口
   - 建立 API 版本管理机制

### 5.3 长期维护

5. **建立架构一致性检查机制**：
   - 使用 ESLint 规则检查依赖导入
   - 使用架构检查工具自动验证
   - 定期进行架构审查

6. **完善文档**：
   - 补充架构决策记录（ADR）
   - 编写详细的架构使用指南
   - 维护架构演进路线图

---

**报告生成时间**: 2026-03-09
**分析工具**: 手动架构对比分析
**架构基准**: Vxture Platform Architecture v1.0
