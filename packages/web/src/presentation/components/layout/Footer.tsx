/**
 * Footer.tsx - 网站全局底部信息栏
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示网站全局底部栏 UI
 * - 使用 Application Layer 的 useFooter Hook 获取数据
 *
 * @layer Presentation
 * @category Components - Layout
 */
'use client';

import { useFooter } from '@/application/hooks/layout';
import { FiGithub, FiMail, FiPhone } from 'react-icons/fi';
import { SiWechat } from 'react-icons/si';

/**
 * Footer 组件
 */
export default function Footer() {
  // ✅ 使用 Application Layer Hooks 获取数据
  const { data: footer, isLoading, error } = useFooter();

  // 加载状态
  if (isLoading) {
    return (
      <footer className='bg-gradient-to-r from-gray-50 via-slate-100 to-gray-200 text-slate-800'>
        <div className='max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='py-12'>
            <div className='text-gray-600'>loading...</div>
          </div>
        </div>
      </footer>
    );
  }

  // 错误状态或数据缺失 - 使用 Fallback 数据
  if (error || !footer) {
    console.error('Footer data loading error:', error);

    const fallbackFooter = {
      brand: {
        logo: '/icons/favicon.ico',
        text: 'vxture',
        description: '基于AI的虚拟自然探索平台',
        email: 'contact@vxture.com',
        phone: '400-888-0000',
      },
      sections: [
        {
          title: '产品',
          links: [
            { label: '功能特性', href: '/features' },
            { label: '解决方案', href: '/solutions' },
            { label: '案例展示', href: '/cases' },
          ],
        },
        {
          title: '方案',
          links: [
            { label: '数字战场', href: '/solutions/solutions-202401' },
            { label: '应急指挥', href: '/solutions/solutions-202501' },
            { label: '知识服务', href: '/solutions/solutions-202601' },
          ],
        },
        {
          title: '公司',
          links: [
            { label: '公司简介', href: '/company' },
            { label: '联系我们', href: '/contact' },
            { label: '加入我们', href: '/careers' },
          ],
        },
        {
          title: '资源',
          links: [
            { label: '文档中心', href: '/docs' },
            { label: '博客', href: '/blog' },
            { label: '帮助中心', href: '/help' },
          ],
        },
      ],
      copyright: {
        text: `© ${new Date().getFullYear()} vxture. All rights reserved.`,
      },
      legal: [
        { label: '隐私政策', href: '/privacy' },
        { label: '服务条款', href: '/terms' },
        { label: '备案号', href: 'https://beian.miit.gov.cn' },
      ],
    };

    return (
      <footer className='bg-gradient-to-r from-gray-50 via-slate-100 to-gray-200 text-slate-800'>
        <div className='max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row gap-8 py-12'>
            {/* 品牌信息 */}
            <div className='flex flex-col basis-[30%] min-w-[200px]'>
              {/* Brand - Text Only */}
              <div className='flex items-center space-x-3 mb-3'>
                <span className='text-2xl font-bold text-gray-700'>
                  {fallbackFooter.brand.text}
                </span>
              </div>

              {/* Description */}
              {fallbackFooter.brand.description && (
                <p className='text-sm text-gray-600 mb-4'>{fallbackFooter.brand.description}</p>
              )}

              {/* Contact Info */}
              {fallbackFooter.brand.email && (
                <div className='flex items-center space-x-2 text-sm text-gray-600 mb-2'>
                  <FiMail className='w-4 h-4 flex-shrink-0' />
                  <a
                    href={`mailto:${fallbackFooter.brand.email}`}
                    className='hover:text-blue-600 transition-colors'
                  >
                    {fallbackFooter.brand.email}
                  </a>
                </div>
              )}
              {fallbackFooter.brand.phone && (
                <div className='flex items-center space-x-2 text-sm text-gray-600 mb-4'>
                  <FiPhone className='w-4 h-4 flex-shrink-0' />
                  <span>{fallbackFooter.brand.phone}</span>
                </div>
              )}
            </div>

            {/* 链接区 */}
            <div className='flex flex-col md:flex-row basis-[70%] gap-8 justify-between'>
              {fallbackFooter.sections.map((section) => (
                <div key={section.title} className='flex-1'>
                  <h3 className='text-lg font-semibold mb-4 text-gray-700'>{section.title}</h3>
                  <ul className='space-y-2'>
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className='text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300'
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className='border-t border-gray-300'></div>

          {/* 底部信息 - 版权 + 法律链接 */}
          <div className='py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
            <p className='text-sm text-gray-600'>{fallbackFooter.copyright.text}</p>

            {/* 法律链接 - 横向展示 */}
            <div className='flex space-x-6 text-sm text-gray-600'>
              {fallbackFooter.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className='hover:text-blue-600 transition-colors duration-300'
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // 如果内容被禁用，不渲染
  if (!footer.enabled) {
    return null;
  }

  // ✅ 正常渲染（使用 JSON 数据）
  return (
    <footer className='bg-gradient-to-r from-gray-50 via-slate-100 to-gray-200 text-slate-800'>
      <div className='max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* 主要内容区域 */}
        <div className='flex flex-col md:flex-row gap-8 py-12'>
          {/* 品牌信息 - 左侧 */}
          <div className='flex flex-col basis-[30%] min-w-[200px]'>
            {/* Brand - Text Only */}
            <div className='flex items-center space-x-3 mb-3'>
              <span className='text-2xl font-bold text-gray-700'>{footer.brand.text}</span>
            </div>

            {/* Description */}
            {footer.brand.description && (
              <p className='text-sm text-gray-600 mb-4'>{footer.brand.description}</p>
            )}

            {/* Contact Info */}
            {footer.brand.email && (
              <div className='flex items-center space-x-2 text-sm text-gray-600 mb-2'>
                <FiMail className='w-4 h-4 flex-shrink-0' />
                <a
                  href={`mailto:${footer.brand.email}`}
                  className='hover:text-blue-600 transition-colors'
                >
                  {footer.brand.email}
                </a>
              </div>
            )}
            {footer.brand.phone && (
              <div className='flex items-center space-x-2 text-sm text-gray-600 mb-4'>
                <FiPhone className='w-4 h-4 flex-shrink-0' />
                <span>{footer.brand.phone}</span>
              </div>
            )}

            {/* Social Links */}
            {footer.social && footer.social.length > 0 && (
              <div className='flex space-x-4 mt-2'>
                {footer.social.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.ariaLabel}
                    className='text-gray-600 hover:text-blue-600 transition-colors'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {social.icon === 'github' && <FiGithub className='w-5 h-5' />}
                    {social.icon === 'wechat' && <SiWechat className='w-5 h-5' />}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* 链接区 - 右侧 */}
          <div className='flex flex-col md:flex-row basis-[70%] gap-8 justify-between'>
            {footer.sections.map((section) => (
              <div key={section.title} className='flex-1'>
                <h3 className='text-lg font-semibold mb-4 text-gray-700'>{section.title}</h3>
                <ul className='space-y-2'>
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className='text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300'
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 分割线 */}
        <div className='border-t border-gray-300'></div>

        {/* 底部信息 - 版权 + 法律链接 */}
        <div className='py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
          <p className='text-sm text-gray-600'>{footer.copyright.text}</p>

          {/* 法律链接 - 横向展示 */}
          {footer.legal && footer.legal.length > 0 && (
            <div className='flex space-x-6 text-sm text-gray-600'>
              {footer.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className='hover:text-blue-600 transition-colors duration-300'
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
