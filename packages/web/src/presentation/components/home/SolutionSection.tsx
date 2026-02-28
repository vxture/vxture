/**
 * SolutionSection.tsx - 首页解决方案区块（重构版）
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示首页 Solutions 区块 UI
 * - 使用 Application Layer 的 useSolutions Hook 获取数据
 * - 支持吸附滚动、响应式布局、方案轮播
 *
 * @layer Presentation
 * @category Components - Home
 */
'use client';

import { useState, memo, useMemo } from 'react';
import Image from 'next/image';
import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi';
import { useSolutions } from '@/application/hooks/homepage';
import { useLocale } from '@/application/hooks/shared/useLocale';

// 解决方案卡片组件（性能优化：React.memo）
interface SolutionCardProps {
  solution: {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    cover: {
      url: string;
      alt: string;
    };
    theme: string;
    cta?: {
      label: string;
      href: string;
    };
  };
  idx: number;
  colors: {
    gradient: string;
    bg: string;
    border: string;
    text: string;
    button: string;
  };
  uiTexts: {
    learnMore: string;
    prev: string;
    next: string;
    featuresTitle: string;
  };
  prev: () => void;
  next: () => void;
}

const SolutionCard = memo(function SolutionCard({
  solution,
  idx,
  colors,
  uiTexts,
  prev,
  next,
}: SolutionCardProps) {
  return (
    <div className={`w-full transition-all duration-500 ${colors.border} ${colors.bg}`}>
      <div className='grid grid-cols-1 lg:grid-cols-[38%_62%] h-full rounded-2xl shadow-lg overflow-hidden'>
        {/* 左侧文本内容 */}
        <div className='relative flex h-full items-center justify-start px-12 py-4'>
          <div className='relative w-full h-full flex flex-col gap-3 justify-items-start'>
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
              <div className='relative z-10 flex-1 flex flex-col items-start pl-12'>
                <h3 className='text-xl font-bold text-blue-800 text-left'>{solution.title}</h3>
                <p className='text-sm text-gray-600 mt-1 text-left'>{solution.subtitle}</p>
              </div>
            </div>
            {/* 方案描述 */}
            <div className='items-center justify-left'>
              <p className='text-base text-gray-600 leading-relaxed'>{solution.description}</p>
            </div>
            {/* 特色标签 */}
            <div className='items-center justify-left my-2'>
              <h4 className='text-lg font-semibold text-gray-800'>{uiTexts.featuresTitle}</h4>
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
            <div className='flex justify-between items-center mt-2'>
              <a
                href={solution.cta?.href || `/solutions/${solution.slug}`}
                className={`inline-flex items-center px-5 py-1.5 ${colors.button} text-white rounded-lg transition-all duration-300 font-semibold w-max hover:opacity-90 text-sm`}
              >
                {solution.cta?.label || uiTexts.learnMore}
              </a>
              <div className='flex justify-normal'>
                <div className='flex gap-6'>
                  {/* 上一项 */}
                  <button
                    aria-label='Previous'
                    onClick={prev}
                    className='flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-all duration-300 hover:shadow-md'
                  >
                    <PiCaretLeftBold className='w-4 h-4 text-gray-700' />
                    <span className='text-gray-400 font-medium text-sm'>{uiTexts.prev}</span>
                  </button>
                  {/* 下一项 */}
                  <button
                    aria-label='Next'
                    onClick={next}
                    className='flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-all duration-300 hover:shadow-md'
                  >
                    <span className='text-gray-400 font-medium text-sm'>{uiTexts.next}</span>
                    <PiCaretRightBold className='w-4 h-4 text-gray-700' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 右侧图片内容 */}
        <div className='bg-gradient-to-r from-blue-100 via-blue-100 to-blue-200'>
          <div className='relative flex items-center justify-center bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 px-24 py-6'>
            <div className='relative w-full max-w-lg h-auto flex flex-col items-center justify-start hover:scale-105 transition-all duration-300'>
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
                    src='/images/products/monitor-frame.png'
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
                  src='/images/products/monitor-base.png'
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

// 解决方案区块主组件
interface SolutionSectionProps {
  id: string;
}

// 主题颜色映射表
const colorMap = {
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

const SolutionSection = memo(function SolutionSection({ id }: SolutionSectionProps) {
  // 获取当前语言
  const { locale } = useLocale();

  // 获取 Solutions 数据
  const { data: solutionsData, isLoading } = useSolutions();

  // 轮播当前索引
  const [current, setCurrent] = useState<number>(0);

  // 根据语言设置默认 UI 文本
  const defaultUiTexts = useMemo(() => {
    if (locale === 'en-US') {
      return {
        learnMore: 'Learn More',
        prev: 'Previous',
        next: 'Next',
        featuresTitle: 'Key Features',
      };
    }
    return {
      learnMore: '了解更多',
      prev: '上一个',
      next: '下一个',
      featuresTitle: '核心特性',
    };
  }, [locale]);

  // 如果数据未加载，显示加载状态
  if (isLoading || !solutionsData) {
    return (
      <section
        id={id}
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

  const solutions = solutionsData.items;
  const total = solutions.length;

  // UI 文本（优先使用 JSON 数据，否则使用根据语言的默认值）
  const uiTexts = solutionsData.ui || defaultUiTexts;

  // 轮播切换
  const prev = () => setCurrent((prev) => (prev - 1 + total) % total);
  const next = () => setCurrent((prev) => (prev + 1) % total);

  return (
    <section
      id='snap-section-3'
      className='relative snap-section min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white border-2 border-red-500'
    >
      <div className='w-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full min-h-screen border-2 border-red-500'>
        {/* 1. 标题区 - 靠上对齐 */}
        <div className='text-center pt-28 border-2 border-red-500'>
          <h2 className='text-3xl lg:text-4xl font-bold text-blue-800 mb-4'>
            {solutionsData.title}
          </h2>
          <p className='text-lg text-gray-600 max-w-4xl mx-auto'>{solutionsData.subtitle}</p>
        </div>

        {/* 2. 内容区 - 上下居中 */}
        <div className='flex items-center justify-center py-8 border-2 border-red-500'>
          <div className='w-full'>
            {/* 方案轮播区块 */}
            <div className='w-full flex justify-center'>
              {solutions.map((solution, idx) => {
                if (idx !== current) return null;
                const colors = colorMap[solution.theme as keyof typeof colorMap] || colorMap.primary;
                return (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    idx={idx}
                    colors={colors}
                    uiTexts={uiTexts}
                    prev={prev}
                    next={next}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. 底部区 - 靠下对齐 */}
        {solutionsData.tagline && (
          <div className='text-center pb-20 border-2 border-red-500'>
            <div className='inline-flex items-center space-x-2'>
              <div className='w-8 h-[1px] bg-gradient-to-r from-transparent to-blue-200'></div>
              <span className='text-sm font-medium text-blue-500'>{solutionsData.tagline}</span>
              <div className='w-8 h-[1px] bg-gradient-to-l from-transparent to-blue-200'></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default SolutionSection;
