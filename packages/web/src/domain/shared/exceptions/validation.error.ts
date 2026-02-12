/**
 * validation.error.ts - 验证失败异常
 *
 * Domain Layer - Shared Exceptions
 *
 * @layer Domain
 * @category Shared - Exceptions
 */

/**
 * 验证错误接口
 */
export interface ValidationError extends Error {
  readonly name: 'ValidationError';
  readonly key: string;
  readonly errors: string[];
}

/**
 * 创建验证错误
 */
export const createValidationError = (key: string, errors: string[]): ValidationError => {
  const error = new Error(`Validation failed for ${key}: ${errors.join(', ')}`) as ValidationError;
  error.name = 'ValidationError';
  (error as any).key = key;
  (error as any).errors = errors;
  return error;
};

/**
 * 类型守卫：检查是否为验证错误
 */
export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof Error && error.name === 'ValidationError';
};