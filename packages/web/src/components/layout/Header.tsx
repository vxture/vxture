/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            {/* Logo image */}
            <img
              src="/images/hearder/vxture-logo-white.png"
              alt="logo"
              className="w-6 h-6 object-contain"
            />
            <h1
              className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              vxture.ai
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {["产品服务", "解决方案", "行业案例", "关于我们"].map((item) => (
              <a
                key={item}
                href="#"
                className={`transition-colors duration-300 hover:text-cyan-400 ${
                  isScrolled ? "text-gray-600" : "text-white/90"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isScrolled
                  ? "text-gray-600 hover:text-gray-900"
                  : "text-white/90 hover:text-white"
              }`}
            >
              登录
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Ruins Agent
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
