# 图片资源目录说明

## 目录结构

```
packages/web/public/images/
├── cases/          # 案例展示图片
├── features/       # 功能特性图片
├── products/       # 产品展示图片
└── icons/          # 图标文件
```

## 使用方式

### 1. 案例图片 (Case Section)

- **路径**: `public/images/cases/`
- **命名**: `case-smart-city.jpg`, `case-finance.jpg`, `case-supply-chain.jpg`
- **尺寸**: 推荐 400x250px 或 800x500px (2倍图)
- **格式**: JPG/PNG/WebP

**在代码中使用**:

```tsx
image: "/images/cases/case-smart-city.jpg";
```

### 2. 功能特性图片 (Features Section)

- **路径**: `public/images/features/`
- **命名**: `feature-data-graph.png`, `feature-ai-scheduling.png`, `feature-simulation.png`
- **尺寸**: 推荐 600x400px
- **格式**: PNG (支持透明背景)

### 3. 产品展示图片 (Product Section)

- **路径**: `public/images/products/`
- **命名**: `product-platform.jpg`, `product-dashboard.jpg`
- **尺寸**: 推荐 800x600px
- **格式**: JPG/PNG

### 4. 图标文件

- **路径**: `public/images/icons/`
- **命名**: `icon-logo.svg`, `icon-feature-*.svg`
- **格式**: SVG (矢量图标)

## 注意事项

1. **路径规则**: Next.js 中，`public` 目录下的文件可以直接通过 `/` 路径访问
2. **文件命名**: 使用小写字母和连字符，避免空格和特殊字符
3. **图片优化**: 建议使用 WebP 格式以获得更好的压缩效果
4. **响应式**: 可以准备 2x 图片用于高分辨率显示

## 当前占位符

目前 CaseSection 中使用的是占位符地址：

```tsx
image: "/api/placeholder/400/250";
```

替换为实际图片后应该是：

```tsx
image: "/images/cases/case-smart-city.jpg";
```
