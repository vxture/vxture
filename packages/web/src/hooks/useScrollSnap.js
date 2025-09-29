// hooks/useScrollSnap.js
import { useState, useEffect, useRef } from 'react';

export const useScrollSnap = (sectionRef) => {
  const [isSnapped, setIsSnapped] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当元素的顶部与视口顶部交叉（即吸附到位）时触发
        setIsSnapped(entry.isIntersecting);
      },
      {
        root: null, // 相对于视口
        threshold: 1.0, // 当元素100%可见时才算吸附
        rootMargin: '0px 0px 0px 0px'
      }
    );

    observer.observe(sectionRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sectionRef]);

  return isSnapped;
};