"use client";
import { useEffect } from "react";

import CaseSection from "@/components/home/CaseSection";
import CTASection from "@/components/home/CTASection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import ProductSection from "@/components/home/ProductSection";
import StatsSection from "@/components/home/StatsSection";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // 只修改return部分，添加外层滚动容器
  return (
    // 新增滚动容器，启用纵向滚动吸附
    <main>
      <HeroSection />
      <FeaturesSection />
      <ProductSection />
      <CaseSection />
      <StatsSection />
      <CTASection />
      {children}
    </main>
  );

}
