/**
 * page.tsx - 首页主内容区（重构版）
 *
 * Presentation Layer - Page
 *
 * 职责：
 * - 渲染首页所有区块
 * - 使用重构后的组件
 *
 * @layer Presentation
 * @category Pages
 */
'use client';

import HeroSection from '@/Presentation/components/home/HeroSection';
import FeaturesSection from '@/Presentation/components/home/FeaturesSection';

export default function HomePage() {
  return (
    <div className='relative'>
      {/* Hero 区块 */}
      <HeroSection />

      {/* Features 区块 */}
      <FeaturesSection id='features' theme='light' />

      {/* 其他区块待重构 */}
      {/* <SolutionSection id='solutions' /> */}
      {/* <CaseSection id='cases' /> */}
      {/* <CTASection id='cta' /> */}
    </div>
  );
}