/**
 * error.utils.ts - error相关工具（从 @vxture/shared 重新导出）
 * @package @vxture/core-utils
 * @description
 *   基础错误类和 HTTP 语义错误子类，支持错误元数据和 toJSON 序列化
 *   向后兼容层：从 @vxture/shared 重新导出，消费方无需改动
 */

// 从 @vxture/shared 重新导出所有错误类和工具
export {
  type ErrorMetadata,
  VxtureError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  isVxtureError,
} from '@vxture/shared';
