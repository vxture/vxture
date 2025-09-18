// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  // 其他用户属性
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 添加其他项目特定类型