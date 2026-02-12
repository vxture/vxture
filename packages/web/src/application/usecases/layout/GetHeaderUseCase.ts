/**
 * GetHeaderUseCase.ts - 获取 Header 数据用例
 *
 * Application Layer - Use Case
 *
 * @layer Application
 * @category Use Cases
 */

import type { ILayoutRepository } from '@/domain/layout/layout.repository';
import type { HeaderContent } from '@/domain/layout/header.model';
import { HeaderHelpers } from '@/domain/layout/header.model';

/**
 * 获取 Header 数据用例
 */
export class GetHeaderUseCase {
  constructor(private readonly layoutRepository: ILayoutRepository) {}

  /**
   * 执行用例
   * @param locale 语言代码
   * @returns Header 数据
   */
  async execute(locale: string): Promise<HeaderContent> {
    const header = await this.layoutRepository.getHeader(locale);

    // 业务规则：验证数据
    const validation = HeaderHelpers.validate(header);
    if (!validation.valid) {
      console.warn('Header validation failed:', validation.errors);
    }

    return header;
  }
}

/**
 * 创建 GetHeaderUseCase 实例
 */
export const createGetHeaderUseCase = (
  repository: ILayoutRepository
): GetHeaderUseCase => {
  return new GetHeaderUseCase(repository);
};