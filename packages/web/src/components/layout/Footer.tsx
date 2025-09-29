"use client";

import { VscGithubInverted } from 'react-icons/vsc';
import { AiFillWechatWork,AiFillTikTok } from 'react-icons/ai';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-50 via-slate-100 to-gray-200 text-slate-800">
      <div className="max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 主要内容区域 */}
        <div className="flex flex-col md:flex-row gap-32 py-8">
          {/* 品牌信息 - 左侧 30% */}
          <div className="flex flex-col h-full basis-[38%] min-w-[260px] pl-32">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-gray-500">vxture.ai</span>
            </div>
            {/* Contact Info */}
            <div className="flex flex-col items-start justify-start text-sm py-2">
              <div className="flex items-center text-base text-gray-500 py-2">
                <svg
                  className="w-6 h-6 text-blue-300"
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
                <span className="mx-2">contact@vxture.com</span>
              </div>
              <div className="flex items-center text-base text-gray-500 py-2">
                <svg
                  className="w-6 h-6 text-blue-300"
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
                <span className="mx-2">400-888-0000</span>
              </div>
            </div>
            {/* 社交媒体 联系方式，底部对齐 */}
            <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 mt-auto">
              <div className="flex items-center justify-center space-x-4 self-end">
                <a
                  href="#"
                  aria-label="GitHub"
                >
                  {/* GitHub SVG */}
                  <VscGithubInverted className="w-7 h-7 text-gray-500 mr-2" />
                </a>
                <a
                  href="#"
                  aria-label="Douyin"
                >
                  {/* Tiktok SVG */}
                  <AiFillTikTok className="w-8 h-8 text-gray-500 mr-2" />
                </a>
                <a
                  href="#"
                  aria-label="WeChat Official Account"
                >
                  {/* Wechat SVG */}
                  <AiFillWechatWork className="w-8 h-8 text-gray-500 mr-2" />
                </a>
              </div>

            </div>
          </div>

          {/* 链接区 - 右侧 70% */}
          <div className="flex h-full flex-col md:flex-row basis-[62%] justify-between  pt-1">
            {/* 产品服务 */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-6 text-gray-500">产品服务</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                  >
                    产品矩阵
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                  >
                    应用中心
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                  >
                    帮助文档
                  </a>
                </li>
              </ul>
            </div>

            {/* 解决方案 */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-6 text-gray-500">解决方案</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                  >
                    重大活动保障场景
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                  >
                    决策指挥调度场景
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-blue-700 transition-colors duration-300"
                  >
                    通用决策分析场景
                  </a>
                </li>
              </ul>
            </div>

            {/* 关于我们 */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-6 text-gray-500">关于我们</h3>
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
