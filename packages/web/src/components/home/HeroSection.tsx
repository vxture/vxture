"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <section className="relative snap-start min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景视频与遮罩 */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded && !videoError ? "opacity-100" : "opacity-0"
          }`}
          poster="/images/banner-hero-poster-01.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/banner-hero-01.mp4" type="video/mp4" />
        {/*
          <source src="/videos/banner-hero-01.webm" type="video/webm" />
        */}
          </video>
        {/* 调整遮罩透明度为更柔和的 80% */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-slate-900/50 via-blue-900/40 to-slate-900/50 transition-opacity duration-1000 ${
            videoLoaded && !videoError ? "opacity-100" : "opacity-0"
          }`}
        ></div>
      </div>
      {/* 备用背景 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 transition-opacity duration-1000 ${
          !videoLoaded || videoError ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* 中央文字区 */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full pointer-events-auto">
        <div className="w-full flex justify-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              释放数据的
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                无限潜力
              </span>
            </h1>

            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              <br />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 hover:scale-105">
                开启数据智能之旅
              </button>
              <button className="px-8 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
                查看演示
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部滚动提示 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce z-20">
        <svg
          className="w-6 h-6 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
        <p className="text-sm">向下滚动</p>
      </div>
    </section>
  );
}
