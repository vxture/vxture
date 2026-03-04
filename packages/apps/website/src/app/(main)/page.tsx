/**
 * page.tsx - 首页主内容区
 *
 * 功能：渲染首页核心区块，包括 Hero、Features、Solutions、Cases、CTA
 *
 * @author Stone Smoker
 * @created 2024-06-01
 * @lastModified 2026-03-03
 * @version 2.0.0
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

import HeroSection from '@/presentation/components/home/HeroSection';
import FeaturesSection from '@/presentation/components/home/FeaturesSection';
import SolutionSection from '@/presentation/components/home/SolutionSection';
import CaseSection from '@/presentation/components/home/CaseSection';
import CTASection from '@/presentation/components/home/CTASection';
import ScrollToButton from '@/presentation/components/widgets/ScrollToButton';
import SnapDebugPanel from '@/presentation/components/panels/SnapDebugPanel';
import SnapChoicePanel from '@/presentation/components/panels/SnapChoicePanel';
import { useWindowScrollSnap } from '@/application/hooks/useWindowScrollSnap';

// ============================================================================
// 常量定义
// ============================================================================

/** 区块信息列表 */
const SECTIONS = [
  { id: 'section-01', name: 'Hero' },
  { id: 'section-02', name: 'Features' },
  { id: 'section-03', name: 'Solutions' },
  { id: 'section-04', name: 'Cases' },
  { id: 'section-05', name: 'CTA' },
] as const;
/** 调试面板位置 */
const DEBUG_PANEL_POSITION = { top: '80px', right: '20px', zIndex: 50 } as const;
/** 选择面板位置 */
const CHOICE_PANEL_POSITION = { top: '80px', left: '20px', zIndex: 50 } as const;
/** 是否开发环境 */
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// ============================================================================
// 组件实现
// ============================================================================

export default function HomePage() {
  // ==========================================================================
  // Hook 调用
  // ==========================================================================

  const { activeTarget, snapToTarget, snapdebugInfo } = useWindowScrollSnap({
    debugFlag: IS_DEVELOPMENT,
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
        visible={IS_DEVELOPMENT}
      />

      {/* 吸附选择调试组件 */}
      <SnapChoicePanel
        sections={SECTIONS}
        activeTarget={activeTarget}
        snapToTarget={snapToTarget}
        position={CHOICE_PANEL_POSITION}
        visible={IS_DEVELOPMENT}
      />

      {/* Hero 区块 */}
      <HeroSection id='section-01' />

      {/* Features 区块 */}
      <FeaturesSection id='section-02' theme='light' />

      {/* Solutions 区块 */}
      <SolutionSection id='section-03' />

      {/* Cases 区块 */}
      <CaseSection id='section-04' />

      {/* CTA 区块 */}
      <CTASection id='section-05' />

      {/* 滚动到顶部按钮 */}
      <ScrollToButton snapToTarget={snapToTarget} />
    </div>
  );
}
