// app/(main)/page.tsx

'use client';

import { useEffect } from 'react';
import { resetWindowScrollTop } from '../../utils/scroll';
import { useWindowScrollSnap } from '../../hooks/useWindowScrollSnap'; // 滚动吸附 hook
import { useSnapDebugPanel } from '../../components/common/useSnapDebugPanel'; // 调试面板 hook
import { useSnapSectionChoice } from '../../components/common/useSnapSectionChoice'; // 新增：吸附选择调试组件

import CaseSection from '@/components/home/CaseSection';
import CTASection from '@/components/home/CTASection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HeroSection from '@/components/home/HeroSection';
import ProductSection from '@/components/home/ProductSection';
import StatsSection from '@/components/home/StatsSection';
import ProductDetailPartOne from '@/components/products/ProductDetailPartOne';

export default function HomePage() {
  // 组件挂载时重置滚动位置到顶部
  useEffect(() => {
    resetWindowScrollTop('instant');
  }, []);

  // 调用滚动吸附 hook，获取状态和方法
  const { activeTarget, snapToTarget, snapdebugInfo } = useWindowScrollSnap({
    debugFlag: true, // 启用调试模式
    targetSelector: '.snap-section',
    targetAlignTo: 'top',
    snapThreshold: 280,
    enabledDirections: ['up', 'down'],
    observerRoot: undefined,
  });

  // 获取吸附调试面板组件
  const SnapDebugPanel = useSnapDebugPanel({
    snapdebugInfo,
    position: { top: '4px', right: '4px', zIndex: 50 },
    visible: true,
  });

  // 获取吸附选择调试组件
  const SnapSectionChoice = useSnapSectionChoice({
    sectionCount: 6,
    targetIdPrefix: 'snapTarget',
    activeTarget,
    snapToTarget,
    // 可选参数
    position: { top: '96px', left: '4px', zIndex: 50 },
    visible: true,
  });

  return (
    <div className='relative'>
      {/* 调试面板信息组件 */}
      {SnapDebugPanel}
      {/* 吸附选择调试组件 */}
      {SnapSectionChoice}
      {/* 内容组件 */}
      <FeaturesSection />
      <ProductSection />
      <CaseSection />
    </div>
  );
}
