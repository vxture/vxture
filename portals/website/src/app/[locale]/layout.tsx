/**
 * [locale]/layout.tsx - 国际化布局
 *
 * 职责：
 * - 验证 locale 参数
 * - 提供 next-intl Provider
 * - 加载翻译消息
 * - 渲染通知组件
 *
 * 注意：<html> 和 <body> 标签必须在根布局 src/app/layout.tsx 中
 *
 * @package @vxture/website
 * @layer Presentation
 * @category Pages
 */

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import Notifications from '@/components/ui/Notifications';
import type { Locale } from '@vxture/shared';

type Props = {
  children: React.ReactNode;
  params: { locale: Locale };
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // 确保 locale 是有效的
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // 获取翻译消息
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Notifications />
      {children}
    </NextIntlClientProvider>
  );
}
