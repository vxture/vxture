/**
 * GetCasesUseCase.ts - 获取 Cases 区块数据用例
 *
 * Application Layer - Use Case
 *
 * @layer Application
 * @category Use Cases
 */

import type { IHomepageRepository } from '@/domain/homepage/homepage.repository';
import type { CasesContent } from '@/domain/homepage/cases.model';
import { CasesHelpers } from '@/domain/homepage/cases.model';

/**
 * 获取 Cases 区块数据用例
 */
export class GetCasesUseCase {
  constructor(private readonly homepageRepository: IHomepageRepository) {}

  /**
   * 执行用例
   * @param locale 语言代码
   * @returns Cases 数据
   */
  async execute(locale: string): Promise<CasesContent> {
    const cases = await this.homepageRepository.getCases(locale);

    // 业务规则：验证数据
    const validation = CasesHelpers.validate(cases);
    if (!validation.valid) {
      console.warn('Cases validation failed:', validation.errors);
    }

    return cases;
  }
}

/**
 * 创建 GetCasesUseCase 实例
 */
export const createGetCasesUseCase = (
  repository: IHomepageRepository
): GetCasesUseCase => {
  return new GetCasesUseCase(repository);
};