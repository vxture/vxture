/**
 * page.tsx - 首页主内容区
 *
 * Presentation Layer - Page
 *
 * 职责：
 * - 渲染首页核心区块
 * - Header 和 Footer 在 (main)/layout.tsx 中
 *
 * @layer Presentation
 * @category Pages
 */
'use client';

import HeroSection from '@/presentation/components/home/HeroSection';
import FeaturesSection from '@/presentation/components/home/FeaturesSection';
import SolutionSection from '@/presentation/components/home/SolutionSection';
import CaseSection from '@/presentation/components/home/CaseSection';
import CTASection from '@/presentation/components/home/CTASection';
import { useWindowScrollSnap } from '@/application/hooks/useWindowScrollSnap';
import { useSnapDebugPanel } from '@/presentation/components/common/useSnapDebugPanel';
import { useSnapSectionChoice } from '@/presentation/components/common/useSnapSectionChoice';

export default function HomePage() {
  // 调用滚动吸附 hook，获取状态和方法
  const { activeTarget, snapToTarget, snapdebugInfo } = useWindowScrollSnap({
    debugFlag: process.env.NODE_ENV === 'development', // 开发环境启用调试，生产环境关闭
    targetSelector: '.snap-section',
    targetAlignTo: 'top',
    snapThreshold: 280, // 初始值，实际使用响应式阈值（视口高度的25%，150-400px）
    enabledDirections: ['up', 'down'],
    observerRoot: undefined,
  });

  // 获取吸附调试面板组件（仅开发环境显示）
  const SnapDebugPanel = useSnapDebugPanel({
    snapdebugInfo,
    position: { top: '4px', right: '4px', zIndex: 50 },
    visible: process.env.NODE_ENV === 'development',
  });

  // 获取吸附选择调试组件（仅开发环境显示）
  const SnapSectionChoice = useSnapSectionChoice({
    sectionCount: 5, // Hero + Features + Solutions + Cases + CTA = 5个section
    targetIdPrefix: 'snap-section',
    activeTarget,
    snapToTarget,
    position: { top: '4px', left: '4px', zIndex: 50 },
    visible: process.env.NODE_ENV === 'development',
  });

  return (
    <div className='relative'>
      {/* 调试面板信息组件 */}
      {SnapDebugPanel as unknown as React.ReactNode}

      {/* 吸附选择调试组件 */}
      {SnapSectionChoice}

      {/* Hero 区块 */}
      <HeroSection />

      {/* Features 区块 */}
      <FeaturesSection id='features' theme='light' />

      {/* Solutions 区块 */}
      <SolutionSection id='solutions' />

      {/* Cases 区块 */}
      <CaseSection id='cases' />

      {/* CTA 区块 */}
      <CTASection id='cta' snapToTarget={snapToTarget} />
    </div>
  );
}