import Link from 'next/link';

export default function Footer() {
  // 获取当前年份
  const currentYear = new Date().getFullYear();

  // 页脚链接组定义
  const footerGroups = [
    {
      title: '产品',
      links: [
        { name: '智能体平台', href: '/products/agent-platform' },
        { name: '数据分析', href: '/products/data-analytics' },
        { name: '集成服务', href: '/products/integration' },
      ],
    },
    {
      title: '解决方案',
      links: [
        { name: '企业智能化', href: '/solutions/enterprise' },
        { name: '数据决策', href: '/solutions/data-decision' },
        { name: '流程自动化', href: '/solutions/automation' },
      ],
    },
    {
      title: '资源',
      links: [
        { name: '博客', href: '/blog' },
        { name: '案例研究', href: '/cases' },
        { name: '文档', href: '/docs' },
      ],
    },
    {
      title: '公司',
      links: [
        { name: '关于我们', href: '/about' },
        { name: '联系我们', href: '/contact' },
        { name: '加入我们', href: '/careers' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-50">
      {/* 内容链接区 */}
      <div className="container mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {footerGroups.map(group => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {group.title}
            </h2>
            <ul className="space-y-2">
              {group.links.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-base text-gray-600 hover:text-blue-600">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 版权声明区 */}
      <div className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
          <p> {currentYear} Vxture. 保留所有权利。</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-blue-600">
              隐私政策
            </Link>
            <Link href="/terms" className="hover:text-blue-600">
              使用条款
            </Link>
            <Link href="/sitemap" className="hover:text-blue-600">
              网站地图
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
