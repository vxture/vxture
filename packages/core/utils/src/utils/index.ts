/**
 * utils/index.ts - 工具函数导出
 * @package @vxture/core-utils
 * @description
 *   工具函数的统一导出文件
 */

export {
  getNodeEnv,
  isProduction,
  isDevelopment,
  isTest,
  isStaging,
  isNode,
  isBrowser,
} from './env.utils';

export { VxLogger, logger } from './logger.utils';

export {
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isSymbol,
  isDefined,
  isNotNull,
  isPresent,
  isObject,
  isArray,
  isEmptyObject,
  isEmptyArray,
  isNonEmptyString,
  isValidUrl,
  isUuid,
} from './type-guards.utils';

export {
  VxtureError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  isVxtureError,
} from './error.utils';
