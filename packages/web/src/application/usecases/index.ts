/**
 * usecases/index.ts - Use Cases 统一导出
 *
 * @layer Application
 * @category Use Cases
 */

// Homepage Use Cases
export * from './homepage';

// Layout Use Cases
export * from './layout';

// ============================================================================
// Use Case 实例工厂
// ============================================================================

import { repositories } from '@/infrastructure';
import { createGetHomepageUseCase } from './homepage/GetHomepageUseCase';
import { createGetHeroUseCase } from './homepage/GetHeroUseCase';
import { createGetFeaturesUseCase } from './homepage/GetFeaturesUseCase';
import { createGetSolutionsUseCase } from './homepage/GetSolutionsUseCase';
import { createGetCasesUseCase } from './homepage/GetCasesUseCase';
import { createGetCTAUseCase } from './homepage/GetCTAUseCase';
import { createGetLayoutUseCase } from './layout/GetLayoutUseCase';
import { createGetHeaderUseCase } from './layout/GetHeaderUseCase';
import { createGetFooterUseCase } from './layout/GetFooterUseCase';

/**
 * 预配置的 Use Case 实例
 */
export const useCases = {
  // Homepage
  getHomepage: createGetHomepageUseCase(repositories.homepage),
  getHero: createGetHeroUseCase(repositories.homepage),
  getFeatures: createGetFeaturesUseCase(repositories.homepage),
  getSolutions: createGetSolutionsUseCase(repositories.homepage),
  getCases: createGetCasesUseCase(repositories.homepage),
  getCTA: createGetCTAUseCase(repositories.homepage),

  // Layout
  getLayout: createGetLayoutUseCase(repositories.layout),
  getHeader: createGetHeaderUseCase(repositories.layout),
  getFooter: createGetFooterUseCase(repositories.layout),
};