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

type Pillar = {
  icon: IconName;
  title: string;
  description: string;
  points: string[];
};

type FlowStep = {
  title: string;
  description: string;
};

type AgentCapability = {
  icon: IconName;
  title: string;
  description: string;
};

type Scenario = {
  title: string;
  description: string;
};

type Practice = {
  label: string;
  title: string;
  description: string;
  tags: string[];
};

const PRACTICE_IMAGE = '/images/casessection/case-intro-03.jpg';

export default function EmergencySolutionPage() {
  const t = useTranslations('solutions');
  const highlights = t.raw('hero.highlights') as string[];
  const metrics = t.raw('hero.metrics') as Metric[];
  const intelligenceItems = t.raw('hero.intelligence.items') as string[];
  const pillars = t.raw('architecture.items') as Pillar[];
  const flow = t.raw('flow.steps') as FlowStep[];
  const agents = t.raw('agents.items') as AgentCapability[];
  const scenarios = t.raw('scenarios.items') as Scenario[];
  const practices = t.raw('practice.items') as Practice[];

  return (
    <div className='min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100'>
            <section className='vx-hero-section'>
        <AnimatedHeroBg />
        <div className='vx-hero-content'>
          <div className='max-w-3xl'>
            <p className='mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-cyan-200'>{t('hero.eyebrow')}</p>
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
                href='#solution-architecture'
                className='inline-flex h-11 items-center rounded-md border border-blue-200 bg-white/60 px-5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-white dark:border-white/35 dark:bg-transparent dark:text-white dark:hover:border-white dark:hover:bg-white/10'
              >
                {t('hero.secondaryAction')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id='solution-architecture'
        className='vx-section-odd'
      >
        <div className='mx-auto max-w-7xl px-6 lg:px-8 xl:max-w-screen-2xl'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>
                {t('architecture.eyebrow')}
              </p>
              <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>
                {t('architecture.title')}
              </h2>
            </div>
            <p className='max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('architecture.description')}
            </p>
          </div>

          <div className='mt-10 grid gap-4 lg:grid-cols-3'>
            {pillars.map((pillar) => (
              <article
                key={pillar.title}
                className='rounded-lg border border-blue-100 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/30'
              >
                <div className='mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-200'>
                  <Icon name={pillar.icon} className='h-5 w-5' />
                </div>
                <h3 className='text-lg font-semibold text-slate-950 dark:text-white'>{pillar.title}</h3>
                <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                  {pillar.description}
                </p>
                <ul className='mt-5 space-y-2'>
                  {pillar.points.map((point) => (
                    <li key={point} className='flex gap-2 text-sm text-slate-600 dark:text-slate-300'>
                      <Icon name='check' className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='border-y border-slate-100 bg-white py-16 dark:border-slate-800 dark:bg-slate-950'>
        <div className='mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[30%_1fr] lg:px-8 xl:max-w-screen-2xl'>
          <div>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('flow.eyebrow')}</p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('flow.title')}</h2>
            <p className='mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('flow.description')}
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {flow.map((step, index) => (
              <article
                key={step.title}
                className='relative min-h-40 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900'
              >
                <p className='text-xs font-semibold text-blue-600 dark:text-blue-300'>
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className='mt-3 text-base font-semibold text-slate-950 dark:text-white'>{step.title}</h3>
                <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-slate-50 py-16 dark:bg-slate-900'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8 xl:max-w-screen-2xl'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('agents.eyebrow')}</p>
              <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('agents.title')}</h2>
            </div>
            <p className='max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('agents.description')}
            </p>
          </div>

          <div className='mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {agents.map((agent) => (
              <article
                key={agent.title}
                className='rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950'
              >
                <div className='flex items-start gap-4'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-200'>
                    <Icon name={agent.icon} className='h-5 w-5' />
                  </div>
                  <div>
                    <h3 className='text-base font-semibold text-slate-950 dark:text-white'>{agent.title}</h3>
                    <p className='mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                      {agent.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-white py-16 dark:bg-slate-950'>
        <div className='mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[38%_1fr] lg:px-8 xl:max-w-screen-2xl'>
          <div>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('scenarios.eyebrow')}</p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('scenarios.title')}</h2>
            <p className='mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('scenarios.description')}
            </p>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            {scenarios.map((scenario) => (
              <article
                key={scenario.title}
                className='rounded-lg border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-400/15 dark:bg-blue-950/20'
              >
                <h3 className='text-base font-semibold text-slate-950 dark:text-white'>{scenario.title}</h3>
                <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                  {scenario.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='border-t border-slate-100 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900'>
        <div className='mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[42%_1fr] lg:px-8 xl:max-w-screen-2xl'>
          <div className='relative min-h-[420px] overflow-hidden rounded-lg'>
            <Image
              src={PRACTICE_IMAGE}
              alt={t('practice.imageAlt')}
              fill
              sizes='(min-width: 1024px) 42vw, 100vw'
              className='object-cover'
            />
            <div className='absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-transparent' />
            <div className='absolute bottom-0 p-6 text-white'>
              <p className='text-sm font-semibold text-cyan-200'>{t('practice.imageLabel')}</p>
              <p className='mt-2 max-w-md text-2xl font-semibold'>{t('practice.imageTitle')}</p>
            </div>
          </div>

          <div>
            <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('practice.eyebrow')}</p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('practice.title')}</h2>
            <p className='mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('practice.description')}
            </p>

            <div className='mt-8 space-y-4'>
              {practices.map((practice) => (
                <article
                  key={practice.title}
                  className='rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950'
                >
                  <p className='text-xs font-semibold text-blue-600 dark:text-blue-300'>{practice.label}</p>
                  <h3 className='mt-2 text-base font-semibold text-slate-950 dark:text-white'>{practice.title}</h3>
                  <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                    {practice.description}
                  </p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {practice.tags.map((tag) => (
                      <span
                        key={tag}
                        className='rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/35 dark:text-blue-200'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
