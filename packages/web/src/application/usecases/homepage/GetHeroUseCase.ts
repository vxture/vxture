/**
 * GetHeroUseCase.ts - 获取 Hero 区块数据用例
 *
 * Application Layer - Use Case
 *
 * @layer Application
 * @category Use Cases
 */

import type { IHomepageRepository } from '@/domain/homepage/homepage.repository';
import type { HeroContent } from '@/domain/homepage/hero.model';
import { HeroHelpers } from '@/domain/homepage/hero.model';

/**
 * 获取 Hero 区块数据用例
 */
export class GetHeroUseCase {
  constructor(private readonly homepageRepository: IHomepageRepository) {}

  /**
   * 执行用例
   * @param locale 语言代码
   * @returns Hero 数据
   */
  async execute(locale: string): Promise<HeroContent> {
    const hero = await this.homepageRepository.getHero(locale);

    // 业务规则：验证数据
    const validation = HeroHelpers.validate(hero);
    if (!validation.valid) {
      console.warn('Hero validation failed:', validation.errors);
    }

    return hero;
  }
}

/**
 * 创建 GetHeroUseCase 实例
 */
export const createGetHeroUseCase = (
  repository: IHomepageRepository
): GetHeroUseCase => {
  return new GetHeroUseCase(repository);
};