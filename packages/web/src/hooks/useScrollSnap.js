import { useEffect, useRef, useState } from "react";

export const useScrollSnap = (sectionRef) => {
  const [isSnapped, setIsSnapped] = useState(false);
  const observerRef = useRef(null);
  const isScrolling = useRef(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === "undefined" || !sectionRef.current) return;

    const handleScroll = () => {
      isScrolling.current = true;
      clearTimeout(window.scrollTimer);
      window.scrollTimer = setTimeout(() => (isScrolling.current = false), 100);
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // 使用entry的boundingClientRect替代重新获取
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (isScrolling.current) return;

        // 直接使用entry的boundingClientRect，避免重复获取
        const rect = entry.boundingClientRect;
        const isScrollingDown = window.scrollY > lastScrollY.current;

        if (isScrollingDown) {
          if (rect.top > 10 && rect.top < window.innerHeight - 100) {
            window.scrollTo({
              top: window.scrollY + rect.top,
              behavior: "smooth",
            });
            setIsSnapped(true);
          }
        } else {
          if (Math.abs(rect.top) > 10 && rect.top > -window.innerHeight + 100) {
            window.scrollTo({
              top: window.scrollY + rect.top,
              behavior: "smooth",
            });
            setIsSnapped(true);
          }
        }

        setIsSnapped(Math.abs(rect.top) <= 10);
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: "-20px 0px",
      }
    );

    observer.observe(sectionRef.current);
    observerRef.current = observer;

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observerRef.current?.disconnect();
      clearTimeout(window.scrollTimer);
    };
  }, [sectionRef]);

  return isSnapped;
};
