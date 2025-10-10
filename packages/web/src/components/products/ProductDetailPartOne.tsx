// components/products/ProductDetailPartOne.tsx - 产品详情组件
// 功能：渲染多个 section，每个 section 都是滚动吸附目标，用于演示分屏滚动效果
// 每个 section 高度为屏幕高度，带有 'snap-section' 类，支持临近吸附

'use client'; // 客户端组件声明，允许使用浏览器 API

export default function ProductDetailPartOne() {
  return (
    <>
      {/* Section 1: 普通内容区（吸附目标） */}
      <div
        id='snap-section-1' // 唯一 ID
        className='snap-section bg-gray-200 px-8 flex items-center justify-center' // 吸附类、屏幕高度、居中布局、调试边框
      >
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-blue-600'>特定吸附区域1</h2>
          <p className='mt-4 text-gray-600'>
            带.snap-section类，滚动到距离视口120px内会自动吸附到顶部。
          </p>
        </div>
      </div>

      {/* Section 2: 特定吸附元素1（吸附目标） */}
      <div
        id='snap-section-2' // 唯一 ID
        className='snap-section bg-blue-200 px-8 flex items-center justify-center' // 吸附类、屏幕高度、居中布局、调试边框
      >
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-blue-600'>特定吸附区域2</h2>
          <p className='mt-4 text-gray-600'>
            带.snap-section类，滚动到距离视口120px内会自动吸附到顶部。
          </p>
        </div>
      </div>

      {/* Section 3: 普通内容区（吸附目标） */}
      <div
        id='snap-section-3' // 唯一 ID
        className='snap-section bg-gray-200 px-8 flex items-center justify-center' // 吸附类、屏幕高度、调试边框
      >
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>特定吸附区域3</h2>
          <p className='mt-4 text-gray-600'>继续滚动，下一个带.snap-section的元素会触发吸附。</p>
        </div>
      </div>

      {/* Section 4: 特定吸附元素2（吸附目标） */}
      <div
        id='snap-section-4' // 唯一 ID
        className='snap-section bg-blue-200 px-8 flex items-center justify-center' // 吸附类、屏幕高度、居中布局、调试边框
      >
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-green-600'>特定吸附区域4</h2>
          <p className='mt-4 text-gray-600'>同样带.snap-section类，仅该类元素会触发吸附。</p>
        </div>
      </div>
    </>
  );
}
