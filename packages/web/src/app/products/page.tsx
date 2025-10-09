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

import { useWindowScrollSnap } from '../../hooks/useWindowScrollSnap'; // 滚动吸附 hook
import { useSnapDebugPanel } from '../../components/common/useSnapDebugPanel'; // 调试面板 hook
import ProductDetailPartOne from '../../components/products/ProductDetailPartOne'; // 内容组件

export default function ProductsPage() {
  // 调用滚动吸附 hook，获取状态和方法
  const { activeTarget, snapToTarget, snapdebugInfo } = useWindowScrollSnap({
    debugFlag: true, // 启用调试模式
    targetSelector: '.snap-target',
    targetAlignTo: 'top',
    snapThreshold: 280,
    enabledDirections: ['up', 'down'],
    observerRoot: undefined,
  });

  // 获取调试面板组件（已适配新版接口）
  const DebugPanel = useSnapDebugPanel({
    snapdebugInfo,
    position: { top: '16px', right: '16px' },
    visible: true,
  });

  return (
    <div className='relative'>
      {/* 调试面板：显示滚动信息 */}
      {DebugPanel}

      {/* 固定导航栏 */}
      <nav className='fixed top-0 left-0 right-0 bg-white/30 backdrop-blur-md z-10 p-4'>
        <div className='flex gap-4'>
          {/* 性能优化：按钮渲染采用 map，避免重复代码 */}
          {[1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => {
                const target = document.getElementById(`target-${i}`);
                if (target) snapToTarget(target);
              }}
              className={`px-3 py-1 rounded ${
                activeTarget?.id === `target-${i}` ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              吸附到区域{i}
            </button>
          ))}
        </div>
      </nav>

      {/* 内容组件 */}
      <ProductDetailPartOne />
    </div>
  );
}
