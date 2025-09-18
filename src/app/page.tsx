import Button from '@/components/ui/Button';
import ChatBox from '@/components/common/ChatBox';

export default function Home() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* 英雄区块 */}
      <section className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          智能体<span className="text-primary">解决方案</span>，赋能未来
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Vxture提供先进的智能体解决方案，为企业带来革命性的创新体验。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg" animated>
            了解更多
          </Button>
          <Button variant="secondary" size="lg">
            联系我们
          </Button>
        </div>
      </section>
      
      {/* 功能展示 */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          我们的服务
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 卡片1 */}
          <div className="custom-card">
            <div className="custom-card__header">
              <h3 className="text-xl font-semibold">智能对话系统</h3>
            </div>
            <div className="custom-card__body">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                基于最新大语言模型的智能对话系统，为企业提供高效客户服务。
              </p>
              <Button variant="primary" size="sm">了解详情</Button>
            </div>
          </div>
          
          {/* 卡片2 */}
          <div className="custom-card">
            <div className="custom-card__header">
              <h3 className="text-xl font-semibold">数据分析平台</h3>
            </div>
            <div className="custom-card__body">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                利用AI技术对企业数据进行深度分析，提取有价值的业务洞察。
              </p>
              <Button variant="primary" size="sm">了解详情</Button>
            </div>
          </div>
          
          {/* 卡片3 */}
          <div className="custom-card">
            <div className="custom-card__header">
              <h3 className="text-xl font-semibold">自动化工作流</h3>
            </div>
            <div className="custom-card__body">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                智能流程自动化解决方案，帮助企业提高效率，降低运营成本。
              </p>
              <Button variant="primary" size="sm">了解详情</Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* 聊天演示 */}
      <section className="max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          体验智能对话
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          与我们的AI助手交流，了解Vxture如何为您的业务带来价值。
        </p>
        <ChatBox />
      </section>
      
      {/* 客户徽标 */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          受到信赖的合作伙伴
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
          {/* 这里会放置合作伙伴徽标 */}
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </section>
    </div>
  );
}