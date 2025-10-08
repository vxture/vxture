"use client";

import { useEffect, useState } from "react";

/**
 * 通用屏幕信息组件，显示当前视口高度和宽度
 */
export default function ScreenInfo() {
  const [height, setHeight] = useState<number>(window.innerHeight);
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="mt-4 text-base text-gray-500">
      <div>h-screen: {height}px</div>
      <div>width: {width}px</div>
    </div>
  );
}
