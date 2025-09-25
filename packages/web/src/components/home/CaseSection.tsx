/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { CACHE_ONE_YEAR } from "next/dist/lib/constants";
import Image from "next/image";
import { LuCalendarDays } from 'react-icons/lu';

export default function CaseSection() {
  const cases = [
    {
      title: "智慧城市数据中台",
      description:
        "为某地政府打造统一数据中台，实现多部门数据融合与智能分析，提升城市治理效率。",
      image: "/images/cases/case-intro-01.jpg",
      tags: ["数据融合", "城市治理", "智能分析"],
      year: "2024-03",
      color: "blue",
    },
    {
      title: "金融风控智能平台",
      description:
        "为大型银行构建实时风控系统，支持大数据建模与风险预测，保障金融安全。",
      image: "/images/cases/case-intro-02.jpg",
      tags: ["金融风控", "实时建模", "风险预测"],
      year: "2024-12",
      color: "cyan",
    },
    {
      title: "制造业数字孪生",
      description:
        "助力制造企业实现生产流程数字化仿真，优化资源配置，提升生产效率。",
      image: "/images/cases/case-intro-03.jpg",
      tags: ["数字孪生", "流程优化", "生产效率"],
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
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
                {/* Image area with overlay opacity 20% */}
                <div className="relative w-full h-56">
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
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    {/* Year tag on the left */}
                    <span className="flex items-center text-sm text-gray-400 font-medium">
                      <LuCalendarDays className="w-4 h-4 mr-1" color="gray-400" />
                      {item.year}
                    </span>
                    <button
                      className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 border ${buttonClass}`}
                    >
                      查看详情
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
