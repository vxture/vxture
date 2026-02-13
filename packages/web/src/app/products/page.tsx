/**
 * products/page.tsx - 产品页面
 *
 * 功能：演示窗口滚动吸附效果，包含导航、调试面板和内容组件
 * 用途：测试 useWindowScrollSnap hook 和 useSnapDebugPanel 调试面板
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 时间：2024-06-01
 *
 * 代码规范：严格遵循 TypeScript + React 组件最佳实践
 * 性能优化：避免不必要的渲染，导航按钮渲染采用 map，调试面板 useMemo
 */

'use client'; // 客户端组件，允许使用浏览器 API

import { useWindowScrollSnap } from '@/application/hooks/useWindowScrollSnap'; // 滚动吸附 hook
import { useSnapDebugPanel } from '@/presentation/components/common/useSnapDebugPanel'; // 调试面板 hook
import { useSnapSectionChoice } from '@/presentation/components/common/useSnapSectionChoice'; // 吸附选择调试组件
import ProductDetailPartOne from '@/presentation/components/products/ProductDetailPartOne'; // 内容组件

export default function ProductsPage() {
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
    // 可选参数
    position: { top: '4px', right: '4px', zIndex: 50 },
    visible: true,
  });

  // 获取吸附选择调试组件
  const SnapSectionChoice = useSnapSectionChoice({
    sectionCount: 4,
    targetIdPrefix: 'snap-section',
    activeTarget,
    snapToTarget,
    // 可选：自定义位置
    position: { top: '96px', left: '4px', zIndex: 50 },
    visible: true,
  });
  return (
    <div className='relative'>
      {/* 调试面板信息组件 */}
      {SnapDebugPanel as unknown as React.ReactNode}

      {/* 吸附选择调试组件 */}
      {SnapSectionChoice}

      {/* 内容组件 */}
      <ProductDetailPartOne />
    </div>
  );
}
