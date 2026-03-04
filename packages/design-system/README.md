# Vxture Design System

公用设计系统，适用于：-运营管理平台 -业务服务系统 -智能体服务平台

无业务逻辑，纯 UI 组件。

## 🎨 图标组件

### 使用规范

**禁止直接使用任何外部图标库，必须使用 `@vxture/design-system` 提供的 `<Icon>` 组件。**

#### 正确用法

```typescript
import { Icon } from '@vxture/design-system';

// 使用内置图标
<Icon name="user" size={24} />
<Icon name="settings" size={20} weight="bold" />
<Icon name="home" size={16} className="text-blue-500" />
```

#### 禁止的错误用法

```typescript
// ❌ 错误：直接使用其他图标库
import { UserIcon } from '@phosphor-icons/react';

<UserIcon size={24} /> // ❌ 禁止
```

### 支持的图标

#### 常用图标

```typescript
// 基础图标
'user'          // 用户
'settings'      // 设置
'home'          // 首页
'bell'          // 通知
'plus'          // 加
'x'             // 关闭
'check'         // 勾选
'search'        // 搜索
'edit'          // 编辑
'trash'         // 删除

// 导航图标
'chevron-right' // 右箭头
'chevron-left'  // 左箭头
'chevron-up'    // 上箭头
'chevron-down'  // 下箭头
'arrow-right'   // 箭头右
'arrow-left'    // 箭头左
'arrow-up'      // 箭头上
'arrow-down'    // 箭头下

// 功能图标
'moon'          // 月亮（深色模式）
'sun'           // 太阳（浅色模式）
'globe'         // 语言切换
'mail'          // 邮件
'phone'         // 电话
'map-pin'       // 地图定位
'calendar-days' // 日历
'chart-bar'     // 图表
'code'          // 代码
'lightbulb'     // 灯泡（想法）
'paperplane-tilt' // 纸飞机（发送）
'shield-check'  // 盾牌（安全）
'sparkle'       // 火花（高亮）
'cog'           // 齿轮（设置）
'chat-circle'   // 聊天气泡

// 社交图标
'github'        // GitHub
'wechat'        // 微信
'linkedin'      // LinkedIn
```

### 图标属性

#### 基本属性

```typescript
interface IconProps {
  // 必填：图标名称（从支持的图标列表中选择）
  name: IconName;

  // 可选：图标大小（默认：20px）
  size?: number | string;

  // 可选：图标粗细（默认：regular）
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

  // 可选：CSS 类名
  className?: string;
}
```

#### 权重说明

| 权重值       | 说明          |
|--------------|---------------|
| 'thin'       | 细线风格      |
| 'light'      | 轻量风格      |
| 'regular'    | 常规风格（默认）|
| 'bold'       | 粗体风格      |
| 'fill'       | 填充风格      |
| 'duotone'    | 双色调风格    |

### 最佳实践

1. **统一使用 Icon 组件**：所有图标必须通过 `<Icon>` 组件渲染
2. **避免硬编码**：不要在组件中直接使用任何外部图标库
3. **图标命名**：使用语义化的图标名称
4. **大小一致**：在同一页面中保持图标大小一致
5. **颜色规范**：使用设计系统提供的颜色变量

### 维护说明

如果需要添加新图标，请：
1. 在 `src/icon/Icon.tsx` 中添加新图标到类型定义
2. 更新图标映射表
3. 确保图标名称语义化
4. 遵循设计系统的设计规范

---

**最后更新：** 2026-03-04
**维护者：** vxture team
