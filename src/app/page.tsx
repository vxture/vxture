import Link from 'next/link';

export default function Home() {
  // 特色/优势数据
  const features = [
    {
      title: 'AI 集成',
      description: '无缝集成多种 AI 模型与服务，提供统一的管理界面',
      icon: (
        <svg
          className="w-12 h-12 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: '数据分析',
      description: '强大的数据处理和分析能力，从海量数据中提取有价值的见解',
      icon: (
        <svg
          className="w-12 h-12 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: '自动化流程',
      description: '自动化业务流程，减少人工干预，提高运营效率',
      icon: (
        <svg
          className="w-12 h-12 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
    {
      title: '安全可靠',
      description: '企业级安全架构，确保数据和模型的安全性与合规性',
      icon: (
        <svg
          className="w-12 h-12 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
  ];

  // 客户证言数据
  const testimonials = [
    {
      quote: 'Vxture 的 AI 平台帮助我们将客户服务响应时间缩短了60%，同时提高了客户满意度。',
      name: '张明',
      title: '某科技公司 CTO',
    },
    {
      quote:
        '采用Vxture的数据分析解决方案后，我们发现了之前未注意到的市场趋势，成功开发了两个新产品线。',
      name: '李华',
      title: '某制造企业 CEO',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 英雄区域 */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">企业 AI 集成平台</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            为企业提供先进的 AI 集成与解决方案，释放数据价值，加速业务创新
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/solutions"
              className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium text-lg"
            >
              探索解决方案
            </Link>
            <Link
              href="/contact"
              className="bg-transparent hover:bg-blue-700 border-2 border-white px-6 py-3 rounded-lg font-medium text-lg"
            >
              联系我们
            </Link>
          </div>
        </div>
      </section>

      {/* 特色/优势区 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择 Vxture</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我们提供领先的 AI 技术与解决方案，帮助企业实现数字化转型
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 产品/服务展示 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">我们的产品</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              全面的智能化产品套件，满足各行业需求
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">企业 AI 平台</h3>
                <p className="text-gray-600 mb-4">
                  统一管理和部署多种 AI 模型与服务，支持业务自动化
                </p>
                <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium">
                  了解更多 &rarr;
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">数据分析工具</h3>
                <p className="text-gray-600 mb-4">
                  强大的数据处理和分析能力，从海量数据中提取有价值的见解
                </p>
                <Link
                  href="/products/data-analytics"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  了解更多 &rarr;
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">集成服务</h3>
                <p className="text-gray-600 mb-4">连接现有系统与 AI 平台，打造无缝的业务生态</p>
                <Link
                  href="/products/integration"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  了解更多 &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 客户证言 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">客户评价</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">听听我们的客户怎么说</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg">
                <p className="text-gray-700 italic mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 号召行动区 */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">准备好开始您的智能化转型了吗？</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">联系我们，获取专业解决方案和技术支持</p>
          <Link
            href="/contact"
            className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg inline-block"
          >
            立即咨询
          </Link>
        </div>
      </section>
    </div>
  );
}
