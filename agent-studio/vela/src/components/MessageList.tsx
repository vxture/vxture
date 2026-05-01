/**
 * MessageList.tsx - 消息列表（自动滚动到底部）
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Component
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { useVelaStore } from '../stores/vela.store';

// ============================================================================
// 组件
// ============================================================================

export function MessageList() {
  const messages   = useVelaStore((s) => s.messages);
  const bottomRef  = useRef<HTMLDivElement>(null);

  // 每次消息变化时滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages.length) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
        你好！有什么可以帮助你的？
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
