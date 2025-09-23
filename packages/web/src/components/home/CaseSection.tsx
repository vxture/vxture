"use client";

import Image from "next/image";

export default function CaseSection() {
  const cases = [
    {
      title: "智慧城市数据中台",
      description:
        "为某地政府打造统一数据中台，实现多部门数据融合与智能分析，提升城市治理效率。",
      image: "/images/cases/case-intro-01.jpg",
      tags: ["数据融合", "城市治理", "智能分析"],
    },
    {
      title: "金融风控智能平台",
      description:
        "为大型银行构建实时风控系统，支持大数据建模与风险预测，保障金融安全。",
      image: "/images/cases/case-intro-02.jpg",
      tags: ["金融风控", "实时建模", "风险预测"],
    },
    {
      title: "制造业数字孪生",
      description:
        "助力制造企业实现生产流程数字化仿真，优化资源配置，提升生产效率。",
      image: "/images/cases/case-intro-03.jpg",
      tags: ["数字孪生", "流程优化", "生产效率"],
    },
  ];

  // Unified button style
  const unifiedButton =
    "px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 font-semibold";

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            成功案例
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我们数据智能平台的真实应用场景
          </p>
        </div>

        {/* Case grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((item) => (
            <div
              key={item.title}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 border border-blue-50"
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
                <div className="pt-2 flex justify-end">
                  <button className={unifiedButton}>查看详情</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
