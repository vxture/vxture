/**
 * GetFeaturesUseCase.ts - 获取 Features 区块数据用例
 *
 * Application Layer - Use Case
 *
 * @layer Application
 * @category Use Cases
 */

import type { IHomepageRepository } from '@/domain/homepage/homepage.repository';
import type { FeaturesContent } from '@/domain/homepage/features.model';
import { FeaturesHelpers } from '@/domain/homepage/features.model';

/**
 * 获取 Features 区块数据用例
 */
export class GetFeaturesUseCase {
  constructor(private readonly homepageRepository: IHomepageRepository) {}

  /**
   * 执行用例
   * @param locale 语言代码
   * @returns Features 数据
   */
  async execute(locale: string): Promise<FeaturesContent> {
    const features = await this.homepageRepository.getFeatures(locale);

    // 业务规则：验证数据
    const validation = FeaturesHelpers.validate(features);
    if (!validation.valid) {
      console.warn('Features validation failed:', validation.errors);
    }

    return features;
  }
}

/**
 * 创建 GetFeaturesUseCase 实例
 */
export const createGetFeaturesUseCase = (
  repository: IHomepageRepository
): GetFeaturesUseCase => {
  return new GetFeaturesUseCase(repository);
};