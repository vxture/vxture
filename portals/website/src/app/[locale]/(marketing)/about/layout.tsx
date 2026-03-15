/**
 * layout.tsx
 *
 * 功能：
 * - 统一管理 about 页面布局，仅渲染页面内容，不包含 Header 和 Footer
 *
 * 用途：
 * - 作为 about 相关页面的局部布局，包裹所有子页面内容
 * - 结构与其它布局、页面组件保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 被 app/about/page.tsx 及其它 about 子页面自动包裹
 *
 * 设计规范：
 * - 只负责页面布局，不包含业务逻辑
 * - 命名、结构、注释与其它页面/布局组件保持一致
 *
 * @file app/about/layout.tsx
 * @desc about 页面局部布局组件，仅渲染子页面内容
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React
 * @tags layout, about, page
 * @example
 *   // 自动包裹所有 about 子页面，无需手动引入
 * @remarks
 *   仅负责页面布局，业务逻辑请移至页面/组件层。
 * @todo
 *   支持更多 about 页面布局扩展
 */

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  // 这个布局只渲染页面内容，不包含Header和Footer
  return (
    <div className='min-h-screen'>
      {/* 直接渲染children（即about/page.tsx的内容） */}
      {children}
    </div>
  );
}
