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
  /** 按钮位置类名，默认值为 "fixed right-6 bottom-6" */
  positionClass?: string;
  /** 额外的样式类名 */
  className?: string;
  /** 动画类名，默认值为 "animate-float" */
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
  positionClass = 'fixed right-6 bottom-6',
  className = '',
  animationClass = 'animate-float',
  iconSize = 'w-6 h-6',
  textSize = 'text-sm',
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
    <div className={`${positionClass} z-40`}>
      <button
        type='button'
        className={`flex flex-col items-center px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 ${animationClass} ${className}`}
        onClick={handleClick}
        aria-label={ariaLabel || text}
      >
        <FiChevronUp className={`${iconSize} mb-1`} />
        <span className={`${textSize} font-medium`}>{text}</span>
      </button>
    </div>
  );
}
