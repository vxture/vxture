/**
 * client/index.ts - 配置客户端导出
 * @package @vxture/core-config
 *
 * Description: 配置客户端类和工具的统一导出文件
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Client - Config
 */

export * from './config.client';
export {
  ConfigManager,
  MemoryConfigSource,
  EnvConfigSource,
  ObjectConfigSource,
} from './config.client';
export { getConfigManager, createConfigManager } from './config.client';
