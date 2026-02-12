# 目录重构后的引用修复方案

## 🔍 问题分析

目录重构后，很多文件的引用路径需要更新。以下是完整的修复方案。

## 📋 需要修复的引用

### 1. HeroSection.tsx
**错误**: `@/hooks/useScrollSnap`
**正确**: `@/application/hooks/useScrollSnap`

### 2. FeaturesSection.tsx
**错误**: `@/theme/colorMap`
**正确**: `@/shared/theme/colorMap`

### 3. 其他可能的问题
- 检查所有 `@/hooks/*` 引用
- 检查所有 `@/components/*` 引用
- 检查所有 `@/theme/*` 引用
- 检查所有 `@/utils/*` 引用

## 🛠️ 修复步骤

### 步骤 1: 更新 HeroSection.tsx
```typescript
// 修改前
import { useScrollSnap } from "@/hooks/useScrollSnap";

// 修改后
import { useScrollSnap } from "@/application/hooks/useScrollSnap";
```

### 步骤 2: 检查 tsconfig.json 路径别名
确保 `tsconfig.json` 包含正确的路径映射：
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/application/*": ["./src/application/*"],
      "@/domain/*": ["./src/domain/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/Presentation/*": ["./src/Presentation/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

### 步骤 3: 全局搜索替换
需要批量替换的路径模式：

| 旧路径 | 新路径 |
|--------|--------|
| `@/hooks/` | `@/application/hooks/` |
| `@/services/` | `@/application/services/` |
| `@/components/` | `@/Presentation/components/` |
| `@/theme/` | `@/shared/theme/` |
| `@/utils/` | `@/shared/utils/` (如果存在) |

## 🔧 快速修复命令

### 方案 A: 手动修复每个文件
逐个文件检查并更新引用路径。

### 方案 B: 使用批量替换
```bash
# 在 src 目录下批量替换
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/hooks/|@/application/hooks/|g'
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/theme/|@/shared/theme/|g'
```

## 📊 完整的目录结构映射

```
旧结构                  →  新结构
────────────────────────────────────────────
src/
├── hooks/             →  application/hooks/
├── services/          →  application/services/
├── components/        →  Presentation/components/
├── theme/             →  shared/theme/
├── utils/             →  shared/utils/ (已删除)
├── types/             →  domain/shared/types/
└── clients/           →  infrastructure/adapters/
```

## ✅ 验证清单

修复后需要验证：
- [ ] 所有 TypeScript 编译错误消失
- [ ] 开发服务器正常启动
- [ ] 页面可以正常访问
- [ ] 浏览器控制台无错误
- [ ] 所有组件正常渲染

## 🎯 优先修复列表

1. **HeroSection.tsx** - useScrollSnap 引用
2. **FeaturesSection.tsx** - colorMap 引用（已修复）
3. **Header.tsx** - 检查所有引用
4. **Footer.tsx** - 检查所有引用
5. **page.tsx** - 检查所有引用
6. **layout.tsx** - 检查所有引用

## 📝 修复记录

- [x] globals.css - 注释掉已删除的 CSS 文件
- [x] page.tsx - 更新组件导入路径
- [x] layout.tsx - 更新 Header/Footer 路径
- [x] FeaturesSection.tsx - 更新 colorMap 路径
- [ ] HeroSection.tsx - 更新 useScrollSnap 路径
- [ ] 其他文件 - 待检查

---

**修复日期**: 2026-02-12
**状态**: 🔧 进行中
