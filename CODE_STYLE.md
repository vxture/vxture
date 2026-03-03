# Claude 代码规范指南

> 本文档记录 Claude 在优化代码时遵循的规范和最佳实践

## 📋 目录

- [文件头部注释](#文件头部注释)
- [代码结构组织](#代码结构组织)
- [接口和类型定义](#接口和类型定义)
- [函数排序](#函数排序)
- [SonarQube 问题修复](#sonarqube-问题修复)

---

## 文件头部注释

### 完整头部注释（推荐）

适用于核心业务文件、Hooks、组件：

```typescript
/**
 * 文件名.tsx - 简短描述
 *
 * 功能：详细描述文件的功能和职责
 *
 * @author Stone Smoker
 * @created 2024-06-01
 * @lastModified 2026-03-03
 * @version 2.0.0
 * @copyright Copyright (c) 2024-2026 Vxture Team
 * @license MIT
 *
 * @layer Presentation
 * @category Components - Common
 */
```

### 简化头部注释

适用于简单组件、工具函数：

```typescript
/**
 * 文件名.tsx - 简短描述
 *
 * @copyright Vxture Team
 * @license MIT
 */
```

---

## 代码结构组织

### 分区注释

使用统一的分区注释格式：

```typescript
// ============================================================================
// 类型定义
// ============================================================================

// ... 类型定义代码 ...

// ============================================================================
// 常量定义
// ============================================================================

// ... 常量定义代码 ...

// ============================================================================
// Hook/组件实现
// ============================================================================

// ... 主要代码 ...
```

### 内部分区

在 Hook 或组件内部使用：

```typescript
export function useExampleHook() {
  // ==========================================================================
  // 状态初始化
  // ==========================================================================
  // ... 状态代码 ...
  // ==========================================================================
  // Props 解构
  // ==========================================================================
  // ... Props 代码 ...
  // ==========================================================================
  // 计算属性
  // ==========================================================================
  // ... 计算属性代码 ...
  // ==========================================================================
  // 事件处理
  // ==========================================================================
  // ... 事件处理函数 ...
  // ==========================================================================
  // Effects
  // ==========================================================================
  // ... Effects 代码 ...
  // ==========================================================================
  // 渲染/返回
  // ==========================================================================
  // ... 返回代码 ...
}
```

---

## 接口和类型定义

### Props 接口标记为 readonly

```typescript
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
```

### 接口注释

```typescript
/**
 * Props 接口
 */
interface ExampleProps {
  readonly id: string;
  readonly data?: Data;
}
```

---

## 函数排序

### Hook 内部函数排序原则

1. **状态初始化** - `useState`, `useRef` 等
2. **Props 解构** - 解构传入的 props
3. **工具函数** - 纯函数、计算函数
4. **事件处理** - 回调函数
5. **Effects** - `useEffect` 按逻辑顺序排列
6. **返回** - 最后的 return 语句

### 示例

```typescript
export function useExample() {
  // 1. 状态初始化
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  // 2. 计算属性/工具函数
  const doubleCount = useMemo(() => count * 2, [count]);

  const formatNumber = (num: number) => num.toFixed(2);

  // 3. 事件处理
  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  // 4. Effects
  useEffect(() => {
    // ...
  }, []);

  // 5. 返回
  return { count, handleClick };
}
```

---

## SonarQube 问题修复

### TypeScript:S6759 - Props 标记为 readonly

**问题**: Mark the props of the component as read-only

**修复**:

```typescript
// ✅
interface ExampleProps {
  readonly text?: string;
  readonly onClick?: () => void;
}
```

---

### TypeScript:S7764 - Prefer `globalThis.window`

**问题**: Prefer `globalThis.window` over `window`

**修复**:

```typescript
// ✅ 推荐
const hasWindow = globalThis?.window !== undefined;

// 使用时
if (hasWindow) {
  (globalThis.window as Window).scrollTo({ top: 0 });
}
```

---

### TypeScript:S3776 - Cognitive Complexity

**问题**: Refactor this function to reduce its Cognitive Complexity

**修复原则**:

1. 提取嵌套逻辑为独立函数
2. 使用早期返回（early return）
3. 减少嵌套层级
4. 使用映射对象替代 switch-case（如适用）

**示例**:

```typescript
// ✅ 重构后
const handleKeyDown = (e: KeyboardEvent) => {
  if (isInputElement(e)) return;
  if (!activeTarget) return;

  const targetIndex = getTargetIndex(e.key);
  if (targetIndex === -1) return;

  e.preventDefault();
  snapToTarget(targets[targetIndex]);
};

// 辅助函数提取
const isInputElement = (e: KeyboardEvent): boolean => {
  const target = e.target as HTMLElement;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
};

const getTargetIndex = (key: string): number => {
  switch (key) {
    case 'PageDown':
      return currentIndex + 1;
    // ...
  }
};
```

---

### TypeScript:S6582 - Prefer optional chain

**问题**: Prefer using an optional chain expression

**修复**:

```typescript
// ✅ 推荐
const hasWindow = globalThis?.window !== undefined;

// ❌ 避免
const hasWindow = typeof globalThis !== 'undefined' && globalThis.window !== undefined;
```

---

## 架构优化

### 避免 Prop Drilling

**问题**: 通过多层组件传递 props

## 通用原则

1. **职责单一** - 每个组件/函数只做一件事
2. **早期返回** - 减少嵌套层级
3. **提取函数** - 降低认知复杂度
4. **类型安全** - 使用 TypeScript 类型系统
5. **注释清晰** - 注释解释"为什么"而不是"是什么"
6. **一致性** - 保持代码风格一致

---

## 相关文件

- `CLAUDE.md` - 项目说明文档
