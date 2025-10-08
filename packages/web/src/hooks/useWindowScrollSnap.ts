// hooks/useWindowScrollSnap.ts - 窗口滚动吸附钩子
// 功能：实现页面元素的滚动吸附效果，提供目标检测和自动吸附功能
// 使用场景：页面滚动时自动吸附到指定元素，提升用户体验

import { useEffect, useState, useCallback, useRef } from 'react';

// 配置接口：定义 hook 的输入参数
interface WindowScrollSnapConfig {
  debugFlag?: boolean;                                              // 是否启用调试模式
  targetSelector: string;                                           // 目标元素选择器，用于匹配吸附元素
  threshold: number;                                                // 吸附触发阈值（像素）
  alignTo?: 'top' | 'center' | 'bottom' | 'auto';                   // 对齐方式，默认顶部
  smooth?: boolean;                                                 // 是否启用平滑滚动
  enabledDirections?: ('up' | 'down')[];                            // 允许吸附的方向
  observerRoot?: HTMLElement;                                       // DOM 监听根容器
}

// 配置接口：定义 hook 的输出参数
interface WindowScrollSnapReturn {
  activeTarget: HTMLElement | null;                                 // 当前活跃吸附目标
  snapToTarget: (target: HTMLElement) => void;                      // 手动吸附函数
  snapdebugInfo: {                                                  // 调试信息对象
    rect: DOMRect | null;                                           // 活跃目标的矩形信息
    targetsCount: number;                                           // 目标元素总数
    isScrollingDirection: 'up' | 'down' | 'no';                     // 滚动方向
    alignTo: string;                                                // 对齐方式
    activeTargetId: string | null;                                  // 活跃目标 ID
    scrollY: number;                                                // 当前滚动位置 Y
    threshold: number;                                              // 吸附触发阈值
    scrollVelocity: number;                                         // 滚动速度
  };
  viewportRect: {                                                   // 视口矩形信息
    width: number;                                                  // 视口宽度
    height: number;                                                 // 视口高度
    top: number;                                                    // 视口顶部相对文档顶部的偏移
    bottom: number;                                                 // 视口底部相对文档顶部的偏移
    scrollX: number;                                                // 水平滚动位置
    scrollY: number;                                                // 垂直滚动位置
  };
}

// 导出函数
export function useWindowScrollSnap(config: WindowScrollSnapConfig): WindowScrollSnapReturn {
  // 解构配置参数，提供默认值
  const {
    debugFlag = false,                                                          // 默认关闭调试
    targetSelector = '.snap-target',                                            // 默认选择器
    threshold = 150,                                                            // 默认阈值
    alignTo = 'top',                                                            // 默认对齐
    smooth = true,                                                              // 默认平滑
    enabledDirections = ['up', 'down'],                                         // 默认方向
    observerRoot = typeof window !== 'undefined' ? document.body : null,        // 默认根容器
  } = config;

  // 获取状态参数，实时状态值
  const [activeTarget, setActiveTarget] = useState<HTMLElement | null>(null);   // 活跃目标状态
  const [targets, setTargets] = useState<HTMLElement[]>([]);                                  // 目标元素列表
  const isProgramScrollingRef = useRef(false);                                  // 程序滚动标记 ref
  const lastScrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);          // 上次滚动位置 ref
  const handleWindowScrollRef = useRef<() => void>();                                         // 滚动处理函数 ref

  // 获取调试参数，初始默认值
  const [snapdebugInfo, setsnapdebugInfo] = useState({
    rect: null as DOMRect | null,                                               // 矩形信息
    targetsCount: 0,                                                            // 目标数量
    isScrollingDirection: 'no' as 'up' | 'down' | 'no',                         // 滚动方向
    alignTo: alignTo,                                                           // 对齐方式
    activeTargetId: null as string | null,                                      // 活跃 ID
    scrollY: 0,                                                                 // 滚动 Y
    threshold: threshold,                                                       // 吸附触发阈值
    scrollVelocity: 0,                                                          // 滚动速度
  });

  // 添加视口矩形信息状态，初始默认值
  const [viewportRect, setViewportRect] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    top: typeof window !== 'undefined' ? window.scrollY : 0,
    bottom: typeof window !== 'undefined' ? window.scrollY + window.innerHeight : 0,
    scrollX: typeof window !== 'undefined' ? window.scrollX : 0,
    scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
  });

  // 更新视口矩形信息参数，实时状态值
  const updateViewportRect = useCallback(() => {
    if (typeof window === 'undefined') return;

    setViewportRect({
      width: window.innerWidth,
      height: window.innerHeight,
      top: window.scrollY,
      bottom: window.scrollY + window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    });
  }, []);

  // 在组件挂载和窗口大小变化时更新视口信息
  useEffect(() => {
    updateViewportRect();
    window.addEventListener('resize', updateViewportRect, { passive: true });
    return () => window.removeEventListener('resize', updateViewportRect);
  }, [updateViewportRect]);

  // 吸附执行函数
  const snapToTarget = useCallback(
    (target: HTMLElement) => {
      if (debugFlag) console.log('Snapping to', target.id);               // 只在 debug 模式下输出
      if (typeof window === 'undefined' || !target) return;

      isProgramScrollingRef.current = true;                                    // 设置程序滚动标记
      const rect = target.getBoundingClientRect();                             // 获取目标矩形
      const viewportHeight = window.innerHeight;                               // 获取视口高度
      let scrollTop = window.scrollY;                                          // 当前滚动位置

      switch (alignTo) {                                                       // 根据对齐方式计算滚动位置
        case 'auto':
          scrollTop += rect.height < viewportHeight ? rect.top + rect.height - viewportHeight : rect.top;
          break;
        case 'center':
          scrollTop += rect.top - (viewportHeight - rect.height) / 2;
          break;
        case 'bottom':
          scrollTop += rect.top + rect.height - viewportHeight;
          break;
        default:
          scrollTop += rect.top;
          break;
      }

      const scrollOptions: ScrollToOptions = {                                 // 滚动选项
        top: scrollTop,
        behavior: smooth ? 'smooth' as ScrollBehavior : 'auto' as ScrollBehavior,
      };

      window.scrollTo(scrollOptions);                                          // 执行滚动
      setActiveTarget(target);                                                 // 更新活跃目标

      // 滚动完成后更新 rect
      setTimeout(() => {
        const updatedRect = target.getBoundingClientRect();                    // 获取更新后矩形
        if (debugFlag) {
          setsnapdebugInfo((prev) => ({
            ...prev,
            rect: updatedRect,                                                 // 更新 rect
            activeTargetId: target.id,
            scrollY: scrollTop,
          }));
        }
      }, smooth ? 1000 : 0);                                                   // 等待滚动完成

      // 重置程序滚动标记
      const resetTimer = smooth ? 1000 : 0;
      setTimeout(() => isProgramScrollingRef.current = false, resetTimer);
    },
    [alignTo, smooth, debugFlag]
  );

  // 目标元素是否进入吸附范围
  const isTargetInThreshold = useCallback(
    (element: HTMLElement): boolean => {
      if (typeof window === 'undefined') return false;                         // 环境检查
      const style = window.getComputedStyle(element);                          // 获取计算样式
      if (style.display === 'none' || style.visibility === 'hidden') return false; // 过滤不可见元素

      const rect = element.getBoundingClientRect();                            // 获取矩形
      if (rect.height <= 0) return false;                                      // 过滤无效高度

      const viewportHeight = window.innerHeight;                               // 视口高度
      const isTopInThreshold = rect.top >= 0 && rect.top <= threshold;         // 顶部阈值
      const isBottomInThreshold = rect.bottom <= viewportHeight && rect.bottom >= viewportHeight - threshold; // 底部阈值
      const isFullyInView = rect.top >= 0 && rect.bottom <= viewportHeight;    // 完全可见

      return isTopInThreshold || isBottomInThreshold || isFullyInView;         // 返回判断结果
    },
    [threshold]
  );

  // 初始化目标元素 + 监听DOM变化
  useEffect(() => {
    // 环境检查
    if (typeof window === 'undefined' || !observerRoot) return;

    // 查询目标函数
    const queryTargets = () => {
      const foundTargets = Array.from(
        document.querySelectorAll(targetSelector) as NodeListOf<HTMLElement>
      )
        .filter((el) => {                                             // 过滤不可见元素
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        })
        .sort((a, b) => a.offsetTop - b.offsetTop);                    // 按位置排序

      setTargets(foundTargets);                                                 // 更新目标列表
      if (debugFlag) {
        setsnapdebugInfo((prev) => ({ ...prev, targetsCount: foundTargets.length })); // 更新调试信息
      }
    };
    // 初始查询
    queryTargets();
    const observer = new MutationObserver((mutations) => {                      // DOM 变化监听
      if (mutations.some((m) => m.type === 'childList')) queryTargets();     // 子元素变化时重新查询
    });

    observer.observe(observerRoot, { childList: true, subtree: true });               // 开始监听
    return () => observer.disconnect();                                         // 清理监听
  }, [targetSelector, debugFlag, observerRoot]);

  // 滚动监听逻辑
  useEffect(() => {
    if (typeof window === 'undefined' || targets.length === 0) return;         // 环境检查

    let isProcessing = false;                                                  // 处理标记
    const handleWindowScroll = () => {
      if (debugFlag) console.log('Scroll event triggered');                              // 只在 debug 模式下输出
      if (isProgramScrollingRef.current || isProcessing) {
        if (debugFlag) console.log('Skipped due to program scrolling or processing');    // 只在 debug 模式下输出
        return;
      }

      isProcessing = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;                                 // 当前滚动 Y
        const viewportHeight = window.innerHeight;                             // 视口高度
        const isScrollingDirection: 'up' | 'down' | 'no' =                     // 计算滚动方向
          currentScrollY > lastScrollYRef.current ? 'down' :
          currentScrollY < lastScrollYRef.current ? 'up' : 'no';
        const velocity = Math.abs(currentScrollY - lastScrollYRef.current);    // 计算速度

        // 更新视口矩形信息
        updateViewportRect();

        if (debugFlag) console.log('Processing scroll, direction:', isScrollingDirection, 'velocity:', velocity); // 只在 debug 模式下输出

        // 实时更新 rect（滚动过程中）
        if (debugFlag && activeTarget) {
          const currentRect = activeTarget.getBoundingClientRect();            // 获取当前 rect
          setsnapdebugInfo((prev) => ({
            ...prev,
            rect: currentRect,                                                 // 更新 rect
            isScrollingDirection,
            scrollY: currentScrollY,
            viewportHeight,
            scrollVelocity: velocity,
          }));
        } else if (debugFlag) {
          setsnapdebugInfo((prev) => ({
            ...prev,
            isScrollingDirection,
            scrollY: currentScrollY,
            viewportHeight,
            scrollVelocity: velocity,
          }));
        }

        // 快速滚动时跳过
        if (velocity > 300) {
          lastScrollYRef.current = currentScrollY;                             // 更新上次 Y
          isProcessing = false;
          return;
        }

        // 检查方向是否允许
        if (isScrollingDirection !== 'no' && !enabledDirections.includes(isScrollingDirection)) {
          lastScrollYRef.current = currentScrollY;                             // 更新上次 Y
          isProcessing = false;
          return;
        }

        // 查找目标元素
        let targetToSnap: HTMLElement | undefined;
        if (isScrollingDirection === 'down') {
          const currentIndex = targets.findIndex((t) => t === activeTarget);
          const startIndex = currentIndex === -1 ? 0 : currentIndex + 1;
          for (let i = startIndex; i < targets.length; i++) {
            if (isTargetInThreshold(targets[i])) {
              targetToSnap = targets[i];
              if (debugFlag) console.log('Target to snap:', targetToSnap.id); // 只在 debug 模式下输出
              break;
            }
          }
        } else if (isScrollingDirection === 'up') {
          const currentIndex = targets.findIndex((t) => t === activeTarget);
          const startIndex = currentIndex === -1 ? targets.length - 1 : currentIndex - 1;
          for (let i = startIndex; i >= 0; i--) {
            if (isTargetInThreshold(targets[i])) {
              targetToSnap = targets[i];
              if (debugFlag) console.log('Target to snap:', targetToSnap.id); // 只在 debug 模式下输出
              break;
            }
          }
        }

        if (targetToSnap && targetToSnap !== activeTarget) {                   // 触发吸附
          snapToTarget(targetToSnap);
        }

        lastScrollYRef.current = currentScrollY;                               // 更新上次 Y
        isProcessing = false;                                                  // 重置处理
      });
    };

    // 设置 ref
    handleWindowScrollRef.current = handleWindowScroll;

    handleWindowScroll();                                                      // 初始执行
    window.addEventListener('scroll', handleWindowScroll, { passive: true });  // 添加监听

    // 清理函数：使用 ref 移除
    return () => {
      if (handleWindowScrollRef.current) {
        window.removeEventListener('scroll', handleWindowScrollRef.current);
      }
    };
  }, [targets, activeTarget, isTargetInThreshold, snapToTarget, enabledDirections, debugFlag, updateViewportRect]);

  // 初始化活跃目标
  useEffect(() => {
    if (targets.length > 0 && !activeTarget) {                                 // 条件检查
      setActiveTarget(targets[0]);                                             // 设置初始活跃
      if (debugFlag) {
        setsnapdebugInfo((prev) => ({ ...prev, activeTargetId: targets[0].id })); // 更新调试
      }
    }
  }, [targets, activeTarget, debugFlag]);

  return { activeTarget, snapToTarget, snapdebugInfo, viewportRect };              // 返回结果，增加 viewportRect
}
