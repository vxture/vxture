# CLAUDE.md — packages/shared (@vxture/shared)

> 继承根 `CLAUDE.md` 全部规则。本文件只记录 Shared 层专属约束。

---

## 层定位

**@layer**: `Shared`
**包名**: `@vxture/shared`
**变更频率**: Very Slow — 修改此层影响全平台，需极其谨慎

Shared 层是整个平台的**最底层依赖**。它只存在纯粹的、与业务无关的内容。

---

## ✅ 允许放入 shared 的内容

| 类型 | 示例 |
|------|------|
| 纯工具函数 | `formatDate`, `deepClone`, `safeJsonParse` |
| TypeScript 类型 / 接口 | `Nullable<T>`, `Pagination<T>`, `ApiResponse<T>` |
| 平台级常量 | `HTTP_STATUS`, `LOCALE_CODES`, `DATE_FORMATS` |
| 枚举 | `EStatus`, `ELocale` |
| 类型守卫 | `isString()`, `isNonNullable()` |

---

## ❌ 禁止放入 shared 的内容

- 任何业务逻辑（用户、账单、订阅、租户处理等）
- 任何对 `@vxture/core-*`、`service-*`、`ai-sdk` 的引用
- 任何 React 组件或 UI 相关代码
- 任何副作用（网络请求、定时器、文件操作）
- 环境相关代码（`process.env` 只允许在 `core-config` 中）

---

## 📁 文件结构规范

```
packages/shared/
├── src/
│   ├── types/          # 类型定义，按领域分文件
│   ├── constants/      # 常量，按领域分文件
│   ├── utils/          # 工具函数，按功能分文件
│   └── index.ts        # 统一导出入口
├── package.json
└── tsconfig.json
```

每个子目录有自己的 `index.ts`，根 `index.ts` 汇总导出。

---

## 依赖约束

```
@vxture/shared
  ✅ → 第三方纯工具库（lodash、dayjs、zod 等）
  ❌ → 所有内部 @vxture/* 包
```

---

## 新增内容检查清单

在向 shared 添加任何内容前，自问：
- [ ] 这个工具 / 类型 / 常量是否**与业务完全无关**？
- [ ] 是否有 2 个以上不同层的包需要它？
- [ ] 是否可以用已有的第三方库替代（避免重复造轮子）？
- [ ] 添加后是否会导致 shared 包体积显著增大？

如果任何一项答案不理想，考虑放到更合适的层。