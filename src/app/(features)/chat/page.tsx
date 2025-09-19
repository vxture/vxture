import ChatClient from '@/components/features/chat/ChatClient';

export const metadata = {
  title: 'LangGraph 聊天演示 | Vxture',
  description: '测试与LangGraph智能代理的对话功能',
};

export default function ChatPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">LangGraph 智能代理演示</h1>
      <p className="text-center mb-8 text-gray-600 max-w-2xl mx-auto">
        这是一个演示页面，用于测试与LangGraph智能代理的交互。
        目前使用模拟响应，后续将连接到真实的智能代理后端。
      </p>

      <ChatClient />
    </div>
  );
}
