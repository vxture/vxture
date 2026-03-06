/**
 * GetCTAUseCase.ts - 获取 CTA 区块数据用例
 *
 * Application Layer - Use Case
 *
 * @layer Application
 * @category Use Cases
 */

import type { IHomepageRepository } from '@/domain/homepage/homepage.repository';
import type { CTAContent } from '@/domain/homepage/cta.model';
import { CTAHelpers } from '@/domain/homepage/cta.model';

/**
 * 获取 CTA 区块数据用例
 */
export class GetCTAUseCase {
  constructor(private readonly homepageRepository: IHomepageRepository) {}

  /**
   * 执行用例
   * @param locale 语言代码
   * @returns CTA 数据
   */
  async execute(locale: string): Promise<CTAContent> {
    const cta = await this.homepageRepository.getCTA(locale);

    // 业务规则：验证数据
    const validation = CTAHelpers.validate(cta);
    if (!validation.valid) {
      console.warn('CTA validation failed:', validation.errors);
    }

    return cta;
  }
}

/**
 * 创建 GetCTAUseCase 实例
 */
export const createGetCTAUseCase = (
  repository: IHomepageRepository
): GetCTAUseCase => {
  return new GetCTAUseCase(repository);
};