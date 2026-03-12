/**
 * layout.tsx
 *
 * 功能：
 * - 主布局组件，统一头部、底部
 *
 * 用途：
 * - 作为主内容区的布局包裹，承载 children 页面内容
 * - 结构与其它 layout 组件保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 依赖 Header、Footer
 * - 被 app/(main)/page.tsx 自动包裹
 *
 * 设计规范：
 * - 只负责布局，不包含业务逻辑
 * - 命名、结构、注释与其它 layout 组件保持一致
 *
 * @file app/(main)/layout.tsx
 * @desc 主内容区布局，统一头部、底部
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Next.js
 * @tags layout, main
 * @remarks
 *   仅负责布局，业务逻辑请移至页面/组件层。
 */
import { Footer, Header } from '@/components/layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
