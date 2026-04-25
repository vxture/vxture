'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Link } from '@/lib/i18n/navigation';
import ThemedHeroImage from './ThemedHeroImage';

type Pillar = {
  icon: IconName;
  title: string;
  description: string;
};

type Step = {
  title: string;
  description: string;
};

type Capability = {
  icon: IconName;
  title: string;
  description: string;
};

const ABOUT_HERO_IMAGE = {
  light: '/images/herosection/banner-hero-poster-light-01.png',
  dark: '/images/herosection/banner-hero-poster-dark-01.png',
};

export default function AboutUsPage() {
  const t = useTranslations('company.about');
  const highlights = t.raw('hero.highlights') as string[];
  const pillars = t.raw('positioning.items') as Pillar[];
  const steps = t.raw('method.steps') as Step[];
  const capabilities = t.raw('capabilities.items') as Capability[];
  const principles = t.raw('principles.items') as string[];

  return (
    <div className='min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100'>
      <section className='relative flex min-h-[72vh] items-end overflow-hidden bg-blue-50 pt-20 dark:bg-slate-950'>
        <ThemedHeroImage
          lightSrc={ABOUT_HERO_IMAGE.light}
          darkSrc={ABOUT_HERO_IMAGE.dark}
          alt={t('hero.imageAlt')}
          className='saturate-125'
        />

        <div className='relative mx-auto grid w-full max-w-7xl gap-10 px-6 pb-14 pt-24 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 xl:max-w-screen-2xl'>
          <div className='max-w-3xl'>
            <p className='mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-cyan-200'>
              {t('hero.eyebrow')}
            </p>
            <h1 className='text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-6xl'>
              {t('hero.title')}
            </h1>
            <p className='mt-6 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-200'>
              {t('hero.description')}
            </p>
            <div className='mt-8 flex flex-wrap gap-3'>
              {highlights.map((item) => (
                <span
                  key={item}
                  className='rounded-full border border-blue-100 bg-white/70 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-900/5 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-slate-100'
                >
                  {item}
                </span>
              ))}
            </div>
            <div className='mt-10 flex flex-wrap items-center gap-4'>
              <Link
                href='/signin'
                className='inline-flex h-11 items-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500'
              >
                {t('hero.primaryAction')}
              </Link>
              <a
                href='#about-positioning'
                className='inline-flex h-11 items-center rounded-md border border-blue-200 bg-white/60 px-5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-white dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
              >
                {t('hero.secondaryAction')}
              </a>
            </div>
          </div>

          <aside className='self-end rounded-lg border border-blue-100 bg-white/72 p-5 shadow-lg shadow-blue-950/8 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/52'>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('hero.panelTitle')}</p>
            <p className='mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300'>
              {t('hero.panelDescription')}
            </p>
          </aside>
        </div>
      </section>

      <section id='about-positioning' className='bg-white py-16 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8 xl:max-w-screen-2xl'>
          <div className='max-w-3xl'>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('positioning.eyebrow')}</p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('positioning.title')}</h2>
            <p className='mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('positioning.description')}
            </p>
          </div>

          <div className='mt-10 grid gap-4 md:grid-cols-3'>
            {pillars.map((item) => (
              <article
                key={item.title}
                className='rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-200'>
                  <Icon name={item.icon} className='h-5 w-5' />
                </div>
                <h3 className='mt-5 text-base font-semibold text-slate-950 dark:text-white'>{item.title}</h3>
                <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='border-y border-slate-100 bg-linear-to-b from-blue-50 to-white py-16 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950'>
        <div className='mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[34%_1fr] lg:px-8 xl:max-w-screen-2xl'>
          <div>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('method.eyebrow')}</p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('method.title')}</h2>
            <p className='mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('method.description')}
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            {steps.map((step, index) => (
              <article
                key={step.title}
                className='rounded-lg border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'
              >
                <p className='text-xs font-semibold text-blue-600 dark:text-blue-300'>
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className='mt-3 text-base font-semibold text-slate-950 dark:text-white'>{step.title}</h3>
                <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-white py-16 dark:bg-slate-950'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8 xl:max-w-screen-2xl'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('capabilities.eyebrow')}</p>
              <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('capabilities.title')}</h2>
            </div>
            <p className='max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('capabilities.description')}
            </p>
          </div>

          <div className='mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {capabilities.map((item) => (
              <article
                key={item.title}
                className='rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900'
              >
                <Icon name={item.icon} className='h-5 w-5 text-blue-600 dark:text-blue-300' />
                <h3 className='mt-4 text-base font-semibold text-slate-950 dark:text-white'>{item.title}</h3>
                <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-slate-50 py-14 dark:bg-slate-900'>
        <div className='mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[34%_1fr] lg:px-8 xl:max-w-screen-2xl'>
          <div>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('principles.eyebrow')}</p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('principles.title')}</h2>
          </div>
          <div className='grid gap-3 md:grid-cols-3'>
            {principles.map((item) => (
              <div
                key={item}
                className='rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-white py-14 dark:bg-slate-950'>
        <div className='mx-auto flex max-w-7xl flex-col gap-5 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:max-w-screen-2xl'>
          <div>
            <h2 className='text-2xl font-bold text-slate-950 dark:text-white'>{t('cta.title')}</h2>
            <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('cta.description')}
            </p>
          </div>
          <Link
            href='/signin'
            className='inline-flex h-11 w-max items-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500'
          >
            {t('cta.action')}
          </Link>
        </div>
      </section>
    </div>
  );
}
