"use client";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-50 via-slate-100 to-gray-200 text-slate-800">
      <div className="max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 主要内容区域 */}
        <div className="py-16 grid lg:grid-cols-4 md:grid-cols-2 gap-8 ml-48">
          {/* 品牌信息 */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6 border-2 border-red-800">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-2xl font-bold text-blue-700">vxture</span>
            </div>
            <div className="flex flex-col items-start justify-start text-sm">
              <div className="flex items-start justify-start text-sm text-gray-500 border-2 border-red-800 py-2">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>contact@vxture.com</span>
              </div>
              <div className="flex items-start justify-start text-sm text-gray-500 border-2 border-red-800 py-2">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="px-10">400-888-0000</span>
              </div>
            </div>
          </div>

          {/* 产品服务 */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-700">产品服务</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                >
                  数据建模
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                >
                  智能调度
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                >
                  仿真推演
                </a>
              </li>
            </ul>
          </div>

          {/* 解决方案 */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-700">解决方案</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                >
                  重大活动保障
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                >
                  战场态势分析
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                >
                  通用决策场景
                </a>
              </li>
            </ul>
          </div>

          {/* 关于我们 */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-700">关于我们</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                >
                  招贤纳士
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                >
                  联系我们
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                >
                  合作伙伴
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 社交媒体 联系方式 */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">  
          <div className="flex space-x-4">
            <a
              href="#"
              className="w-10 h-10 bg-white hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-300 border border-gray-200"
              aria-label="GitHub"
            >
              {/* GitHub */}
              <svg
                className="w-5 h-5 text-gray-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.989C24.007 5.367 18.641.001.012.001z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-300 border border-gray-200"
              aria-label="Douyin"
            >
              {/* Douyin (抖音) 图标 */}
              <svg
                className="w-5 h-5 text-black"
                viewBox="0 0 48 48"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M34 6c.2 4.2 2.7 7.2 7 7.7v6.2c-3.7-.1-7.1-1.2-10-3.2v14.8c0 5.6-4.6 10.2-10.2 10.2S10.6 37.1 10.6 31.5c0-5.6 4.6-10.2 10.2-10.2.5 0 1 .1 1.5.1v6.3c-.5-.1-1-.2-1.5-.2-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4V6h7.5z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors duration-300 border border-gray-200"
              aria-label="WeChat Official Account"
            >
              {/* 微信公众号图标 */}
              <svg
                className="w-5 h-5 text-green-500"
                viewBox="0 0 48 48"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="20" fill="#fff" />
                <ellipse cx="24" cy="24" rx="18" ry="14" fill="#4caf50" />
                <circle cx="18" cy="22" r="2" fill="#fff" />
                <circle cx="30" cy="22" r="2" fill="#fff" />
                <ellipse cx="24" cy="28" rx="6" ry="3" fill="#fff" />
              </svg>
            </a>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>contact@vxture.com</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>400-888-0000</span>
            </div>
          </div>
        </div>

        {/* 分割线 */}
        <div className="border-t border-gray-300"></div>

        {/* 底部信息 */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 text-sm text-gray-500">
            <p>&copy; 2023 vxture All rights reserved.</p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="hover:text-blue-700 transition-colors duration-300"
              >
                隐私政策
              </a>
              <a
                href="#"
                className="hover:text-blue-700 transition-colors duration-300"
              >
                服务条款
              </a>
              <a
                href="#"
                className="hover:text-blue-700 transition-colors duration-300"
              >
                法律声明
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>备案：<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700">陕ICP备2025076448号</a></span>
            <span>|</span>
            <span>增值电信业务经营许可证：B2-20180000</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
