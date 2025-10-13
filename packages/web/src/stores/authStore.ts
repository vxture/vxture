// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用户信息类型
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  permissions: string[]; // 权限列表（如['edit', 'delete']）
}

// 状态与方法类型
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean; // 是否登录（派生状态）
  login: (email: string, password: string) => Promise<void>; // 登录（异步）
  logout: () => void; // 退出
  hasPermission: (permission: string) => boolean; // 权限校验
}

// 创建Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      // 派生状态：是否登录（根据user是否存在判断）
      get isAuthenticated() {
        return !!get().user;
      },

      // 登录方法（模拟API请求）
      login: async (email, password) => {
        // 模拟API请求（实际项目中替换为真实接口）
        const mockUser: User = {
          id: '123',
          name: '测试用户',
          email,
          permissions: ['edit', 'view'], // 模拟权限
        };
        const mockToken = 'fake-jwt-token-' + Date.now();

        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 更新状态
        set({
          user: mockUser,
          token: mockToken,
        });
      },

      // 退出方法
      logout: () => {
        set({
          user: null,
          token: null,
        });
      },

      // 权限校验
      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions.includes(permission) ?? false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }), // 持久化用户信息和token
    }
  )
);
