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
      features: ["多源数据接入", "实时数据处理", "数据质量管控", "标准化转换"],
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
  const [current, setCurrent] = useState(0);
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
    <section className="snap-start min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-24">
      <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title area with left/right navigation arrows */}
        <div className="flex items-center justify-between mb-16">
          {/* Left arrow button */}
          <button
            aria-label="Previous"
            onClick={prev}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <PiCaretLeftBold className="w-7 h-7 text-gray-500" />
          </button>
          {/* Section title and subtitle */}
          <div className="flex-1 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              产品与服务
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              覆盖数据本体构建、融合分析决策、智能指挥调度、场景推演仿真的全业务流程
            </p>
          </div>
          {/* Right arrow button */}
          <button
            aria-label="Next"
            onClick={next}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <PiCaretRightBold className="w-7 h-7 text-gray-500" />
          </button>
        </div>

        {/* Carousel: show only the current product card, card is full width */}
        <div className="w-full flex justify-center">
          {products.map((product, idx) => {
            if (idx !== current) return null;
            const colors = colorMap[product.color as keyof typeof colorMap];
            return (
              <div
                key={product.title}
                className={`w-full border-2 rounded-2xl transition-all duration-500 ${colors.border} ${colors.bg} shadow-xl`}
              >
                {/* Two-column layout: left for text, right for image */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: text content */}
                  <div className="flex flex-col justify-center p-8">
                    {/* Card header: icon and title */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {product.title}
                        </h3>
                        <p className="text-gray-600">{product.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed ml-16 mr-8 mb-8">
                      {product.description}
                    </p>
                    <div>
                      <h4 className="font-semibold text-gray-900 ml-16 mr-8 mb-8">
                        特色功能
                      </h4>
                      <div className="grid grid-cols-2 gap-2 ml-16 mr-8 mb-8">
                        {product.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center space-x-2"
                          >
                            <div
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}
                            ></div>
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Learn More button */}
                    <button
                      className={`px-6 py-3 ${colors.button} text-white rounded-lg transition-colors duration-300 font-semibold w-max ml-16 mr-8 mb-30`}
                    >
                      More
                    </button>
                  </div>
                  {/* Right: image area */}
                  <div className="relative flex items-center justify-center p-8">
                    {/* Gradient background decoration */}
                    <div
                      className={`absolute -inset-2 bg-gradient-to-r ${colors.gradient} rounded-xl blur-lg opacity-25`}
                    ></div>
                    {/* Product image */}
                    <div className="relative bg-white rounded-xl p-0 shadow-lg w-full h-full flex items-center">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-72 object-cover rounded-lg"
                        style={{ maxHeight: 360 }}
                      />
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
