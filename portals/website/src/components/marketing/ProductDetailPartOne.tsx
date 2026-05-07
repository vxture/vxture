'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@vxture/design-system';
import { Link } from '@/lib/i18n/navigation';
import AnimatedHeroBg from './AnimatedHeroBg';

type Metric = {
  label: string;
  value: string;
};

type Capability = {
  title: string;
  description: string;
  points: string[];
};

type WorkflowStep = {
  title: string;
  description: string;
};

type Scenario = {
  title: string;
  description: string;
};

export default function ProductDetailPartOne() {
  const t = useTranslations('products');
  const metrics = t.raw('hero.metrics') as Metric[];
  const highlights = t.raw('hero.highlights') as string[];
  const capabilities = t.raw('capabilities.items') as Capability[];
  const workflow = t.raw('workflow.steps') as WorkflowStep[];
  const scenarios = t.raw('scenarios.items') as Scenario[];

  return (
    <div className='min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100'>
            <section className='vx-hero-section'>
        <AnimatedHeroBg />
        <div className='vx-hero-content'>
          <div className='max-w-3xl'>
            <p className='mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-200'>{t('hero.eyebrow')}</p>
            <h1 className='text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-6xl'>{t('hero.title')}</h1>
            <p className='mt-5 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-200'>{t('hero.description')}</p>
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
                {t('hero.primaryAction')}
              </Link>
              <a
                href='#product-capabilities'
                className='inline-flex h-11 items-center rounded-md border border-blue-200 bg-white/60 px-5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-white dark:border-white/35 dark:bg-transparent dark:text-white dark:hover:border-white dark:hover:bg-white/10'
              >
                {t('hero.secondaryAction')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id='product-capabilities'
        className='vx-section-odd'
      >
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
            {capabilities.map((item, index) => (
              <article
                key={item.title}
                className='rounded-lg border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/30'
              >
                <div className='mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-200'>
                  <span className='text-sm font-bold'>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className='text-base font-semibold text-slate-950 dark:text-white'>{item.title}</h3>
                <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>{item.description}</p>
                <ul className='mt-5 space-y-2'>
                  {item.points.map((point) => (
                    <li key={point} className='flex gap-2 text-sm text-slate-600 dark:text-slate-300'>
                      <Icon name='check' className='mt-0.5 h-4 w-4 text-blue-500' />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='border-y border-slate-100 bg-white py-14 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[34%_1fr] lg:px-8 xl:max-w-screen-2xl'>
          <div>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('workflow.eyebrow')}</p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('workflow.title')}</h2>
            <p className='mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('workflow.description')}
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-4'>
            {workflow.map((step, index) => (
              <div key={step.title} className='relative border-l border-blue-200 pl-5 dark:border-blue-900/70'>
                <div className='absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-blue-500' />
                <p className='text-xs font-semibold text-blue-600 dark:text-blue-300'>
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className='mt-2 text-base font-semibold text-slate-950 dark:text-white'>{step.title}</h3>
                <p className='mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300'>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-slate-50 py-16 dark:bg-slate-900'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8 xl:max-w-screen-2xl'>
          <div className='grid gap-10 lg:grid-cols-[36%_1fr]'>
            <div>
              <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('scenarios.eyebrow')}</p>
              <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('scenarios.title')}</h2>
              <p className='mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                {t('scenarios.description')}
              </p>
            </div>
            <div className='grid gap-4 md:grid-cols-3'>
              {scenarios.map((scenario) => (
                <article
                  key={scenario.title}
                  className='rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950'
                >
                  <h3 className='text-base font-semibold text-slate-950 dark:text-white'>{scenario.title}</h3>
                  <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>{scenario.description}</p>
                </article>
              ))}
            </div>
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
