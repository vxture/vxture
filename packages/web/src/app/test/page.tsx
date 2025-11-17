/**
 * 测试页面导航中心 - Component Test Navigation Center
 *
 * 功能概述：
 * - 整合所有测试页面的导航入口，按Phase组织
 * - 替换原有的426行复杂测试页面，提供更清晰的组织结构
 * - 集成主题切换、多语言、通知系统等成熟功能
 *
 * 架构设计：
 * - 使用 Zustand Store 进行状态管理（themeStore, i18nStore, notificationStore）
 * - 多语言配置通过 navigationContent 对象管理
 * - Phase 组织结构，每个Phase最多3个组件，便于调试
 * - 响应式设计，支持深色/浅色主题切换
 *
 * 调试要点：
 * - 主题切换：检查 HTML class 和 data-theme 属性是否正确应用
 * - 多语言：验证 locale 状态变化和内容切换
 * - 通知系统：确认切换操作时通知是否正确显示
 * - Phase导航：验证路由跳转和页面状态
 *
 * @version 2.1.0 - 添加详细调试注释
 * @created 2025-10-18
 * @updated 2025-10-19
 * @dependencies useThemeStore, useI18nStore, useNotificationStore
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  SunIcon,
  MoonIcon,
  HomeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  BookOpenIcon,
  BeakerIcon,
  SwatchIcon,
  CubeIcon,
  PuzzlePieceIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';

import { useThemeStore } from '@/stores/themeStore';
import { useI18nStore } from '@/stores/i18nStore';
import { useNotificationStore } from '@/stores/notificationStore';

// ==============================================================================
// 多语言内容配置 - Multi-language Content Configuration
// ==============================================================================

/**
 * 多语言内容配置对象
 *
 * 调试要点：
 * - 确保所有语言版本的key保持一致
 * - 验证 locale 状态变化时内容是否正确切换
 * - 检查 TypeScript 类型匹配问题
 * - 注意属性名命名规范（如 completionRate vs completion）
 */
const navigationContent = {
  'zh-CN': {
    pageTitle: '组件测试中心',
    pageDescription: '按Phase组织的测试页面导航，每个Phase最多3个组件',
    progressOverview: '测试进度概览',
    completedPhases: '已完成阶段',
    totalPhases: '总阶段数',
    completionRate: '完成进度',
    completion: '完成进度', // 修复：添加 completion 属性以匹配使用
    overallProgress: '整体进度',
    testPhases: '测试阶段',
    viewTest: '查看测试',
    comingSoon: '即将开放',
    usageGuide: '使用说明',
    usageItems: [
      '每个Phase最多包含3个相关组件，便于集中测试和调试',
      '已完成的Phase可以直接访问测试页面',
      '组件系统采用渐进式恢复策略，确保每个组件都经过充分验证',
      '主题系统页面展示CSS变量体系和工具类使用方法',
    ],
    home: '首页',
  },
  'en-US': {
    pageTitle: 'Component Test Center',
    pageDescription: 'Phase-organized test page navigation with max 3 components per phase',
    progressOverview: 'Test Progress Overview',
    completedPhases: 'Completed Phases',
    totalPhases: 'Total Phases',
    completionRate: 'Completion Rate',
    completion: 'Completion Rate', // 修复：添加 completion 属性以匹配使用
    overallProgress: 'Overall Progress',
    testPhases: 'Test Phases',
    viewTest: 'View Test',
    comingSoon: 'Coming Soon',
    usageGuide: 'Usage Guide',
    usageItems: [
      'Each Phase contains max 3 related components for focused testing and debugging',
      'Completed Phases can be accessed directly for testing',
      'Component system uses progressive recovery strategy to ensure thorough validation',
      'Theme system page demonstrates CSS variables and utility class usage',
    ],
    home: 'Home',
  },
};

// ==============================================================================
// 测试Phase配置 - Test Phase Configuration
// ==============================================================================

/**
 * Phase 接口定义
 *
 * 调试要点：
 * - status 状态必须准确反映实际完成情况
 * - path 路径必须与实际文件结构匹配
 * - components 数组控制每个Phase的组件数量（最多3个）
 * - icon 图标组件必须正确导入
 */
interface TestPhase {
  id: string;
  title: string;
  description: string;
  path: string;
  status: 'completed' | 'in-progress' | 'pending';
  components: string[];
  icon: React.ReactNode;
}

const testPhases: TestPhase[] = [
  {
    id: 'theme-system',
    title: '主题系统',
    description: 'CSS变量、工具类、语义映射完整展示',
    path: '/test/theme-system',
    status: 'completed',
    components: ['CSS Variables', 'Utilities', 'Semantics'],
    icon: <SwatchIcon className='w-6 h-6' />,
  },
  {
    id: 'phase1',
    title: 'Phase 1: 基础组件',
    description: '按钮、卡片组件与主题系统基础测试',
    path: '/test/phase1',
    status: 'completed',
    components: ['Button', 'Card', 'Theme'],
    icon: <CubeIcon className='w-6 h-6' />,
  },
  {
    id: 'phase2',
    title: 'Phase 2: 表单组件',
    description: '徽章、表单、输入组件测试',
    path: '/test/phase2',
    status: 'in-progress',
    components: ['Badge', 'Forms', 'Input'],
    icon: <PuzzlePieceIcon className='w-6 h-6' />,
  },
  {
    id: 'phase3',
    title: 'Phase 3: 导航组件',
    description: '导航、菜单、面包屑组件测试',
    path: '/test/phase3',
    status: 'pending',
    components: ['Navigation', 'Menu', 'Breadcrumb'],
    icon: <CommandLineIcon className='w-6 h-6' />,
  },
  {
    id: 'phase4',
    title: 'Phase 4: 交互组件',
    description: '弹窗、提示、下拉组件测试',
    path: '/test/phase4',
    status: 'pending',
    components: ['Modal', 'Tooltip', 'Dropdown'],
    icon: <BeakerIcon className='w-6 h-6' />,
  },
  {
    id: 'phase5',
    title: 'Phase 5: 数据组件',
    description: '表格、列表、分页组件测试',
    path: '/test/phase5',
    status: 'pending',
    components: ['Table', 'List', 'Pagination'],
    icon: <BookOpenIcon className='w-6 h-6' />,
  },
];

// ==============================================================================
// 状态图标组件
// ==============================================================================

const StatusIcon: React.FC<{ status: TestPhase['status'] }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className='w-5 h-5 text-green-500' />;
    case 'in-progress':
      return <ExclamationCircleIcon className='w-5 h-5 text-yellow-500' />;
    case 'pending':
      return <ClockIcon className='w-5 h-5 text-gray-400' />;
    default:
      return null;
  }
};

const StatusBadge: React.FC<{ status: TestPhase['status'] }> = ({ status }) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';

  switch (status) {
    case 'completed':
      return <span className={`${baseClasses} bg-green-100 text-green-700`}>已完成</span>;
    case 'in-progress':
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>进行中</span>;
    case 'pending':
      return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>待开始</span>;
    default:
      return null;
  }
};

// ==============================================================================
// 主组件 - Main Component
// ==============================================================================

const TestNavigationPage: React.FC = () => {
  // ============================================================================
  // 状态管理 - State Management
  // ============================================================================

  /**
   * 主题状态管理
   * 调试要点：检查 theme 值是否为 'light' 或 'dark'
   */
  const { theme, toggleTheme } = useThemeStore();

  /**
   * 多语言状态管理
   * 调试要点：检查 locale 值是否为 'zh-CN' 或 'en-US'
   */
  const { locale, setLocale, t } = useI18nStore();

  /**
   * 通知系统状态管理
   * 调试要点：确认 addNotification 函数是否正常工作
   */
  const { addNotification } = useNotificationStore();

  // ============================================================================
  // 计算逻辑 - Calculation Logic
  // ============================================================================

  /**
   * Phase 进度计算
   * 调试要点：检查 completedCount 和 progressPercentage 计算是否正确
   */
  const completedCount = testPhases.filter((phase) => phase.status === 'completed').length;
  const totalCount = testPhases.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  console.log('🔍 [Debug] 进度计算:', { completedCount, totalCount, progressPercentage });

  /**
   * 当前语言内容获取
   * 调试要点：确保 content 对象包含所有必需的属性
   */
  const content =
    navigationContent[locale as keyof typeof navigationContent] || navigationContent['zh-CN'];

  console.log('🌐 [Debug] 当前语言内容:', { locale, contentKeys: Object.keys(content) });

  // ============================================================================
  // 副作用 - Side Effects
  // ============================================================================

  /**
   * 主题初始化和同步到 DOM
   * 调试要点：
   * - 检查 HTML 元素的 class 属性是否包含正确的主题类
   * - 验证 data-theme 属性是否正确设置
   * - 确保 CSS 样式能够正确响应主题变化
   */
  React.useEffect(() => {
    console.log('🎨 [Debug] 主题同步到DOM:', { theme });

    if (typeof window !== 'undefined') {
      const html = document.documentElement;

      // 移除旧主题类
      html.classList.remove('light', 'dark');
      console.log('🧹 [Debug] 已移除旧主题类');

      // 添加当前主题类
      html.classList.add(theme);
      console.log('✅ [Debug] 已添加新主题类:', theme);

      // 设置 data-theme 属性
      html.setAttribute('data-theme', theme);
      console.log('📝 [Debug] 已设置 data-theme 属性:', theme);

      // 验证结果
      console.log('🔍 [Debug] HTML 元素状态:', {
        classList: Array.from(html.classList),
        dataTheme: html.getAttribute('data-theme'),
      });
    }
  }, [theme]);

  // ============================================================================
  // 事件处理器 - Event Handlers
  // ============================================================================

  /**
   * 主题切换处理器
   * 调试要点：
   * - 检查 toggleTheme() 是否正确改变 theme 状态
   * - 验证通知消息是否正确显示
   * - 确认 DOM 同步是否在 useEffect 中正确触发
   */
  const handleToggleTheme = () => {
    const previousTheme = theme;
    console.log('🎨 [Debug] 开始切换主题:', { from: previousTheme });

    toggleTheme();

    const notificationMessage = theme === 'light' ? '已切换到深色主题' : '已切换到浅色主题';
    addNotification(notificationMessage, 'success');

    console.log('✅ [Debug] 主题切换完成:', {
      previousTheme,
      expectedTheme: theme === 'light' ? 'dark' : 'light',
      notificationMessage,
    });
  };

  /**
   * 语言切换处理器
   * 调试要点：
   * - 检查 setLocale() 是否正确改变 locale 状态
   * - 验证内容是否根据新语言正确更新
   * - 确认通知消息使用正确的语言显示
   */
  const handleSetLocale = (targetLocale: string) => {
    console.log('🌐 [Debug] 开始切换语言:', { from: locale, to: targetLocale });

    if (locale !== targetLocale) {
      setLocale(targetLocale);

      const notificationMessage =
        targetLocale === 'zh-CN' ? '已切换为简体中文' : 'Switched to English';
      addNotification(notificationMessage, 'success');

      console.log('✅ [Debug] 语言切换完成:', {
        newLocale: targetLocale,
        notificationMessage,
        contentUpdated: navigationContent[targetLocale as keyof typeof navigationContent]
          ? '是'
          : '否',
      });
    } else {
      console.log('ℹ️ [Debug] 语言无需切换，已经是目标语言:', targetLocale);
    }
  };

  // ============================================================================
  // 渲染组件 - Render Component
  // ============================================================================

  console.log('🎯 [Debug] 组件渲染开始:', {
    theme,
    locale,
    completedCount,
    totalCount,
    progressPercentage,
    contentLoaded: !!content,
  });

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300'>
      {/* ========================================================================
          顶部导航栏 - Top Navigation Header
          调试要点：
          - 检查背景色是否根据主题正确变化
          - 验证语言切换按钮状态和交互
          - 确认主题切换按钮图标和功能正常
          ======================================================================== */}
      <header className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/'
                className='flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors'
              >
                <HomeIcon className='w-5 h-5' />
                <span>{content.home}</span>
              </Link>
              <div className='h-6 w-px bg-gray-300 dark:bg-gray-600'></div>
              <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {content.pageTitle}
              </h1>
            </div>

            <div className='flex items-center space-x-4'>
              {/* 语言切换 */}
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => handleSetLocale('zh-CN')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    locale === 'zh-CN'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => handleSetLocale('en-US')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    locale === 'en-US'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* 主题切换 */}
              <button
                onClick={handleToggleTheme}
                className='p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors'
                title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
              >
                {theme === 'light' ? (
                  <MoonIcon className='w-5 h-5' />
                ) : (
                  <SunIcon className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================
          主要内容区域 - Main Content Area
          ======================================================================== */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ====================================================================
            进度概览统计卡片 - Progress Overview Statistics Card
            调试要点：
            - 验证进度计算的准确性
            - 检查多语言文本显示是否正确
            - 确认深色模式下卡片样式正常
            ==================================================================== */}
        <div className='mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              {content.progressOverview}
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                  {completedCount}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>
                  {content.completedPhases}
                </div>
              </div>

              <div className='text-center'>
                <div className='text-3xl font-bold text-gray-900 dark:text-white'>{totalCount}</div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>
                  {content.totalPhases}
                </div>
              </div>

              <div className='text-center'>
                <div className='text-3xl font-bold text-green-600 dark:text-green-400'>
                  {progressPercentage}%
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>{content.completion}</div>
              </div>
            </div>

            {/* 进度条 */}
            <div className='mt-6'>
              <div className='flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2'>
                <span>{content.overallProgress}</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-500'
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试阶段列表 */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>测试阶段</h2>

          {testPhases.map((phase) => (
            <div
              key={phase.id}
              className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow'
            >
              <div className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4 flex-1'>
                    <div className='flex-shrink-0'>{phase.icon}</div>

                    <div className='flex-1'>
                      <div className='flex items-center space-x-3 mb-2'>
                        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                          {phase.title}
                        </h3>
                        <StatusBadge status={phase.status} />
                        <StatusIcon status={phase.status} />
                      </div>

                      <p className='text-gray-600 dark:text-gray-300'>{phase.description}</p>

                      <div className='mt-2 flex flex-wrap gap-2'>
                        {phase.components.map((component) => (
                          <span
                            key={component}
                            className='px-2 py-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded'
                          >
                            {component}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3'>
                    {phase.status === 'completed' && (
                      <Link
                        href={{ pathname: phase.path }}
                        className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                      >
                        查看测试
                      </Link>
                    )}

                    {phase.status === 'pending' && (
                      <span className='px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md'>
                        即将开放
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 说明文档 */}
        <div className='mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6'>
          <h3 className='text-lg font-medium text-blue-900 dark:text-blue-100 mb-3'>使用说明</h3>
          <div className='text-blue-800 dark:text-blue-200 space-y-2 text-sm'>
            <p>• 每个Phase最多包含3个相关组件，便于集中测试和调试</p>
            <p>• 已完成的Phase可以直接访问测试页面</p>
            <p>• 组件系统采用渐进式恢复策略，确保每个组件都经过充分验证</p>
            <p>• 主题系统页面展示CSS变量体系和工具类使用方法</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestNavigationPage;
