/**
 * content-not-found.error.ts - 内容未找到异常
 *
 * Domain Layer - Shared Exceptions
 *
 * @layer Domain
 * @category Shared - Exceptions
 */

/**
 * 内容未找到错误接口
 */
export interface ContentNotFoundError extends Error {
  readonly name: 'ContentNotFoundError';
  readonly key: string;
  readonly locale: string;
}

/**
 * 创建内容未找到错误
 */
export const createContentNotFoundError = (key: string, locale: string): ContentNotFoundError => {
  const error = new Error(`Content not found: ${key}.${locale}`) as ContentNotFoundError;
  error.name = 'ContentNotFoundError';
  (error as any).key = key;
  (error as any).locale = locale;
  return error;
};

/**
 * 类型守卫：检查是否为内容未找到错误
 */
export const isContentNotFoundError = (error: unknown): error is ContentNotFoundError => {
  return error instanceof Error && error.name === 'ContentNotFoundError';
};