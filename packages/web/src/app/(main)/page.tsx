/**
 * page.tsx
 *
 * 功能：
 * - 首页主内容区，包含吸附滚动、调试面板、内容分区
 * - 支持吸附滚动调试、内容区块动态渲染
 *
 * 用途：
 * - 作为主页面，承载核心内容区块
 * - 结构与其它页面组件保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 依赖 useWindowScrollSnap、useSnapDebugPanel、useSnapSectionChoice
 * - 被 app/(main)/layout.tsx 自动包裹
 *
 * 设计规范：
 * - 只负责页面内容与交互，不包含业务逻辑
 * - 命名、结构、注释与其它页面组件保持一致
 *
 * @file app/(main)/page.tsx
 * @desc 首页主内容区，吸附滚动与调试面板
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand, heroicons
 * @tags main, snap, debug, page
 * @example
 *   // 由 Next.js 自动路由，无需手动引入
 * @remarks
 *   仅负责页面内容与交互，业务逻辑请移至组件/服务层。
 * @todo
 *   支持更多内容区块与交互测试
 */
// app/(main)/page.tsx

'use client';

import { useEffect } from 'react';
import { resetWindowScrollTop } from '../../utils/scroll';
import { useWindowScrollSnap } from '../../hooks/useWindowScrollSnap'; // 滚动吸附 hook
import { useSnapDebugPanel } from '../../components/common/useSnapDebugPanel'; // 调试面板 hook
import { useSnapSectionChoice } from '../../components/common/useSnapSectionChoice'; // 新增：吸附选择调试组件

import CaseSection from '@/components/home/CaseSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProductSection from '@/components/home/ProductSection';

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
    position: { top: '96px', right: '4px', zIndex: 50 },
    visible: true,
  });

  // 获取吸附选择调试组件
  const targetIdPrefix = 'snapTarget';
  const SnapSectionChoice = useSnapSectionChoice({
    sectionCount: 6,
    targetIdPrefix,
    activeTarget,
    snapToTarget,
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
      <FeaturesSection id={`${targetIdPrefix}-2`} />
      <ProductSection id={`${targetIdPrefix}-3`} />
      <CaseSection id={`${targetIdPrefix}-4`} />
    </div>
  );
}
