'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { HEADER_DATA } from '@/data/layout/header.data';
import { Link } from '@/lib/i18n/navigation';

export function AuthHeader() {
  const t = useTranslations('layout.header');

  return (
    <header className='vx-auth-header'>
      <div className='vx-auth-header-inner'>
        <Link
          href={HEADER_DATA.logo.href}
          aria-label={t(HEADER_DATA.logo.labelKey)}
          className='vx-auth-brand'
        >
          <Image
            src={HEADER_DATA.logo.image}
            alt={t(HEADER_DATA.logo.altKey)}
            width={24}
            height={24}
            className='object-contain'
          />
          <h1 className='vx-auth-brand-name'>
            {t(HEADER_DATA.logo.labelKey)}
          </h1>
        </Link>
      </div>
    </header>
  );
}

export function AuthFooter() {
  const t = useTranslations('layout.footer');

  return (
    <footer className='vx-auth-footer'>
      <div className='vx-auth-footer-inner'>
        <span>© 2026 vxture Inc. All rights reserved.</span>
        <nav className='vx-auth-footer-links' aria-label='Legal links'>
          <Link href='/legal/privacy'>{t('legal.privacy')}</Link>
          <Link href='/legal/terms'>{t('legal.terms')}</Link>
          <Link href='/legal/cookies'>{t('legal.cookies')}</Link>
        </nav>
      </div>
    </footer>
  );
}
