/**
 * GetFooterUseCase.ts - 获取 Footer 数据用例
 *
 * Application Layer - Use Case
 *
 * @layer Application
 * @category Use Cases
 */

import type { ILayoutRepository } from '@/domain/layout/layout.repository';
import type { FooterContent } from '@/domain/layout/footer.model';
import { FooterHelpers } from '@/domain/layout/footer.model';

/**
 * 获取 Footer 数据用例
 */
export class GetFooterUseCase {
  constructor(private readonly layoutRepository: ILayoutRepository) {}

  /**
   * 执行用例
   * @param locale 语言代码
   * @returns Footer 数据
   */
  async execute(locale: string): Promise<FooterContent> {
    const footer = await this.layoutRepository.getFooter(locale);

    // 业务规则：验证数据
    const validation = FooterHelpers.validate(footer);
    if (!validation.valid) {
      console.warn('Footer validation failed:', validation.errors);
    }

    return footer;
  }
}

/**
 * 创建 GetFooterUseCase 实例
 */
export const createGetFooterUseCase = (
  repository: ILayoutRepository
): GetFooterUseCase => {
  return new GetFooterUseCase(repository);
};