
/**
 * page.tsx
 *
 * 功能：
 * - 统一管理 about 页面内容，分屏展示团队、使命、联系等信息
 * - 支持自定义 section 配置，便于扩展
 *
 * 用途：
 * - 作为关于我们页面，展示公司/团队介绍、使命、联系方式等
 * - 结构与其它页面组件保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 依赖 @/components/aboutus/TestSection 进行分屏滚动展示
 * - 被 app/about/layout.tsx 自动包裹
 *
 * 设计规范：
 * - 只负责页面内容展示，不包含业务逻辑
 * - 命名、结构、注释与其它页面组件保持一致
 *
 * @file app/about/page.tsx
 * @desc 关于我们页面，分屏展示团队、使命、联系等信息
 * @author vxture team
 * @created 2024-06-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React
 * @see @/components/aboutus/TestSection
 * @tags about, page, section
 * @example
 *   // 由 Next.js 自动路由，无需手动引入
 * @remarks
 *   仅负责页面内容展示，业务逻辑请移至组件/服务层。
 * @todo
 *   支持更多 section 类型与动态数据
 */

'use client';

import ScrollSnapDemo from '@/Presentation/components/aboutus/TestSection';

interface SectionConfig {
  id: string;
  title: string;
  backgroundColor?: string;
}

export default function AboutPage() {
  const sections: SectionConfig[] = [
    { id: 'section-1', title: '关于我们', backgroundColor: '#e0f2fe' },
    { id: 'section-2', title: '我们的使命', backgroundColor: '#f1f5f9' },
    { id: 'section-3', title: '团队介绍', backgroundColor: '#e0f2fe' },
    { id: 'section-4', title: '联系信息', backgroundColor: '#f1f5f9' },
    // { id: 'section-5', title: '新增部分', backgroundColor: '#e0f2fe' },
  ];

  return (
    <div className='min-h-screen'>
      <ScrollSnapDemo sections={sections} />
    </div>
  );
}
