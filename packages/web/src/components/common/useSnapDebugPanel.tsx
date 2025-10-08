// components/common/useSnapDebugPanel.tsx - 滚动吸附调试面板
// 功能：提供一个可复用的调试面板组件，用于显示滚动吸附相关的调试信息
// 使用场景：开发时在页面右上角显示 rect、滚动方向等信息，便于调试

import { ReactElement } from 'react'; // 只导入必要的类型

// 调试信息接口：定义调试面板显示的数据结构
interface SnapDebugInfo {
  rect: DOMRect | null;           // 当前活跃目标的矩形信息
  targetsCount: number;           // 目标元素总数
  isScrollingDirection: 'up' | 'down' | 'no'; // 滚动方向
  alignTo: string;                // 对齐方式
  activeTargetId: string | null;  // 当前活跃目标 ID
  scrollY: number;                // 当前滚动位置 Y
  threshold: number;              // 吸附触发阈值
  scrollVelocity: number;         // 滚动速度（px/帧）
}

interface ViewportRect {                                          // 视口矩形信息
  width: number;                                                  // 视口宽度
  height: number;                                                 // 视口高度
  top: number;                                                    // 视口顶部相对文档顶部的偏移
  bottom: number;                                                 // 视口底部相对文档顶部的偏移
  scrollX: number;                                                // 水平滚动位置
  scrollY: number;                                                // 垂直滚动位置
}

// 选项接口：配置调试面板的行为
interface UseDebugPanelOptions {
  snapdebugInfo: SnapDebugInfo;                                     // 调试信息数据
  viewportRect: ViewportRect;                                       // 视口矩形信息
  position?: {
    // 面板位置配置
    top?: string; // 顶部位置
    right?: string; // 右侧位置
    bottom?: string; // 底部位置
    left?: string; // 左侧位置
  };
  visible?: boolean; // 是否显示面板，默认 true
}

// Hook 函数：返回调试面板的 JSX 元素
export function useSnapDebugPanel(options: UseDebugPanelOptions): ReactElement {
  // 解构选项参数，提供默认值
  const {
    snapdebugInfo = {} as SnapDebugInfo, // 添加默认值处理
    viewportRect = {} as ViewportRect,   // 添加默认值处理
    position = { top: '4px', right: '4px' },
    visible = true,
  } = options || {}; // 添加对 options 为空的处理

  // 检查是否可见
  if (!visible) {
    return <></>; // 返回空片段
  }

  // 返回 JSX 元素
  return (
    <div
      className='fixed bg-black/40 text-white p-4 rounded shadow-lg z-50' // 固定定位，半透明黑色背景
      style={{
        top: position.top,       // 应用顶部位置
        right: position.right,   // 应用右侧位置
        bottom: position.bottom, // 应用底部位置
        left: position.left,     // 应用左侧位置
      }}
    >
      <h3 className='text-sm font-bold'>Debug Info</h3> {/* 面板标题 */}
      <p> {/* 显示 Rect 信息 */}
        Rect: {
          snapdebugInfo?.rect // 添加可选链操作符
            ? `top: ${snapdebugInfo.rect.top.toFixed(2)}, left: ${snapdebugInfo.rect.left.toFixed(2)}, width: ${snapdebugInfo.rect.width.toFixed(2)}, height: ${snapdebugInfo.rect.height.toFixed(2)}`
            : 'null'
        }
      </p>
      <p>Targets Count: {snapdebugInfo?.targetsCount || 0}</p>     {/* 显示目标数量 */}
      <p>Scrolling: {snapdebugInfo?.isScrollingDirection || 'no'}</p> {/* 显示滚动方向 */}
      <p>Align To: {snapdebugInfo?.alignTo || 'top'}</p>               {/* 显示对齐方式 */}
      <p>Active Target ID: {snapdebugInfo?.activeTargetId || 'null'}</p> {/* 显示活跃目标 ID */}
      <p>Scroll Y: {(snapdebugInfo?.scrollY || 0).toFixed(2)}</p>    {/* 显示滚动位置 Y */}
      <p>Threshold: {(snapdebugInfo?.threshold || 0).toFixed(2)}</p> {/* 显示阈值 */}
      <p>Scroll Velocity: {(snapdebugInfo?.scrollVelocity || 0).toFixed(2)}</p> {/* 显示滚动速度 */}

      <h3 className='text-sm font-bold mt-4'>Viewport Rect</h3> {/* 视口矩形信息标题 */}
      <p>Width: {(viewportRect?.width || 0).toFixed(2)}px</p>       {/* 显示视口宽度 */}
      <p>Height: {(viewportRect?.height || 0).toFixed(2)}px</p>     {/* 显示视口高度 */}
      <p>Top: {(viewportRect?.top || 0).toFixed(2)}px</p>           {/* 显示视口顶部位置 */}
      <p>Bottom: {(viewportRect?.bottom || 0).toFixed(2)}px</p>     {/* 显示视口底部位置 */}
      <p>Scroll X: {(viewportRect?.scrollX || 0).toFixed(2)}px</p>  {/* 显示水平滚动位置 */}
      <p>Scroll Y: {(viewportRect?.scrollY || 0).toFixed(2)}px</p>  {/* 显示垂直滚动位置 */}
    </div>
  );
}
