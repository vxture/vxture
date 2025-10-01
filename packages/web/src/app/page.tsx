"use client";

import { useEffect } from "react";

import CaseSection from "@/components/home/CaseSection";
import CTASection from "@/components/home/CTASection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import ProductSection from "@/components/home/ProductSection";
import StatsSection from "@/components/home/StatsSection";

export default function HomePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 100);
  }, []);

  return (
    <>
      <HeroSection /> {/* snap-section h-screen */}
      <FeaturesSection /> {/* snap-section h-screen */}
      <ProductSection /> {/* snap-section h-screen */}
      <CaseSection /> {/* snap-section h-screen */}
      <StatsSection /> {/* snap-section h-screen */}
      <CTASection /> {/* 只设置 h-screen，不设置 snap-section */}
    </>
  );
}
