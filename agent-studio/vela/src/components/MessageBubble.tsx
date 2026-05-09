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
    <div className={isUser ? 'vx-vela-message vx-vela-message--user' : 'vx-vela-message vx-vela-message--assistant'}>
      <div
        className={
          isUser
            ? 'vx-vela-message__bubble vx-vela-message__bubble--user'
            : 'vx-vela-message__bubble vx-vela-message__bubble--assistant'
        }
      >
        {message.content || (
          // 助手消息占位符（流式接收中）
          <span className="vx-vela-message__cursor">▍</span>
        )}
      </div>
    </div>
  );
}
