// app/about/page.tsx

'use client'; // 客户端组件声明，允许使用浏览器API和状态管理

import ScrollSnapDemo from '@/components/aboutus/TestSection'; // 导入滚动吸附演示组件，用于分屏展示

// 定义Section类型，方便未来扩展
interface SectionConfig {
  id: string; // section的唯一标识，用于导航和锚点
  title: string; // section的标题，显示在导航和内容中
  backgroundColor?: string; // 可选的背景色，用于自定义样式
}

export default function AboutPage() {
  // 这里可以配置section数据，轻松扩展或修改
  const sections: SectionConfig[] = [
    { id: 'section-1', title: '关于我们', backgroundColor: '#e0f2fe' },
    { id: 'section-2', title: '我们的使命', backgroundColor: '#f1f5f9' },
    { id: 'section-3', title: '团队介绍', backgroundColor: '#e0f2fe' },
    { id: 'section-4', title: '联系信息', backgroundColor: '#f1f5f9' },
    // 如需添加新section，只需在这里添加对象即可
    // { id: 'section-5', title: '新增部分', backgroundColor: '#e0f2fe' },
  ];

  return (
    <div className='min-h-screen'>
      {/* 页面容器，最小高度为屏幕高度 */}
      {/* 直接调用ScrollSnapDemo组件，并传入配置 */}
      <ScrollSnapDemo sections={sections} /> {/* 传递sections配置到子组件 */}
    </div>
  );
}
