"use client";

import Image from "next/image";

export default function CaseSection() {
  const cases = [
    {
      title: "智慧城市数据治理",
      subtitle: "某省会城市大数据平台",
      description:
        "整合城市各部门数据资源，构建统一的城市数据中台，实现跨部门数据共享和业务协同。",
      image: "/images/cases/case-intro-01.jpg",
      tags: ["政务数据", "城市治理", "数据共享"],
      metrics: {
        data: "100TB+",
        systems: "50+",
        users: "10万+",
      },
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "金融风控建模",
      subtitle: "某股份制银行风控系统",
      description:
        "基于机器学习算法构建智能风控模型，实时识别金融风险，大幅提升风控效率和准确性。",
      image: "/images/cases/case-intro-02.jpg",
      tags: ["风险控制", "机器学习", "实时计算"],
      metrics: {
        accuracy: "95%+",
        response: "<100ms",
        cases: "百万级",
      },
      gradient: "from-purple-500 to-blue-500",
    },
    {
      title: "供应链优化调度",
      subtitle: "某制造业龙头企业",
      description:
        "通过智能调度算法优化生产计划和物流配送，降低库存成本，提升供应链响应速度。",
      image: "/images/cases/case-intro-03.jpg",
      tags: ["供应链", "智能调度", "成本优化"],
      metrics: {
        cost: "降低30%",
        efficiency: "提升40%",
        delivery: "准时率98%",
      },
      gradient: "from-cyan-500 to-green-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            成功案例
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            携手行业领军企业，共创数字化转型新价值
          </p>
        </div>

        {/* 案例网格 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {cases.map((caseItem) => (
            <div
              key={caseItem.title}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105"
            >
              {/* 渐变背景装饰 */}
              <div
                className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r ${caseItem.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
              ></div>

              {/* 案例图片 */}
              <div className="relative overflow-hidden rounded-t-2xl">
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${caseItem.gradient} opacity-80 z-10`}
                ></div>
                <div className="aspect-video overflow-hidden">
                  <Image
                    src={caseItem.image}
                    alt={caseItem.title}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* 标签 */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
                  {caseItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 案例内容 */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {caseItem.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {caseItem.subtitle}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {caseItem.description}
                  </p>
                </div>

                {/* 关键指标 */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {Object.entries(caseItem.metrics).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div
                          className={`text-lg font-bold bg-gradient-to-r ${caseItem.gradient} bg-clip-text text-transparent`}
                        >
                          {value}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {key === "data" && "数据量"}
                          {key === "systems" && "接入系统"}
                          {key === "users" && "服务用户"}
                          {key === "accuracy" && "准确率"}
                          {key === "response" && "响应时间"}
                          {key === "cases" && "处理案例"}
                          {key === "cost" && "成本"}
                          {key === "efficiency" && "效率"}
                          {key === "delivery" && "交付"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 查看详情按钮 */}
                <div className="pt-4">
                  <button
                    className={`w-full py-3 bg-gradient-to-r ${caseItem.gradient} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                  >
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 更多案例链接 */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:shadow-lg">
            查看更多案例
            <svg
              className="inline-block ml-2 w-5 h-5"
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
    </section>
  );
}
