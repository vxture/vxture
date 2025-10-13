'use client';

import { useNotificationStore } from '@/stores/notificationStore';
import { XIcon } from '@heroicons/react/24/outline';

export default function Notifications() {
  // 从Notification Store获取通知列表和移除方法
  const { notifications, removeNotification } = useNotificationStore();

  // 通知样式映射
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
    <div className='fixed top-4 right-4 z-50 flex flex-col gap-2 w-80'>
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
            >
              <XIcon className='w-4 h-4' />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
