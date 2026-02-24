/**
 * TestSection.tsx
 *
 * 功能：
 * - 关于页分屏滚动演示区块，支持自定义 section 配置
 * - 支持动态背景色、响应式布局
 *
 * 用途：
 * - 作为 about 页面分屏演示区块，便于团队协作与扩展
 * - 结构与其它 Section 组件保持一致
 *
 * 依赖/调用关系：
 * - 被 app/about/page.tsx 直接引用
 *
 * 设计规范：
 * - 只负责 UI 展示与交互，不包含业务逻辑
 * - 命名、结构、注释与其它 Section 组件保持一致
 *
 * @file TestSection.tsx
 * @desc 关于页分屏滚动演示区块，支持自定义配置
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React
 * @tags about, section, component
 * @example
 *   <TestSection sections={[{ id: 'about-1', title: '团队介绍' }]} />
 * @remarks
 *   仅负责 UI 展示，业务逻辑请移至上层页面/服务。
 *   如需吸附功能，请在页面级使用 useWindowScrollSnap
 * @todo
 *   支持更多动态内容与动画效果
 */
'use client'; // 客户端组件声明，用于使用浏览器 API

// 接收外部传入的 section 配置类型
interface ScrollSnapDemoProps {
  sections: {
    id: string; // section 的唯一标识
    title: string; // section 的标题
    backgroundColor?: string; // 可选的背景颜色
  }[];
}

export default function ScrollSnapDemo({ sections }: ScrollSnapDemoProps) {
  // 注意：如需吸附功能，请在 about/page.tsx 中使用 useWindowScrollSnap

  return (
    <div className='min-h-screen'>
      <div className='pt-0 border-2 border-red-600'>
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className='snap-section min-h-screen flex items-center justify-center p-8 border-2 border-red-600 transition-all'
            style={{
              backgroundColor: section.backgroundColor || (index % 2 === 0 ? '#e0f2fe' : '#f1f5f9'),
            }}
          >
            <div className='w-full max-w-3xl text-center border-2 border-red-600'>
              <h2 className='text-3xl md:text-4xl font-bold mb-6 text-blue-700'>{section.title}</h2>
              <p className='text-gray-600 text-lg'>
                这是{section.title.toLowerCase()}的内容区，可根据需求自定义填充。
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
