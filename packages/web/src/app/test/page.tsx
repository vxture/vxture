/**
 * test/page.tsx - 测试页面
 *
 * 用于逐步验证功能
 */

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          测试页面
        </h1>
        <p className="text-gray-600 mb-4">
          这是一个简单的测试页面，用于验证基础功能。
        </p>

        <div className="space-y-2 text-sm">
          <p>✅ Next.js 路由正常</p>
          <p>✅ Tailwind CSS 样式正常</p>
          <p>✅ 页面渲染正常</p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="text-blue-800 font-semibold">访问地址：</p>
          <code className="text-blue-600">http://localhost:3004/test</code>
        </div>
      </div>
    </div>
  );
}
