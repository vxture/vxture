/**
 * cta.model.ts - CTA 区块领域模型
 *
 * Domain Layer - Homepage Domain
 *
 * 职责：
 * - 定义行动号召区块的领域模型
 * - 封装联系方式和行动按钮逻辑
 *
 * @layer Domain
 * @category Homepage
 */

import type { ContentEntity } from '../shared/types/content.types';
import type { ValidationResult } from '../shared/types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * CTA 特性项接口
 */
export interface CTAFeature {
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly theme: string;
}

/**
 * CTA 行动按钮接口
 */
export interface CTAAction {
  readonly label: string;
  readonly href: string;
  readonly variant: 'primary' | 'secondary' | 'outline';
  readonly icon?: string;
}

/**
 * 联系方式项接口
 */
export interface ContactItem {
  readonly icon: string;
  readonly value: string;
}

/**
 * CTA 联系方式接口
 */
export interface CTAContact {
  readonly description: string;
  readonly email: ContactItem;
  readonly phone: ContactItem;
}

/**
 * CTA 内容接口
 */
export interface CTAContent extends ContentEntity {
  readonly key: 'cta';
  readonly title: string;
  readonly subtitle: string;
  readonly features: CTAFeature[];
  readonly actions: CTAAction[];
  readonly contact: CTAContact;
}

// ============================================================================
// 纯函数辅助
// ============================================================================

/**
 * CTAFeature 辅助函数
 */
export const CTAFeatureHelpers = {
  /**
   * 验证特性
   */
  validate: (feature: CTAFeature): ValidationResult => {
    const errors: string[] = [];
    if (!feature.name?.trim()) errors.push('Feature name is required');
    if (!feature.description?.trim()) errors.push('Feature description is required');
    return { valid: errors.length === 0, errors };
  },
};

/**
 * CTAAction 辅助函数
 */
export const CTAActionHelpers = {
  /**
   * 检查是否有图标
   */
  hasIcon: (action: CTAAction): boolean => {
    return !!action.icon;
  },

  /**
   * 验证行动按钮
   */
  validate: (action: CTAAction): ValidationResult => {
    const errors: string[] = [];
    if (!action.label?.trim()) errors.push('Action label is required');
    if (!action.href?.trim()) errors.push('Action href is required');
    return { valid: errors.length === 0, errors };
  },
};

/**
 * CTAContact 辅助函数
 */
export const CTAContactHelpers = {
  /**
   * 验证联系方式
   */
  validate: (contact: CTAContact): ValidationResult => {
    const errors: string[] = [];
    if (!contact.description?.trim()) errors.push('Contact description is required');
    if (!contact.email?.value) errors.push('Email is required');
    if (!contact.phone?.value) errors.push('Phone is required');
    return { valid: errors.length === 0, errors };
  },
};

/**
 * CTAContent 辅助函数
 */
export const CTAHelpers = {
  /**
   * 获取特性数量
   */
  getFeatureCount: (cta: CTAContent): number => {
    return cta.features.length;
  },

  /**
   * 获取主要行动按钮
   */
  getPrimaryAction: (cta: CTAContent): CTAAction | undefined => {
    return cta.actions.find(action => action.variant === 'primary');
  },

  /**
   * 获取次要行动按钮
   */
  getSecondaryActions: (cta: CTAContent): CTAAction[] => {
    return cta.actions.filter(action => action.variant !== 'primary');
  },

  /**
   * 检查是否有联系方式
   */
  hasContact: (cta: CTAContent): boolean => {
    return !!cta.contact;
  },

  /**
   * 验证 CTA 内容
   */
  validate: (cta: CTAContent): ValidationResult => {
    const errors: string[] = [];

    if (!cta.title?.trim()) {
      errors.push('CTA title is required');
    }

    if (!cta.features || cta.features.length === 0) {
      errors.push('CTA must have at least one feature');
    }

    if (!cta.actions || cta.actions.length === 0) {
      errors.push('CTA must have at least one action');
    }

    // 验证每个特性
    cta.features.forEach((feature, index) => {
      const featureResult = CTAFeatureHelpers.validate(feature);
      if (!featureResult.valid) {
        errors.push(`Feature ${index}: ${featureResult.errors.join(', ')}`);
      }
    });

    // 验证每个行动按钮
    cta.actions.forEach((action, index) => {
      const actionResult = CTAActionHelpers.validate(action);
      if (!actionResult.valid) {
        errors.push(`Action ${index}: ${actionResult.errors.join(', ')}`);
      }
    });

    // 验证联系方式
    if (cta.contact) {
      const contactResult = CTAContactHelpers.validate(cta.contact);
      if (!contactResult.valid) {
        errors.push(...contactResult.errors);
      }
    }

    return { valid: errors.length === 0, errors };
  },
};