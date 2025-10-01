"use client";

import { useScrollSnap } from "@/hooks/useScrollSnap";

export default function ScrollSnapDemo() {
  // 确保targets初始化为空数组而非undefined
  const {
    activeTarget,
    snapToTarget,
    targets = [],
  } = useScrollSnap({
    targetSelector: ".section-snap",
    threshold: 150,
    duration: 400,
    checkOnMount: true,
  });

  // 导航到指定部分 - 增加完整的存在性检查
  const scrollToSection = (index: number) => {
    // 先检查targets是否存在且有值，再访问索引
    if (targets && targets.length > 0 && targets[index]) {
      snapToTarget(targets[index]);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => scrollToSection(i - 1)}
              // 当targets未准备好时禁用按钮
              disabled={!targets || targets.length === 0}
              className={`px-4 py-2 rounded-md transition-colors ${
                !targets || targets.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : activeTarget?.id === `section-${i}`
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              章节 {i}
            </button>
          ))}
        </div>
      </nav>

      <div className="pt-20">
        {[1, 2, 3, 4].map((i) => (
          <section
            key={i}
            id={`section-${i}`}
            className="section-snap min-h-screen flex items-center justify-center p-8 border-2 border-red-500"
            style={{
              backgroundColor: i % 2 === 0 ? "#f0f9ff" : "#f8fafc",
            }}
          >
            <div className="container mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 text-gray-800">
                章节 {i}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                这是第 {i} 个可吸附的区块
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
