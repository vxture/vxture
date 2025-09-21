"use client";

export default function FeaturesSection() {
  const features = [
    {
      title: "数据图谱构建",
      description:
        "多源数据融合，自动构建知识图谱，让海量数据形成智能化的关联网络，发现数据间的隐藏价值和深层关系。",
      icon: "🔗",
      gradient: "from-blue-500 to-cyan-500",
      highlights: ["多源数据融合", "知识图谱构建", "关联关系挖掘"],
    },
    {
      title: "智能决策调度",
      description:
        "AI 驱动的资源优化与任务调度，通过机器学习算法实现智能化的资源分配，提升运营效率和决策质量。",
      icon: "🧠",
      gradient: "from-purple-500 to-blue-500",
      highlights: ["AI 智能调度", "资源优化配置", "决策质量提升"],
    },
    {
      title: "仿真建模推演",
      description:
        "数字孪生建模，预测未来趋势，通过高精度仿真模型模拟各种场景，为战略决策提供科学依据。",
      icon: "🔬",
      gradient: "from-cyan-500 to-green-500",
      highlights: ["数字孪生建模", "场景仿真推演", "预测分析能力"],
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            核心能力
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            通过先进的数据科学技术，为企业提供全方位的智能化解决方案
          </p>
        </div>

        {/* 功能网格 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105"
            >
              {/* 渐变背景装饰 */}
              <div
                className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r ${feature.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
              ></div>

              {/* 内容区域 */}
              <div className="relative p-8 space-y-6">
                {/* 大图标 */}
                <div className="flex justify-center">
                  <div
                    className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                </div>

                {/* 标题 */}
                <h3 className="text-2xl font-bold text-gray-900 text-center">
                  {feature.title}
                </h3>

                {/* 描述 */}
                <p className="text-gray-600 leading-relaxed text-center">
                  {feature.description}
                </p>

                {/* 亮点标签 */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {feature.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className={`px-3 py-1 bg-gradient-to-r ${feature.gradient} bg-opacity-10 text-gray-700 text-sm font-medium rounded-full border border-gray-200`}
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* 了解更多按钮 */}
                <div className="pt-4 text-center">
                  <button
                    className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
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

                {/* 装饰性元素 */}
                <div
                  className={`absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部装饰文本 */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-sm font-medium">数据驱动，智能未来</span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
