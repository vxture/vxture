// packages/web/src/app/products/page.tsx - 产品页面
// 功能：演示窗口滚动吸附效果，包含导航、调试面板和内容组件
// 使用场景：测试滚动吸附 hook 和调试面板

'use client'; // 客户端组件，允许使用浏览器 API

// 导入必要的模块
import { useWindowScrollSnap } from '../../hooks/useWindowScrollSnap'; // 滚动吸附 hook
import { useSnapDebugPanel } from '../../components/common/useSnapDebugPanel'; // 调试面板 hook
import ProductDetailPartOne from '../../components/products/ProductDetailPartOne'; // 内容组件

export default function WindowScrollDemo() {
  // 调用滚动吸附 hook，获取状态和方法
  const { activeTarget, snapToTarget, snapdebugInfo, viewportRect } = useWindowScrollSnap({
    debugFlag: true,                                                           // 启用调试模式，更新 debugInfo
    targetSelector: '.snap-target',                                            // 选择吸附目标的 CSS 类
    threshold: 150,                                                            // 吸附触发距离（像素）
    alignTo: 'top',                                                            // 对齐方式：顶部
    smooth: true,                                                              // 平滑滚动
    enabledDirections: ['up', 'down'],                                         // 启用上下方向吸附
    observerRoot: undefined,
  });

  // 获取调试面板组件
  const DebugPanel = useSnapDebugPanel({
    snapdebugInfo: snapdebugInfo,  // 确保传递正确的参数名称
    viewportRect,
    // 可选配置
    position: { top: '4px', right: '4px' },
    visible: true,  // 仅在调试模式下显示
  });

  return (
    // 根容器：相对定位，调试边框
    <div className='relative'>
      {/* 调试面板：显示滚动信息 */}
      {DebugPanel}

      {/* 固定导航栏：顶部固定，半透明背景 */}
      <nav className='fixed top-0 left-0 right-0 bg-white/30 backdrop-blur-md z-10 p-4'>
        <div className='flex gap-4'>
          {/* 吸附按钮1：点击吸附到 target-1 */}
          <button
            onClick={() => {
              const target = document.getElementById('target-1');
              console.log('Button clicked for target-1, found:', target); // 调试日志
              if (target) snapToTarget(target); // 安全检查后吸附
            }}
            className={`px-3 py-1 rounded ${
              activeTarget?.id === 'target-1' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`} // 动态样式：活跃时高亮
          >
            吸附到区域1
          </button>
          {/* 吸附按钮2：点击吸附到 target-2 */}
          <button
            onClick={() => {
              const target = document.getElementById('target-2');
              console.log('Button clicked for target-2, found:', target); // 调试日志
              if (target) snapToTarget(target); // 安全检查后吸附
            }}
            className={`px-3 py-1 rounded ${
              activeTarget?.id === 'target-2' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`} // 动态样式：活跃时高亮
          >
            吸附到区域2
          </button>
        </div>
      </nav>

      {/* 内容组件：渲染产品详情部分 */}
      <ProductDetailPartOne />
    </div>
  );
}
