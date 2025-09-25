/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { CACHE_ONE_YEAR } from "next/dist/lib/constants";
import Image from "next/image";
import { LuCalendarDays } from 'react-icons/lu';

export default function CaseSection() {
  const cases = [
    {
      title: "地质灾害数据图谱",
      description:
        "构建数据智能平台，整合分散的静态基础数据和动态监测监管数据，实现深度关联分析与图形结合展示",
      image: "/images/cases/case-intro-01.jpg",
      tags: ["数据融合", "本体构建", "业务分析"],
      year: "2024-03",
      color: "blue",
    },
    {
      title: "智能应急指挥平台",
      description:
        "搭建智能决策指挥调度平台，整合跨领域数据资源，实现灾害预警、资源调度和应急决策的一体化支持",
      image: "/images/cases/case-intro-02.jpg",
      tags: ["智能决策", "应急管理", "数据整合"],
      year: "2024-12",
      color: "cyan",
    },
    {
      title: "公共安全情报分析",
      description:
        "通过深度应用大模型技术，实现了案件智能融合分析与实时研判决策，构建起精准高效的安全防控体系",
      image: "/images/cases/case-intro-03.jpg",
      tags: ["融合分析", "动态研判", "事件响应"],
      year: "2025-06",
      color: "purple",
    },
  ];

  // Button color mapping, same as FeaturesSection
  const colorMap = {
    blue: {
      border: "hover:border-blue-400",
      button: "bg-blue-100 text-blue-700 border-blue-200 group-hover:bg-blue-600 group-hover:text-white",
    },
    cyan: {
      border: "hover:border-cyan-400",
      button: "bg-cyan-100 text-cyan-700 border-cyan-200 group-hover:bg-blue-600 group-hover:text-white",
    },
    purple: {
      border: "hover:border-purple-400",
      button: "bg-purple-100 text-purple-700 border-purple-200 group-hover:bg-blue-600 group-hover:text-white",
    },
  };

  return (
    <section className="snap-section py-24 bg-gradient-to-b from-slate-50 to-white relative">
      <div className="max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            最佳实践
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我们数据智能平台的真实应用场景
          </p>
        </div>

        {/* Case grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((item) => {
            const borderClass = colorMap[item.color as keyof typeof colorMap].border;
            const buttonClass = colorMap[item.color as keyof typeof colorMap].button;
            return (
              <div
                key={item.title}
                className="group relative bg-white hover:bg-blue-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-blue-50"
              >
                {/* Image area with 16:9 aspect ratio */}
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={item.image}
                    alt={item.title + "案例图片"}
                    fill
                    className="object-cover rounded-t-2xl"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-blue-900/20 to-transparent rounded-t-2xl pointer-events-none"></div>
                </div>

                {/* Content area */}
                <div className="p-6 space-y-4">
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-blue-800 text-center">{item.title}</h3>
                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed text-center">{item.description}</p>
                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {/* Learn more button */}
                    <div className="pt-4 text-center">
                      <button
                        className={`inline-flex items-center px-6 py-2 font-semibold rounded-lg transition-all duration-300 border ${buttonClass}`}
                      >
                        查看详情
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
      </div>
    </section>
  );
}
