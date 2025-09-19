# Vxture 设计令牌文档

本文档定义了 Vxture 项目的设计令牌 (Design Tokens)，作为 SCSS 变量和 CSS 变量的参考。

## 颜色系统

### 主色调

| 变量名  | SCSS变量               | CSS变量                 | HEX值     | 用途                 |
| ------- | ---------------------- | ----------------------- | --------- | -------------------- |
| 主色    | `$color-primary`       | `--color-primary`       | `#3b82f6` | 按钮、链接、强调元素 |
| 主色-亮 | `$color-primary-light` | `--color-primary-light` | `#93c5fd` | 悬停状态、背景       |
| 主色-暗 | `$color-primary-dark`  | `--color-primary-dark`  | `#1d4ed8` | 按下状态、文本       |
| 次色    | `$color-secondary`     | `--color-secondary`     | `#10b981` | 辅助按钮、成功状态   |
| 强调色  | `$color-accent`        | `--color-accent`        | `#f59e0b` | 提示、警告、突出显示 |

### 扩展颜色 (可根据需要添加)

- 灰度系列
- 语义色 (成功、警告、错误等)

## 间距系统

| 变量名   | SCSS变量        | CSS变量        | 值              | 用途                     |
| -------- | --------------- | -------------- | --------------- | ------------------------ |
| 基础单位 | `$spacing-base` | -              | `0.25rem` (4px) | 基础单位，其他间距的基础 |
| 超小间距 | `$spacing-xs`   | `--spacing-xs` | `0.5rem` (8px)  | 紧凑元素内间距           |
| 小间距   | `$spacing-sm`   | `--spacing-sm` | `1rem` (16px)   | 常规元素内间距           |
| 中间距   | `$spacing-md`   | `--spacing-md` | `1.5rem` (24px) | 卡片内间距               |
| 大间距   | `$spacing-lg`   | `--spacing-lg` | `2.5rem` (40px) | 区块间距                 |
| 超大间距 | `$spacing-xl`   | `--spacing-xl` | `4rem` (64px)   | 大区块分隔               |

## 字体系统

### 字体族

| 变量名     | SCSS变量            | CSS变量              | 值                               |
| ---------- | ------------------- | -------------------- | -------------------------------- |
| 无衬线字体 | `$font-family-sans` | `--font-family-sans` | `'Inter', system-ui, sans-serif` |
| 等宽字体   | `$font-family-mono` | `--font-family-mono` | `'JetBrains Mono', monospace`    |

### 字体大小

| 变量名 | SCSS变量          | CSS变量 | 值                | 用途         |
| ------ | ----------------- | ------- | ----------------- | ------------ |
| 超小   | `$font-size-xs`   | -       | `0.75rem` (12px)  | 小标签、脚注 |
| 小     | `$font-size-sm`   | -       | `0.875rem` (14px) | 辅助文本     |
| 基础   | `$font-size-base` | -       | `1rem` (16px)     | 正文文本     |
| 大     | `$font-size-lg`   | -       | `1.125rem` (18px) | 副标题       |
| 超大   | `$font-size-xl`   | -       | `1.25rem` (20px)  | 小标题       |
| 2XL    | `$font-size-2xl`  | -       | `1.5rem` (24px)   | 中标题       |
| 3XL    | `$font-size-3xl`  | -       | `1.875rem` (30px) | 大标题       |
| 4XL    | `$font-size-4xl`  | -       | `2.25rem` (36px)  | 主标题       |

## 边框和圆角

| 变量名  | SCSS变量              | CSS变量 | 值               | 用途               |
| ------- | --------------------- | ------- | ---------------- | ------------------ |
| 圆角-小 | `$border-radius-sm`   | -       | `0.125rem` (2px) | 小元素圆角         |
| 圆角-中 | `$border-radius-md`   | -       | `0.25rem` (4px)  | 按钮、卡片圆角     |
| 圆角-大 | `$border-radius-lg`   | -       | `0.5rem` (8px)   | 大卡片、模态框圆角 |
| 圆角-全 | `$border-radius-full` | -       | `9999px`         | 圆形、胶囊形状     |

## 使用指南

### SCSS中使用

```scss
.my-component {
  color: $color-primary;
  padding: $spacing-md;
  font-size: $font-size-lg;
}
```

### Tailwind中使用

```html
<div class="text-primary p-4 text-lg">
  <!-- 内容 -->
</div>
```

### CSS变量使用

```css
.custom-element {
  color: var(--color-primary);
  padding: var(--spacing-md);
}
```

## 暗色主题变换

在`.dark`类下，部分CSS变量会有不同的值以适应暗色模式。
