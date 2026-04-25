/**
 * HeroSection.tsx - 首页主视觉区块
 *
 * 功能：展示首页 Hero 区块 UI，支持视频背景、吸附滚动、响应式布局
 *
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2026-03-19
 * @version 2.3.0
 * @copyright Copyright (c) 2024-2026 Vxture Team
 * @license MIT
 *
 * @layer Presentation
 * @category Components - Home
 */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { debugLog, debugError } from '@vxture/shared';
import { useTheme, Icon } from '@vxture/design-system';
import Image from 'next/image';

import { HERO_DATA } from '@/data/home/home.hero.data';
import ThemedHeroImage from './ThemedHeroImage';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Props 接口
 */
interface HeroSectionProps {
  readonly id: string;
  readonly name?: string;
}

// ============================================================================
// 组件实现
// ============================================================================

/**
 * 首页主视觉区块
 */
export default function HeroSection({ id, name = 'Hero' }: HeroSectionProps) {
  // ==========================================================================
  // 状态初始化
  // ==========================================================================

  const sectionRef = useRef<HTMLElement | null>(null);

  // 视频状态管理
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ==========================================================================
  // Hooks 调用
  // ==========================================================================

  const t = useTranslations('home.hero');
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // 根据主题选择封面图：暗色模式优先使用 posterImageDark，回退到 posterImage
  const activePosterImage = isDarkMode
    ? (HERO_DATA.media.posterImageDark ?? HERO_DATA.media.posterImage)
    : HERO_DATA.media.posterImage;

  // ==========================================================================
  // 调试日志
  // ==========================================================================

  debugLog('Hero data:', HERO_DATA);

  // ==========================================================================
  // 事件处理
  // ==========================================================================

  const handleVideoLoaded = useCallback(() => {
    debugLog('Video loaded successfully');
    setVideoLoaded(true);
  }, []);

  const handleVideoError = useCallback((e: Event) => {
    debugError('Video loading error:', e);
    debugError('Video element:', videoRef.current);
    debugError('Video src:', videoRef.current?.src);
    setVideoError(true);
  }, []);

  // ==========================================================================
  // Effects
  // ==========================================================================

  // 监听视频加载
  useEffect(() => {
    const video = videoRef.current;
    if (!video || HERO_DATA.media.type !== 'video') {
      debugLog('Video ref or media type check failed:', {
        hasVideo: !!video,
        mediaType: HERO_DATA.media.type,
      });
      return;
    }

    video.addEventListener('loadeddata', handleVideoLoaded);
    video.addEventListener('error', handleVideoError);
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleVideoLoaded);
      video.removeEventListener('error', handleVideoError);
    };
  }, [handleVideoLoaded, handleVideoError]);

  // ==========================================================================
  // 早期返回
  // ==========================================================================

  if (!HERO_DATA.enabled) {
    return null;
  }

  // ==========================================================================
  // 渲染
  // ==========================================================================

  return (
    <section
      ref={sectionRef}
      id={id}
      data-name={name}
      className='snap-section relative min-h-screen flex items-center justify-center overflow-hidden'
    >
      {/* 背景媒体层 */}
      <div className='absolute inset-0 w-full h-full z-0'>
        {/* 视频背景 */}
        {HERO_DATA.media.type === 'video' && HERO_DATA.media.videoUrl && (
          <>
            {/* 视频封面 - 根据主题切换亮/暗封面图 */}
            {activePosterImage && (
              <Image
                src={activePosterImage}
                alt={t('title') || '视频封面'}
                fill
                className={`object-cover transition-opacity duration-1000 ${
                  !videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}

            {/* 背景视频 */}
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'
              }`}
              autoPlay
              loop
              muted
              playsInline
              preload='auto'
            >
              <source src={HERO_DATA.media.videoUrl} type='video/mp4' />
            </video>

            {/* 视频遮罩 */}
            <div
              className={`absolute inset-0 bg-linear-to-b from-slate-100/10 via-blue-100/10 to-slate-100/10 dark:from-slate-800/30 dark:via-blue-900/20 dark:to-slate-800/30 transition-opacity duration-1000 ${
                videoLoaded && !videoError ? 'opacity-70' : 'opacity-0'
              }`}
            ></div>
          </>
        )}

        {/* 图片背景 */}
        {HERO_DATA.media.type === 'image' && HERO_DATA.media.url && (
          <>
            <ThemedHeroImage
              lightSrc={HERO_DATA.media.url}
              darkSrc={HERO_DATA.media.urlDark ?? HERO_DATA.media.url}
              alt={t('title') || '背景图片'}
            />
          </>
        )}

        {/* 备用背景 - 仅在没有媒体或媒体加载失败时显示 */}
        {(!HERO_DATA.media.type ||
          (HERO_DATA.media.type === 'video' && !HERO_DATA.media.videoUrl) ||
          (HERO_DATA.media.type === 'image' && !HERO_DATA.media.url) ||
          (HERO_DATA.media.type === 'video' && videoError)) && (
          <div className='absolute inset-0 bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800'>
            <div className='absolute inset-0'>
              <div className='absolute top-8 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse' />
            </div>
          </div>
        )}
      </div>

      {/* 中央文字区 */}
      <div className='relative w-full flex flex-col items-center justify-center pointer-events-auto z-10'>
        <div className='max-w-5xl px-4 sm:px-6 lg:px-8 py-32 text-center'>
          {/* 主标题 + 高亮部分 */}
          <h1 className='text-5xl lg:text-7xl font-bold py-8 leading-tight'>
            {/* light: 深灰渐变；dark: 浅白渐变，在深色背景上清晰可读 */}
            <span className='inline-block bg-linear-to-r from-slate-700 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent'>
              {t('title')}
            </span>
            {t('titleHighlight') && (
              <>
                {' '}
                <span className='inline-block bg-linear-to-r from-blue-600 to-cyan-500 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent'>
                  {t('titleHighlight')}
                </span>
              </>
            )}
          </h1>

          {/* 描述 */}
          {t('description') && (
            <p className='text-xl text-slate-700 dark:text-slate-200 mb-12 max-w-2xl mx-auto'>
              {t('description')}
            </p>
          )}

          {/* CTA 按钮 */}
          {HERO_DATA.cta && (
            <div className='flex justify-center'>
              <a
                href={HERO_DATA.cta.href}
                className='px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 shadow-2xl hover:scale-105 bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:shadow-blue-500/25'
              >
                {t('cta.label')}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 底部滚动提示 */}
      {HERO_DATA.scrollIndicator?.enabled && (
        <div className='absolute bottom-8 flex justify-center items-center z-10 pointer-events-auto'>
          <div className='text-slate-500 dark:text-slate-300 animate-bounce px-4 py-2 flex flex-col items-center'>
            <Icon name='arrow-down' className='w-6 h-6' />
            {t('scrollIndicator.text') && (
              <p className='text-sm text-center'>{t('scrollIndicator.text')}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
