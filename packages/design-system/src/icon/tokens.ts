/**
 * Icon Tokens - 语义化图标分类系统
 *
 * 设计原则：
 * 1. Icon 仅表达「业务语义」，不表达样式、情绪或装饰
 * 2. 内容层只能使用此处定义的 token
 * 3. UI 层负责 token → 具体 icon（SVG / Font / React Component）
 * 4. 禁止在内容 JSON 中新增或临时定义 icon
 *
 * 扩展规则（非常重要）：
 * - 只有当「多个模块/页面都会复用」时，才允许新增 token
 * - 单一页面、单一文案需求 → ❌ 不新增
 * - 装饰性、营销情绪类 icon（如 fire / star / heart）→ ❌ 不新增
 */

export const IconTokens = {
  // 通用交互
  navigation: [
    'home',
    'arrow-left',
    'arrow-right',
    'arrow-up',
    'arrow-down',
    'arrow-long-right',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'chevron-down',
  ],
  action: ['search', 'settings', 'edit', 'delete', 'add', 'plus', 'x', 'check', 'trash', 'cog'],
  status: ['success', 'error', 'warning', 'info', 'check'],

  // 云服务/智能体专属
  platform: [
    'agent',
    'workflow',
    'trigger',
    'database',
    'cloud',
    'server',
    'cube',
    'building-library',
    'cog',
  ],
  data: [
    'chart',
    'chart-bar',
    'table',
    'code',
    'api',
    'graph',
    'lightbulb',
    'sparkles',
    'shield-check',
  ],

  // 用户/组织
  user: ['user', 'user-group', 'users', 'medal', 'star'],

  // 通讯/联系
  communication: ['mail', 'phone', 'wechat', 'github', 'linkedin', 'chat-circle'],

  // 时间/日历
  time: ['calendar', 'calendar-days', 'clock'],

  // 地图/位置
  location: ['map-pin', 'map-marker'],

  // 主题/显示
  theme: ['sun', 'moon', 'globe'],

  // 额外需要的图标
  extra: ['paperplane-tilt', 'caret-left-bold', 'caret-right-bold'],
} as const;

// 从 tokens 自动推导 IconName 类型，无需手动维护
type Flatten<T> = T extends readonly (infer U)[] ? U : never;
export type IconName = Flatten<typeof IconTokens[keyof typeof IconTokens]>;