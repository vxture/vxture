/**
 * Footer.tsx - 网站全局底部信息栏（重构版）
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示网站全局底部栏 UI
 * - 使用 Application Layer 的 useFooter Hook 获取数据
 * - 支持品牌展示、联系方式、链接区、社交媒体
 *
 * @layer Presentation
 * @category Components - Layout
 */
'use client';

import { useFooter } from '@/application/hooks/layout';
import { AiFillTikTok, AiFillWechatWork } from 'react-icons/ai';
import { VscGithubInverted } from 'react-icons/vsc';

/**
 * Footer 组件
 */
export default function Footer() {
  // 使用新的 Application Layer Hook 获取数据
  const { data: footer, isLoading, error } = useFooter();

  // 加载状态
  if (isLoading) {
    return (
      <footer className='bg-gradient-to-r from-gray-50 via-slate-100 to-gray-200 text-slate-800'>
        <div className='max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center text-gray-500'>加载中...</div>
        </div>
      </footer>
    );
  }

  // 错误状态或数据缺失
  if (error || !footer) {
    return null;
  }

  // 如果内容被禁用，不渲染
  if (!footer.enabled) {
    return null;
  }

  // 从 sections 中提取联系方式
  const contactSection = footer.sections.find((s) => s.title.includes('联系'));
  const contactEmail = contactSection?.links.find((l) => l.href.includes('mailto:'));
  const contactPhone = contactSection?.links.find((l) => l.href.includes('tel:'));

  // 从 social 中提取社交媒体链接
  const githubLink = footer.social?.find((s) => s.platform === 'github');
  const tiktokLink = footer.social?.find((s) => s.platform === 'tiktok');
  const wechatLink = footer.social?.find((s) => s.platform === 'wechat');

  return (
    <footer className='bg-gradient-to-r from-gray-50 via-slate-100 to-gray-200 text-slate-800'>
      <div className='max-w-7xl xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* 主要内容区域 */}
        <div className='flex flex-col md:flex-row gap-32 py-8'>
          {/* 品牌信息 - 左侧 */}
          <div className='flex flex-col h-full basis-[38%] min-w-[260px] pl-32'>
            {/* Brand */}
            {footer.brand && (
              <div className='flex items-center space-x-3'>
                <span className='text-2xl font-bold text-gray-500'>{footer.brand.name}</span>
              </div>
            )}

            {/* Contact Info */}
            <div className='flex flex-col items-start justify-start text-sm py-2'>
              {contactEmail && (
                <div className='flex items-center text-base text-gray-500 py-2'>
                  <svg
                    className='w-6 h-6 text-blue-300'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                  <span className='mx-2'>{contactEmail.label}</span>
                </div>
              )}

              {contactPhone && (
                <div className='flex items-center text-base text-gray-500 py-2'>
                  <svg
                    className='w-6 h-6 text-blue-300'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                  <span className='mx-2'>{contactPhone.label}</span>
                </div>
              )}
            </div>

            {/* 社交媒体 */}
            {footer.social && footer.social.length > 0 && (
              <div className='flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 mt-auto'>
                <div className='flex items-center justify-center space-x-4 self-end'>
                  {githubLink && (
                    <a href={githubLink.url} aria-label={githubLink.label} target='_blank' rel='noopener noreferrer'>
                      <VscGithubInverted className='w-7 h-7 text-gray-500 mr-2' />
                    </a>
                  )}
                  {tiktokLink && (
                    <a href={tiktokLink.url} aria-label={tiktokLink.label} target='_blank' rel='noopener noreferrer'>
                      <AiFillTikTok className='w-8 h-8 text-gray-500 mr-2' />
                    </a>
                  )}
                  {wechatLink && (
                    <a href={wechatLink.url} aria-label={wechatLink.label} target='_blank' rel='noopener noreferrer'>
                      <AiFillWechatWork className='w-8 h-8 text-gray-500 mr-2' />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 链接区 - 右侧 */}
          <div className='flex h-full flex-col md:flex-row basis-[62%] justify-between pt-1'>
            {footer.sections.map((section) => (
              <div key={section.title} className='w-full'>
                <h3 className='text-lg font-semibold mb-6 text-gray-500'>{section.title}</h3>
                <ul className='space-y-3'>
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className='text-gray-600 hover:text-blue-700 transition-colors duration-300'
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

        {/* 底部信息 */}
        <div className='py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
          <div className='flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 text-sm text-gray-500'>
            {footer.copyright && <p>{footer.copyright}</p>}

            {footer.legal && footer.legal.length > 0 && (
              <div className='flex space-x-6'>
                {footer.legal.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className='hover:text-blue-700 transition-colors duration-300'
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {footer.compliance && footer.compliance.length > 0 && (
            <div className='flex items-center space-x-4 text-sm text-gray-500'>
              {footer.compliance.map((item, index) => (
                <span key={item.label}>
                  {index > 0 && <span className='mr-4'>|</span>}
                  {item.href ? (
                    <a
                      href={item.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:text-blue-700'
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}