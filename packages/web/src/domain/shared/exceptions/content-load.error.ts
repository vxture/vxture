/**
 * content-load.error.ts - 内容加载失败异常
 *
 * Domain Layer - Shared Exceptions
 *
 * @layer Domain
 * @category Shared - Exceptions
 */

/**
 * 内容加载错误接口
 */
export interface ContentLoadError extends Error {
  readonly name: 'ContentLoadError';
  readonly key: string;
  readonly locale: string;
  readonly cause?: Error;
}

/**
 * 创建内容加载错误
 */
export const createContentLoadError = (
  key: string,
  locale: string,
  cause?: Error
): ContentLoadError => {
  const message = `Failed to load content: ${key}.${locale}${cause ? ` - ${cause.message}` : ''}`;
  const error = new Error(message) as ContentLoadError;
  error.name = 'ContentLoadError';
  (error as any).key = key;
  (error as any).locale = locale;
  (error as any).cause = cause;
  return error;
};

/**
 * 类型守卫：检查是否为内容加载错误
 */
export const isContentLoadError = (error: unknown): error is ContentLoadError => {
  return error instanceof Error && error.name === 'ContentLoadError';
};