'use client';

import { useState, useCallback } from 'react';
import { ChatMessage } from '@/types';

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  onError?: (error: Error) => void;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { initialMessages = [], onError } = options;
  
  // 消息状态
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 发送消息到API
  const sendMessage = useCallback(async (content: string) => {
    // 添加用户消息到状态
    const userMessage: ChatMessage = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    
    // 设置加载状态
    setIsLoading(true);
    setError(null);
    
    try {
      // 发送API请求
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      // 解析并添加助手的回复
      const assistantMessage = await response.json();
      setMessages((prev) => [...prev, assistantMessage]);
      
      return assistantMessage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, onError]);

  // 清除所有消息
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};

export default useChat;