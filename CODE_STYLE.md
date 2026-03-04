# CODE_STYLE.md - Vxture 项目代码规范

本文档记录项目开发及 Claude 优化代码时遵循的规范和最佳实践，覆盖前后端编码、目录结构、注释规范、问题修复等全场景，确保代码一致性、可维护性。

一、通用编码原则

1. 可读性优先，清晰 > 简洁 > 聪明

1. 单一职责：一个函数/组件只做一件事

1. 高内聚低耦合，禁止硬编码魔法值

1. 必须添加必要注释，注释解释“为什么”而不是“是什么”，不写无用注释

1. 禁止使用未定义的类型、变量、路径

1. 遵循项目分层架构，禁止跨层调用

1. 早期返回：减少嵌套层级，提升代码可读性

1. 提取函数：复杂逻辑拆分提取，降低认知复杂度

1. 类型安全：充分利用 TypeScript 类型系统，杜绝无约束类型使用

1. 一致性：全项目保持统一的代码风格、命名规范和注释格式

二、前端代码规范（Next.js + React + TypeScript）

1. 基础格式

- 缩进：2 空格

- 行宽：不超过 120 字符

- 文件编码：UTF-8

- 结尾换行：必须保留

- 引号：统一使用单引号 '，JSX 使用双引号 "

1. 命名规范

- 组件：PascalCase 大驼峰

- 例：UserLoginForm.tsx

- 页面文件：kebab-case 短横线

- 例：user-login/page.tsx

- 工具函数、变量、常量：camelCase 小驼峰（静态变量除外）

- 接口/类型：以 I 开头 + PascalCase

- 例：IUserInfo、IAuthToken

- 枚举：以 E 开头 + PascalCase

- 例：EUserStatus、ESubscriptionPlan

1. 静态数据规范（/public/data 目录）

静态数据指存放于项目 /public/data 目录下、固定不变、可直接读取的静态资源文件（如JSON配置、静态列表、模板数据等），严格遵循以下规范，与代码内静态变量区分管理：

- 文件命名：kebab-case 短横线命名，后缀统一（JSON文件用 .json，CSV文件用 .csv），语义清晰

- 正确：user-role-list.json、subscription-plan-template.json

- 错误：data1.json、roleList.json、plan.txt

- 目录划分：按业务模块拆分子目录，禁止根目录直接存放大量文件

- 例：/public/data/user/ 存放用户相关静态数据，/public/data/system/ 存放系统配置静态数据

- 文件格式：统一使用UTF-8编码，JSON文件需格式化（缩进2空格），保证可读性，禁止语法错误

- 示例：JSON文件需符合规范结构，避免多余逗号、语法缺失

- 读取规范：前端读取时直接使用Next.js公共目录路径（/data/xxx/xxx.json），禁止硬编码完整路径

- 正确：fetch('/data/user/user-role-list.json')

- 错误：fetch(`http://localhost:3000/data/user/user-role-list.json`)

- 内容约束：仅存放静态、不变的数据，禁止存放动态数据、敏感信息（如密钥、用户隐私数据）

- 维护规范：静态数据文件修改后，需同步检查所有引用该文件的业务模块，确保适配；新增文件需同步更新目录说明

- 复用原则：同一静态数据被多个模块引用时，统一存放于对应业务子目录；仅单个模块使用的，可按模块划分存放，避免冗余

1. 静态变量规范

静态变量指项目中固定不变、可复用的常量（如接口地址、状态映射、配置参数等），严格遵循以下规范：

- 命名：全大写 + 下划线（UPPER_SNAKE_CASE），明确语义，禁止模糊命名

- 正确：API_BASE_URL、USER_STATUS_ACTIVE、PAGE_SIZE

- 错误：URL、STATUS1、NUM

- 存放位置：统一放在 shared/constants/ 目录下，按模块拆分文件（如 api.ts、user.ts、system.ts）

- 例：shared/constants/api.ts 存放接口相关静态变量，shared/constants/user.ts 存放用户相关静态变量

- 类型约束：必须结合 TypeScript 类型定义，禁止无类型约束的静态变量

- 例：export const API_BASE_URL: string = `http://localhost:8000/api`;

- 使用要求：禁止硬编码静态值，所有固定值必须引用对应静态变量

- 正确：axios.get(`${API_BASE_URL}/user/list`)

- 错误：axios.get(`http://localhost:8000/api/user/list`)

- 复用原则：同一静态变量被2个及以上模块使用时，必须抽离到 shared/constants/ 目录；仅单个模块使用的，可在模块内顶部定义（仍遵循命名规范）

- 禁止修改：静态变量一旦定义，禁止在业务逻辑中修改其值，如需调整，统一在 constants 目录对应文件中修改，并同步相关引用模块

1. 文件规范

- 组件文件：一个组件一个文件

- 类型文件：统一存放 types/ 目录

- 工具函数：按模块拆分，禁止超大文件

- 图片/静态资源：kebab-case 命名

1. 文件头部注释规范

所有前端文件（组件、Hooks、工具函数、类型文件等）需添加头部注释，根据文件重要性选择完整注释或简化注释，格式统一。

## 完整头部注释（推荐）

适用于核心业务文件、Hooks、公共组件：

/\*\*

- 文件名.tsx - 简短描述（如：用户登录组件）

*

- 功能：详细描述文件的功能和职责（如：负责用户登录表单渲染、表单验证、登录接口调用）

*

- @author Stone Smoker
- @created 2024-06-01
- @lastModified 2026-03-03
- @version 2.0.0
- @copyright Copyright (c) 2024-2026 Vxture Team
- @license MIT

*

- @layer Presentation // 对应架构分层（Presentation/Application/Domain/Infrastructure）
- @category Components - Common // 分类（如：Components - Common/Components - User、Hooks、Utils）
  \*/

## 简化头部注释

适用于简单组件、工具函数、辅助文件：

/\*\*

- 文件名.tsx - 简短描述（如：日期格式化工具）

*

- @copyright Vxture Team
- @license MIT
  \*/

1. 代码结构组织规范

### 分区注释

文件内部需使用统一的分区注释格式，按逻辑划分代码块，提升可读性：

// ============================================================================
// 类型定义
// ============================================================================

// ... 类型定义代码（接口、枚举等） ...

// ============================================================================
// 常量定义
// ============================================================================

// ... 常量、静态变量定义代码 ...

// ============================================================================
// Hook/组件实现
// ============================================================================

// ... 主要业务代码 ...

### 内部分区

在 Hook 或组件内部，按逻辑顺序使用分区注释，统一代码结构：

export function useExampleHook() {
// ==========================================================================
// 状态初始化
// ==========================================================================
// ... 状态代码（useState、useRef 等） ...

// ==========================================================================
// Props 解构
// ==========================================================================
// ... Props 解构、校验代码 ...

// ==========================================================================
// 计算属性/工具函数
// ==========================================================================
// ... 计算属性（useMemo）、工具函数定义 ...

// ==========================================================================
// 事件处理
// ==========================================================================
// ... 事件处理函数（useCallback 包裹） ...

// ==========================================================================
// Effects
// ==========================================================================
// ... useEffect 代码（按逻辑顺序排列） ...

// ==========================================================================
// 渲染/返回
// ==========================================================================
// ... 返回值、渲染相关代码 ...
}

1. 接口和类型定义规范

#### Props 接口标记为 readonly

组件 Props 接口的所有属性必须标记为 readonly，避免意外修改，符合 SonarQube 规范：

// ✅ 推荐
interface ComponentProps {
readonly text?: string;
readonly onClick?: () => void;
readonly className?: string;
}

// ❌ 避免
interface ComponentProps {
text?: string;
onClick?: () => void;
className?: string;
}

#### 接口注释

所有接口（Props、数据模型等）需添加清晰注释，说明接口用途：

/\*_ -示例组件 Props 接口 -用于接收组件所需的外部参数
_/
interface ExampleProps {
readonly id: string; // 组件唯一标识
readonly data?: IData; // 组件渲染所需数据
}

1. 函数排序规范

#### Hook 内部函数排序原则（按以下顺序排列）

1. 状态初始化：useState、useRef 等状态相关代码

1. Props 解构：解构传入的 props、props 校验

1. 计算属性/工具函数：useMemo 计算属性、组件内部工具函数

1. 事件处理：回调函数（优先使用 useCallback 包裹）

1. Effects：useEffect 代码（按业务逻辑优先级排列）

1. 返回：最后的 return 语句或渲染逻辑

#### 示例

export function useExample() {
// 1. 状态初始化
const [count, setCount] = useState(0);
const ref = useRef(null);

// 2. 计算属性/工具函数
const doubleCount = useMemo(() => count - 2, [count]);

const formatNumber = (num: number) => num.toFixed(2);

// 3. 事件处理
const handleClick = useCallback(() => {
setCount((c) => c + 1);
}, []);

// 4. Effects
useEffect(() => {
// ... 副作用逻辑 ...
}, []);

// 5. 返回
return { count, handleClick };
}

1. React 规范

- 只使用函数组件 + Hooks

- 禁止使用 class 组件

- Props 必须定义接口，禁止 any 类型

- 状态提升合理，避免过度 props drilling（可通过 Zustand 或 Context 优化）

- 服务端组件 / 客户端组件明确区分

- 客户端组件必须添加 'use client'

1. TypeScript 规范

- 禁止使用 any、unknown 无约束使用

- 必须开启严格类型校验

- 接口优先于 type 定义对象结构

- 类型复用优先使用泛型

- 禁止隐式 any

- 优先使用可选链（?.）简化判断逻辑（符合 SonarQube 规范）

1. TailwindCSS 规范

- 只使用 TailwindCSS 4，禁止原生 CSS

- 类名按逻辑排序：布局 → 尺寸 → 边框 → 文字 → 交互

- 复用样式使用工具类组合，禁止重复代码

- 禁止内联样式

1. Icon 使用规范

- **禁止直接使用任何外部图标库**，所有图标必须通过 `@vxture/design-system` 提供的 `<Icon>` 组件使用
- 底层图标库使用 Phosphor Icons（@phosphor-icons/react），但只能通过设计系统访问
- 禁止直接导入外部图标库

#### 示例代码（可直接复用）

客户端组件中使用 @vxture/design-system 的 Icon 组件，结合 TailwindCSS 调整样式，符合项目规范：

```typescript
// use client
/**
 * IconButton.tsx - 图标按钮组件
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Components - Common
 */

// ============================================================================
// 类型定义
// ============================================================================
interface IconButtonProps {
  readonly icon: 'user' | 'settings' | 'search';
  readonly onClick: () => void;
  readonly className?: string;
}

// ============================================================================
// 常量定义
// ============================================================================
import { Icon } from '@vxture/design-system';

// ============================================================================
// 组件实现
// ============================================================================
export const IconButton = ({ icon, onClick, className }: IconButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 ${className}`}
      aria-label={`${icon} button`}
    >
      <Icon name={icon} className="w-5 h-5" />
    </button>
  );
};

// 使用示例
// const App = () => {
//   return (
//     <>
//       <IconButton icon="user" onClick={() => console.log('用户中心')} />
//       <IconButton icon="settings" onClick={() => console.log('设置')} />
//       <IconButton icon="search" onClick={() => console.log('搜索')} />
//     </>
//   );
// };
```

示例说明：使用 @vxture/design-system 的 Icon 组件，结合组件封装复用，样式统一使用 TailwindCSS，符合项目所有编码规范。

1. 状态管理（Zustand）

- 按模块拆分 store

- 命名规则：useXxxStore

- 禁止在 store 中存放非状态数据

- 状态更新必须通过 action

1. SonarQube 问题修复规范

#### TypeScript:S6759 - Props 标记为 readonly

**问题**: Mark the props of the component as read-only

**修复**: 组件 Props 接口所有属性添加 readonly 修饰符（详见 1. 接口和类型定义规范）

// ✅ 推荐
interface ExampleProps {
readonly text?: string;
readonly onClick?: () => void;
}

#### TypeScript:S7764 - Prefer `globalThis.window`

**问题**: Prefer `globalThis.window` over `window`

**修复**: 使用 globalThis.window 替代直接使用 window，提升兼容性和规范度

// ✅ 推荐
const hasWindow = globalThis?.window !== undefined;

// 使用时
if (hasWindow) {
(globalThis.window as Window).scrollTo({ top: 0 });
}

#### TypeScript:S3776 - Cognitive Complexity

**问题**: Refactor this function to reduce its Cognitive Complexity（函数认知复杂度过高）

**修复原则**:

1. 提取嵌套逻辑为独立函数

1. 使用早期返回（early return）减少嵌套层级

1. 减少嵌套层级（避免超过3层嵌套）

1. 使用映射对象替代 switch-case（如适用）

**示例**:

// ✅ 重构后
const handleKeyDown = (e: KeyboardEvent) => {
if (isInputElement(e)) return;
if (!activeTarget) return;

const targetIndex = getTargetIndex(e.key);
if (targetIndex === -1) return;

e.preventDefault();
snapToTarget(targets[targetIndex]);
};

// 辅助函数提取（降低认知复杂度）
const isInputElement = (e: KeyboardEvent): boolean => {
const target = e.target as HTMLElement;
return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
};

const getTargetIndex = (key: string): number => {
switch (key) {
case 'PageDown':
return currentIndex + 1;
// ... 其他case ...
default:
return -1;
}
};

#### TypeScript:S6582 - Prefer optional chain

**问题**: Prefer using an optional chain expression（优先使用可选链表达式）

**修复**: 使用可选链（?.）替代繁琐的存在性判断，简化代码

// ✅ 推荐
const hasWindow = globalThis?.window !== undefined;
const userName = user?.info?.name || '未知用户';

// ❌ 避免
const hasWindow = typeof globalThis !== 'undefined' && globalThis.window !== undefined;
const userName = user && user.info && user.info.name ? user.info.name : '未知用户';

1. 架构优化规范

#### 避免 Prop Drilling

**问题**: 通过多层组件传递 props，导致代码冗余、维护困难

**优化方案**:

1. 简单场景：使用 Context 传递公共数据

1. 复杂场景：使用 Zustand 状态管理，统一管理全局/模块级数据

1. 局部场景：组件组合、插槽（Slot）传递，减少 props 层级

三、后端代码规范（FastAPI + Python 3.13）

1. 基础格式

- 缩进：4 空格

- 行宽：不超过 120 字符

- 严格遵循 PEP8 规范

- 引号：统一使用单引号 '

1. 命名规范

- 函数/变量：snake_case 下划线

- 类名：PascalCase 大驼峰

- 常量：全大写 + 下划线

- 路由名称：kebab-case

1. 接口规范

- 所有接口必须定义请求/响应模型

- 接口路径使用小写 + 短横线

- 统一状态码与返回结构

- 必须添加接口描述、参数说明

- 权限校验统一处理

1. 注释规范

- 函数必须写 docstring 说明，明确功能、参数、返回值

- 复杂业务逻辑必须写行注释

- 接口参数、返回值必须说明

1. 架构规范

- 路由层 → 服务层 → 数据层

- 禁止在路由中写业务逻辑

- 数据库操作统一封装

- 异常统一捕获与返回

四、目录与结构规范

前端（packages/web/src）

- app/ 路由页面（App Router）

- presentation/ UI 组件、页面

- application/ 业务逻辑、用例

- domain/ 业务模型、规则

- infrastructure/ API、存储、外部服务

- stores/ 状态管理

- shared/ 工具、常量、类型（含 constants 静态变量目录）

- public/data/ 静态数据文件（按业务模块划分，存放JSON等静态资源）

后端（packages/api）

- app/main.py 入口

- app/routes/ 路由

- app/services/ 业务服务

- app/models/ 数据模型

- app/schemas/ 请求/响应体

- app/core/ 配置、中间件

- app/utils/ 工具函数

五、Git 提交规范

格式：type: 描述

- feat: 新功能

- fix: 修复问题

- refactor: 重构

- docs: 文档

- style: 格式

- test: 测试

- chore: 构建/工具

六、代码检查要求

- 前端：pnpm lint、pnpm type-check

- 后端：flake8、mypy

- 所有代码必须通过检查才能提交

- 测试覆盖率 > 80%

七、相关文件

- `CLAUDE.md` - 项目说明文档、Claude 协作规范
