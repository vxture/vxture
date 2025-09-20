'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 导航项定义
  const navItems = [
    { name: '产品', href: '/products' },
    { name: '解决方案', href: '/solutions' },
    { name: '案例', href: '/cases' },
    { name: '关于我们', href: '/about' },
    { name: '博客', href: '/blog' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {/* 可以替换为实际logo */}
              <span className="text-xl font-bold text-blue-600">Vxture</span>
            </Link>
          </div>

          {/* 桌面导航 */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA 按钮 */}
          <div className="hidden md:block">
            <Link
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              联系我们
            </Link>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">打开菜单</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden py-2">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/contact"
                className="block w-full text-center mt-4 px-4 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                联系我们
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
