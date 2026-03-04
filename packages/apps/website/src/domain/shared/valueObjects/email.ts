/**
 * email.ts - 邮箱地址值对象
 *
 * Domain Layer - Shared Value Objects
 *
 * @layer Domain
 * @category Shared - Value Objects
 */

/**
 * Email 值对象接口
 */
export interface Email {
  readonly value: string;
}

/**
 * Email 相关的纯函数
 */
export const EmailHelpers = {
  /**
   * 创建 Email 实例
   */
  create: (email: string): Email => {
    const normalized = email.trim().toLowerCase();
    if (!EmailHelpers.isValid(normalized)) {
      throw new Error(`Invalid email address: ${email}`);
    }
    return { value: normalized };
  },

  /**
   * 验证邮箱格式
   */
  isValid: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * 获取用户名部分
   */
  getUsername: (email: Email): string => {
    return email.value.split('@')[0];
  },

  /**
   * 获取域名部分
   */
  getDomain: (email: Email): string => {
    return email.value.split('@')[1];
  },

  /**
   * 值相等性比较
   */
  equals: (a: Email, b: Email): boolean => {
    return a.value === b.value;
  },
};