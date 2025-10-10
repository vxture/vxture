/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { GiPathDistance } from 'react-icons/gi';
import { PiGraphFill } from 'react-icons/pi';
import { SiCodeceptjs } from 'react-icons/si';

export default function FeaturesSection() {
  const features = [
    {
      title: '数据图谱构建',
      description:
        '多源数据融合，自动构建知识图谱，让海量数据形成智能化的关联网络，发现数据间的隐藏价值和深层关系。',
      icon: <PiGraphFill className='w-10 h-10 text-blue-400' />,
      highlights: ['多源数据融合', '知识图谱构建', '关联关系挖掘'],
      color: 'blue',
    },
    {
      title: '智能决策调度',
      description:
        'AI 驱动的资源优化与任务调度，通过机器学习算法实现智能化的资源分配，提升运营效率和决策质量。',
      icon: <GiPathDistance className='w-10 h-10 text-blue-400' />,
      highlights: ['AI 智能调度', '资源优化配置', '决策质量提升'],
      color: 'blue',
    },
    {
      title: '孪生仿真推演',
      description:
        '数字孪生建模，预测未来趋势，通过高精度仿真模型模拟各种场景，为战略决策提供科学依据。',
      icon: <SiCodeceptjs className='w-10 h-10 text-blue-400' />,
      highlights: ['数字孪生建模', '场景仿真推演', '预测分析能力'],
      color: 'blue',
    },
  ];

  const colorMap = {
    blue: {
      border: 'hover:border-blue-400',
      button:
        'bg-blue-50 text-gray-600 border-blue-200 group-hover:bg-blue-600 group-hover:text-white',
    },
  };

  return (
    <section
      id='snapTarget-2'
      className={`relative snap-section h-screen pt-28 bg-gradient-to-b from-slate-50 to-white`}
    >
      <div className='h-full max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Title area */}
        <div className='text-center mb-16'>
          <h2 className='text-3xl lg:text-4xl font-bold text-blue-800 mb-6'>核心能力</h2>
          <p className='text-lg text-gray-400 max-w-4xl mx-auto'>
            专注为政府和大型企事业单位，提供数据驱动决策的业务重构与转型升级
          </p>
        </div>

        {/* Features grid */}
        <div className='grid lg:grid-cols-3 gap-8'>
          {features.map((feature) => {
            const colors = colorMap[feature.color as keyof typeof colorMap];
            return (
              <div
                key={feature.title}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 `}
              >
                {/* 简洁科技感装饰 */}
                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-blue-100 to-transparent' />
                <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-blue-100 to-transparent' />
                {/* 卡片左下角星星装饰，SVG内嵌并支持hover变色 */}
                <span
                  className='
                      absolute top-4 right-4
                      transition-colors duration-300
                      text-blue-100
                      group-hover:text-blue-600
                    '
                >
                  <svg
                    width={24}
                    height={24}
                    viewBox='0 0 1024 1024' // 保留原SVG的 viewBox，确保图形比例正确
                    fill='currentColor' // 关键：继承 span 的 text 颜色，实现 hover 同步变色
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M513.633 277.267c-181.308 0-328.306 149.329-328.306 333.542 0 184.21 146.999 333.539 328.306 333.539 181.36 0 328.338-149.329 328.338-333.539 0-184.213-146.974-333.542-328.338-333.542z m168.846 303.781l-64.732 64.108 15.271 90.519c5.139 30.388-11.955 43.678-39.342 29.052l-80.037-42.745-79.997 42.745c-26.854 14.345-44.582 1.947-39.351-29.052l15.281-90.519-64.729-64.108c-21.737-21.516-15.6-42.455 15.039-46.984l89.454-13.209 40.003-82.345c13.431-27.658 34.957-28.207 48.647 0l40.016 82.345 89.451 13.209c30.022 4.431 37.189 25.046 15.026 46.984zM820.57 84.981H617.566c-10.964 0-19.736 7.781-22.317 18.097l-62.573 125.355s133.988 8.203 213.146 85.619l93.464-191.596c2.77-3.929 4.749-8.461 4.749-13.652 0-13.158-10.514-23.823-23.465-23.823zM491.322 228.439L428.75 103.083c-2.581-10.321-11.375-18.098-22.318-18.098H203.418c-12.952 0-23.453 10.66-23.453 23.824 0 5.191 1.969 9.729 4.75 13.652l93.463 191.598c79.154-77.422 213.144-85.62 213.144-85.62z' />
                    <path d='M185.327 610.809c0 178.329 137.763 323.964 311.049 333.082l40.01-209.761-22.747-12.148-79.997 42.745c-26.854 14.345-44.582 1.947-39.351-29.052l15.281-90.519-64.729-64.108c-21.737-21.516-15.6-42.455 15.039-46.984l89.454-13.209 40.003-82.345c13.431-27.658 34.957-28.207 48.647 0l39.347 80.966 42.777-224.27c-33.39-11.621-69.204-17.939-106.477-17.939-181.308 0-328.306 149.329-328.306 333.542zM278.178 314.059c79.154-77.422 213.144-85.62 213.144-85.62L428.75 103.083c-2.581-10.321-11.375-18.098-22.318-18.098H203.418c-12.952 0-23.453 10.66-23.453 23.824 0 5.191 1.969 9.729 4.75 13.652l93.463 191.598zM595.249 103.078l-62.573 125.355s43.986 2.7 96.44 19.559L660.21 84.981h-42.644c-10.963 0-19.736 7.781-22.317 18.097z' />
                  </svg>
                </span>

                {/* Content area */}
                <div className='relative p-8 space-y-6 z-10'>
                  {/* Main icon */}
                  <div className='flex justify-center'>
                    <div className='w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 border border-blue-100'>
                      {feature.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className='text-2xl font-bold text-blue-800 text-center'>{feature.title}</h3>

                  {/* Description */}
                  <p className='text-gray-600 leading-relaxed text-center'>{feature.description}</p>

                  {/* Highlights tags */}
                  <div className='flex flex-wrap gap-2 justify-center'>
                    {feature.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className='px-3 py-1 bg-blue-50 text-blue-400 text-sm font-semibold rounded-full border border-blue-50'
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  {/* Learn more button */}
                  <div className='pt-4 text-center'>
                    <button
                      className={`inline-flex items-center px-6 py-2 rounded-lg transition-all duration-300 border ${colors.button}`}
                    >
                      了解更多
                      <svg
                        className='ml-2 w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M17 8l4 4m0 0l-4 4m4-4H3'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom decorative text */}
        <div className='text-center mt-16'>
          <div className='inline-flex items-center space-x-2 text-gray-500'>
            <div className='w-8 h-[1px] bg-gradient-to-r from-transparent to-gray-300'></div>
            <span className='text-sm font-medium'>数据驱动，智能决策</span>
            <div className='w-8 h-[1px] bg-gradient-to-l from-transparent to-gray-300'></div>
          </div>
        </div>
      </div>
    </section>
  );
}
