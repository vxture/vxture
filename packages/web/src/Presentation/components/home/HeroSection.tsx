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
"use client";

import { useScrollSnap } from "@/application/hooks/useScrollSnap";
import { useHero } from "@/application/hooks/homepage";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isSnapped = useScrollSnap(sectionRef);

  // 使用新的 Application Layer Hook 获取数据
  const { data: hero, isLoading, error } = useHero();

  // 视频状态管理
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 监听视频加载
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedData = () => setVideoLoaded(true);
      const handleError = () => setVideoError(true);

      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("error", handleError);
      video.load();

      return () => {
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("error", handleError);
      };
    }
  }, []);

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
      {/* 背景视频与遮罩层 */}
      <div className='absolute inset-0 w-full h-full z-0'>
        {/* 视频封面 */}
        {hero.backgroundImage && (
          <Image
            src={hero.backgroundImage}
            alt={hero.backgroundImageAlt || '视频封面'}
            fill
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              !videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* 背景视频 */}
        {hero.backgroundVideo && (
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
            <source src={hero.backgroundVideo} type='video/mp4' />
          </video>
        )}

        {/* 视频遮罩 */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-slate-900/60 via-blue-900/60 to-slate-900/60 transition-opacity duration-1000 ${
            videoLoaded && !videoError ? 'opacity-70' : 'opacity-0'
          }`}
        ></div>
      </div>

      {/* 备用背景 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-slate-900/50 via-blue-900/50 to-slate-900/50 transition-opacity duration-1000 ${
          !videoLoaded || videoError ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className='absolute inset-0'>
          <div className='absolute top-8 right-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl animate-pulse' />
        </div>
      </div>

      {/* 中央文字区 */}
      <div className='relative w-full flex flex-col items-center justify-center pointer-events-auto'>
        <div className='max-w-5xl px-4 sm:px-6 lg:px-8 py-32 text-center'>
          {/* 主标题 */}
          <h1 className='text-5xl lg:text-7xl font-bold py-8 leading-tight'>
            <span className='inline-block bg-gradient-to-r from-white/80 to-white bg-clip-text text-transparent'>
              {hero.title}
            </span>
          </h1>

          {/* 副标题 */}
          {hero.subtitle && (
            <p className='text-2xl text-white/80 mb-4 max-w-3xl mx-auto'>
              {hero.subtitle}
            </p>
          )}

          {/* 描述 */}
          {hero.description && (
            <p className='text-xl text-white/70 mb-12 max-w-2xl mx-auto'>
              {hero.description}
            </p>
          )}

          {/* 行动按钮区 */}
          {hero.actions && hero.actions.length > 0 && (
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              {hero.actions.map((action, index) => (
                <a
                  key={action.text}
                  href={action.href}
                  className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 shadow-2xl hover:scale-105 ${
                    index === 0
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:shadow-cyan-500/25'
                      : 'bg-white/10 text-white border-2 border-white/30 hover:bg-white/20'
                  }`}
                >
                  {action.text}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部滚动提示 */}
      <div className='absolute w-full flex justify-center bottom-8 pointer-events-auto'>
        <div className='text-white/60 animate-bounce px-4 py-2 rounded-xl'>
          <svg
            className='w-6 h-6 mx-auto mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 14l-7 7m0 0l-7-7m7 7V3'
            />
          </svg>
          <p className='text-sm'>向下滚动</p>
        </div>
      </div>
    </section>
  );
}