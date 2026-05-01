/**
 * useVelaSurface.ts - 读取宿主注入的 surface 并同步到 store
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Hook
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

'use client';

import { useEffect } from 'react';
import { useVelaStore } from '../stores/vela.store';
import type { VelaSurface } from '../types/vela.types';

/**
 * 宿主 portal 通过 prop 传入 surface，此 hook 负责将其写入全局 store。
 * 仅在 VelaChat 根组件调用一次。
 */
export function useVelaSurface(surface: VelaSurface) {
  const setSurface = useVelaStore((s) => s.setSurface);

  useEffect(() => {
    setSurface(surface);
  }, [surface, setSurface]);
}
