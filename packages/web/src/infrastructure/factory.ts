/**
 * factory.ts - Infrastructure 实例工厂
 *
 * Infrastructure Layer - Factory
 *
 * 职责：
 * - 提供预配置的 Repository 实例
 * - 管理依赖注入
 * - 统一的实例创建入口
 *
 * @layer Infrastructure
 * @category Factory
 */

import { JsonAdapter, createJsonAdapter } from './adapters/json/JsonAdapter';
import { CacheManager, createCacheManager } from './cache/CacheManager';
import { HomepageRepository, createHomepageRepository } from './repositories/homepage/HomepageRepository';
import { LayoutRepository, createLayoutRepository } from './repositories/layout/LayoutRepository';

/**
 * Infrastructure 配置
 */
export interface InfrastructureConfig {
  json?: {
    baseUrl?: string;
    timeout?: number;
  };
  cache?: {
    ttl?: number;
    maxSize?: number;
  };
}

/**
 * Infrastructure 实例容器
 */
export interface InfrastructureContainer {
  // Adapters
  jsonAdapter: JsonAdapter;

  // Cache
  cacheManager: CacheManager<any>;

  // Repositories
  homepageRepository: HomepageRepository;
  layoutRepository: LayoutRepository;
}

/**
 * 创建 Infrastructure 容器
 */
export const createInfrastructure = (
  config: InfrastructureConfig = {}
): InfrastructureContainer => {
  // 创建 Adapters
  const jsonAdapter = createJsonAdapter(config.json);

  // 创建 Cache
  const cacheManager = createCacheManager(config.cache);

  // 创建 Repositories
  const homepageRepository = createHomepageRepository(jsonAdapter, cacheManager);
  const layoutRepository = createLayoutRepository(jsonAdapter, cacheManager);

  return {
    jsonAdapter,
    cacheManager,
    homepageRepository,
    layoutRepository,
  };
};

/**
 * 默认 Infrastructure 实例
 */
export const infrastructure = createInfrastructure();

/**
 * 便捷访问 - Repositories
 */
export const repositories = {
  homepage: infrastructure.homepageRepository,
  layout: infrastructure.layoutRepository,
};