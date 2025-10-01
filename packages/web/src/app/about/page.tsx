"use client";

import TestSection from "@/components/about/TestSection";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 100);
  }, []);

  return (
    <>
      <TestSection />
    </>
  );
}
