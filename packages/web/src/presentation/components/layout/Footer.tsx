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
import { FiMail, FiPhone, FiX } from 'react-icons/fi';
import { SiGithub, SiWechat, SiLinkedin } from 'react-icons/si';
import { useState, useRef } from 'react';

export default function Footer() {
  // 1️⃣ 获取 Footer 数据
  const { data: footerData, error } = useFooter();

  // 2️⃣ 二维码相关状态（必须在条件判断前定义）
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [qrCodePosition, setQrCodePosition] = useState({ x: 0, y: 0 });
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // 3️⃣ 数据规范化：保证前端渲染安全完整
  const displayData = normalizeFooterData(error || !footerData ? undefined : footerData);

  // 4️⃣ 如果 Footer 被禁用，不渲染
  if (!displayData.enabled) return null;

  // 5️⃣ 处理微信图标点击事件
  const handleWechatClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // 阻止默认跳转行为
    setQrCodePosition({ x: e.clientX, y: e.clientY });
    setQrCodeVisible(true);
  };

  // 6️⃣ 处理关闭按钮点击事件
  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setQrCodeVisible(false);
  };

  // 7️⃣ 处理点击二维码外部区域
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (qrCodeRef.current && !qrCodeRef.current.contains(e.target as Node)) {
      setQrCodeVisible(false);
    }
  };

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
                {displayData.brand.shortname}
              </span>
            </div>
            {/* 品牌描述 */}
            {displayData.brand.description && (
              <p className='text-sm text-gray-600 mb-4'>{displayData.brand.description}</p>
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
                  <a
                    key={social.name}
                    href={social.icon === 'wechat' ? '#' : social.href}
                    aria-label={social.ariaLabel}
                    className='text-gray-600 hover:text-blue-600 transition-colors'
                    target={social.icon === 'wechat' ? undefined : '_blank'}
                    rel={social.icon === 'wechat' ? undefined : 'noopener noreferrer'}
                    onClick={social.icon === 'wechat' ? handleWechatClick : undefined}
                  >
                    {social.icon === 'github' && <SiGithub className='w-5 h-5' />}
                    {social.icon === 'linkedin' && <SiLinkedin className='w-5 h-5' />}
                    {social.icon === 'wechat' && <SiWechat className='w-5 h-5' />}
                  </a>
                ))}
              </div>
            )}

            {/* 微信二维码 */}
            {qrCodeVisible && (
              <div
                className='fixed inset-0 bg-black/50 z-50 qr-code-container'
                onClick={handleOutsideClick}
              >
                <div
                  ref={qrCodeRef}
                  className='relative bg-white p-4 rounded-lg shadow-2xl'
                  style={{
                    position: 'fixed',
                    left: qrCodePosition.x,
                    top: qrCodePosition.y,
                    transform: 'translate(0, -100%)',
                  }}
                >
                  {/* 关闭按钮 */}
                  <button
                    onClick={handleCloseClick}
                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors'
                    aria-label='关闭二维码'
                  >
                    <FiX className='w-4 h-4' />
                  </button>

                  {/* 二维码图片 */}
                  <img
                    src='/images/footer/WeChatOfficialAccounts.png'
                    alt='微信公众号二维码'
                    className='w-64 h-64'
                  />

                  {/* 二维码说明 */}
                  <div className='mt-2 text-center text-sm text-gray-600'>
                    扫描二维码关注微信公众号
                  </div>
                </div>
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
