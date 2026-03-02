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
  text?: string;
  positionClass?: string;
  className?: string;
  animationClass?: string;
  iconSize?: string;
  ariaLabel?: string;
  snapToTarget?: (target: HTMLElement) => void;
}

export default function BackToTopButton({
  text = 'Top',
  positionClass = 'absolute right-16 bottom-20',
  className = '',
  animationClass = 'animate-bounce',
  iconSize = 'w-5 h-5',
  ariaLabel,
  snapToTarget,
}: BackToTopProps) {
  const handleClick = () => {
    if (snapToTarget) {
      const firstSection = document.querySelector('.snap-section');
      if (firstSection) {
        snapToTarget(firstSection as HTMLElement);
      }
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  /** 基础样式（默认状态） */
  const baseButtonClass = `
    flex items-center justify-center
    w-12 h-12 rounded-full
    bg-gradient-to-br from-white to-gray-100
    text-gray-500
    shadow-sm
    backdrop-blur-sm
    transition-all duration-300
  `;

  /** 交互样式 */
  const interactiveClass = `
    hover:from-blue-50 hover:to-cyan-50
    hover:text-blue-500
    hover:shadow-md
    hover:-translate-y-0.5
    active:translate-y-0
    active:shadow-sm
  `;

  return (
    <div className={`${positionClass} z-40`}>
      <button
        type='button'
        onClick={handleClick}
        aria-label={ariaLabel || text}
        className={`
          ${baseButtonClass}
          ${interactiveClass}
          ${animationClass}
          ${className}
        `}
      >
        <FiChevronUp className={iconSize} />
      </button>
    </div>
  );
}
