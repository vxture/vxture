/**
 * products/page.tsx - 产品页面
 *
 * 功能：演示窗口滚动吸附效果，包含导航、调试面板和内容组件
 * 用途：测试 useWindowScrollSnap hook 和 SnapDebugPanel 调试面板
 *
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2026-03-03
 * @version 1.0.0
 * @copyright Copyright (c) 2024-2026 Vxture Team
 * @license MIT
 *
 * @layer Presentation
 * @category Pages
 */

'use client';

// ============================================================================
// 导入
// ============================================================================

import { useWindowScrollSnap } from '@/application/hooks/useWindowScrollSnap';
import SnapDebugPanel from '@/presentation/components/panels/SnapDebugPanel';
import SnapChoicePanel from '@/presentation/components/panels/SnapChoicePanel';
import ProductDetailPartOne from '@/presentation/components/products/ProductDetailPartOne';

// ============================================================================
// 常量定义
// ============================================================================

/** 产品页面区块总数 */
const SECTION_COUNT = 4;
/** 目标 ID 前缀 */
const TARGET_ID_PREFIX = 'snap-section';
/** 调试面板位置 */
const DEBUG_PANEL_POSITION = { top: '4px', right: '4px', zIndex: 50 } as const;
/** 选择面板位置 */
const CHOICE_PANEL_POSITION = { top: '96px', left: '4px', zIndex: 50 } as const;

// ============================================================================
// 组件实现
// ============================================================================

export default function ProductsPage() {
  // ==========================================================================
  // Hook 调用
  // ==========================================================================

  const { activeTarget, snapToTarget, snapdebugInfo } = useWindowScrollSnap({
    debugFlag: true,
    targetSelector: '.snap-section',
    targetAlignTo: 'top',
    snapThreshold: 280,
    enabledDirections: ['up', 'down'],
    observerRoot: undefined,
  });

  // ==========================================================================
  // 渲染
  // ==========================================================================

  return (
    <div className='relative'>
      {/* 调试面板信息组件 */}
      <SnapDebugPanel
        snapdebugInfo={snapdebugInfo}
        position={DEBUG_PANEL_POSITION}
        visible={true}
      />

      {/* 吸附选择调试组件 */}
      <SnapChoicePanel
        sectionCount={SECTION_COUNT}
        targetIdPrefix={TARGET_ID_PREFIX}
        activeTarget={activeTarget}
        snapToTarget={snapToTarget}
        position={CHOICE_PANEL_POSITION}
        visible={true}
      />

      {/* 内容组件 */}
      <ProductDetailPartOne />
    </div>
  );
}
