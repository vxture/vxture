/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useScrollSnap } from "@/hooks/useScrollSnap";
import { useRef, useState } from "react";

import Image from "next/image";

import { LuCalendarDays } from "react-icons/lu";

export default function CaseSection() {
  const sectionRef = useRef(null);
  const isSnapped = useScrollSnap(sectionRef); // 监听当前section是否处于吸附状态

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
      button:
        "bg-blue-100 text-blue-700 border-blue-200 group-hover:bg-blue-600 group-hover:text-white",
    },
    cyan: {
      border: "hover:border-cyan-400",
      button:
        "bg-cyan-100 text-cyan-700 border-cyan-200 group-hover:bg-blue-600 group-hover:text-white",
    },
    purple: {
      border: "hover:border-purple-400",
      button:
        "bg-purple-100 text-purple-700 border-purple-200 group-hover:bg-blue-600 group-hover:text-white",
    },
  };
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      ref={sectionRef}
      className={`relative snap-section h-screen pt-28 bg-gradient-to-b from-slate-50 to-white ${isSnapped ? "shadow-lg shadow-black/10" : ""}`}
    >
      <div className="relative h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="flex items-center justify-between mb-16">
          {/* Section title and subtitle */}
          <div className="flex-1 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-800 mb-6">
              最佳实践
            </h2>
            <p className="text-lg text-gray-400 max-w-4xl mx-auto">
              为客户业务赋能的最佳应用场景
            </p>
          </div>
        </div>
        {/* Case grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((item) => {
            const borderClass =
              colorMap[item.color as keyof typeof colorMap].border;
            const buttonClass =
              colorMap[item.color as keyof typeof colorMap].button;
            return (
              <div
                key={item.title}
                className="group relative bg-white hover:bg-blue-50 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-200/80 via-blue-100/80 to-transparent group-hover:opacity-40 rounded-t-2xl pointer-events-none"></div>
                </div>

                {/* Content area */}
                <div className="p-6 space-y-4">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-blue-800 text-left">
                    {item.title}
                  </h3>
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-left">
                    {item.description}
                  </p>
                  {/* Highlights tags */}
                  <div className="flex flex-wrap gap-2 justify-start">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-50 text-blue-500 text-sm font-semibold rounded-full border border-blue-50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Learn more button */}

                  <div className="pt-4 flex items-center justify-between">
                    {/* 左下角年份 */}
                    <div className="flex items-center text-gray-500 text-xs font-semibold">
                      <LuCalendarDays className="mr-1 w-5 h-5" />
                      {item.year}
                    </div>
                    {/* 居中按钮 */}
                    <div className="flex-1 flex justify-end">
                      <button className="inline-flex items-center text-sm font-semibold text-gray-500 rounded-lg transition-all duration-300 ml-auto bg-transparent border-none shadow-none">
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
              </div>
            );
          })}
        </div>
        {/* Bottom decorative text */}
        <div className="text-center text-gray-400/40  animate-bounce mt-16">
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
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-sm font-medium">更多案例</span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
