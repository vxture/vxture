// app/about/layout.tsx

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  // 这个布局只渲染页面内容，不包含Header和Footer
  return (
    <div className='min-h-screen'>
      {/* 直接渲染children（即about/page.tsx的内容） */}
      {children}
    </div>
  );
}
