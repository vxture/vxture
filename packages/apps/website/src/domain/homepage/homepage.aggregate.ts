/**
 * homepage.aggregate.ts - Homepage 聚合根
 *
 * Domain Layer - Homepage Domain
 *
 * 职责：
 * - 聚合首页所有区块（Hero, Features, Solutions, Cases, CTA）
 * - 提供首页级别的业务操作
 * - 作为首页领域的统一入口
 *
 * @layer Domain
 * @category Homepage
 */

import type { HeroContent } from './hero.model';
import type { FeaturesContent } from './features.model';
import type { SolutionsContent } from './solutions.model';
import type { CasesContent } from './cases.model';
import type { CTAContent } from './cta.model';
import type { ValidationResult } from '../shared/types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Homepage 聚合根接口
 */
export interface HomepageAggregate {
  hero?: HeroContent;
  features?: FeaturesContent;
  solutions?: SolutionsContent;
  cases?: CasesContent;
  cta?: CTAContent;
}

/**
 * 区块信息接口
 */
export interface SectionInfo {
  readonly key: string;
  readonly content: HeroContent | FeaturesContent | SolutionsContent | CasesContent | CTAContent;
}

// ============================================================================
// 纯函数辅助
// ============================================================================

/**
 * HomepageAggregate 辅助函数
 */
export const HomepageHelpers = {
  /**
   * 获取所有启用的区块
   */
  getEnabledSections: (homepage: HomepageAggregate): SectionInfo[] => {
    const sections: SectionInfo[] = [
      { key: 'hero', content: homepage.hero },
      { key: 'features', content: homepage.features },
      { key: 'solutions', content: homepage.solutions },
      { key: 'cases', content: homepage.cases },
      { key: 'cta', content: homepage.cta },
    ];

    return sections.filter(section => section.content.enabled);
  },

  /**
   * 获取启用的区块数量
   */
  getEnabledSectionCount: (homepage: HomepageAggregate): number => {
    return HomepageHelpers.getEnabledSections(homepage).length;
  },

  /**
   * 检查特定区块是否启用
   */
  isSectionEnabled: (
    homepage: HomepageAggregate,
    key: 'hero' | 'features' | 'solutions' | 'cases' | 'cta'
  ): boolean => {
    return homepage[key].enabled;
  },

  /**
   * 获取首页的 SEO 信息（从 Hero 区块提取）
   */
  getSEOInfo: (homepage: HomepageAggregate): { title: string; description: string } => {
    return {
      title: `${homepage.hero.title} ${homepage.hero.titleHighlight}`,
      description: homepage.hero.description,
    };
  },

  /**
   * 验证整个首页数据
   */
  validate: (homepage: HomepageAggregate): ValidationResult => {
    const errors: string[] = [];

    // 验证每个区块（这里假设每个区块都有 validate 方法）
    // 注意：由于我们使用纯函数，需要导入各个 Helpers
    // 这里简化处理，只检查基本结构
    if (!homepage.hero) errors.push('Hero section is required');
    if (!homepage.features) errors.push('Features section is required');
    if (!homepage.solutions) errors.push('Solutions section is required');
    if (!homepage.cases) errors.push('Cases section is required');
    if (!homepage.cta) errors.push('CTA section is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};