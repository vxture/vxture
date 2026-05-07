'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Link } from '@/lib/i18n/navigation';
import Image from 'next/image';
import AnimatedHeroBg from './AnimatedHeroBg';

type Metric = {
  label: string;
  value: string;
};

type Capability = {
  icon: IconName;
  title: string;
  description: string;
};

type Practice = {
  image: string;
  imageAlt: string;
  customer: string;
  title: string;
  subtitle: string;
  demand: string;
  architecture: string;
  evaluation: string;
  technologies: string[];
};

type Dimension = {
  icon: IconName;
  title: string;
  description: string;
};

export default function BestPracticePage() {
  const t = useTranslations('cases');
  const highlights = t.raw('page.hero.highlights') as string[];
  const metrics = t.raw('page.hero.metrics') as Metric[];
  const capabilities = t.raw('page.capabilities.items') as Capability[];
  const dimensions = t.raw('page.dimensions.items') as Dimension[];
  const practices = t.raw('page.practices.items') as Practice[];

  return (
    <div className='min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100'>
            <section className='vx-hero-section'>
        <AnimatedHeroBg />
        <div className='vx-hero-content'>
          <div className='max-w-3xl'>
            <p className='mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-cyan-200'>{t('page.hero.eyebrow')}</p>
            <h1 className='text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-6xl'>{t('page.hero.title')}</h1>
            <p className='mt-5 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-200'>{t('page.hero.description')}</p>
            <div className='mt-6 flex flex-wrap gap-3'>
              {highlights.map((item) => (
                <span
                  key={item}
                  className='rounded-full border border-blue-100 bg-white/70 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-900/5 backdrop-blur dark:border-white/20 dark:bg-white/10 dark:text-slate-100'
                >
                  {item}
                </span>
              ))}
            </div>
            <div className='mt-8 flex flex-wrap items-center gap-4'>
              <Link
                href='/signin'
                className='inline-flex h-11 items-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500'
              >
                {t('page.hero.primaryAction')}
              </Link>
              <a
                href='#practice-list'
                className='inline-flex h-11 items-center rounded-md border border-blue-200 bg-white/60 px-5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-white dark:border-white/35 dark:bg-transparent dark:text-white dark:hover:border-white dark:hover:bg-white/10'
              >
                {t('page.hero.secondaryAction')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className='vx-section-odd'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8 xl:max-w-screen-2xl'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>
                {t('page.capabilities.eyebrow')}
              </p>
              <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>
                {t('page.capabilities.title')}
              </h2>
            </div>
            <p className='max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('page.capabilities.description')}
            </p>
          </div>

          <div className='mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {capabilities.map((item) => (
              <article
                key={item.title}
                className='rounded-lg border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/30'
              >
                <div className='mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-200'>
                  <Icon name={item.icon} className='h-5 w-5' />
                </div>
                <h3 className='text-base font-semibold text-slate-950 dark:text-white'>{item.title}</h3>
                <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='border-y border-slate-100 bg-white py-14 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[32%_1fr] lg:px-8 xl:max-w-screen-2xl'>
          <div>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>
              {t('page.dimensions.eyebrow')}
            </p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>
              {t('page.dimensions.title')}
            </h2>
            <p className='mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('page.dimensions.description')}
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            {dimensions.map((item) => (
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

      <section id='practice-list' className='bg-slate-50 py-16 dark:bg-slate-900'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8 xl:max-w-screen-2xl'>
          <div className='max-w-3xl'>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>
              {t('page.practices.eyebrow')}
            </p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>
              {t('page.practices.title')}
            </h2>
            <p className='mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('page.practices.description')}
            </p>
          </div>

          <div className='mt-10 space-y-6'>
            {practices.map((practice) => (
              <article
                key={practice.title}
                className='grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[36%_1fr]'
              >
                <div className='relative min-h-[280px]'>
                  <Image
                    src={practice.image}
                    alt={practice.imageAlt}
                    fill
                    sizes='(min-width: 1024px) 36vw, 100vw'
                    className='object-cover'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-slate-950/72 via-slate-950/8 to-transparent' />
                  <div className='absolute bottom-0 p-5 text-white'>
                    <p className='text-xs font-semibold text-cyan-200'>{practice.customer}</p>
                    <p className='mt-2 text-xl font-semibold'>{practice.title}</p>
                  </div>
                </div>

                <div className='p-5 lg:p-6'>
                  <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>
                    {practice.subtitle}
                  </p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {practice.technologies.map((technology) => (
                      <span
                        key={technology}
                        className='rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/35 dark:text-blue-200'
                      >
                        {technology}
                      </span>
                    ))}
                  </div>

                  <div className='mt-6 grid gap-4 xl:grid-cols-3'>
                    <div>
                      <div className='flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white'>
                        <Icon name='building-library' className='h-4 w-4 text-blue-600 dark:text-blue-300' />
                        {t('page.practices.demandLabel')}
                      </div>
                      <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                        {practice.demand}
                      </p>
                    </div>
                    <div>
                      <div className='flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white'>
                        <Icon name='workflow' className='h-4 w-4 text-blue-600 dark:text-blue-300' />
                        {t('page.practices.architectureLabel')}
                      </div>
                      <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                        {practice.architecture}
                      </p>
                    </div>
                    <div>
                      <div className='flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white'>
                        <Icon name='chat-circle' className='h-4 w-4 text-blue-600 dark:text-blue-300' />
                        {t('page.practices.evaluationLabel')}
                      </div>
                      <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                        {practice.evaluation}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-white py-14 dark:bg-slate-950'>
        <div className='mx-auto flex max-w-7xl flex-col gap-5 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:max-w-screen-2xl'>
          <div>
            <h2 className='text-2xl font-bold text-slate-950 dark:text-white'>{t('page.cta.title')}</h2>
            <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('page.cta.description')}
            </p>
          </div>
          <Link
            href='/signin'
            className='inline-flex h-11 w-max items-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500'
          >
            {t('page.cta.action')}
          </Link>
        </div>
      </section>
    </div>
  );
}
