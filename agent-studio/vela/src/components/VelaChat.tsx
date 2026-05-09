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

import { Button } from '@vxture/design-system';
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
// 组件
// ============================================================================

export function VelaChat({ surface, position }: VelaChatProps) {
  useVelaSurface(surface);

  const isOpen = useVelaStore((s) => s.isOpen);
  const toggleOpen = useVelaStore((s) => s.toggleOpen);

  // ---- sidebar 模式：始终可见
  if (position === 'sidebar') {
    return (
      <div className="vx-vela-chat vx-vela-chat--sidebar">
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
        <div className="vx-vela-chat vx-vela-chat--float">
          <Header surface={surface} onClose={toggleOpen} />
          <MessageList />
          <ConfirmActionDialog />
          <InputBar />
        </div>
      )}
      <Button className="vx-vela-float-button" onClick={toggleOpen} aria-label="打开 Vela 助手" size="icon">
        {isOpen ? '✕' : '✦'}
      </Button>
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
    <div className="vx-vela-header">
      <div className="vx-vela-header__leading">
        <span className="vx-vela-header__title">维引</span>
        <SurfaceBadge surface={surface} />
      </div>
      {onClose && (
        <Button
          onClick={onClose}
          className="vx-vela-header__close"
          aria-label="关闭"
          variant="ghost"
          size="icon"
        >
          ✕
        </Button>
      )}
    </div>
  );
}
