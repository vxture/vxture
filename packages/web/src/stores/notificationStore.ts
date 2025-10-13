// src/stores/notificationStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid'; // 用于生成唯一ID（需安装：pnpm add uuid @types/uuid）

// 通知类型
type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知项类型
interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number; // 自动关闭时间（毫秒，默认3000）
}

// 状态与方法类型
interface NotificationState {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType, duration?: number) => string; // 返回通知ID
  removeNotification: (id: string) => void; // 手动移除通知
}

// 创建Notification Store
export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],

  // 添加通知
  addNotification: (message, type, duration = 3000) => {
    const id = uuidv4(); // 生成唯一ID
    const newNotification: Notification = { id, message, type, duration };

    // 添加到通知列表
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // 自动移除（如果设置了duration）
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }

    return id;
  },

  // 移除通知
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
