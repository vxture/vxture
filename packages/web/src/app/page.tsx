"use client";

import CaseSection from "@/components/home/CaseSection";
import CTASection from "@/components/home/CTASection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import ProductSection from "@/components/home/ProductSection";
import StatsSection from "@/components/home/StatsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ProductSection />
      <CaseSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
