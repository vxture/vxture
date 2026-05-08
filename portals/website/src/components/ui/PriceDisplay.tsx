/**
 * PriceDisplay.tsx
 *
 * 功能：
 * - 统一的价格展示组件，支持多种货币格式、周期显示
 * - 支持原价/折扣价对比、价格说明文字
 *
 * 用途：
 * - 产品页面价格展示
 * - 购物车、结算页面价格显示
 * - 营销活动价格对比
 *
 * 依赖/调用关系：
 * - 使用 @vxture/core-locale 进行格式化（可选）
 *
 * @file PriceDisplay.tsx
 * @desc 统一的价格展示组件，支持多种货币格式
 * @author AI-Generated
 * @created 2026-03-15
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, @vxture/core-locale
 * @category Components - UI
 * @layer Presentation
 */

import { formatCurrency } from '@vxture/shared';
import { useLocale } from 'next-intl';
import type { Locale } from '@vxture/shared';

// ============================================================================
// 类型定义区
// ============================================================================

export interface PriceDisplayProps {
  /** 价格 */
  price: number;
  /** 货币代码 */
  currency?: string;
  /** 周期 */
  period?: 'month' | 'year' | 'once';
  /** 原价（用于折扣显示） */
  originalPrice?: number;
  /** 价格说明 */
  description?: string;
  /** 是否高亮显示 */
  highlighted?: boolean;
  /** 是否显示价格前缀 */
  showPrefix?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 价格单位 */
  unit?: string;
}

// ============================================================================
// 组件实现区
// ============================================================================

export default function PriceDisplay({
  price,
  currency,
  period,
  originalPrice,
  description,
  highlighted = false,
  showPrefix = true,
  className = '',
  unit = '',
}: PriceDisplayProps) {
  const locale = useLocale() as Locale;

  // 格式化价格
  const formattedPrice = formatCurrency(price, locale, currency);
  const formattedOriginalPrice = originalPrice
    ? formatCurrency(originalPrice, locale, currency)
    : null;

  // 周期文本
  const periodText = {
    month: '/月',
    year: '/年',
    once: '',
  };

  return (
    <div className={`flex items-baseline ${className}`}>
      {/* 价格前缀 */}
      {showPrefix && currency === 'CNY' && (
        <span className={`font-medium ${
          highlighted ? 'text-2xl' : 'text-lg'
        }`}>
          ¥
        </span>
      )}

      {/* 价格 */}
      <span className={`font-bold ${
        highlighted ? 'text-4xl' : 'text-2xl'
      }`}>
        {formattedPrice}
        {unit}
      </span>

      {/* 周期 */}
      {period && periodText[period] && (
        <span className={`ml-1 text-sm ${
          highlighted ? 'text-vx-gray-500' : 'text-vx-gray-600'
        }`}>
          {periodText[period]}
        </span>
      )}

      {/* 原价 */}
      {formattedOriginalPrice && (
        <span className='ml-2 text-sm text-vx-gray-500 line-through'>
          {formattedOriginalPrice}
          {period && periodText[period]}
        </span>
      )}

      {/* 价格说明 */}
      {description && (
        <span className='ml-2 text-sm text-vx-gray-500'>
          ({description})
        </span>
      )}
    </div>
  );
}
