"use client";

/**
 * CTASection
 * 
 * 作者：Stone Smoker
 * 更新时间：2025-09-29
 * 代码说明：代码已美化，结构分组清晰，注释详尽，移除无效/冗余属性。
 * 
 */

export default function CTASection() {
  return (
    <section className="pt-40 pb-12 bg-gradient-to-b from-blue-50 to-blue-50">
      {/* ===== 背景装饰层 ===== */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/5 to-green-500/5 rounded-full blur-3xl" />
      </div>

      {/* ===== 装饰性几何图形层 ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* 蓝色六边形 */}
        <svg
          className="absolute top-10 left-10 w-16 h-16 text-blue-500/20"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7l-10-5z" />
        </svg>
        {/* 紫色圆形 */}
        <svg
          className="absolute top-20 right-32 w-12 h-12 text-purple-500/20"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
        {/* 青色星形 */}
        <svg
          className="absolute bottom-32 left-32 w-20 h-20 text-cyan-500/20"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      {/* ===== 主内容区 ===== */}
      <div className="relative max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 主标题 */}
        <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent block lg:inline lg:ml-4">
            准备好释放数据潜力了吗？
          </span>
        </h2>
        {/* 副标题（如无内容可移除） */}
        {/* <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"></p> */}

        {/* ===== 特色亮点区 ===== */}
        <div className="grid md:grid-cols-5 gap-6 my-12">
          {/* 左侧占位格 */}
          <div className="flex items-center justify-center p-4" />
          {/* 快速部署 */}
          <div className="flex items-center justify-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-800">快速部署</span>
          </div>
          {/* 专业保障 */}
          <div className="flex items-center justify-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-800">专业保障</span>
          </div>
          {/* 持续创新 */}
          <div className="flex items-center justify-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-800">持续创新</span>
          </div>
          {/* 右侧占位格 */}
          <div className="flex items-center justify-center p-4" />
        </div>

        {/* ===== CTA 按钮区 ===== */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* 免费试用按钮 */}
          <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl min-w-[200px]">
            <span className="flex items-center justify-center space-x-2">
              <span>免费试用</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </button>
          {/* 联系咨询按钮 */}
          <button className="group px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg min-w-[200px]">
            <span className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>RuinsAgent</span>
            </span>
          </button>
        </div>

        {/* ===== 联系方式区 ===== */}
        <div className="py-8 bg-gradient-to-r from-blue-50 to-blue-50 rounded-2xl border border-gray-100">
          <p className="text-gray-600 mb-4">我们的专家团队随时为您服务</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            {/* 邮箱 */}
            <div className="flex items-center space-x-2 text-gray-700">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>experts@vxture.com</span>
            </div>
            {/* 电话 */}
            <div className="flex items-center space-x-2 text-gray-700">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>029-12345678</span>
            </div>
          </div>
        </div>
      </div>
      {/* 回到顶部按钮，右下角，带动态效果 */}
      <div className="absolute right-16 bottom-20 z-20">
        <button
          type="button"
          className="flex flex-col items-center px-3 py-2 rounded-full bg-white/0 hover:bg-gray-100 transition animate-bounce"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="回到顶部"
        >
          <svg
            className="w-6 h-6 text-gray-400 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          <span className="text-xs text-gray-400">回到顶部</span>
        </button>
      </div>
    </section>
  );
}
