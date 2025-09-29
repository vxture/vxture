/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

/**
 * ProductSection component
 * - Section uses snap-start for scroll snap, no sticky/minHeight/position
 * - Carousel with left/right navigation, two-column layout
 */
export default function ProductSection() {
  // Product data array
  const products = [
    {
      title: "数据融合平台",
      subtitle: "统一数据接入与处理",
      description:
        "支持多种数据源接入，包括结构化、半结构化和非结构化数据，提供实时数据清洗、转换和标准化服务。",
      features: ["多源数据接入", "实时数据处理", "数据质量管控", "数据标准转换"],
      image: "/images/products/product-intro-01.jpg",
      color: "blue",
    },
    {
      title: "知识图谱引擎",
      subtitle: "构建智能关联网络",
      description:
        "基于深度学习算法自动构建实体关系图谱，挖掘数据间的潜在关联，形成可查询的知识网络。",
      features: ["实体识别", "关系抽取", "图谱构建", "语义查询"],
      image: "/images/products/product-intro-02.jpg",
      color: "purple",
    },
    {
      title: "智能调度系统",
      subtitle: "AI驱动的资源优化",
      description:
        "运用先进的优化算法和机器学习技术，实现资源的智能分配和任务的最优调度。",
      features: ["智能调度", "资源优化", "负载均衡", "性能监控"],
      image: "/images/products/product-intro-03.jpg",
      color: "cyan",
    },
    {
      title: "仿真建模工具",
      subtitle: "数字孪生与预测分析",
      description:
        "提供高精度的数字孪生建模能力，支持多场景仿真推演，预测未来发展趋势。",
      features: ["数字孪生", "场景仿真", "趋势预测", "风险评估"],
      image: "/images/products/product-intro-04.jpg",
      color: "green",
    },
  ];

  // Carousel state
  const [current, setCurrent] = useState<number | null>(0);
  const total = products.length;

  // Carousel navigation
  const prev = () => setCurrent((prev) => (prev - 1 + total) % total);
  const next = () => setCurrent((prev) => (prev + 1) % total);

  // Color mapping for different product cards
  const colorMap = {
    blue: {
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      button: "bg-blue-500 hover:bg-blue-600",
    },
    purple: {
      gradient: "from-purple-500 to-blue-500",
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-600",
      button: "bg-purple-500 hover:bg-purple-600",
    },
    cyan: {
      gradient: "from-cyan-500 to-green-500",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      text: "text-cyan-600",
      button: "bg-cyan-500 hover:bg-cyan-600",
    },
    green: {
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-600",
      button: "bg-green-500 hover:bg-green-600",
    },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 to-gray-50 relative">
      <div className="max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title area with left/right navigation arrows */}
        <div className="flex items-center justify-between mb-16">
          {/* Section title and subtitle */}
          <div className="flex-1 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-800 mb-6">
              产品与服务
            </h2>
            <p className="text-lg text-gray-400 max-w-4xl mx-auto">
              覆盖数据本体构建、融合分析决策、智能指挥调度、场景推演仿真的全业务流程
            </p>
          </div>
        </div>

        {/* Carousel: show only the current product card, card is full width */}
        <div className="w-full flex justify-center">
          {products.map((product, idx) => {
            if (idx !== current) return null;
            const colors = colorMap[product.color as keyof typeof colorMap];
            return (
              <div
                key={product.title}
                className={`w-full transition-all duration-500 ${colors.border} ${colors.bg}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] h-full rounded-2xl shadow-lg overflow-hidden first-letter:2px border-red-600">
                  {/* Left: text content */}
                  <div className="relative flex h-full items-center justify-start px-16">
                    <div className="relative w-full h-full flex flex-col gap-4 justify-items-start">
                      
                      {/* Title and subtitle */}
                      <div className="relative flex items-center h-24 min-h-[96px] ${colors.border} ${colors.bg} ">
                        {/* 背景修饰：设计感数字，居左，带渐变和阴影 */}
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 text-[64px] font-semibold text-blue-400 opacity-70 select-none pointer-events-none z-0 drop-shadow-lg"
                          aria-hidden="true"
                          style={{
                            letterSpacing: '-0.05em',
                            textShadow: '0 4px 24px #60a5fa, 0 1px 0 #fff'
                          }}
                        >
                          {idx + 1}
                        </span>
                        {/* 标题内容，居右显示，置于背景之上 */}
                        <div className="relative z-10 flex-1 flex flex-col items-start pl-16">
                          <h3 className="text-2xl font-bold text-blue-800 text-left">{product.title}</h3>
                          <p className="text-base text-gray-600 mt-1 text-left">{product.subtitle}</p>
                        </div>
                      </div>
                      {/* Description */}
                      <div className="items-center justify-left">
                        <p className="text-lg text-gray-600 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                      {/* Feature list container */}
                      <div className="items-center justify-left my-4">
                        {/* Feature Title */}
                        <h4 className="text-xl font-semibold text-gray-800">
                          特色功能
                        </h4>
                        {/* Feature list grid */}
                        <div className="grid grid-cols-2 gap-4 justify-items-left my-4">
                          {product.features.map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center justify-start space-x-2"
                            >
                              <div
                                className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}
                              ></div>
                              <span className="text-lg text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Learn more button */}
                      <div className="flex justify-between items-center my-4">
                        <button
                          className={`inline-flex items-center px-6 py-2 ${colors.button} text-white rounded-lg transition-all duration-300 font-semibold w-max`}
                        >
                          了解更多
                        </button>

                        {/* Left/Right navigation arrows */}
                        <div className="flex justify-normal">
                          <div className="flex gap-8"> {/* 添加间隙让两个按钮分开 */}
                            {/* Previous 按钮 */}
                            <button
                              aria-label="Previous"
                              onClick={prev}
                              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 transition-all duration-300 hover:shadow-md"
                            >
                              <PiCaretLeftBold className="w-5 h-5 text-gray-700" />
                              <span className="text-gray-400 font-medium">Prev</span>
                            </button>

                            {/* Next 按钮 */}
                            <button
                              aria-label="Next"
                              onClick={next}
                              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 transition-all duration-300 hover:shadow-md"
                            >
                              <span className="text-gray-400 font-medium">Next</span>
                              <PiCaretRightBold className="w-5 h-5 text-gray-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-200"
                  >
                    {/* Right: image area */}
                    <div className="relative flex items-center justify-start bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 px-40 py-10">
                      <div className="relative w-full h-auto flex flex-col items-center justify-start hover:scale-105 transition-all duration-300">
                        {/* Monitor frame image（上方） */}
                        <div className="relative w-full pointer-events-none select-none">
                          {/* 上层：Product Image 容器 - 延迟加载 */}
                          <div
                            className="absolute flex items-center justify-center"
                            style={{
                              top: "4%",
                              right: "3%",
                              bottom: "4.5%",
                              left: "3%",
                            }}
                          >
                            <div className="w-full h-full overflow-hidden z-10">
                              <img
                                src={product.image}
                                alt={product.title}
                                draggable={false}
                                loading="lazy" // 延迟加载
                                className="w-full h-full object-cover" // 使用 cover 填充
                                onContextMenu={(e) => e.preventDefault()} // 禁止右键菜单
                              />
                            </div>
                          </div>
                          {/* 底层：Frame Image 容器 - 优先加载 */}
                          <div className="relative w-full h-full z-20">
                            <img
                              src="/images/products/monitor-frame.png"
                              alt="Monitor Frame"
                              draggable={false}
                              loading="eager" // 优先加载
                              className="block w-full h-auto"
                              onContextMenu={(e) => e.preventDefault()} // 禁止右键菜单
                            />
                          </div>
                        </div>
                        {/* Monitor base image（下方） */}
                        <div className="relative w-full pointer-events-none select-none mt-1">
                          <img
                            src="/images/products/monitor-base.png"
                            alt="Monitor Base"
                            draggable={false}
                            className="block w-full h-auto"
                            onContextMenu={(e) => e.preventDefault()} // 禁止右键菜单
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
