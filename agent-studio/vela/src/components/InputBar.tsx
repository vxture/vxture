/**
 * InputBar.tsx - 消息输入框 + 发送按钮
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Component
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { useVelaChat } from '../hooks/useVelaChat';
import { useVelaStore } from '../stores/vela.store';

// ============================================================================
// 组件
// ============================================================================

export function InputBar() {
  const [text, setText]   = useState('');
  const textareaRef        = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming } = useVelaChat();
  const pendingConfirm = useVelaStore((s) => s.pendingConfirm);

  /** 有挂起确认时禁用输入，防止在确认前发送新消息 */
  const isDisabled = isStreaming || !!pendingConfirm;

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isDisabled) return;
    setText('');
    await sendMessage(trimmed);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'flex-end',
        gap:          '8px',
        padding:      '12px 16px',
        borderTop:    '1px solid var(--vx-color-border)',
        background:   'var(--vx-color-surface)',
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={pendingConfirm ? '请先处理上方的确认请求…' : '输入消息… (Enter 发送，Shift+Enter 换行)'}
        disabled={isDisabled}
        rows={1}
        style={{
          flex:        1,
          resize:      'none',
          border:      '1px solid var(--vx-color-border)',
          borderRadius: '8px',
          padding:     '8px 12px',
          fontSize:    '14px',
          lineHeight:  '1.5',
          outline:     'none',
          maxHeight:   '120px',
          overflowY:   'auto',
          background:  isDisabled ? 'var(--vx-color-surface-muted)' : 'var(--vx-color-surface)',
          color:       'var(--vx-color-text-primary)',
          fontFamily:  'inherit',
        }}
      />
      <button
        onClick={() => void handleSend()}
        disabled={!text.trim() || isDisabled}
        style={{
          padding:      '8px 16px',
          borderRadius: '8px',
          border:       'none',
          background:   !text.trim() || isDisabled ? 'var(--vx-color-surface-muted)' : 'var(--vx-color-primary)',
          color:        !text.trim() || isDisabled ? 'var(--vx-color-text-disabled)' : 'var(--vx-color-text-inverse)',
          fontSize:     '14px',
          fontWeight:   600,
          cursor:       !text.trim() || isDisabled ? 'not-allowed' : 'pointer',
          whiteSpace:   'nowrap',
          transition:   'background 0.15s',
        }}
      >
        {isStreaming ? '…' : '发送'}
      </button>
    </div>
  );
}
