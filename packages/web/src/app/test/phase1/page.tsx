'use client';

/**
 * Phase 1 测试页面 - 基础组件
 *
 * 测试内容：
 * - Button 组件（基础、主要、次要、图标按钮）
 * - Card 组件（基础卡片、标题）
 * - 主题切换功能
 *
 * 目的：验证已恢复的基础组件功能
 */

import Link from 'next/link';
import { useThemeStore } from '@/stores/themeStore';
import { SunIcon, MoonIcon, ArrowLeftIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Phase1TestPage() {
  const { theme, setTheme } = useThemeStore();
  const [buttonClickCount, setButtonClickCount] = useState(0);

  const handleButtonClick = () => {
    setButtonClickCount(prev => prev + 1);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-theme-background text-theme-on-background transition-theme">
      {/* 页面头部 */}
      <header className="border-b border-theme-border bg-theme-surface">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-theme-primary">Phase 1 测试</h1>
              <p className="text-theme-on-surface opacity-70">基础组件：Button + Card + 主题切换</p>
            </div>
            <div className="flex items-center gap-4">
              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className="btn-icon-md"
                title="切换主题"
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </button>
              <Link href="/test" className="btn-secondary">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                返回测试首页
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-12">
        {/* Button 组件测试区域 */}
        <section className="space-y-6">
          <div className="border-l-4 border-theme-primary pl-4">
            <h2 className="text-xl font-semibold text-theme-primary mb-2">Button 组件测试</h2>
            <p className="text-theme-on-surface opacity-70">测试各种按钮样式和交互效果</p>
          </div>

          {/* 基础按钮 */}
          <div className="card">
            <h3 className="card-title">基础按钮样式</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn" onClick={handleButtonClick}>
                基础按钮
              </button>
              <button className="btn-primary" onClick={handleButtonClick}>
                主要按钮
              </button>
              <button className="btn-secondary" onClick={handleButtonClick}>
                次要按钮
              </button>
            </div>
            <p className="mt-4 text-sm text-theme-on-surface opacity-60">
              点击次数: {buttonClickCount}
            </p>
          </div>

          {/* 图标按钮 */}
          <div className="card">
            <h3 className="card-title">图标按钮样式</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <button className="btn-icon-sm" title="小图标按钮">
                <HeartIcon className="h-4 w-4" />
              </button>
              <button className="btn-icon-md" title="中图标按钮">
                <StarIcon className="h-5 w-5" />
              </button>
              <button className="btn-icon-lg" title="大图标按钮">
                <SunIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4 text-sm text-theme-on-surface opacity-60">
              <p>尺寸：sm (32px) / md (40px) / lg (48px)</p>
            </div>
          </div>

          {/* 按钮状态演示 */}
          <div className="card">
            <h3 className="card-title">按钮交互状态</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary">正常状态</button>
                <button className="btn-primary" disabled>
                  禁用状态
                </button>
              </div>
              <p className="text-sm text-theme-on-surface opacity-60">
                悬停时有上移效果，点击时有按下动画
              </p>
            </div>
          </div>
        </section>

        {/* Card 组件测试区域 */}
        <section className="space-y-6">
          <div className="border-l-4 border-theme-secondary pl-4">
            <h2 className="text-xl font-semibold text-theme-secondary mb-2">Card 组件测试</h2>
            <p className="text-theme-on-surface opacity-70">测试卡片容器和内容布局</p>
          </div>

          {/* 基础卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="card-title">基础卡片</h3>
              <p className="text-theme-on-surface">
                这是一个基础的卡片组件，具有圆角、边框和阴影效果。
                会根据当前主题自动调整背景色和文本色。
              </p>
            </div>

            <div className="card">
              <h3 className="card-title">带操作的卡片</h3>
              <p className="text-theme-on-surface mb-4">
                卡片可以包含各种内容，如文本、按钮等。
              </p>
              <div className="flex gap-2">
                <button className="btn-primary">主要操作</button>
                <button className="btn-secondary">次要操作</button>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">信息展示卡片</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-on-surface opacity-70">当前主题:</span>
                  <span className="font-medium text-theme-primary">{theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-on-surface opacity-70">按钮点击:</span>
                  <span className="font-medium text-theme-primary">{buttonClickCount} 次</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">响应式卡片</h3>
              <p className="text-theme-on-surface mb-4">
                卡片布局支持响应式设计，在不同屏幕尺寸下自动调整。
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-theme-primary bg-opacity-10 p-2 rounded text-center">
                  <div className="font-medium text-theme-primary">移动端</div>
                  <div className="text-xs text-theme-on-surface opacity-60">单列布局</div>
                </div>
                <div className="bg-theme-secondary bg-opacity-10 p-2 rounded text-center">
                  <div className="font-medium text-theme-secondary">桌面端</div>
                  <div className="text-xs text-theme-on-surface opacity-60">双列布局</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 主题系统测试区域 */}
        <section className="space-y-6">
          <div className="border-l-4 border-theme-tertiary pl-4">
            <h2 className="text-xl font-semibold text-theme-tertiary mb-2">主题系统测试</h2>
            <p className="text-theme-on-surface opacity-70">测试主题切换和CSS变量系统</p>
          </div>

          <div className="card">
            <h3 className="card-title">主题变量演示</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <div className="w-full h-8 bg-theme-primary rounded"></div>
                <div className="text-center text-theme-on-surface opacity-70">primary</div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-8 bg-theme-secondary rounded"></div>
                <div className="text-center text-theme-on-surface opacity-70">secondary</div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-8 bg-theme-tertiary rounded"></div>
                <div className="text-center text-theme-on-surface opacity-70">tertiary</div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-8 bg-theme-surface border-2 border-theme-border rounded"></div>
                <div className="text-center text-theme-on-surface opacity-70">surface</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">切换说明</h3>
            <div className="space-y-3 text-sm text-theme-on-surface">
              <p>• 点击右上角的太阳/月亮图标切换主题</p>
              <p>• 所有组件会自动跟随主题变化</p>
              <p>• CSS变量系统确保一致性</p>
              <p>• 过渡动画提供平滑体验</p>
            </div>
          </div>
        </section>

        {/* 测试总结 */}
        <section className="card bg-theme-primary bg-opacity-5 border-theme-primary">
          <h3 className="text-lg font-semibold text-theme-primary mb-4">Phase 1 测试总结</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-theme-primary mb-2">✅ 已测试组件</div>
              <ul className="space-y-1 text-theme-on-surface opacity-70">
                <li>• Button 基础样式</li>
                <li>• Button 图标变体</li>
                <li>• Card 容器组件</li>
                <li>• 主题切换系统</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-theme-primary mb-2">🎯 测试要点</div>
              <ul className="space-y-1 text-theme-on-surface opacity-70">
                <li>• 交互状态反馈</li>
                <li>• 主题色彩适配</li>
                <li>• 响应式布局</li>
                <li>• 无障碍访问</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-theme-primary mb-2">🚀 下一步</div>
              <ul className="space-y-1 text-theme-on-surface opacity-70">
                <li>• 恢复 Badge 组件</li>
                <li>• 添加 Forms 组件</li>
                <li>• 创建 Phase 2 测试</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
