/**
 * 认证相关常量配置
 * 集中管理认证相关的配置项，便于维护和修改
 */
export const AUTH_CONSTANTS = {
  /** 本地存储键名 */
  STORAGE_KEY: 'auth-storage',

  /** Token 提前刷新时间（毫秒）- 在过期前30秒开始尝试刷新 */
  TOKEN_REFRESH_BUFFER: 30 * 1000,

  /** 默认的Token有效期（秒）- 若接口未返回则使用此值 */
  DEFAULT_TOKEN_EXPIRY: 3600, // 1小时

  /** 自动登出倒计时（毫秒） */
  AUTO_LOGOUT_COUNTDOWN: 5 * 1000, // 5秒

  /** 权限相关常量 */
  PERMISSIONS: {
    ADMIN: 'admin',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete',
  } as const,

  /** API 端点配置 */
  API_ENDPOINTS: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
  },
};

