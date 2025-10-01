import { useCallback, useEffect, useRef, useState } from "react";

/**
 * ScrollSnapOptions 接口定义
 * @property targetSelector            - 需要吸附的目标元素的选择器（如 ".snap-section"）
 * @property threshold                 - 吸附触发的距离阈值（单位：像素，默认100）
 * @property checkOnMount              - 是否在组件挂载时就检查一次吸附（默认false）
 */
interface ScrollSnapOptions {
  targetSelector: string; // 目标元素选择器
  threshold?: number; // 吸附距离阈值
  checkOnMount?: boolean; // 挂载时是否检查
}

/**
 * useScrollSnap Hook
 * 实现基于 window 容器的滚动临近吸附功能。
 * 当页面滚动到接近目标元素时，自动平滑滚动吸附到该元素。
 *
 * @param options - ScrollSnapOptions 配置对象
 * @returns {
 *   activeTarget: 当前吸附的目标元素,
 *   targets: 所有目标元素数组,
 *   triggerCheck: 手动触发一次吸附检查,
 *   snapToTarget: 手动吸附到指定目标
 * }
 */
export function useScrollSnap({
  targetSelector, // 目标元素选择器
  threshold = 100, // 默认吸附距离阈值
  checkOnMount = false, // 默认挂载时不检查
}: ScrollSnapOptions) {
  const isProcessing = useRef(false); // 节流标志，避免滚动事件频繁触发
  const targetsRef = useRef<HTMLElement[]>([]); // 所有目标元素的引用

  /**
   * 获取所有目标元素，并按页面顺序排序
   * @returns 目标元素数组
   */
  // 已移除未使用的 targets 状态

  const getTargets = useCallback((): HTMLElement[] => {
    const elements = document.querySelectorAll<HTMLElement>(targetSelector); // 获取所有匹配的元素
    return Array.from(elements).sort((a, b) => a.offsetTop - b.offsetTop); // 按 offsetTop 排序
  }, [targetSelector]);

  /**
   * 查找距离视口中心最近的目标元素
   * @returns 最近的目标元素或 null
   */
  const findNearestTarget = useCallback((): HTMLElement | null => {
    const targets = getTargets(); // 获取所有目标元素
    if (targets.length === 0) return null; // 无目标则返回 null

    targetsRef.current = targets; // 更新目标元素引用

    const scrollY = window.scrollY; // 当前页面滚动位置
    const viewportHeight = window.innerHeight; // 当前视口高度
    const viewportCenter = scrollY + viewportHeight / 2; // 视口中心位置

    // 遍历所有目标，找到距离视口中心最近的那个
    return targets.reduce(
      (nearest, target) => {
        const targetTop = target.offsetTop; // 目标元素顶部位置
        const targetCenter = targetTop + target.offsetHeight / 2; // 目标元素中心位置
        const currentDistance = Math.abs(targetCenter - viewportCenter); // 当前目标与视口中心距离

        const nearestDistance = nearest
          ? Math.abs(
              nearest.offsetTop + nearest.offsetHeight / 2 - viewportCenter
            ) // 最近目标与视口中心距离
          : Infinity;

        return currentDistance < nearestDistance ? target : nearest; // 返回更近的目标
      },
      null as HTMLElement | null
    );
  }, [getTargets]);

  /**
   * 平滑滚动吸附到指定目标元素
   * @param target - 目标元素
   */
  const snapToTarget = useCallback((target: HTMLElement) => {
    if (!target) return; // 无目标直接返回

    const targetPosition = target.offsetTop; // 目标元素距离页面顶部的位置

    window.scrollTo({
      top: targetPosition, // 滚动到目标顶部
      behavior: "smooth", // 平滑滚动
    });

    setActiveTarget(target); // 更新当前吸附目标
  }, []);

  /**
   * 滚动事件处理函数
   * 检查是否有目标元素在阈值范围内，若有则吸附
   */
  const handleScroll = useCallback(() => {
    if (isProcessing.current) return; // 节流，避免重复执行
    isProcessing.current = true;

    requestAnimationFrame(() => {
      // 优化性能
      const nearestTarget = findNearestTarget(); // 查找最近目标
      if (!nearestTarget) {
        isProcessing.current = false;
        return;
      }

      const scrollY = window.scrollY; // 当前滚动位置
      const viewportHeight = window.innerHeight; // 视口高度
      const targetTop = nearestTarget.offsetTop; // 目标顶部
      const targetBottom = targetTop + nearestTarget.offsetHeight; // 目标底部

      const distanceToTop = Math.abs(scrollY - targetTop); // 距离视口顶部
      const distanceToBottom = Math.abs(
        scrollY + viewportHeight - targetBottom
      ); // 距离视口底部
      const minDistance = Math.min(distanceToTop, distanceToBottom); // 取最小距离

      if (minDistance < threshold) {
        // 距离小于阈值则吸附
        snapToTarget(nearestTarget);
      }

      isProcessing.current = false; // 处理结束
    });
  }, [findNearestTarget, snapToTarget, threshold]);

  /**
   * 初始化和清理滚动事件监听
   */
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true }); // 添加 window 滚动事件监听

    if (checkOnMount) {
      // 挂载时是否检查
      setTimeout(handleScroll, 100); // 延迟确保 DOM 已渲染
    }

    return () => {
      window.removeEventListener("scroll", handleScroll); // 卸载时移除事件监听
    };
  }, [handleScroll, checkOnMount]);

  /**
   * 手动触发一次吸附检查
   */
  const triggerCheck = useCallback(() => {
    handleScroll(); // 手动触发吸附检查
  }, [handleScroll]);

  // 当前吸附的目标元素状态
  const [activeTarget, setActiveTarget] = useState<HTMLElement | null>(null); // 当前吸附的目标元素

  // 返回 Hook 的 API
  return {
    activeTarget, // 当前吸附的目标元素
    targets: targetsRef.current, // 所有目标元素数组
    triggerCheck, // 手动触发吸附检查
    snapToTarget, // 手动吸附到指定目标
  };
}
