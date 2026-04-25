'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { HEADER_DATA } from '@/data/layout/header.data';
import { Link } from '@/lib/i18n/navigation';

export function AuthHeader() {
  const t = useTranslations('layout.header');

  return (
    <header className='vx-auth-header'>
      <div className='max-w-7xl xl:max-w-screen-2xl 2xl:max-w-400 mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <Link
            href={HEADER_DATA.logo.href}
            aria-label={t(HEADER_DATA.logo.labelKey)}
            className='shrink-0 flex items-center space-x-2 rounded-md transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
          >
            <Image
              src={HEADER_DATA.logo.image}
              alt={t(HEADER_DATA.logo.altKey)}
              width={24}
              height={24}
              className='object-contain'
            />
            <h1 className='text-2xl font-bold text-gray-800 dark:text-slate-200'>
              {t(HEADER_DATA.logo.labelKey)}
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function AuthFooter() {
  return (
    <footer className='vx-auth-footer'>
      <span>© 2026 vxture Inc. All rights reserved.</span>
      <nav className='vx-auth-footer-links' aria-label='Legal links'>
        <a href='#privacy'>Privacy Policy</a>
        <a href='#terms'>Terms of Service</a>
        <a href='#security'>Security</a>
        <a href='#status'>Status</a>
      </nav>
    </footer>
  );
}
