/**
 * Notifications.tsx
 *
 * 功能：
 * - 统一管理所有全局通知展示，便于集中维护
 * - 支持 success/error/warning/info 类型消息的统一展示与交互
 *
 * 用途：
 * - 供全局布局、页面、业务组件调用，集中展示用户操作反馈
 * - 结构与 ThemeSync、I18nSync、AuthSync 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 状态依赖 @/stores/notificationStore
 * - 图标依赖 @vxture/design-system
 * - 被 src/app/layout.tsx、全局 UI 组件调用
 *
 * 设计规范：
 * - 只负责 UI 展示与交互，不包含业务逻辑
 * - 命名、结构、注释与其它全局组件保持一致
 *
 * @file Notifications.tsx
 * @desc 全局通知展示组件，统一支持消息展示与交互
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2026-03-04
 * @modifiedBy vxture team
 * @copyright Copyright (c) 2024-2026 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand, @vxture/design-system
 * @see src/stores/notificationStore.ts 通知状态管理
 * @tags notification, component, UI
 * @example
 *   <Notifications />
 * @remarks
 *   仅负责 UI 展示，业务逻辑请移至 Store 层。
 * @todo
 *   支持多语言、分组通知、动画等
 */

'use client';

import { useNotificationStore } from '@/stores/notification.store';
import { Icon } from '@vxture/design-system';

// ============================================================================
// 主组件区 - Notifications 全局通知组件
// ============================================================================

/**
 * 全局通知展示组件
 * - 自动监听 notificationStore，展示所有通知
 * - 支持 success/error/warning/info 类型，点击可移除
 */
export default function Notifications() {
  // 从 Notification Store 获取通知列表和移除方法
  const { notifications, removeNotification } = useNotificationStore();

  /**
   * 根据通知类型返回对应样式
   * @param type 通知类型（success | error | warning | info）
   * @returns TailwindCSS 样式字符串
   */
  const getStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className='fixed top-24 left-4 z-50 flex flex-col gap-2 w-80'>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 border rounded-lg shadow ${getStyle(notification.type)}`}
        >
          <div className='flex justify-between items-start'>
            <p>{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className='text-gray-500 hover:text-gray-700'
              aria-label='关闭通知'
            >
              <Icon name='delete' className='w-4 h-4' />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
