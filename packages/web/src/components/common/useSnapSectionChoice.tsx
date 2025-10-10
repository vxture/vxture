/**
 * useSnapSectionChoice.tsx - 吸附调试选择面板
 *
 * 功能：提供可复用的吸附目标选择面板，便于调试页面吸附功能
 * 用途：开发时在页面右上角展示纵向按钮，快速跳转到各 section/target
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 时间：2024-06-01
 *
 * 代码规范：严格遵循 TypeScript + React 组件最佳实践
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
