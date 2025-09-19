'use client';

import { useState } from 'react';

import { ChatMessage } from '@/types/chat';

export default function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // 添加用户消息到对话列表
    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 调用API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '请求失败');
      }

      // 添加助手回复到对话列表
      setMessages(prev => [...prev, data.data.response]);
    } catch (error) {
      console.error('聊天请求错误:', error);
      // 显示错误消息
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '抱歉，处理您的请求时出现错误。请稍后再试。' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">LangGraph 聊天演示</h2>

      <div className="mb-4 h-80 overflow-y-auto border rounded p-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-32">开始对话吧！</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 p-2 rounded ${
                msg.role === 'user' ? 'bg-blue-100 ml-12' : 'bg-gray-100 mr-12'
              }`}
            >
              <p className="text-sm font-semibold">{msg.role === 'user' ? '你' : '助手'}:</p>
              <p>{msg.content}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-center mt-2">
            <p className="text-gray-500">思考中...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入你的问题..."
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading || !input.trim()}
        >
          发送
        </button>
      </form>
    </div>
  );
}
