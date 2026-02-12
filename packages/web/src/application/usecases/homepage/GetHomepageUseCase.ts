/**
 * GetHomepageUseCase.ts - 获取首页完整数据用例
 *
 * Application Layer - Use Case
 *
 * 职责：
 * - 编排首页数据获取业务逻辑
 * - 验证业务规则
 * - 处理业务异常
 *
 * @layer Application
 * @category Use Cases
 */

import type { IHomepageRepository } from '@/domain/homepage/homepage.repository';
import type { HomepageAggregate } from '@/domain/homepage/homepage.aggregate';
import { HomepageHelpers } from '@/domain/homepage/homepage.aggregate';
import { createContentNotFoundError } from '@/domain/shared/exceptions/content-not-found.error';

/**
 * 获取首页数据用例
 */
export class GetHomepageUseCase {
  constructor(private readonly homepageRepository: IHomepageRepository) {}

  /**
   * 执行用例
   * @param locale 语言代码
   * @returns 首页聚合数据
   * @throws ContentNotFoundError 当内容不存在时
   */
  async execute(locale: string): Promise<HomepageAggregate> {
    try {
      // 1. 从 Repository 获取数据
      const homepage = await this.homepageRepository.getHomepage(locale);

      // 2. 业务规则验证
      const validation = HomepageHelpers.validate(homepage);
      if (!validation.valid) {
        console.warn('Homepage validation failed:', validation.errors);
        // 继续返回数据，但记录警告
      }

      // 3. 返回数据
      return homepage;
    } catch (error) {
      // 业务异常处理
      console.error('Failed to get homepage:', error);
      throw error;
    }
  }
}

/**
 * 创建 GetHomepageUseCase 实例
 */
export const createGetHomepageUseCase = (
  repository: IHomepageRepository
): GetHomepageUseCase => {
  return new GetHomepageUseCase(repository);
};