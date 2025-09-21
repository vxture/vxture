"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("loadeddata", () => setVideoLoaded(true));
      video.addEventListener("error", () => setVideoError(true));

      return () => {
        video.removeEventListener("loadeddata", () => setVideoLoaded(true));
        video.removeEventListener("error", () => setVideoError(true));
      };
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* 背景视频 */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded && !videoError ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/videos/banner-hero-01.mp4" type="video/mp4" />
        </video>

        {/* 渐变遮罩层 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70"></div>
      </div>

      {/* 备用背景（视频未加载时显示） */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 transition-opacity duration-1000 ${
          videoLoaded && !videoError ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* 背景动画元素 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-32 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左侧内容 */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              构建智能
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                数据图谱
              </span>
            </h1>
            <h2 className="text-2xl lg:text-3xl font-light text-white/90 mb-8">
              驱动科学决策
            </h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl">
              专业的数据建模、智能调度与仿真推演平台
              <br />
              让复杂数据变成智能决策的强大引擎
            </p>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 hover:scale-105">
                免费试用
              </button>
              <button className="px-8 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
                查看演示
              </button>
            </div>
          </div>

          {/* 右侧可视化 */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* 数据流动动画 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-80 h-80">
                  {/* 中心节点 */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-2xl shadow-cyan-500/50 animate-pulse">
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* 周围节点 */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`absolute w-12 h-12 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full shadow-lg animate-bounce`}
                      style={{
                        top: `${50 + 35 * Math.cos((i * Math.PI) / 3)}%`,
                        left: `${50 + 35 * Math.sin((i * Math.PI) / 3)}%`,
                        transform: "translate(-50%, -50%)",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    >
                      <div className="absolute inset-1 bg-white/90 rounded-full"></div>
                    </div>
                  ))}

                  {/* 连接线 */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={`line-${i}`}
                      className="absolute w-0.5 bg-gradient-to-t from-cyan-400/50 to-transparent"
                      style={{
                        height: "120px",
                        top: "50%",
                        left: "50%",
                        transformOrigin: "top center",
                        transform: `translate(-50%, -50%) rotate(${i * 60}deg)`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部滚动提示 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce z-10">
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
