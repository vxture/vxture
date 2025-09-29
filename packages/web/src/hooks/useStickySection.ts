import { useRef, useCallback, useEffect } from "react";

/**
 * 用于使页面区块(section)在滚动时具有粘性吸附效果的Hook
 * @param {Object} options - 配置选项
 * @param {number} options.headerHeight - 顶部导航栏高度(像素)，吸附时元素会固定在此高度之下，默认为64
 * @param {number} options.threshold - 触发吸附的阈值(像素)，即元素顶部距离视口顶部多少像素时开始吸附，默认为180
 * @param {number} options.zIndex - 吸附状态下的元素层级，默认为100
 * @returns {Object} 返回包含sectionRef和isSticky状态的对象
 */
export const useStickySection = (options: {
  headerHeight?: number;
  threshold?: number;
  zIndex?: number;
} = {}) => {
  const { headerHeight = 64, threshold = 180, zIndex = 100 } = options;

  const sectionRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // 使用useRef来存储状态和占位元素引用，避免重新渲染
  const stickyState = useRef<{
    isSticky: boolean;
    placeholder: HTMLDivElement | null;
  }>({
    isSticky: false,
    placeholder: null,
  });

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const currentScrollY = window.scrollY;

    // 判断是否需要吸附：元素到达阈值且正在向下滚动
    const shouldSticky = rect.top <= threshold && currentScrollY > lastScrollY.current;

    if (shouldSticky && !stickyState.current.isSticky) {
      // 进入吸附状态
      stickyState.current.isSticky = true;

      // 创建占位元素防止布局跳动
      const placeholder = document.createElement("div");
      placeholder.style.height = `${rect.height}px`;
      placeholder.className = "sticky-placeholder"; // 可添加自定义类名
      if (sectionRef.current.parentNode) {
        sectionRef.current.parentNode.insertBefore(placeholder, sectionRef.current);
      }
      stickyState.current.placeholder = placeholder;

      // 应用吸附样式
      sectionRef.current.style.position = "fixed";
      sectionRef.current.style.top = `${headerHeight}px`;
      sectionRef.current.style.width = `${rect.width}px`;
      sectionRef.current.style.zIndex = zIndex.toString();
    } else if (!shouldSticky && stickyState.current.isSticky) {
      // 解除吸附状态
      stickyState.current.isSticky = false;

      // 移除吸附样式
      sectionRef.current.style.position = "";
      sectionRef.current.style.top = "";
      sectionRef.current.style.width = "";
      sectionRef.current.style.zIndex = "";

      // 移除占位元素
      if (stickyState.current.placeholder) {
        stickyState.current.placeholder.remove();
        stickyState.current.placeholder = null;
      }
    }

    lastScrollY.current = currentScrollY;
  }, [headerHeight, threshold, zIndex]);

  useEffect(() => {
    // 添加滚动事件监听，使用passive: true提升滚动性能
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 组件卸载时清理
    const stickyStateRef = stickyState.current;
    return () => {
      window.removeEventListener("scroll", handleScroll);

      // 清理可能存在的占位元素
      if (stickyStateRef.placeholder && stickyStateRef.placeholder.parentNode) {
        stickyStateRef.placeholder.remove();
        stickyStateRef.placeholder = null;
      }
    };
  }, [handleScroll]);

  return {
    sectionRef,
    isSticky: stickyState.current.isSticky,
  };
};