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
  return (
    // 让 body 作为滚动容器，main 只负责 snap 类型，不设置 h-screen/overflow
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
