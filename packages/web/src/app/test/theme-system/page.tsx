'use client';

/**
 * 主题系统演示页面
 *
 * 测试内容：
 * - CSS 变量系统
 * - 主题工具类 (.bg-theme-*, .text-theme-*)
 * - 语义映射工具类 (.cm-primary-*, .cm-success-*)
 * - 主题切换效果
 *
 * 目的：展示完整的主题系统功能和工具类使用
 */

import Link from 'next/link';
import { useThemeStore } from '@/stores/themeStore';
import { SunIcon, MoonIcon, ArrowLeftIcon, SwatchIcon } from '@heroicons/react/24/outline';

export default function ThemeSystemPage() {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const semanticTypes = ['primary', 'secondary', 'info', 'success', 'warning', 'danger', 'gray'];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* 页面头部 */}
      <header className="border-b border-theme-border bg-theme-surface">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-theme-primary">主题系统演示</h1>
              <p className="text-theme-on-surface opacity-70">CSS变量 + 工具类 + 语义映射完整展示</p>
            </div>
            <div className="flex items-center gap-4">
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

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* 主题变量系统 */}
        <section className="space-y-6">
          <div className="border-l-4 border-theme-primary pl-4">
            <h2 className="text-xl font-semibold text-theme-primary mb-2">CSS 变量系统</h2>
            <p className="text-theme-on-surface opacity-70">基础主题变量定义和使用</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="card-title">基础颜色变量</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'primary', var: '--color-primary' },
                  { name: 'secondary', var: '--color-secondary' },
                  { name: 'tertiary', var: '--color-tertiary' },
                  { name: 'quaternary', var: '--color-quaternary' },
                ].map(color => (
                  <div key={color.name} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded border border-theme-border bg-theme-${color.name}`}
                    ></div>
                    <div className="text-sm">
                      <div className="font-medium text-theme-on-surface">{color.name}</div>
                      <div className="text-xs text-theme-on-surface opacity-60">{color.var}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">表面颜色变量</h3>
              <div className="space-y-3">
                <div className="p-3 bg-theme-background border border-theme-border rounded">
                  <div className="text-sm font-medium text-theme-on-background">background</div>
                  <div className="text-xs text-theme-on-background opacity-60">--color-background</div>
                </div>
                <div className="p-3 bg-theme-surface border border-theme-border rounded">
                  <div className="text-sm font-medium text-theme-on-surface">surface</div>
                  <div className="text-xs text-theme-on-surface opacity-60">--color-surface</div>
                </div>
                <div className="p-3 border-2 border-theme-outline rounded">
                  <div className="text-sm font-medium text-theme-on-surface">outline & border</div>
                  <div className="text-xs text-theme-on-surface opacity-60">--color-outline / --color-border</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 原子化工具类 */}
        <section className="space-y-6">
          <div className="border-l-4 border-theme-secondary pl-4">
            <h2 className="text-xl font-semibold text-theme-secondary mb-2">原子化工具类</h2>
            <p className="text-theme-on-surface opacity-70">.bg-theme-* / .text-theme-* / .border-theme-*</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 背景色工具类 */}
            <div className="card">
              <h3 className="card-title">背景色工具类</h3>
              <div className="space-y-2">
                {['primary', 'secondary', 'tertiary', 'quaternary'].map(color => (
                  <div key={color} className={`p-3 rounded bg-theme-${color} text-theme-on-${color === 'quaternary' ? 'primary' : color}`}>
                    <div className="text-sm font-medium">.bg-theme-{color}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 文本色工具类 */}
            <div className="card">
              <h3 className="card-title">文本色工具类</h3>
              <div className="space-y-2">
                {['primary', 'secondary', 'tertiary', 'quaternary'].map(color => (
                  <div key={color} className="p-3 rounded bg-theme-surface border border-theme-border">
                    <div className={`text-sm font-medium text-theme-${color}`}>
                      .text-theme-{color}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 边框色工具类 */}
            <div className="card">
              <h3 className="card-title">边框色工具类</h3>
              <div className="space-y-2">
                {['primary', 'secondary', 'tertiary', 'quaternary'].map(color => (
                  <div key={color} className={`p-3 rounded bg-theme-surface border-2 border-theme-${color}`}>
                    <div className="text-sm font-medium text-theme-on-surface">
                      .border-theme-{color}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 语义映射工具类 */}
        <section className="space-y-6">
          <div className="border-l-4 border-theme-tertiary pl-4">
            <h2 className="text-xl font-semibold text-theme-tertiary mb-2">语义映射工具类</h2>
            <p className="text-theme-on-surface opacity-70">.cm-semantic-slot 预定义颜色组合</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {semanticTypes.map(semantic => (
              <div key={semantic} className={`cm-${semantic}-card p-4 rounded-lg border`}>
                <div className={`cm-${semantic}-text-main text-lg font-semibold mb-2`}>
                  {semantic.charAt(0).toUpperCase() + semantic.slice(1)}
                </div>
                <div className={`cm-${semantic}-text-sub text-sm mb-2`}>
                  副标题样式
                </div>
                <div className={`cm-${semantic}-text-desc text-xs mb-3`}>
                  描述文本样式，通常用于补充说明
                </div>
                <div className="flex gap-2 mb-3">
                  <div className={`cm-${semantic}-tag px-2 py-1 rounded-full text-xs`}>
                    标签
                  </div>
                  <button className={`cm-${semantic}-btn px-3 py-1 rounded text-xs`}>
                    按钮
                  </button>
                </div>
                <div className={`cm-${semantic}-divider h-px mb-2`}></div>
                <div className="text-xs text-theme-on-surface opacity-50">
                  .cm-{semantic}-*
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 组合使用示例 */}
        <section className="space-y-6">
          <div className="border-l-4 border-theme-quaternary pl-4">
            <h2 className="text-xl font-semibold text-theme-quaternary mb-2">组合使用示例</h2>
            <p className="text-theme-on-surface opacity-70">原子化工具类 + 语义映射的混合使用</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hero 区域示例 */}
            <div className="cm-primary-hero p-8 rounded-lg">
              <div className="text-center">
                <SwatchIcon className="h-12 w-12 cm-primary-icon-main mx-auto mb-4" />
                <h3 className="text-2xl font-bold cm-primary-text-main mb-2">
                  语义映射 Hero
                </h3>
                <p className="cm-primary-text-desc mb-4">
                  使用 .cm-primary-hero 类创建的英雄区域，
                  自动适配主题颜色。
                </p>
                <button className="cm-primary-cta px-6 py-2 rounded-lg font-medium">
                  主要操作
                </button>
              </div>
            </div>

            {/* 混合使用示例 */}
            <div className="bg-theme-surface border border-theme-border p-8 rounded-lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-theme-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <SwatchIcon className="h-6 w-6 text-theme-on-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-theme-secondary mb-2">
                  原子化工具类
                </h3>
                <p className="text-theme-on-surface opacity-70 mb-4">
                  使用原子化工具类构建的区域，
                  提供更细粒度的控制。
                </p>
                <button className="bg-theme-secondary text-theme-on-secondary px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all">
                  次要操作
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 使用指南 */}
        <section className="card bg-theme-tertiary bg-opacity-5 border-theme-tertiary">
          <h3 className="text-lg font-semibold text-theme-tertiary mb-4">主题系统使用指南</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-medium text-theme-tertiary mb-3">🎨 原子化工具类</div>
              <div className="space-y-2 text-theme-on-surface opacity-70">
                <p><code className="bg-theme-surface px-1 rounded">.bg-theme-primary</code> - 主色背景</p>
                <p><code className="bg-theme-surface px-1 rounded">.text-theme-on-primary</code> - 主色上的文本</p>
                <p><code className="bg-theme-surface px-1 rounded">.border-theme-border</code> - 边框色</p>
                <p>适合需要精确控制的场景</p>
              </div>
            </div>
            <div>
              <div className="font-medium text-theme-tertiary mb-3">🎯 语义映射工具类</div>
              <div className="space-y-2 text-theme-on-surface opacity-70">
                <p><code className="bg-theme-surface px-1 rounded">.cm-primary-card</code> - 主色卡片</p>
                <p><code className="bg-theme-surface px-1 rounded">.cm-success-btn</code> - 成功按钮</p>
                <p><code className="bg-theme-surface px-1 rounded">.cm-warning-tag</code> - 警告标签</p>
                <p>适合快速构建一致的UI</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-theme-primary bg-opacity-10 rounded-lg">
            <div className="font-medium text-theme-primary mb-2">💡 最佳实践</div>
            <ul className="space-y-1 text-sm text-theme-on-surface opacity-70">
              <li>• 优先使用语义映射工具类，确保设计一致性</li>
              <li>• 在需要特殊控制时使用原子化工具类</li>
              <li>• 避免硬编码颜色值，始终使用主题变量</li>
              <li>• 利用 .transition-theme 类为主题切换添加过渡效果</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
