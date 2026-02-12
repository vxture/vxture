/**
 * GetLayoutUseCase.ts - 获取完整布局数据用例
 *
 * Application Layer - Use Case
 *
 * @layer Application
 * @category Use Cases
 */

import type { ILayoutRepository } from '@/domain/layout/layout.repository';
import type { LayoutAggregate } from '@/domain/layout/layout.aggregate';
import { LayoutHelpers } from '@/domain/layout/layout.aggregate';

/**
 * 获取布局数据用例
 */
export class GetLayoutUseCase {
  constructor(private readonly layoutRepository: ILayoutRepository) {}

  /**
   * 执行用例
   * @param locale 语言代码
   * @returns 布局聚合数据
   */
  async execute(locale: string): Promise<LayoutAggregate> {
    const layout = await this.layoutRepository.getLayout(locale);

    // 业务规则：验证数据
    const validation = LayoutHelpers.validate(layout);
    if (!validation.valid) {
      console.warn('Layout validation failed:', validation.errors);
    }

    return layout;
  }
}

/**
 * 创建 GetLayoutUseCase 实例
 */
export const createGetLayoutUseCase = (
  repository: ILayoutRepository
): GetLayoutUseCase => {
  return new GetLayoutUseCase(repository);
};