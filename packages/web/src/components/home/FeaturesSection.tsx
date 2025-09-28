/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { PiGraphFill } from 'react-icons/pi';
import { GiPathDistance } from 'react-icons/gi';
import { SiCodeceptjs } from 'react-icons/si';

export default function FeaturesSection() {
  const features = [
    {
      title: "数据图谱构建",
      description:
        "多源数据融合，自动构建知识图谱，让海量数据形成智能化的关联网络，发现数据间的隐藏价值和深层关系。",
      icon: <PiGraphFill className="w-10 h-10 text-blue-400" />,
      highlights: ["多源数据融合", "知识图谱构建", "关联关系挖掘"],
      color: "blue",
    },
    {
      title: "智能决策调度",
      description:
        "AI 驱动的资源优化与任务调度，通过机器学习算法实现智能化的资源分配，提升运营效率和决策质量。",
      icon: <GiPathDistance className="w-10 h-10 text-blue-400" />,
      highlights: ["AI 智能调度", "资源优化配置", "决策质量提升"],
      color: "blue",
    },
    {
      title: "孪生仿真推演",
      description:
        "数字孪生建模，预测未来趋势，通过高精度仿真模型模拟各种场景，为战略决策提供科学依据。",
      icon: <SiCodeceptjs className="w-10 h-10 text-blue-400" />,
      highlights: ["数字孪生建模", "场景仿真推演", "预测分析能力"],
      color: "blue",
    },
  ];

  const colorMap = {
    blue: {
      border: "hover:border-blue-400",
      button: "bg-blue-50 text-gray-600 border-blue-200 group-hover:bg-blue-600 group-hover:text-white",
    },
    cyan: {
      border: "hover:border-cyan-400",
      button: "bg-cyan-50 text-cyan-600 border-cyan-200 group-hover:bg-cyan-600 group-hover:text-white",
    },
    purple: {
      border: "hover:border-purple-400",
      button: "bg-purple-50 text-purple-600 border-purple-200 group-hover:bg-purple-600 group-hover:text-white",
    },
  };

  return (
    <section className="snap-section py-24 bg-gradient-to-b from-slate-50 to-white relative">
      <div className="max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title area */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-blue-800 mb-6">
            核心能力
          </h2>
          <p className="text-lg text-gray-400 max-w-4xl mx-auto">
            专注为政府和大型企事业单位，提供数据驱动决策的业务重构与转型升级
          </p>
        </div>

        {/* Features grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const colors = colorMap[feature.color as keyof typeof colorMap];
            return (
              <div
                key={feature.title}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 `}
              >
                {/* 简洁科技感装饰 */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-blue-100 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-blue-100 to-transparent" />
                <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-blue-50 group-hover:bg-blue-600 border border-blue-100 shadow-sm" />

                {/* Content area */}
                <div className="relative p-8 space-y-6">
                  {/* Main icon */}
                  <div className="flex justify-center">
                    <div
                      className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 border border-blue-100"
                    >
                      {feature.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-blue-800 text-center">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-center">
                    {feature.description}
                  </p>

                  {/* Highlights tags */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {feature.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="px-3 py-1 bg-blue-50 text-blue-400 text-sm font-semibold rounded-full border border-blue-50"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  {/* Learn more button */}
                  <div className="pt-4 text-center">
                    <button
                      className={`inline-flex items-center px-6 py-2 font-semibold rounded-lg transition-all duration-300 border ${colors.button}`}
                    >
                      了解更多
                      <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom decorative text */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-sm font-medium">数据驱动，智能决策</span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
