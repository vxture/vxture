/**
 * GetSolutionsUseCase.ts - 获取 Solutions 区块数据用例
 *
 * Application Layer - Use Case
 *
 * @layer Application
 * @category Use Cases
 */

import type { IHomepageRepository } from '@/domain/homepage/homepage.repository';
import type { SolutionsContent } from '@/domain/homepage/solutions.model';
import { SolutionsHelpers } from '@/domain/homepage/solutions.model';

/**
 * 获取 Solutions 区块数据用例
 */
export class GetSolutionsUseCase {
  constructor(private readonly homepageRepository: IHomepageRepository) {}

  /**
   * 执行用例
   * @param locale 语言代码
   * @returns Solutions 数据
   */
  async execute(locale: string): Promise<SolutionsContent> {
    const solutions = await this.homepageRepository.getSolutions(locale);

    // 业务规则：验证数据
    const validation = SolutionsHelpers.validate(solutions);
    if (!validation.valid) {
      console.warn('Solutions validation failed:', validation.errors);
    }

    return solutions;
  }
}

/**
 * 创建 GetSolutionsUseCase 实例
 */
export const createGetSolutionsUseCase = (
  repository: IHomepageRepository
): GetSolutionsUseCase => {
  return new GetSolutionsUseCase(repository);
};