/**
 * useSnapSectionChoice.tsx
 *
 * 功能：
 * - 统一提供可复用的吸附目标选择面板，便于调试页面吸附功能
 * - 支持自定义位置、动态 section 数量、吸附跳转等
 *
 * 用途：
 * - 开发时在页面右上角展示纵向按钮，快速跳转到各 section/target
 * - 可集成到任意页面或调试工具中
 *
 * 依赖/调用关系：
 * - 依赖 React
 * - 被页面调试工具、吸附相关组件调用
 *
 * 设计规范：
 * - 只负责吸附选择面板 UI 与交互，不包含业务逻辑
 * - 命名、结构、注释与其它通用组件保持一致
 *
 * @file useSnapSectionChoice.tsx
 * @desc 吸附调试选择面板通用组件，支持动态 section 跳转
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React
 * @tags snap, debug, section, component
 * @example
 *   <useSnapSectionChoice sectionCount={5} targetIdPrefix="section-" ... />
 * @remarks
 *   仅负责吸附选择面板 UI，吸附逻辑请通过 props 传入。
 * @todo
 *   支持吸附目标分组与自定义样式
 */

import React from 'react';

interface UseSnapSectionChoiceProps {
  sectionCount: number; // section/target 数量
  targetIdPrefix: string; //  section/target 目标元素 id 前缀
  activeTarget: HTMLElement | null;
  snapToTarget: (target: HTMLElement) => void;
  position?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    zIndex?: number | string;
  };
  visible?: boolean;
}

const DEFAULT_POSITION = { top: '4px', left: '4px', zIndex: 10 };

export function useSnapSectionChoice(props: UseSnapSectionChoiceProps): React.ReactElement {
  const {
    sectionCount,
    targetIdPrefix,
    activeTarget,
    snapToTarget,
    position = {},
    visible = true,
  } = props;

  // 合并位置配置
  const panelPosition = { ...DEFAULT_POSITION, ...position };

  if (!visible) return <></>;

  return (
    <div
      className='fixed flex flex-col gap-2 w-auto bg-black/40 text-white p-4 rounded shadow-lg'
      style={{
        top: panelPosition.top,
        right: panelPosition.right,
        bottom: panelPosition.bottom,
        left: panelPosition.left,
        zIndex: panelPosition.zIndex,
      }}
    >
      <h3 className='text-sm font-bold mb-2'>吸附选择</h3>
      {Array.from({ length: sectionCount }).map((_, i) => {
        const idx = i + 1;
        const targetId = `${targetIdPrefix}-${idx}`;
        return (
          <button
            key={idx}
            onClick={() => {
              const target = document.getElementById(targetId);
              if (target) snapToTarget(target);
            }}
            className={`px-3 py-1 rounded text-sm transition ${
              activeTarget?.id === targetId
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-black'
            }`}
            style={{ minWidth: 80 }}
          >
            吸附{idx}
          </button>
        );
      })}
    </div>
  );
}
