/**
 * validation.types.ts - 验证相关类型定义
 *
 * Domain Layer - Shared Types
 *
 * @layer Domain
 * @category Shared - Types
 */

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 验证规则函数类型
 */
export type ValidationRule<T> = (value: T) => ValidationResult;

/**
 * 字段验证器
 */
export interface FieldValidator<T = any> {
  field: keyof T;
  rules: ValidationRule<any>[];
}

/**
 * 验证辅助函数
 */
export const ValidationHelpers = {
  /**
   * 合并多个验证结果
   */
  mergeResults: (...results: ValidationResult[]): ValidationResult => {
    const allErrors = results.flatMap(r => r.errors);
    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  },

  /**
   * 创建成功的验证结果
   */
  success: (): ValidationResult => ({
    valid: true,
    errors: [],
  }),

  /**
   * 创建失败的验证结果
   */
  failure: (...errors: string[]): ValidationResult => ({
    valid: false,
    errors,
  }),
};