/**
 * MessageBubble.tsx - 单条消息气泡
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Component
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import { ToolCallCard } from './ToolCallCard';
import type { VelaMessage, VelaToolMessage } from '../types/vela.types';

// ============================================================================
// 组件
// ============================================================================

interface Props {
  message: VelaMessage;
}

export function MessageBubble({ message }: Props) {
  if (message.role === 'tool') {
    return <ToolCallCard message={message as VelaToolMessage} />;
  }

  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display:        'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        margin:         '4px 0',
      }}
    >
      <div
        style={{
          maxWidth:     '80%',
          padding:      '8px 12px',
          borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          background:   isUser ? '#3b82f6' : '#f1f5f9',
          color:        isUser ? '#ffffff' : '#1e293b',
          fontSize:     '14px',
          lineHeight:   '1.5',
          whiteSpace:   'pre-wrap',
          wordBreak:    'break-word',
        }}
      >
        {message.content || (
          // 助手消息占位符（流式接收中）
          <span style={{ opacity: 0.4 }}>▍</span>
        )}
      </div>
    </div>
  );
}
