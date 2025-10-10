/**
 * useSnapDebugPanel.tsx - 滚动吸附调试面板
 *
 * 功能：提供可复用的调试面板组件，显示滚动吸附相关的实时调试信息
 * 用途：开发时在页面右上角展示 rect、滚动方向、速度等，便于调试和性能分析
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 时间：2024-06-01
 *
 * 代码规范：严格遵循 TypeScript + React 组件最佳实践
 * 性能优化：避免不必要的渲染，样式合并 useMemo，属性默认值合并
 */

import React, { ReactElement, useMemo } from 'react';

// 调试信息接口：定义调试面板显示的数据结构
interface SnapDebugInfo {
  screenRect?: DOMRect | null; // 视口区域的 DOMRect 对象
  targetRect?: DOMRect | null; // 当前活跃目标的矩形信息
  targetsCount?: number; // 目标元素总数
  activeTargetId?: string | null; // 当前活跃目标 ID
  targetAlignTo?: string; // 对齐方式
  snapThreshold?: number; // 吸附触发阈值
  isScrollingDirection?: 'up' | 'down' | 'no'; // 滚动方向
  scrollVelocity?: number; // 滚动速度（px/帧）
  scrollX?: number; // 水平滚动位置
  scrollY?: number; // 垂直滚动位置
}

// 选项接口：配置调试面板的行为
interface UseDebugPanelOptions {
  visible?: boolean; // 是否显示面板（可选），默认 true
  snapdebugInfo?: SnapDebugInfo; // 调试信息数据（可选），默认为空对象
  position?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    zIndex?: number | string; // 支持 zIndex
  };
  style?: React.CSSProperties; // 自定义样式
  className?: string; // 自定义类名
}

// 默认位置配置
const DEFAULT_POSITION = { top: '4px', right: '4px', zIndex: 9999 };

/**
 * 工具函数：格式化 DOMRect 信息为字符串
 * @param rect DOMRect 对象
 * @returns 格式化字符串
 */
const formatRect = (rect: DOMRect | null | undefined): string => {
  if (!rect) return 'null';
  return `top: ${rect.top.toFixed(2)}, left: ${rect.left.toFixed(2)}, width: ${rect.width.toFixed(2)}, height: ${rect.height.toFixed(2)}`;
};

/**
 * 工具函数：格式化数字，保留两位小数
 * @param num 数字
 * @param defaultValue 默认值
 * @returns 格式化字符串
 */
const formatNumber = (num: number | undefined, defaultValue = 0): string => {
  return num !== undefined ? num.toFixed(2) : defaultValue.toFixed(2);
};

/**
 * useSnapDebugPanel - 滚动吸附调试面板 Hook
 * @param options UseDebugPanelOptions
 * @returns ReactElement
 */
export function useSnapDebugPanel(options: UseDebugPanelOptions): ReactElement {
  // 解构选项参数，提供默认值
  const { visible = true, snapdebugInfo = {}, position = {}, style, className } = options;

  // 合并位置配置
  const panelPosition = useMemo(
    () => ({
      ...DEFAULT_POSITION,
      ...position,
    }),
    [position]
  );

  // 合并样式配置
  const panelStyle = useMemo<React.CSSProperties>(
    () => ({
      position: 'fixed',
      ...panelPosition,
      padding: '12px',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      color: '#ffffff',
      borderRadius: '6px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      whiteSpace: 'nowrap',
      width: 'auto',
      maxWidth: 'none',
      maxHeight: 'auto',
      overflowY: 'auto',
      fontSize: '14px',
      ...style,
    }),
    [panelPosition, style]
  );

  // 性能优化：面板不可见时直接返回空片段，避免渲染
  if (!visible) {
    return <></>;
  }

  // 渲染调试面板
  return (
    <div style={panelStyle} className={className}>
      <h3 className='mb-2 border-b border-gray-300 pb-1'>滚动吸附调试信息</h3>
      <div className='space-y-1'>
        <p>ScreenRect: {formatRect(snapdebugInfo.screenRect)}</p>
        <p>TargetRect: {formatRect(snapdebugInfo.targetRect)}</p>
      </div>
      <div className='my-2 h-px bg-gray-300'></div>
      <div className='space-y-1'>
        <p>目标总数: {snapdebugInfo.targetsCount ?? 0}</p>
        <p>活跃目标: {snapdebugInfo.activeTargetId ?? 'null'}</p>
        <p>对齐方式: {snapdebugInfo.targetAlignTo ?? 'top'}</p>
        <p>吸附阈值: {formatNumber(snapdebugInfo.snapThreshold)}px</p>
        <p>滚动方向: {snapdebugInfo.isScrollingDirection ?? 'no'}</p>
        <p>滚动速度: {formatNumber(snapdebugInfo.scrollVelocity)}px/帧</p>
      </div>
      <div className='my-2 h-px bg-gray-300'></div>
      <div className='space-y-1'>
        <p>滚动X: {formatNumber(snapdebugInfo.scrollX)}px</p>
        <p>滚动Y: {formatNumber(snapdebugInfo.scrollY)}px</p>
      </div>
    </div>
  );
}
