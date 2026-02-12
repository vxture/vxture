/**
 * layout.repository.ts - Layout 仓储接口
 *
 * Domain Layer - Layout Domain
 *
 * 职责：
 * - 定义 Layout 领域的数据访问契约
 * - 由 Infrastructure Layer 实现
 *
 * @layer Domain
 * @category Layout
 */

import type { IContentRepository } from '../shared/repositories';
import type { HeaderContent } from './header.model';
import type { FooterContent } from './footer.model';

/**
 * Header 仓储接口
 */
export interface IHeaderRepository extends IContentRepository<HeaderContent> {
  /**
   * 获取 Header 内容
   */
  getByLocale(locale: string): Promise<HeaderContent>;
}

/**
 * Footer 仓储接口
 */
export interface IFooterRepository extends IContentRepository<FooterContent> {
  /**
   * 获取 Footer 内容
   */
  getByLocale(locale: string): Promise<FooterContent>;
}

/**
 * Layout 仓储接口（聚合 Header 和 Footer）
 */
export interface ILayoutRepository {
  /**
   * 获取完整的 Layout 数据
   */
  getLayout(locale: string): Promise<{
    header: HeaderContent;
    footer: FooterContent;
  }>;

  /**
   * 获取 Header
   */
  getHeader(locale: string): Promise<HeaderContent>;

  /**
   * 获取 Footer
   */
  getFooter(locale: string): Promise<FooterContent>;

  /**
   * 清除缓存
   */
  clearCache(locale?: string): void;
}