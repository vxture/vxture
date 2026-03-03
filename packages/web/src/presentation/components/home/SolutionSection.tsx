/**
 * SolutionSection.tsx - 首页解决方案区块（重构版）
 *
 * 功能：展示首页 Solutions 区块 UI，使用 Application Layer 的 useSolutions Hook 获取数据，
 *      支持吸附滚动、响应式布局、方案轮播
 *
 * @author Stone Smoker
 * @created 2024-06-01
 * @lastModified 2026-03-03
 * @version 2.0.0
 * @copyright Copyright (c) 2024-2026 Vxture Team
 * @license MIT
 *
 * @layer Presentation
 * @category Components - Home
 */
'use client';

import { useState, memo, useCallback } from 'react';
import Image from 'next/image';
import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi';
import { useSolutions } from '@/application/hooks/homepage';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 解决方案卡片 Props
 */
interface SolutionCardProps {
  readonly solution: {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly subtitle: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly cover: {
      readonly url: string;
      readonly alt: string;
    };
    readonly theme: string;
    readonly cta: {
      readonly href: string;
    };
  };
  readonly idx: number;
  readonly colors: {
    readonly gradient: string;
    readonly bg: string;
    readonly border: string;
    readonly text: string;
    readonly button: string;
  };
  readonly uiTexts: {
    readonly viewDetails: string;
    readonly prev: string;
    readonly next: string;
  };
  readonly featuresTitle: string;
  readonly prev: () => void;
  readonly next: () => void;
}

/**
 * 解决方案区块主组件 Props
 */
interface SolutionSectionProps {
  readonly id: string;
  readonly name?: string;
}

/**
 * 主题颜色映射类型
 */
type ColorMap = {
  readonly [key: string]: {
    readonly gradient: string;
    readonly bg: string;
    readonly border: string;
    readonly text: string;
    readonly button: string;
  };
};

// ============================================================================
// 常量定义
// ============================================================================

/**
 * 主题颜色映射表
 */
const colorMap: ColorMap = {
  primary: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    button: 'bg-blue-500 hover:bg-blue-600',
  },
  brand: {
    gradient: 'from-purple-500 to-blue-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    button: 'bg-purple-500 hover:bg-purple-600',
  },
  info: {
    gradient: 'from-cyan-500 to-green-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    button: 'bg-cyan-500 hover:bg-cyan-600',
  },
  success: {
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    button: 'bg-green-500 hover:bg-green-600',
  },
};

// ============================================================================
// 子组件定义
// ============================================================================

/**
 * 解决方案卡片组件（性能优化：React.memo）
 */
const SolutionCard = memo(function SolutionCard({
  solution,
  idx,
  colors,
  uiTexts,
  featuresTitle,
  prev,
  next,
}: SolutionCardProps) {
  // ==========================================================================
  // 渲染
  // ==========================================================================

  return (
    <div className={`w-full transition-all duration-500 ${colors.border} ${colors.bg}`}>
      <div className='grid grid-cols-1 lg:grid-cols-[38%_62%] h-full rounded-2xl shadow-lg overflow-hidden'>
        {/* 左侧文本内容 */}
        <div className='relative flex h-full items-center justify-start px-4 py-4'>
          <div className='relative w-full h-full flex flex-col gap-4 justify-items-start'>
            {/* 标题与副标题 */}
            <div className='relative flex items-center h-20 min-h-[80px]'>
              {/* 背景数字 */}
              <span
                className='absolute left-0 top-1/2 -translate-y-1/2 text-[48px] font-semibold text-blue-400 opacity-70 select-none pointer-events-none z-0 drop-shadow-lg'
                aria-hidden='true'
                style={{
                  letterSpacing: '-0.05em',
                  textShadow: '0 4px 24px #60a5fa, 0 1px 0 #fff',
                }}
              >
                {idx + 1}
              </span>
              {/* 标题内容 */}
              <div className='relative z-10 flex-1 flex flex-col items-start py-6 pl-12'>
                <h3 className='text-xl font-bold text-blue-800 text-left'>{solution.title}</h3>
                <p className='text-sm text-gray-600 mt-1 text-left'>{solution.subtitle}</p>
              </div>
            </div>
            {/* 方案描述 */}
            <div className='items-center justify-left ml-12'>
              <p className='text-base text-gray-600 leading-relaxed'>{solution.description}</p>
            </div>
            {/* 特色标签 */}
            <div className='items-center justify-left mt-4 ml-12'>
              <h4 className='text-lg font-semibold text-gray-800'>{featuresTitle}</h4>
              <div className='grid grid-cols-2 gap-3 justify-items-left my-2'>
                {solution.tags.map((tag) => (
                  <div key={tag} className='flex items-center justify-start space-x-2'>
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}
                    ></div>
                    <span className='text-base text-gray-600'>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* 了解更多与导航按钮 */}
            <div className='flex flex-col gap-4 mt-auto mb-4'>
              {/* 第一行：了解更多 */}
              <div className='flex justify-start items-center ml-12'>
                <a
                  href={solution.cta.href}
                  className={`inline-flex items-center px-5 py-2 ${colors.button} text-white rounded-lg transition-all duration-300 font-semibold w-max hover:opacity-90 text-sm`}
                >
                  {uiTexts.viewDetails}
                </a>
              </div>
              {/* 分割线 */}
              <div className='w-full h-px bg-gray-200'></div>
              {/* 第二行：两个操作按钮 */}
              <div className='flex justify-center'>
                <div className='flex gap-6'>
                  {/* 上一项 */}
                  <button
                    aria-label='Previous'
                    onClick={prev}
                    className='flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-200 transition-all duration-300 hover:shadow-md'
                  >
                    <PiCaretLeftBold className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-400 font-medium text-sm'>{uiTexts.prev}</span>
                  </button>
                  {/* 下一项 */}
                  <button
                    aria-label='Next'
                    onClick={next}
                    className='flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-200 transition-all duration-300 hover:shadow-md'
                  >
                    <span className='text-gray-400 font-medium text-sm'>{uiTexts.next}</span>
                    <PiCaretRightBold className='w-4 h-4 text-gray-400' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 右侧图片内容 */}
        <div className='bg-gradient-to-r from-blue-100 via-blue-100 to-blue-200'>
          <div className='relative flex items-center justify-center bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 px-38 '>
            <div className='relative w-full max-w-2xl h-auto flex flex-col items-center justify-start hover:scale-105 transition-all duration-300 py-6'>
              {/* 方案主图层（响应式自适应） */}
              <div className='relative w-full pointer-events-none select-none'>
                <div
                  className='absolute flex items-center justify-center'
                  style={{
                    top: '4%',
                    right: '3%',
                    bottom: '4.5%',
                    left: '3%',
                  }}
                >
                  <div className='w-full h-full overflow-hidden z-10'>
                    <Image
                      src={solution.cover.url}
                      alt={solution.cover.alt}
                      width={1}
                      height={1}
                      sizes='100vw'
                      priority
                      className='w-full h-auto object-contain select-none pointer-events-none block'
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
                {/* 装饰边框层（响应式自适应） */}
                <div className='relative w-full z-20'>
                  <Image
                    src='/images/productssection/monitor-frame.png'
                    alt='Monitor Frame'
                    width={1}
                    height={1}
                    sizes='100vw'
                    priority
                    className='w-full h-auto object-contain select-none pointer-events-none block'
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              </div>
              {/* 底座装饰层（响应式自适应） */}
              <div className='relative w-full pointer-events-none select-none mt-1'>
                <Image
                  src='/images/productssection/monitor-base.png'
                  alt='Monitor Base'
                  width={1}
                  height={1}
                  sizes='100vw'
                  priority
                  className='w-full h-auto object-contain select-none pointer-events-none block'
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// 主组件实现
// ============================================================================

/**
 * 解决方案区块主组件
 */
const SolutionSection = memo(function SolutionSection({
  id,
  name = 'Solutions',
}: SolutionSectionProps) {
  // ==========================================================================
  // 状态初始化
  // ==========================================================================

  // 轮播当前索引
  const [current, setCurrent] = useState<number>(0);

  // ==========================================================================
  // Hooks 调用
  // ==========================================================================

  // 获取 Solutions 数据
  const { data: solutionsData, isLoading, error } = useSolutions();

  // ==========================================================================
  // 事件处理
  // ==========================================================================

  // 轮播切换
  const total = solutionsData?.items.length || 0;

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  // ==========================================================================
  // 早期返回
  // ==========================================================================

  // 加载状态
  if (isLoading) {
    return (
      <section
        id={id}
        data-name={name}
        className='relative snap-section min-h-screen flex flex-col justify-center bg-gradient-to-b from-blue-50 to-white'
      >
        <div className='max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-center h-full'>
            <p className='text-gray-400'>加载中...</p>
          </div>
        </div>
      </section>
    );
  }

  // 错误状态
  if (error || !solutionsData) {
    return (
      <section
        id={id}
        data-name={name}
        className='relative snap-section min-h-screen flex flex-col justify-center bg-gradient-to-b from-blue-50 to-white'
      >
        <div className='max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-center h-full'>
            <p className='text-gray-400'>加载失败</p>
          </div>
        </div>
      </section>
    );
  }

  // 如果内容被禁用，不渲染
  if (!solutionsData.enabled) {
    return null;
  }

  // ==========================================================================
  // 渲染
  // ==========================================================================

  const { title, subtitle, tagline, items, ui, featuresTitle } = solutionsData;
  const uiTexts = ui;

  return (
    <section
      id={id}
      data-name={name}
      className='relative snap-section min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white'
    >
      <div className='w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full min-h-screen'>
        {/* 1. 标题区 - 靠上对齐 */}
        <div className='text-center pt-28'>
          <h2 className='text-3xl lg:text-4xl font-bold text-blue-800 mb-4'>{title}</h2>
          <p className='text-lg text-gray-600 max-w-4xl mx-auto'>{subtitle}</p>
        </div>

        {/* 2. 内容区 - 上下居中 */}
        <div className='flex flex-1 items-center justify-center py-8'>
          <div className='w-full'>
            {/* 方案标题导航 */}
            <div className='flex justify-center mb-4'>
              <div className='flex items-center gap-2 sm:gap-4'>
                {items.map((solution, idx) => (
                  <button
                    key={solution.id}
                    onClick={() => setCurrent(idx)}
                    className={`text-xs sm:text-sm transition-all duration-300 px-2 sm:px-3 py-1 rounded-full
                      ${
                        idx === current
                          ? 'text-blue-800 font-semibold bg-blue-100'
                          : 'text-gray-400 hover:text-gray-600'
                      }
                    `}
                  >
                    {solution.title}
                  </button>
                ))}
              </div>
            </div>

            {/* 方案轮播区块 */}
            <div className='w-full flex justify-center'>
              {items.map((solution, idx) => {
                if (idx !== current) return null;
                const colors =
                  colorMap[solution.theme as keyof typeof colorMap] || colorMap.primary;
                return (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    idx={idx}
                    colors={colors}
                    uiTexts={uiTexts}
                    featuresTitle={featuresTitle}
                    prev={prev}
                    next={next}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. 底部区 - 靠下对齐 */}
        {tagline && (
          <div className='text-center pb-12'>
            <div className='inline-flex items-center space-x-2'>
              <div className='w-8 h-[2px] bg-gradient-to-r from-transparent to-blue-200'></div>
              <span className='text-sm font-medium text-blue-500'>{tagline}</span>
              <div className='w-8 h-[2px] bg-gradient-to-l from-transparent to-blue-200'></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default SolutionSection;
