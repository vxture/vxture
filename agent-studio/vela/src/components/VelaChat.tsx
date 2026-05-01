/**
 * VelaChat.tsx - Vela 主入口组件（sidebar / float 两种布局）
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Component
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

'use client';

import { useVelaStore } from '../stores/vela.store';
import { useVelaSurface } from '../hooks/useVelaSurface';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { SurfaceBadge } from './SurfaceBadge';
import type { VelaSurface } from '../types/vela.types';

// ============================================================================
// Props
// ============================================================================

export interface VelaChatProps {
  surface:  VelaSurface;
  /** sidebar：固定侧边栏；float：右下角浮动窗口 */
  position: 'sidebar' | 'float';
}

// ============================================================================
// 布局样式
// ============================================================================

const SIDEBAR_STYLE: React.CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  width:          '360px',
  height:         '100%',
  borderLeft:     '1px solid #e2e8f0',
  background:     '#ffffff',
  flexShrink:     0,
};

const FLOAT_PANEL_STYLE: React.CSSProperties = {
  position:       'fixed',
  bottom:         '80px',
  right:          '24px',
  width:          '380px',
  height:         '560px',
  display:        'flex',
  flexDirection:  'column',
  borderRadius:   '16px',
  boxShadow:      '0 8px 32px rgba(0,0,0,0.15)',
  border:         '1px solid #e2e8f0',
  background:     '#ffffff',
  zIndex:         9999,
  overflow:       'hidden',
};

const FLOAT_BUTTON_STYLE: React.CSSProperties = {
  position:       'fixed',
  bottom:         '24px',
  right:          '24px',
  width:          '48px',
  height:         '48px',
  borderRadius:   '50%',
  background:     '#3b82f6',
  color:          '#ffffff',
  border:         'none',
  fontSize:       '20px',
  cursor:         'pointer',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  boxShadow:      '0 4px 12px rgba(59,130,246,0.4)',
  zIndex:         9999,
};

// ============================================================================
// 组件
// ============================================================================

export function VelaChat({ surface, position }: VelaChatProps) {
  useVelaSurface(surface);

  const isOpen = useVelaStore((s) => s.isOpen);
  const toggleOpen = useVelaStore((s) => s.toggleOpen);

  // ---- sidebar 模式：始终可见
  if (position === 'sidebar') {
    return (
      <div style={SIDEBAR_STYLE}>
        <Header surface={surface} />
        <MessageList />
        <ConfirmActionDialog />
        <InputBar />
      </div>
    );
  }

  // ---- float 模式：按钮展开/收起
  return (
    <>
      {isOpen && (
        <div style={FLOAT_PANEL_STYLE}>
          <Header surface={surface} onClose={toggleOpen} />
          <MessageList />
          <ConfirmActionDialog />
          <InputBar />
        </div>
      )}
      <button style={FLOAT_BUTTON_STYLE} onClick={toggleOpen} aria-label="打开 Vela 助手">
        {isOpen ? '✕' : '✦'}
      </button>
    </>
  );
}

// ============================================================================
// 内部 Header
// ============================================================================

interface HeaderProps {
  surface:  VelaSurface;
  onClose?: () => void;
}

function Header({ surface, onClose }: HeaderProps) {
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '12px 16px',
        borderBottom:   '1px solid #e2e8f0',
        flexShrink:     0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>维引</span>
        <SurfaceBadge surface={surface} />
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', padding: '2px' }}
          aria-label="关闭"
        >
          ✕
        </button>
      )}
    </div>
  );
}
