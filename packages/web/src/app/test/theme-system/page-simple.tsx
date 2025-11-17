'use client'

/**
 * 主题系统演示页面 (简化版)
 */

import Link from 'next/link'
import { useThemeStore } from '@/stores/themeStore'
import { SunIcon, MoonIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function ThemeSystemPage() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* 页面头部 */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/test"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>返回测试导航</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                主题系统演示
              </h1>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 主题切换演示 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">主题切换演示</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              当前主题: <span className="font-medium">{theme === 'light' ? '浅色' : '深色'}</span>
            </p>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              切换主题
            </button>
          </section>

          {/* 颜色演示 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Tailwind 颜色演示</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="text-blue-900 dark:text-blue-100">蓝色</div>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                <div className="text-green-900 dark:text-green-100">绿色</div>
              </div>
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <div className="text-yellow-900 dark:text-yellow-100">黄色</div>
              </div>
              <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                <div className="text-red-900 dark:text-red-100">红色</div>
              </div>
            </div>
          </section>

          {/* CSS变量演示 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">CSS 变量演示</h2>
            <div className="space-y-3">
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)'
                }}
              >
                使用 CSS 变量 --color-primary
              </div>
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-on-secondary)'
                }}
              >
                使用 CSS 变量 --color-secondary
              </div>
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                使用 CSS 变量 --color-surface
              </div>
            </div>
          </section>

          {/* 使用说明 */}
          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
              主题系统说明
            </h3>
            <div className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
              <p>• 使用 Tailwind CSS 的 dark: 前缀实现深色主题</p>
              <p>• 通过 Zustand 管理全局主题状态</p>
              <p>• CSS 变量定义在 theme-colors.css 中</p>
              <p>• 支持系统主题检测和手动切换</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
