/**
 * ProductDetailPartOne.tsx
 *
 * 功能：
 * - 产品详情分屏滚动区块，渲染多个吸附 section
 * - 支持吸附滚动、响应式布局、分屏内容演示
 *
 * 用途：
 * - 作为产品详情页分屏演示区块，便于团队协作与扩展
 * - 结构与其它 Section 组件保持一致
 *
 * 依赖/调用关系：
 * - 依赖 TailwindCSS、Next.js
 * - 被 app/products/page.tsx 直接引用
 *
 * 设计规范：
 * - 只负责 UI 展示与交互，不包含业务逻辑
 * - 命名、结构、注释与其它 Section 组件保持一致
 *
 * @file ProductDetailPartOne.tsx
 * @desc 产品详情分屏滚动区块，支持吸附滚动与分屏内容
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, TailwindCSS
 * @tags products, detail, section, snap, component
 * @example
 *   <ProductDetailPartOne />
 * @remarks
 *   仅负责 UI 展示，业务逻辑请移至上层页面/服务。
 * @todo
 *   支持更多动态内容与动画效果
 */
'use client'; // 客户端组件声明，允许使用浏览器 API

export default function ProductDetailPartOne() {
  return (
    <>
      {/* Section 1: 普通内容区（吸附目标） */}
      <div
        id='snap-section-1' // 唯一 ID
        className='snap-section bg-gray-200 px-8 flex items-center justify-center' // 吸附类、屏幕高度、居中布局、调试边框
      >
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-blue-600'>特定吸附区域1</h2>
          <p className='mt-4 text-gray-600'>
            带.snap-section类，滚动到距离视口120px内会自动吸附到顶部。
          </p>
        </div>
      </div>

      {/* Section 2: 特定吸附元素1（吸附目标） */}
      <div
        id='snap-section-2' // 唯一 ID
        className='snap-section bg-blue-200 px-8 flex items-center justify-center' // 吸附类、屏幕高度、居中布局、调试边框
      >
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-blue-600'>特定吸附区域2</h2>
          <p className='mt-4 text-gray-600'>
            带.snap-section类，滚动到距离视口120px内会自动吸附到顶部。
          </p>
        </div>
      </div>

      {/* Section 3: 普通内容区（吸附目标） */}
      <div
        id='snap-section-3' // 唯一 ID
        className='snap-section bg-gray-200 px-8 flex items-center justify-center' // 吸附类、屏幕高度、调试边框
      >
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>特定吸附区域3</h2>
          <p className='mt-4 text-gray-600'>继续滚动，下一个带.snap-section的元素会触发吸附。</p>
        </div>
      </div>

      {/* Section 4: 特定吸附元素2（吸附目标） */}
      <div
        id='snap-section-4' // 唯一 ID
        className='snap-section bg-blue-200 px-8 flex items-center justify-center' // 吸附类、屏幕高度、居中布局、调试边框
      >
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-green-600'>特定吸附区域4</h2>
          <p className='mt-4 text-gray-600'>同样带.snap-section类，仅该类元素会触发吸附。</p>
        </div>
      </div>
    </>
  );
}
