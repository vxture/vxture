// packages/web/src/components/aboutus/TestSection.tsx

'use client'; // 客户端组件声明，用于使用浏览器API如滚动事件

import { useScrollSnap } from '@/hooks/useScrollSnap'; // 导入自定义滚动吸附钩子

// 接收外部传入的section配置类型
interface ScrollSnapDemoProps {
  sections: {
    id: string; // section的唯一标识
    title: string; // section的标题
    backgroundColor?: string; // 可选的背景颜色
  }[];
}

export default function ScrollSnapDemo({ sections }: ScrollSnapDemoProps) {
  // 使用滚动吸附钩子，获取当前活跃目标、吸附函数和目标列表
  const {
    activeTarget, // 当前活跃的section目标
    snapToTarget, // 吸附到指定目标的函数
    targets = [], // 所有可吸附的目标列表
  } = useScrollSnap({
    targetSelector: '.snap-section', // 匹配section的类名，用于吸附
    threshold: 150, // 吸附触发阈值（像素）
    checkOnMount: true, // 初始加载时检查位置
  });

  // 滚动到指定section的函数
  const scrollToSection = (index: number) => {
    if (targets && targets.length > 0 && targets[index]) {
      snapToTarget(targets[index]); // 调用吸附函数
    }
  };

  return (
    <div className='min-h-screen border-2 border-blue-600'>
      {/* 容器：最小高度为屏幕高度，调试边线 */}
      {/* 顶部导航 - 随滚动变化状态 */}
      {/* 分屏吸附区块 - 基于外部配置渲染 */}
      <div className='pt-0 border-2 border-red-600'>
        {' '}
        {/* 内容区域，上边距避免导航遮挡，调试边线 */}
        {sections.map(
          (
            section,
            index // 遍历sections，生成section元素
          ) => (
            <section
              key={section.id} // 唯一键
              id={section.id} // HTML id，用于锚点
              className='snap-section min-h-screen flex items-center justify-center p-8 border-2 border-red-600 transition-all' // 吸附类名、最小高度、居中布局、调试边框
              style={{
                backgroundColor:
                  section.backgroundColor || (index % 2 === 0 ? '#e0f2fe' : '#f1f5f9'), // 背景颜色，交替或自定义
              }}
            >
              <div className='w-full max-w-3xl text-center border-2 border-red-600'>
                {' '}
                {/* 内容容器，居中对齐，调试边线 */}
                <h2 className='text-3xl md:text-4xl font-bold mb-6 text-blue-700 border-2 border-red-600'>
                  {section.title}
                </h2>{' '}
                {/* 标题，调试边线 */}
                <p className='text-gray-600 text-lg border-2 border-red-600'>
                  {' '}
                  {/* 描述文本，调试边线 */}
                  这是{section.title.toLowerCase()}的内容区域，可以根据需求自定义填充。
                </p>
              </div>
            </section>
          )
        )}
      </div>
    </div>
  );
}
