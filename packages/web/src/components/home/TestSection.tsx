"use client";

import { useScrollSnap } from "@/hooks/useScrollSnap";

// 示例：使用滚动吸附效果的组件
export default function ScrollSnapDemo() {
  // 使用自定义Hook，指定需要吸附的元素选择器
  const { activeTarget, snapToTarget, targets } = useScrollSnap({
    targetSelector: ".section-snap", // 要吸附的元素类名
    threshold: 150, // 距离阈值
    checkOnMount: true, // 初始化时检查
  });

  // 导航到指定部分
  const scrollToSection = (index: number) => {
    if (targets[index]) {
      snapToTarget(targets[index]);
    }
  };

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => scrollToSection(i - 1)}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTarget?.id === `section-${i}`
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              章节 {i}
            </button>
          ))}
        </div>
      </nav>

      {/* 页面内容 - 可吸附的区块 */}
      <div className="pt-20">
        {[1, 2, 3, 4].map((i) => (
          <section
            key={i}
            id={`section-${i}`}
            className="section-snap min-h-screen flex items-center justify-center p-8"
            style={{
              backgroundColor: i % 2 === 0 ? "#f0f9ff" : "#f8fafc",
            }}
          >
            <div className="container mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 text-gray-800">
                章节 {i}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                这是第 {i} 个可吸附的区块，当滚动到接近这个区域时会自动对齐。
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
