/**
 * BackToTop.tsx - 回到顶部按钮组件
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 提供回到顶部的按钮功能
 * - 支持自定义文本、图标和样式
 * - 支持动画效果和交互反馈
 *
 * @layer Presentation
 * @category Components - Common
 */
'use client';

import { FiChevronUp } from 'react-icons/fi';

interface BackToTopProps {
  /** 按钮文本，默认值为 "回到顶部" */
  text?: string;
  /** 按钮位置类名，默认值为 "absolute right-16 bottom-20" */
  positionClass?: string;
  /** 额外的样式类名 */
  className?: string;
  /** 动画类名，默认值为 "animate-bounce" */
  animationClass?: string;
  /** 图标尺寸，默认值为 "w-6 h-6" */
  iconSize?: string;
  /** 文本尺寸，默认值为 "text-xs" */
  textSize?: string;
  /** 无障碍访问标签 */
  ariaLabel?: string;
  /** 滚动吸附函数，用于与 useWindowScrollSnap 钩子协作 */
  snapToTarget?: (target: HTMLElement) => void;
}

export default function BackToTopButton({
  text = '回到顶部',
  positionClass = 'absolute right-16 bottom-20',
  className = '',
  animationClass = 'animate-bounce',
  iconSize = 'w-6 h-6',
  textSize = 'text-xs',
  ariaLabel,
  snapToTarget,
}: BackToTopProps) {
  const handleClick = () => {
    if (snapToTarget) {
      // 如果有滚动吸附函数，找到第一个 section 并吸附到它
      const firstSection = document.querySelector('.snap-section');
      if (firstSection) {
        snapToTarget(firstSection as HTMLElement);
      }
    } else {
      // 没有滚动吸附函数时，直接滚动到顶部
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={`${positionClass} z-20`}>
      <button
        type='button'
        className={`flex flex-col items-center px-3 py-2 rounded-full bg-white/0 hover:bg-gray-100 transition ${animationClass} ${className}`}
        onClick={handleClick}
        aria-label={ariaLabel || text}
      >
        <FiChevronUp className={`${iconSize} text-gray-400 mb-1`} />
        <span className={`${textSize} text-gray-400`}>{text}</span>
      </button>
    </div>
  );
}
