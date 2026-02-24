/**
 * useWindowScrollSnap.ts - 窗口滚动吸附钩子
 *
 * 功能：实现页面元素的滚动吸附效果，提供目标检测和自动吸附功能
 * 用途：页面滚动时自动吸附到指定元素，提升用户体验
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 时间：2024-06-01
 *
 * 代码规范：严格遵循 TypeScript + React 组件最佳实践
 * 性能优化：依赖 useCallback/useMemo，避免不必要的渲染和副作用
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

// 输入参数类型定义
interface WindowScrollSnapConfig {
  debugFlag: boolean; // 是否启用调试模式（必选）
  targetSelector: string; // 目标元素选择器（必选）
  targetAlignTo?: 'top' | 'center' | 'bottom' | 'auto'; // 对齐方式
  snapThreshold?: number; // 吸附触发阈值
  enabledDirections?: ('up' | 'down')[]; // 允许吸附的方向
  observerRoot?: HTMLElement; // DOM 监听根容器
}

// 输出参数类型定义
interface WindowScrollSnapReturn {
  activeTarget: HTMLElement | null; // 当前活跃吸附目标
  snapToTarget: (target: HTMLElement) => void; // 手动吸附函数
  snapdebugInfo?: {
    screenRect: DOMRect | null; // 视口区域的 DOMRect 对象
    targetRect: DOMRect | null; // 当前活跃目标的矩形信息
    targetsCount: number; // 目标元素总数
    targetAlignTo: string; // 对齐方式
    isScrollingDirection: 'up' | 'down' | 'no'; // 滚动方向
    activeTargetId: string | null; // 活跃目标 ID
    snapThreshold: number; // 吸附触发阈值
    scrollVelocity: number; // 滚动速度
    scrollX: number; // 水平滚动位置
    scrollY: number; // 垂直滚动位置
  };
}

// 滚动方向类型
type ScrollDirection = 'up' | 'down' | 'no';

// 快速滚动阈值（像素）
const FAST_SCROLL_THRESHOLD = 300;

/**
 * useWindowScrollSnap - 主 hook 实现
 * @param config WindowScrollSnapConfig
 * @returns WindowScrollSnapReturn
 */
export function useWindowScrollSnap(config: WindowScrollSnapConfig): WindowScrollSnapReturn {
  // 参数解构，提供默认值
  const {
    debugFlag,
    targetSelector,
    targetAlignTo = 'top',
    snapThreshold = 150,
    enabledDirections = ['up', 'down'],
    observerRoot = null,
  } = config;

  // 响应式阈值：根据视口高度动态计算
  // 基于视口高度的 25%，最小 150px，最大 400px
  const [responsiveThreshold, setResponsiveThreshold] = useState<number>(snapThreshold);

  // 计算响应式阈值
  const calculateThreshold = useCallback(() => {
    if (typeof window === 'undefined') return snapThreshold;
    const vh = window.innerHeight;
    // 25% 视口高度，但限制在 150px-400px 范围内
    const calculated = Math.min(Math.max(vh * 0.25, 150), 400);
    return Math.round(calculated);
  }, [snapThreshold]);

  // 初始化和窗口大小变化时更新阈值
  useEffect(() => {
    const updateThreshold = () => {
      const newThreshold = calculateThreshold();
      setResponsiveThreshold(newThreshold);
      if (debugFlag) {
        console.log(
          `Responsive threshold updated: ${newThreshold}px (viewport: ${window.innerHeight}px)`
        );
      }
    };

    updateThreshold();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateThreshold, { passive: true });
      return () => window.removeEventListener('resize', updateThreshold);
    }
  }, [calculateThreshold, debugFlag]);

  // 使用响应式阈值替代固定阈值
  const activeSnapThreshold = responsiveThreshold;

  // 当前活跃目标元素
  const [activeTarget, setActiveTarget] = useState<HTMLElement | null>(null);
  // 当前所有目标元素列表
  const [targets, setTargets] = useState<HTMLElement[]>([]);

  // 滚动相关引用变量
  const isProgramScrollingRef = useRef(false); // 标记是否为程序触发滚动
  const lastScrollYRef = useRef(0); // 上一次滚动位置
  const scrollEndCleanupRef = useRef<(() => void) | null>(null); // 存储清理函数，用于快速点击时清理旧监听器
  const stateRef = useRef<{
    targets: HTMLElement[];
    activeTarget: HTMLElement | null;
    isTargetInThreshold: (element: HTMLElement) => boolean;
  }>({
    targets: [],
    activeTarget: null,
    isTargetInThreshold: () => false,
  });

  // 调试信息状态（仅 debugFlag 为 true 时有效）
  const [snapdebugInfo, setsnapdebugInfo] = useState<WindowScrollSnapReturn['snapdebugInfo']>(() =>
    debugFlag
      ? {
          screenRect: null,
          targetRect: null,
          targetsCount: 0,
          activeTargetId: null,
          targetAlignTo,
          snapThreshold: activeSnapThreshold,
          isScrollingDirection: 'no',
          scrollVelocity: 0,
          scrollX: 0,
          scrollY: 0,
        }
      : undefined
  );

  /**
   * 更新调试信息的工具函数
   * 只合并partialInfo，避免把依赖参数（如snapThreshold/targetAlignTo/enabledDirections）直接写进依赖，否则会导致无限循环
   * @param partialInfo 需要更新的调试信息字段
   */
  const updateDebugInfo = useCallback(
    (partialInfo: Partial<NonNullable<WindowScrollSnapReturn['snapdebugInfo']>>) => {
      if (debugFlag) {
        setsnapdebugInfo((prev) =>
          prev
            ? {
                ...prev,
                ...partialInfo,
              }
            : prev
        );
      }
    },
    [debugFlag]
  );

  /**
   * 监听输入参数（如 activeSnapThreshold、targetAlignTo 等）变化，并同步到调试面板
   * 这部分代码确保参数变化时，snapdebugInfo 里的对应字段会被更新
   */
  useEffect(() => {
    if (debugFlag) {
      setsnapdebugInfo((prev) =>
        prev
          ? {
              ...prev,
              snapThreshold: activeSnapThreshold,
              targetAlignTo,
              // enabledDirections 可选，如需展示可加上
            }
          : prev
      );
    }
  }, [activeSnapThreshold, targetAlignTo, debugFlag]);

  /**
   * 采集并更新窗口尺寸和滚动信息，同时更新当前活跃目标的 targetRect
   * 性能优化：只在依赖变化时更新，避免多余渲染
   */
  const updateScreenAndScrollInfo = useCallback(() => {
    if (typeof window === 'undefined') return;

    // 用 scrollX/scrollY 作为 rect 的 x/y，兼容多屏和所有主流浏览器
    const screenRect = new DOMRect(
      window.scrollX,
      window.scrollY,
      window.innerWidth,
      window.innerHeight
    );

    // 获取当前活跃目标的 rect
    let targetRect: DOMRect | null = null;
    if (activeTarget) {
      targetRect = activeTarget.getBoundingClientRect();
    }

    updateDebugInfo({
      screenRect,
      targetRect,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    });
  }, [updateDebugInfo, activeTarget]);

  /**
   * 初始化视口监听，窗口尺寸变化时自动更新调试信息
   */
  useEffect(() => {
    updateScreenAndScrollInfo();

    if (typeof window === 'undefined') return;

    window.addEventListener('resize', updateScreenAndScrollInfo, { passive: true });
    return () => window.removeEventListener('resize', updateScreenAndScrollInfo);
  }, [updateScreenAndScrollInfo]);

  /**
   * 吸附到指定目标元素
   * @param target 目标元素
   */
  const snapToTarget = useCallback(
    (target: HTMLElement) => {
      if (debugFlag) console.log('Snapping to target:', target.id || 'unknown');
      if (typeof window === 'undefined' || !target) return;

      // 清理之前的监听器（防止快速点击时累积）
      if (scrollEndCleanupRef.current) {
        if (debugFlag) console.log('Cleaning up previous scroll listener');
        scrollEndCleanupRef.current();
        scrollEndCleanupRef.current = null;
      }

      isProgramScrollingRef.current = true;
      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      let scrollTop = window.scrollY;

      // 根据对齐方式计算滚动位置
      switch (targetAlignTo) {
        case 'auto':
          scrollTop +=
            rect.height < viewportHeight ? rect.top + rect.height - viewportHeight : rect.top;
          break;
        case 'center':
          scrollTop += rect.top - (viewportHeight - rect.height) / 2;
          break;
        case 'bottom':
          scrollTop += rect.top + rect.height - viewportHeight;
          break;
        default: // 'top'
          scrollTop += rect.top;
          break;
      }

      // 始终采用平滑滚动
      window.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });

      setActiveTarget(target);
      updateDebugInfo({ activeTargetId: target.id });

      // 滚动结束后更新目标矩形信息和重置程序滚动标记
      const handleScrollEnd = () => {
        const updatedRect = target.getBoundingClientRect();
        updateDebugInfo({ targetRect: updatedRect });
        isProgramScrollingRef.current = false;
        scrollEndCleanupRef.current = null; // 清理完成后重置
      };

      // 检查浏览器是否支持 scrollend 事件
      if ('onscrollend' in window) {
        // 现代浏览器：使用原生 scrollend 事件
        const scrollEndHandler = () => {
          handleScrollEnd();
          window.removeEventListener('scrollend', scrollEndHandler);
        };

        window.addEventListener('scrollend', scrollEndHandler, { once: true });

        // 存储清理函数
        scrollEndCleanupRef.current = () => {
          window.removeEventListener('scrollend', scrollEndHandler);
          isProgramScrollingRef.current = false;
        };
      } else {
        // 降级方案：使用 scroll 事件 + 防抖检测滚动结束
        let scrollTimer: ReturnType<typeof setTimeout> | undefined;
        let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

        const fallbackScrollEnd = () => {
          if (scrollTimer) clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            handleScrollEnd();
            window.removeEventListener('scroll', fallbackScrollEnd);
            if (timeoutTimer) clearTimeout(timeoutTimer);
          }, 150); // 滚动停止 150ms 后认为滚动结束
        };

        window.addEventListener('scroll', fallbackScrollEnd, { passive: true });

        // 安全措施：最多等待 2 秒，防止永远不触发
        timeoutTimer = setTimeout(() => {
          if (scrollTimer) clearTimeout(scrollTimer);
          window.removeEventListener('scroll', fallbackScrollEnd);
          if (isProgramScrollingRef.current) {
            if (debugFlag) console.log('Fallback: Force reset isProgramScrolling after timeout');
            isProgramScrollingRef.current = false;
            scrollEndCleanupRef.current = null;
          }
        }, 2000);

        // 存储清理函数
        scrollEndCleanupRef.current = () => {
          if (scrollTimer) clearTimeout(scrollTimer);
          if (timeoutTimer) clearTimeout(timeoutTimer);
          window.removeEventListener('scroll', fallbackScrollEnd);
          isProgramScrollingRef.current = false;
        };
      }
    },
    [targetAlignTo, debugFlag, updateDebugInfo]
  );

  /**
   * 判断目标元素是否进入吸附范围
   * @param element 目标元素
   */
  const isTargetInThreshold = useCallback(
    (element: HTMLElement): boolean => {
      if (typeof window === 'undefined') return false;

      // 检查元素可见性
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;

      // 获取元素位置信息
      const rect = element.getBoundingClientRect();
      if (rect.height <= 0) return false;

      // 判断元素进入阈值范围
      const viewportHeight = window.innerHeight;
      const isTopNear = Math.abs(rect.top) <= activeSnapThreshold;
      const isBottomNear = Math.abs(rect.bottom - viewportHeight) <= activeSnapThreshold;
      const isFullyInView = rect.top >= 0 && rect.bottom <= viewportHeight;

      // 返回吸附判断结果
      return isTopNear || isBottomNear || isFullyInView;
    },
    [activeSnapThreshold]
  );

  /**
   * 同步状态到 ref，减少依赖项传递
   */
  useEffect(() => {
    stateRef.current = {
      targets,
      activeTarget,
      isTargetInThreshold,
    };
  }, [targets, activeTarget, isTargetInThreshold]);

  /**
   * 查询并更新目标元素列表
   * 性能优化：只在依赖变化时执行
   */
  const queryTargets = useCallback(() => {
    if (typeof window === 'undefined' || !targetSelector) return;

    // 1. 查询所有匹配选择器的元素
    const foundTargets = Array.from(document.querySelectorAll<HTMLElement>(targetSelector))
      // 2. 过滤不可见元素
      .filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      // 3. 按页面绝对位置排序
      .sort((a, b) => {
        const aTop = a.getBoundingClientRect().top + window.scrollY;
        const bTop = b.getBoundingClientRect().top + window.scrollY;
        return aTop - bTop;
      });

    // 4. 更新目标列表状态
    setTargets(foundTargets);
    updateDebugInfo({ targetsCount: foundTargets.length });
  }, [targetSelector, updateDebugInfo]);

  /**
   * 监听 DOM 变化，自动更新目标元素列表
   * 性能优化：防抖 + 限制监听范围
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !targetSelector) return;

    const root = observerRoot || document.body;
    queryTargets();

    // 防抖定时器：避免频繁触发 queryTargets
    let mutationTimer: ReturnType<typeof setTimeout>;
    let mutationCount = 0;

    // 监听子元素和属性变化（如 class/style）
    const observer = new MutationObserver((mutations) => {
      // 过滤：只关注可能影响 section 的变化
      const relevantMutations = mutations.filter((m) => {
        // 1. childList 变化：可能添加/删除 section
        if (m.type === 'childList') return true;

        // 2. attributes 变化：只关注 style/class（可能影响可见性）
        if (m.type === 'attributes' && ['style', 'class'].includes(m.attributeName || '')) {
          // 进一步过滤：只关注 .snap-section 元素或其祖先的变化
          const target = m.target as HTMLElement;
          if (
            target.classList?.contains('snap-section') ||
            target.querySelector('.snap-section')
          ) {
            return true;
          }
        }

        return false;
      });

      // 如果没有相关变化，直接返回
      if (relevantMutations.length === 0) return;

      // 防抖：200ms 内的多次变化只触发一次查询
      clearTimeout(mutationTimer);
      mutationCount++;

      mutationTimer = setTimeout(() => {
        if (debugFlag) {
          console.log(`MutationObserver: Updating targets (${mutationCount} mutations batched)`);
        }
        queryTargets();
        mutationCount = 0;
      }, 200);
    });

    // 优化监听配置
    observer.observe(root, {
      childList: true,
      subtree: true, // 仍需监听子树，但通过过滤减少触发
      attributes: true,
      attributeFilter: ['style', 'class'], // 只监听这两个属性
    });

    return () => {
      clearTimeout(mutationTimer);
      observer.disconnect();
    };
  }, [targetSelector, observerRoot, queryTargets, debugFlag]);

  /**
   * 滚动监听逻辑，自动吸附目标
   * 性能优化：requestAnimationFrame，避免高频触发
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isProcessing = false;

    const handleWindowScroll = () => {
      // 1. 避免重复处理和程序滚动触发
      if (isProgramScrollingRef.current || isProcessing) {
        if (debugFlag) console.log('Skipped scroll processing');
        return;
      }

      isProcessing = true;

      // 2. 使用requestAnimationFrame优化性能
      requestAnimationFrame(() => {
        const { targets, activeTarget, isTargetInThreshold } = stateRef.current;
        if (targets.length === 0) {
          isProcessing = false;
          return;
        }
        // 3. 计算滚动方向和速度
        const currentScrollY = window.scrollY;
        const direction: ScrollDirection =
          currentScrollY > lastScrollYRef.current
            ? 'down'
            : currentScrollY < lastScrollYRef.current
              ? 'up'
              : 'no';

        const velocity = Math.abs(currentScrollY - lastScrollYRef.current);

        // 4. 更新视口和调试信息（仅在调试模式下）
        if (debugFlag) {
          updateScreenAndScrollInfo();
          updateDebugInfo({
            isScrollingDirection: direction,
            scrollVelocity: velocity,
          });
        }

        // 5. 快速滚动时跳过吸附逻辑
        if (velocity > FAST_SCROLL_THRESHOLD) {
          lastScrollYRef.current = currentScrollY;
          isProcessing = false;
          return;
        }

        // 6. 检查方向是否在允许范围内
        if (direction !== 'no' && !enabledDirections.includes(direction)) {
          lastScrollYRef.current = currentScrollY;
          isProcessing = false;
          return;
        }

        // 7. 根据滚动方向查找符合条件的目标元素
        let targetToSnap: HTMLElement | undefined;
        const currentIndex = targets.findIndex((t) => t === activeTarget);

        if (direction === 'down') {
          const startIndex = currentIndex === -1 ? 0 : currentIndex + 1;
          for (let i = startIndex; i < targets.length; i++) {
            if (isTargetInThreshold(targets[i])) {
              targetToSnap = targets[i];
              break;
            }
          }
        } else if (direction === 'up') {
          const startIndex = currentIndex === -1 ? targets.length - 1 : currentIndex - 1;
          for (let i = startIndex; i >= 0; i--) {
            if (isTargetInThreshold(targets[i])) {
              targetToSnap = targets[i];
              break;
            }
          }
        }

        // 8. 执行吸附操作
        if (targetToSnap && targetToSnap !== activeTarget) {
          if (debugFlag) console.log('Found target to snap:', targetToSnap.id);
          snapToTarget(targetToSnap);
        }

        lastScrollYRef.current = currentScrollY;
        isProcessing = false;
      });
    };

    // 添加事件监听
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [debugFlag, enabledDirections, snapToTarget, updateScreenAndScrollInfo, updateDebugInfo]);

  /**
   * 初始化滚动检查
   * 确保 targets 已加载后再执行首次检查
   */
  useEffect(() => {
    if (typeof window === 'undefined' || targets.length === 0) return;

    // 延迟执行，确保 DOM 完全渲染
    const timer = setTimeout(() => {
      if (debugFlag) console.log('Initialization: Checking initial scroll position');

      // 触发一次滚动检查，确定初始活跃目标
      window.dispatchEvent(new Event('scroll'));
    }, 100);

    return () => clearTimeout(timer);
  }, [targets, debugFlag]);

  /**
   * 键盘导航支持
   * 提升可访问性：支持 Page Up/Down、Space、Home/End 快捷键
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果用户在输入框中，不拦截键盘事件
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // 如果没有目标或活跃目标，不处理
      if (!activeTarget || targets.length === 0) return;

      const currentIndex = targets.indexOf(activeTarget);
      let targetIndex = -1;

      switch (e.key) {
        case 'PageDown':
        case ' ': // Space 键
          // 向下跳转到下一个 section
          targetIndex = Math.min(currentIndex + 1, targets.length - 1);
          if (targetIndex !== currentIndex) {
            e.preventDefault(); // 阻止默认滚动
            if (debugFlag) console.log('Keyboard: PageDown/Space → Next section');
          }
          break;

        case 'PageUp':
          // 向上跳转到上一个 section
          targetIndex = Math.max(currentIndex - 1, 0);
          if (targetIndex !== currentIndex) {
            e.preventDefault();
            if (debugFlag) console.log('Keyboard: PageUp → Previous section');
          }
          break;

        case 'Home':
          // 跳转到第一个 section
          targetIndex = 0;
          if (targetIndex !== currentIndex) {
            e.preventDefault();
            if (debugFlag) console.log('Keyboard: Home → First section');
          }
          break;

        case 'End':
          // 跳转到最后一个 section
          targetIndex = targets.length - 1;
          if (targetIndex !== currentIndex) {
            e.preventDefault();
            if (debugFlag) console.log('Keyboard: End → Last section');
          }
          break;

        default:
          // 其他按键不处理
          return;
      }

      // 执行吸附
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        snapToTarget(targets[targetIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTarget, targets, snapToTarget, debugFlag]);

  /**
   * 初始化活跃目标
   */
  useEffect(() => {
    if (targets.length > 0 && !activeTarget) {
      setActiveTarget(targets[0]);
      updateDebugInfo({ activeTargetId: targets[0].id });
    }
  }, [targets, activeTarget, updateDebugInfo]);

  // 返回接口
  return {
    activeTarget,
    snapToTarget,
    snapdebugInfo,
  } as WindowScrollSnapReturn;
}
