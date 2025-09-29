"use client";

// 引入 React 的 hooks
import { useEffect, useState } from "react";
import { HiBuildingLibrary, HiMiniCube, HiMiniUserGroup, HiStar } from 'react-icons/hi2';

/**
 * StatsSection 组件
 * 展示公司核心数据统计，带有动画和卡片交互效果
 * 标题、副标题、底部装饰文字样式与 FeaturesSection 完全一致
 */
export default function StatsSection() {
  // 控制动画是否触发（进入视口时）
  const [inView, setInView] = useState(false);

  // 统计数据列表，每个对象代表一个卡片
  const stats = [
    {
      number: 10,
      suffix: "+",
      label: "企业客户",
      description: "服务政府、国央企等多个大客户",
      icon: <HiBuildingLibrary className="w-16 h-16 text-blue-400" />,
      color: "from-blue-400 to-cyan-400", // Tailwind 渐变色
    },
    {
      number: 50,
      suffix: "+",
      label: "智能化项目",
      description: "成功交付数据智能平台和应用",
      icon: <HiMiniCube className="w-16 h-16 text-blue-400" />,
      color: "from-blue-400 to-cyan-400",
    },
    {
      number: 98.0,
      suffix: "%",
      label: "客户满意度",
      description: "客户续约率持续保持行业领先",
      icon: <HiStar className="w-16 h-16 text-blue-400" />,
      color: "from-blue-400 to-cyan-400",
    },
    {
      number: 2000,
      suffix: "+",
      label: "业务用户",
      description: "在线业务用户规模持续增长",
      icon: <HiMiniUserGroup className="w-16 h-16 text-blue-400" />,
      color: "from-blue-400 to-cyan-400",
    },
  ];

  /**
   * 进入视口时触发动画
   * 使用 IntersectionObserver 监听组件是否进入视口
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true); // 进入视口，触发动画
        }
      },
      { threshold: 0.3 } // 30% 可见时触发
    );

    const element = document.getElementById("stats-section");
    if (element) {
      observer.observe(element);
    }

    // 清理 observer
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  /**
   * 数字动画组件
   * @param value 目标数字
   * @param suffix 单位后缀
   * @param duration 动画时长（毫秒）
   */
  const AnimatedNumber = ({
    value,
    suffix,
    duration = 2000,
  }: {
    value: number;
    suffix: string;
    duration?: number;
  }) => {
    // 当前显示的数字
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (!inView) return; // 未进入视口不动画

      let startTime: number;
      let animationFrame: number;

      // 动画函数
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // 四次缓出函数，动画更平滑
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(value * easeOutQuart);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      // 清理动画帧
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [value, duration]);

    // 格式化数字显示
    const formatNumber = (num: number) => {
      if (suffix === "%") {
        return num.toFixed(1); // 百分比保留一位小数
      }
      if (suffix === "PB+") {
        return Math.floor(num); // PB+取整
      }
      return Math.floor(num); // 其他取整
    };

    return (
      <span className="tabular-nums">
        {formatNumber(displayValue)}
        {suffix}
      </span>
    );
  };

  return (
    <section
      id="stats-section"
      className="py-24 bg-gradient-to-b from-white to-white relative"
    >
      {/* 背景装饰圆形 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-100/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/5 to-cyan-100/5 rounded-full blur-3xl"></div>
      </div>

      {/* 网格背景 */}
      <div className="absolute inset-0 opacity-50">
        <div className="h-full w-full bg-[radial-gradient(circle,rgba(0,0,0,0.08)_10%,transparent_10%)] bg-[size:20px_20px]"></div>
      </div>

      <div className="max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="flex items-center justify-between mb-16">
          {/* Section title and subtitle */}
          <div className="flex-1 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-800 mb-6">
              服务的客户
            </h2>
            <p className="text-lg text-gray-400 max-w-4xl mx-auto">
              用数字见证我们在数据智能领域的专业实力与客户信赖
            </p>
          </div>
        </div>

        {/* 统计卡片网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              // 卡片动画：进入视口时 slide-in-from-bottom，未进入时透明
              className={`relative group ${inView ? "animate-in slide-in-from-bottom-8 duration-700" : "opacity-0"}`}
              style={{ animationDelay: `${index * 150}ms` }} // 瀑布式动画延迟
            >
              {/* 卡片主体 */}
              <div className="relative p-8 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:border-blue-400 hover:scale-105 overflow-hidden">
                {/* 渐变边框效果，hover 时显现, 用伪元素实现渐变边框 */}

                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" // 关键：使用 -z-10 将其置于底层
                  style={{ background: `linear-gradient(to right, ${stat.color})` }} // 使用行内样式设置渐变背景
                >
                  <div className="h-full w-full rounded-2xl bg-transparent"></div>
                </div>

                <div className="relative z-10">

                  {/* 图标 */}
                  <div className="flex justify-center">
                    <div
                      className="w-32 h-32 flex items-center justify-center transition-transform duration-300"
                    >
                      {stat.icon}
                    </div>
                  </div>

                  {/* 动画数字 */}
                  <div
                    className={`text-4xl lg:text-5xl font-bold text-center mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                  >
                    <AnimatedNumber value={stat.number} suffix={stat.suffix} />
                  </div>

                  {/* 标签 */}
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                    {stat.label}
                  </h3>

                  {/* 描述 */}
                  <p className="text-gray-600 text-center text-base leading-relaxed">
                    {stat.description}
                  </p>
                </div>

                {/* 装饰圆形，hover 时增强透明度 */}
                <div
                  className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-r ${stat.color} rounded-full opacity-10 group-hover:opacity-40 transition-opacity duration-500`}
                ></div>
                
              </div>
            </div>
          ))}
        </div>

        {/* 底部装饰文本，样式与 FeaturesSection 完全一致 */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="text-sm font-medium">持续创新，共创数字未来</span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
