/**
 * Footer.tsx - 网站全局底部信息栏
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示网站全局底部栏 UI
 * - 使用 Application Layer 的 useFooter Hook 获取数据
 * - 数据缺失或报错时自动使用 Fallback + normalizeFooterData
 *
 * @layer Presentation
 * @category Components - Layout
 */
'use client';

import { useFooter } from '@/application/hooks/layout';
import { normalizeFooterData } from '@/infrastructure/constants/FooterHelpers';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { SiGithub, SiWechat, SiLinkedin } from 'react-icons/si';

export default function Footer() {
  // 1️⃣ 获取 Footer 数据
  const { data: footerData, error } = useFooter();

  // 3️⃣ 数据规范化：保证前端渲染安全完整
  const displayData = normalizeFooterData(error || !footerData ? undefined : footerData);
  console.log('Footer data:', displayData);

  // 4️⃣ 如果 Footer 被禁用，不渲染
  if (!displayData.enabled) return null;

  // 4️⃣ 渲染 Footer UI
  return (
    <footer className='flex flex-col min-h-[35vh] w-full text-slate-800 bg-slate-100'>
      <div className='flex flex-1 flex-col w-full max-w-7xl xl:max-w-screen-2xl mx-auto pt-8 px-4 sm:px-6 lg:px-8'>
        {/* 主要内容区域：品牌 + 联系 + 社交 / 链接区 */}
        <div className='flex flex-1 flex-col md:flex-row gap-8'>
          {/* 左侧：品牌信息 + 联系方式 + 社交 */}
          <div className='flex flex-col basis-[30%] min-w-[200px]'>
            {/* 品牌标识 */}
            <div className='flex items-center space-x-3 mb-3'>
              <span className='text-2xl font-bold text-gray-700'>
                {displayData.brand.name}
              </span>
            </div>
            {/* 地址信息 */}
            {displayData.brand.address && (
              <div className='flex items-center space-x-1 text-sm text-gray-600 mb-4'>
                <FiMapPin className='w-4 h-4' />
                <span>{displayData.brand.address}</span>
              </div>
            )}
            {/* 联系方式 */}
            <div className='flex flex-col gap-4 text-sm text-gray-600 mb-4'>
              {/* Sales */}
              <div className='flex flex-wrap items-start gap-x-4 gap-y-2'>
                {displayData.contact.sales?.phone && (
                  <span className='flex items-center space-x-1 min-w-[120px]'>
                    <FiPhone className='w-4 h-4' />
                    <span>{displayData.contact.sales.phone}</span>
                  </span>
                )}
                {displayData.contact.sales?.email && (
                  <a
                    href={`mailto:${displayData.contact.sales.email}`}
                    className='flex items-center space-x-1 min-w-[140px] hover:text-blue-600 transition-colors'
                  >
                    <FiMail className='w-4 h-4' />
                    <span>{displayData.contact.sales.email}</span>
                  </a>
                )}
              </div>

              {/* Service */}
              <div className='flex flex-wrap items-start gap-x-4 gap-y-2'>
                {displayData.contact.service?.phone && (
                  <span className='flex items-center space-x-1 min-w-[120px]'>
                    <FiPhone className='w-4 h-4' />
                    <span>{displayData.contact.service.phone}</span>
                  </span>
                )}
                {displayData.contact.service?.email && (
                  <a
                    href={`mailto:${displayData.contact.service.email}`}
                    className='flex items-center space-x-1 min-w-[140px] hover:text-blue-600 transition-colors'
                  >
                    <FiMail className='w-4 h-4' />
                    <span>{displayData.contact.service.email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* 社交链接 */}
            {displayData.social?.length > 0 && (
              <div className='flex space-x-4 mt-2'>
                {displayData.social.map((social) => (
                  <div key={social.name} className='relative group'>
                    <a
                      href={social.icon === 'wechat' ? '#' : social.href}
                      aria-label={social.ariaLabel}
                      className='text-gray-600 hover:text-blue-600 transition-colors'
                      target={social.icon === 'wechat' ? undefined : '_blank'}
                      rel={social.icon === 'wechat' ? undefined : 'noopener noreferrer'}
                    >
                      {social.icon === 'github' && <SiGithub className='w-5 h-5' />}
                      {social.icon === 'linkedin' && <SiLinkedin className='w-5 h-5' />}
                      {social.icon === 'wechat' && <SiWechat className='w-5 h-5' />}
                    </a>
                    {/* 微信二维码 */}
                    {social.icon === 'wechat' && (
                      <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50'>
                        <div className='bg-white p-2 rounded-lg shadow-lg'>
                          <img
                            src='/images/footer/WeChatOfficialAccounts.png'
                            alt='微信公众号二维码'
                            className='w-32 h-32'
                          />
                          <div className='mt-1 text-center text-xs text-gray-600'>
                            扫描二维码关注微信公众号
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：链接区（分区块展示） */}
          <div className='flex flex-1 flex-col md:flex-row basis-[70%] gap-8 justify-between'>
            {displayData.sections.map((section) => (
              <div key={section.id} className='flex-1'>
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
        <div className='mt-auto flex items-center justify-between py-0 border-t border-gray-300'>
          {/* 底部信息：版权 + 法律 + 备案 */}
          <div className='flex w-full justify-between items-center py-4 text-sm text-gray-600 flex-wrap gap-2'>
            {/* 左侧：版权 */}
            <p className='whitespace-nowrap'>{displayData.copyright.text}</p>

            {/* 右侧：法律链接 + 备案信息 */}
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 justify-end'>
              {displayData.legal?.length > 0 &&
                displayData.legal.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className='hover:text-blue-600 transition-colors whitespace-nowrap'
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              {displayData.icp?.text && (
                <a
                  href={displayData.icp.link}
                  className='hover:text-blue-600 transition-colors whitespace-nowrap'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {displayData.icp.text}
                </a>
              )}
              {displayData.publicSecurity?.text && (
                <a
                  href={displayData.publicSecurity.link}
                  className='hover:text-blue-600 transition-colors whitespace-nowrap'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {displayData.publicSecurity.text}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
