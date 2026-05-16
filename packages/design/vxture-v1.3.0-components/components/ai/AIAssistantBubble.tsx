'use client';
import * as React from 'react';
import { cn } from '../../utils/cn';

export type AIAssistantBubbleProps = {
  /** Who's speaking */
  role: 'user' | 'ai';
  /** Message content (string or rich node) */
  children: React.ReactNode;
  /** Avatar text — defaults to first letter of role */
  avatar?: string;
  /** Avatar image src — overrides text avatar */
  avatarSrc?: string;
  /** Timestamp shown below the bubble */
  timestamp?: string | Date;
  className?: string;
};

/**
 * AIAssistantBubble — conversational chat bubble.
 *
 * Asymmetric layout: AI on the left with ai-tinted soft background +
 * aurora avatar; user on the right with primary solid background.
 *
 * @example
 *   <AIAssistantBubble role="user" avatar="A">
 *     How do I optimize this pipeline?
 *   </AIAssistantBubble>
 *   <AIAssistantBubble role="ai" avatar="✦" timestamp={new Date()}>
 *     Three suggestions: ...
 *   </AIAssistantBubble>
 */
export function AIAssistantBubble({
  role,
  children,
  avatar,
  avatarSrc,
  timestamp,
  className,
}: AIAssistantBubbleProps) {
  const fallbackAvatar = avatar ?? (role === 'ai' ? '✦' : 'U');
  const time = timestamp instanceof Date
    ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : timestamp;

  return (
    <div className={cn('vx-bubble', `vx-bubble--${role}`, className)}>
      <div className={cn('vx-bubble__avatar', `vx-bubble__avatar--${role}`)} aria-hidden>
        {avatarSrc ? <img src={avatarSrc} alt="" /> : fallbackAvatar}
      </div>
      <div className="vx-bubble__content">
        <div className="vx-bubble__body">{children}</div>
        {time && <div className="vx-bubble__time">{time}</div>}
      </div>
    </div>
  );
}
