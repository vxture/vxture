"use client";

import { useEffect, useState } from "react";

export default function StatsSection() {
  const [inView, setInView] = useState(false);

  const stats = [
    {
      number: 500,
      suffix: "+",
      label: "企业客户",
      description: "覆盖政府、金融、制造等多个行业",
      icon: "🏢",
      color: "from-blue-400 to-cyan-400",
    },
    {
      number: 1000,
      suffix: "+",
      label: "项目交付",
      description: "成功交付数字化转型项目",
      icon: "🚀",
      color: "from-blue-400 to-cyan-400",
    },
    {
      number: 99.8,
      suffix: "%",
      label: "客户满意度",
      description: "客户续约率持续保持行业领先",
      icon: "⭐",
      color: "from-blue-400 to-cyan-400",
    },
    {
      number: 50,
      suffix: "PB+",
      label: "数据处理量",
      description: "每日处理海量数据，服务亿级用户",
      icon: "📊",
      color: "from-blue-400 to-cyan-400",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById("stats-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const AnimatedNumber = ({
    value,
    suffix,
    duration = 2000,
  }: {
    value: number;
    suffix: string;
    duration?: number;
  }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (!inView) return;

      let startTime: number;
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(value * easeOutQuart);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [value, duration, inView]);

    const formatNumber = (num: number) => {
      if (suffix === "%") {
        return num.toFixed(1);
      }
      if (suffix === "PB+") {
        return Math.floor(num);
      }
      return Math.floor(num);
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
      className="py-24 bg-gradient-to-r from-blue-50 via-blue-100 to-cyan-50 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-100/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/5 to-cyan-100/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title area */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-6">
            数据说话
          </h2>
          <p className="text-xl text-blue-700 max-w-3xl mx-auto">
            用数字见证我们在数据智能领域的专业实力与客户信赖
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`relative group ${inView ? "animate-in slide-in-from-bottom-8 duration-700" : "opacity-0"}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Card background */}
              <div className="relative p-8 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-blue-400">
                {/* Gradient border effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.color} p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                >
                  <div className="h-full w-full rounded-2xl bg-transparent"></div>
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4 text-center">{stat.icon}</div>

                {/* Number */}
                <div
                  className={`text-4xl lg:text-5xl font-bold text-center mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  <AnimatedNumber value={stat.number} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <h3 className="text-xl font-semibold text-blue-900 text-center mb-3">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-blue-700 text-center text-sm leading-relaxed">
                  {stat.description}
                </p>

                {/* Decorative overlay */}
                <div
                  className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-r ${stat.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decorative text */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-blue-400">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-blue-300"></div>
            <span className="text-sm font-medium">持续创新，共创数字未来</span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-blue-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
