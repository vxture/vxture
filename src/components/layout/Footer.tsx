'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* 主要内容 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 公司信息 */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Vxture</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              提供先进的智能体解决方案，助力企业数字化转型。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">微信</span>
                WeChat
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">微博</span>
                Weibo
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">GitHub</span>
                GitHub
              </a>
            </div>
          </div>
          
          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  服务
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  联系我们
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 服务 */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">服务</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/ai-solutions" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  智能体解决方案
                </Link>
              </li>
              <li>
                <Link href="/services/digital-transformation" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  数字化转型
                </Link>
              </li>
              <li>
                <Link href="/services/web-development" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  网站开发
                </Link>
              </li>
              <li>
                <Link href="/services/consulting" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  技术咨询
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 联系信息 */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">联系我们</h3>
            <address className="not-italic text-gray-600 dark:text-gray-400">
              <p className="mb-2">中国北京市</p>
              <p className="mb-2">
                <a href="mailto:info@vxture.com" className="hover:text-primary">
                  info@vxture.com
                </a>
              </p>
              <p>
                <a href="tel:+86123456789" className="hover:text-primary">
                  +86 123 456 789
                </a>
              </p>
            </address>
          </div>
        </div>
        
        {/* 版权信息 */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} Vxture. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;