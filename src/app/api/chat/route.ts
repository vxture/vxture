import { NextRequest } from 'next/server';

import { ApiError, ApiResponseHandler } from '@/lib/utils/apiResponse';
import { ChatMessage } from '@/types/chat';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // 从请求中解析消息内容
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new ApiError('请求格式错误，必须包含有效的消息数组', 400);
    }

    // 模拟与后端LangGraph集成
    // 在实际实现中，这里将调用后端的LangGraph代理
    const mockResponse: ChatMessage = {
      role: 'assistant',
      content: '这是一个示例回复。实际项目中，这里将集成LangGraph智能代理的响应。',
    };

    // 返回响应
    return ApiResponseHandler.success({
      response: mockResponse,
      conversation_id: '模拟会话ID-' + Date.now(),
    });
  } catch (error) {
    return ApiResponseHandler.handleError(error);
  }
}
