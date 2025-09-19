# 样式指南

## 何时使用SCSS

- 复杂动画和过渡效果
- 需要嵌套选择器的复杂组件
- 全局样式和重置
- 主题相关的颜色方案
- 需要SCSS函数和混合的场景

## 何时使用Tailwind

- 布局和间距调整
- 简单的颜色应用
- 响应式设计调整
- 快速原型设计
- 小型UI调整

## 混合使用示例

```tsx
// 混合使用示例
function Card() {
  return (
    <div className="custom-card">
      <div className="custom-card__header">
        <h3 className="text-xl font-bold text-primary">卡片标题</h3>
      </div>
      <div className="custom-card__body flex flex-col gap-4">
        <p className="text-gray-600">使用Tailwind的文本和间距类</p>
        <button className="btn btn--primary mt-2">使用SCSS类</button>
        <button className="bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90">
          纯Tailwind按钮
        </button>
      </div>
    </div>
  );
}
```
