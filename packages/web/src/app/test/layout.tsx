// app/test/layout.tsx

export default function TestLayout({ children }: { children: React.ReactNode }) {
  // 该布局仅用于 test 页面，包裹测试内容
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 渲染 test/page.tsx 的内容 */}
      {children}
    </div>
  );
}
