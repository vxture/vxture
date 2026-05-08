/**
 * SurfaceBadge.tsx - 当前 surface 指示标签
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Component
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import type { VelaSurface } from '../types/vela.types';

// ============================================================================
// 常量
// ============================================================================

const LABEL: Record<VelaSurface, string> = {
  admin:   '运营后台',
  console: '工作台',
};

// ============================================================================
// 组件
// ============================================================================

interface Props {
  surface: VelaSurface;
}

export function SurfaceBadge({ surface }: Props) {
  return (
    <span
      style={{
        display:        'inline-block',
        padding:        '2px 8px',
        borderRadius:   '9999px',
        fontSize:       '11px',
        fontWeight:     600,
        background:     surface === 'admin' ? 'var(--vx-color-info-surface)' : 'var(--vx-color-success-surface)',
        color:          surface === 'admin' ? 'var(--vx-color-info-foreground)' : 'var(--vx-color-success-foreground)',
        letterSpacing:  '0.02em',
      }}
    >
      {LABEL[surface]}
    </span>
  );
}
