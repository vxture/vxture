/**
 * authConfig.ts - 认证相关全局配置常量
 * 统一管理认证配置，供全局状态、组件等模块复用
 */

export const AUTH_CONFIG = {
  tokenExpiryMs: 24 * 60 * 60 * 1000, // Token有效期：24小时（毫秒）
  checkIntervalMs: 60 * 60 * 1000,    // 检查间隔：1小时（毫秒）
  storageKey: 'auth-storage',         // 认证本地存储键名
};
