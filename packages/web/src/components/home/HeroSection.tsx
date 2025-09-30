/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"; // 声明为客户端组件

import { useScrollSnap } from "@/hooks/useScrollSnap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const sectionRef = useRef(null);
  const isSnapped = useScrollSnap(sectionRef); // 监听当前section是否处于吸附状态

  // 视频加载状态：false 表示未加载完成，true 表示加载完成
  const [videoLoaded, setVideoLoaded] = useState(false);
  // 视频错误状态：false 表示无错误，true 表示加载/播放出错
  const [videoError, setVideoError] = useState(false);
  // 视频元素的 ref，用于操作视频 DOM
  const videoRef = useRef<HTMLVideoElement>(null); // 视频元素引用

  // 监听视频的 loadeddata 事件，视频有一帧数据加载完成时触发，视为加载完成
  useEffect(() => {
    const video = videoRef.current; // 获取视频元素
    if (video) {
      // 视频加载完成事件处理
      const handleLoadedData = () => setVideoLoaded(true);
      // 视频加载错误事件处理
      const handleError = () => setVideoError(true);
      // 绑定事件
      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("error", handleError);
      video.load(); // 主动加载视频

      // 组件卸载时移除事件监听，避免内存泄漏，清理事件绑定
      return () => {
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("error", handleError);
      };
    }
  }, []);
  // 以上只在首次渲染时执行

  return (
    // 页面主视觉区块，绝对定位撑满屏幕
    <section
      ref={sectionRef}
      className={`relative snap-section h-screen flex items-center justify-center overflow-hidden ${isSnapped ? "shadow-lg shadow-black/10" : ""}`}
    >
      {/* 背景视频与遮罩层 */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* 视频封面作为加载前的遮罩，加载完成后隐藏 */}
        <Image
          src="/images/banner-hero-poster-01.png"
          alt="视频封面"
          fill // 使用 fill 属性确保图片始终撑满父容器
          // width={1920}
          // height={1080}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            !videoLoaded && !videoError ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* 视频元素，加载完成后显示，否则透明 */}
        <video
          ref={videoRef} // 绑定视频引用
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded && !videoError ? "opacity-100" : "opacity-0"
          }`} // 视频淡入淡出动画
          autoPlay // 自动播放
          loop // 循环播放
          muted // 静音
          playsInline // 移动端内联播放
          preload="auto" // 预加载
        >
          <source src="/videos/banner-hero-01.mp4" type="video/mp4" />
          {/* 视频源 */}
          {/* <source src="/videos/banner-hero-01.webm" type="video/webm" /> 备用格式 */}
        </video>
        {/* 视频遮罩，加载完成后显示 */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-slate-900/60 via-blue-900/60 to-slate-900/60 transition-opacity duration-1000 ${
            videoLoaded && !videoError ? "opacity-70" : "opacity-0"
          }`} // 遮罩渐变与淡入淡出动画
        ></div>
        {/* 遮罩层增加文字可读性 */}
      </div>

      {/* 备用背景（视频未加载或出错时显示） */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-slate-900/50 via-blue-900/50 to-slate-900/50 transition-opacity duration-1000 ${
          !videoLoaded || videoError ? "opacity-100" : "opacity-0"
        }`} // 备用背景渐变与淡入淡出动画
      >
        <div className="absolute inset-0">
          {/* 背景装饰圆形，渐变色与模糊效果 */}
          <div className="absolute top-8 right-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        </div>
      </div>

      {/* 中央文字区（主标题、副标题、按钮） */}
      <div className="relative w-full flex flex-col items-center justify-center pointer-events-auto">
        {/* 内容最大宽度，居中排版 */}
        <div className="max-w-5xl px-4 sm:px-6 lg:px-8 py-32 text-center">
          {/* 主标题，渐变色强调关键词 */}
          <h1 className="text-5xl lg:text-7xl font-bold py-8 leading-tight">
            <span className="inline-block bg-gradient-to-r from-white/80 to-white bg-clip-text text-transparent">
              释放数据的
            </span>
            <span className="inline-block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              无限潜力
            </span>
          </h1>
          {/* 副标题 */}
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            <br />
          </p>
          {/* 行动按钮区 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 hover:scale-105">
              开启数据智能之旅
            </button>
          </div>
        </div>
      </div>

      {/* 底部滚动提示区 */}
      <div className="absolute w-full flex justify-center bottom-8 pointer-events-auto">
        <div className="text-white/60 animate-bounce px-4 py-2 rounded-xl">
          {/* 向下箭头图标 */}
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
          {/* 提示文字 */}
          <p className="text-sm">向下滚动</p>
        </div>
      </div>
    </section>
  );
}
