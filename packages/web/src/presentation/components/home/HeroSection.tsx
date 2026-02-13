/**
 * HeroSection.tsx - 首页主视觉区块（重构版）
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示首页 Hero 区块 UI
 * - 使用 Application Layer 的 useHero Hook 获取数据
 * - 支持视频背景、吸附滚动、响应式布局
 *
 * @layer Presentation
 * @category Components - Home
 */
'use client';

import { useScrollSnap } from '@/application/hooks/useScrollSnap';
import { useHero } from '@/application/hooks/homepage';
import { useEffect, useRef, useState } from 'react';
import { FiArrowDown } from 'react-icons/fi';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isSnapped = useScrollSnap(sectionRef);

  // 使用新的 Application Layer Hook 获取数据
  const { data: hero, isLoading, error } = useHero();

  // 调试：打印 hero 数据
  useEffect(() => {
    if (hero) {
      console.log('Hero data loaded:', hero);
      console.log('Media type:', hero.media?.type);
      console.log('Video URL:', hero.media?.videoUrl);
      console.log('Poster Image:', hero.media?.posterImage);
    }
  }, [hero]);

  // 视频状态管理
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 监听视频加载
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hero?.media.type !== 'video') {
      console.log('Video ref or media type check failed:', {
        hasVideo: !!video,
        mediaType: hero?.media.type,
      });
      return;
    }

    const handleLoadedData = () => {
      console.log('Video loaded successfully');
      setVideoLoaded(true);
    };
    const handleError = (e: Event) => {
      console.error('Video loading error:', e);
      console.error('Video element:', video);
      console.error('Video src:', video.src);
      setVideoError(true);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [hero?.media.type]);

  // 加载状态
  if (isLoading) {
    return (
      <section
        ref={sectionRef}
        id='snap-section-1'
        className='relative snap-section h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
      >
        <div className='text-white text-xl'>加载中...</div>
      </section>
    );
  }

  // 错误状态
  if (error || !hero) {
    return (
      <section
        ref={sectionRef}
        id='snap-section-1'
        className='relative snap-section h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
      >
        <div className='text-white text-xl'>加载失败</div>
      </section>
    );
  }

  // 如果内容被禁用，不渲染
  if (!hero.enabled) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id='snap-section-1'
      className={`relative snap-section h-screen flex items-center justify-center overflow-hidden ${isSnapped ? 'shadow-lg shadow-black/10' : ''}`}
    >
      {/* 背景媒体层 */}
      <div className='absolute inset-0 w-full h-full z-0'>
        {/* 视频背景 */}
        {hero.media.type === 'video' && hero.media.videoUrl && (
          <>
            {/* 视频封面 */}
            {hero.media.posterImage && (
              <img
                src={hero.media.posterImage}
                alt={hero.media.alt || '视频封面'}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
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
              <source src={hero.media.videoUrl} type='video/mp4' />
            </video>

            {/* 视频遮罩 */}
            <div
              className={`absolute inset-0 bg-gradient-to-b from-slate-900/60 via-blue-900/60 to-slate-900/60 transition-opacity duration-1000 ${
                videoLoaded && !videoError ? 'opacity-70' : 'opacity-0'
              }`}
            ></div>
          </>
        )}

        {/* 图片背景 */}
        {hero.media.type === 'image' && hero.media.url && (
          <>
            <img
              src={hero.media.url}
              alt={hero.media.alt || '背景图片'}
              className='absolute inset-0 w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-b from-slate-900/60 via-blue-900/60 to-slate-900/60'></div>
          </>
        )}

        {/* 备用背景 - 仅在没有媒体或媒体加载失败时显示 */}
        {(!hero.media.type ||
          (hero.media.type === 'video' && !hero.media.videoUrl) ||
          (hero.media.type === 'image' && !hero.media.url) ||
          (hero.media.type === 'video' && videoError)) && (
          <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
            <div className='absolute inset-0'>
              <div className='absolute top-8 right-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl animate-pulse' />
            </div>
          </div>
        )}
      </div>

      {/* 中央文字区 */}
      <div className='relative w-full flex flex-col items-center justify-center pointer-events-auto z-10'>
        <div className='max-w-5xl px-4 sm:px-6 lg:px-8 py-32 text-center'>
          {/* 主标题 + 高亮部分 */}
          <h1 className='text-5xl lg:text-7xl font-bold py-8 leading-tight'>
            <span className='inline-block bg-gradient-to-r from-white/80 to-white bg-clip-text text-transparent'>
              {hero.title}
            </span>
            {hero.titleHighlight && (
              <>
                {' '}
                <span className='inline-block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent'>
                  {hero.titleHighlight}
                </span>
              </>
            )}
          </h1>

          {/* 描述 */}
          {hero.description && (
            <p className='text-xl text-white/70 mb-12 max-w-2xl mx-auto'>{hero.description}</p>
          )}

          {/* CTA 按钮 */}
          {hero.cta && (
            <div className='flex justify-center'>
              <a
                href={hero.cta.href}
                className='px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 shadow-2xl hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:shadow-cyan-500/25'
              >
                {hero.cta.label}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 底部滚动提示 */}
      {hero.scrollIndicator?.enabled && (
        <div className='absolute w-full flex justify-center bottom-8 pointer-events-auto z-10'>
          <div className='text-white/60 animate-bounce px-4 py-2 rounded-xl'>
            <FiArrowDown className='w-6 h-6 mx-auto mb-2' />
            {hero.scrollIndicator.text && <p className='text-sm'>{hero.scrollIndicator.text}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
