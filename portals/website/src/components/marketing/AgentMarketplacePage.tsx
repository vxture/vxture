'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Link } from '@/lib/i18n/navigation';
import ThemedHeroImage from './ThemedHeroImage';

type Metric = {
  label: string;
  value: string;
};

type FilterItem = {
  id: string;
  label: string;
};

type AgentItem = {
  name: string;
  type: string;
  icon: IconName;
  industries: string[];
  description: string;
  value: string;
  capabilities: string[];
  tags: string[];
};

type SceneLabel = {
  command: string;
  human: string;
  software: string;
  embodied: string;
  data: string;
};

const AGENT_HERO_IMAGE = {
  light: '/images/hero-banners/pixabay-network-light.jpg',
  dark: '/images/hero-banners/pixabay-big-data-dark.jpg',
};

function AgentNode({
  className,
  icon,
  label,
  delay = '0ms',
}: {
  className: string;
  icon: IconName;
  label: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2 rounded-full border border-cyan-300/24 bg-slate-950/62 px-3 py-2 text-xs font-medium text-cyan-50 shadow-lg shadow-blue-950/30 backdrop-blur-md motion-safe:animate-pulse ${className}`}
      style={{ animationDelay: delay }}
    >
      <Icon name={icon} className='h-4 w-4 text-cyan-200' />
      <span>{label}</span>
    </div>
  );
}

function AgentCollaborationScene({ labels }: { labels: SceneLabel }) {
  return (
    <div aria-hidden='true' className='absolute inset-0 overflow-hidden'>
      <div className='absolute left-[6%] top-[18%] h-64 w-64 rounded-full border border-cyan-300/12 motion-safe:animate-spin' style={{ animationDuration: '28s' }} />
      <div className='absolute right-[12%] top-[20%] h-80 w-80 rounded-full border border-blue-300/12 motion-safe:animate-spin' style={{ animationDuration: '34s', animationDirection: 'reverse' }} />

      <div className='absolute left-1/2 top-[48%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20 bg-blue-500/10 backdrop-blur-sm' />
      <div className='absolute left-1/2 top-[48%] flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-200/40 bg-slate-950/70 text-cyan-100 shadow-2xl shadow-cyan-950/40'>
        <Icon name='users' className='h-9 w-9' />
      </div>
      <div className='absolute left-1/2 top-[calc(48%+4.5rem)] -translate-x-1/2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-medium text-cyan-50 backdrop-blur'>
        {labels.human}
      </div>

      <div className='absolute left-[18%] top-[38%] h-px w-[28%] rotate-6 bg-linear-to-r from-cyan-300/0 via-cyan-200/42 to-cyan-300/0' />
      <div className='absolute right-[19%] top-[40%] h-px w-[28%] -rotate-6 bg-linear-to-r from-cyan-300/0 via-cyan-200/42 to-cyan-300/0' />
      <div className='absolute left-[42%] top-[25%] h-[26%] w-px bg-linear-to-b from-cyan-300/0 via-cyan-200/36 to-cyan-300/0' />
      <div className='absolute left-[56%] top-[52%] h-[28%] w-px bg-linear-to-b from-cyan-300/0 via-cyan-200/34 to-cyan-300/0' />

      <AgentNode className='left-[10%] top-[30%]' icon='sparkles' label={labels.software} />
      <AgentNode className='right-[10%] top-[30%]' icon='cube' label={labels.embodied} delay='300ms' />
      <AgentNode className='left-[20%] bottom-[22%]' icon='database' label={labels.data} delay='600ms' />
      <AgentNode className='right-[22%] bottom-[18%]' icon='workflow' label={labels.command} delay='900ms' />

      <div className='absolute left-[31%] top-[39%] h-2 w-2 rounded-full bg-cyan-200 motion-safe:animate-ping' />
      <div className='absolute right-[32%] top-[39%] h-2 w-2 rounded-full bg-blue-200 motion-safe:animate-ping' style={{ animationDelay: '450ms' }} />
      <div className='absolute left-[46%] top-[30%] h-2 w-2 rounded-full bg-cyan-100 motion-safe:animate-ping' style={{ animationDelay: '700ms' }} />
      <div className='absolute left-[54%] bottom-[30%] h-2 w-2 rounded-full bg-blue-100 motion-safe:animate-ping' style={{ animationDelay: '950ms' }} />

      <div className='absolute bottom-8 left-8 right-8 grid grid-cols-5 gap-3 opacity-60'>
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className='h-10 rounded-md border border-cyan-300/10 bg-cyan-200/5 motion-safe:animate-pulse'
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AgentMarketplacePage() {
  const t = useTranslations('appcenter');
  const [activeIndustry, setActiveIndustry] = useState('all');
  const highlights = t.raw('hero.highlights') as string[];
  const metrics = t.raw('hero.metrics') as Metric[];
  const filters = t.raw('filters.items') as FilterItem[];
  const agents = t.raw('agents.items') as AgentItem[];
  const sceneLabels = t.raw('hero.scene') as SceneLabel;

  const visibleAgents = useMemo(() => {
    if (activeIndustry === 'all') {
      return agents;
    }

    return agents.filter((agent) => agent.industries.includes(activeIndustry));
  }, [activeIndustry, agents]);

  return (
    <div className='min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100'>
      <section className='relative flex min-h-[76vh] items-end overflow-hidden pt-20'>
        <ThemedHeroImage
          lightSrc={AGENT_HERO_IMAGE.light}
          darkSrc={AGENT_HERO_IMAGE.dark}
          alt={t('hero.title')}
          className='saturate-125'
        />
        <AgentCollaborationScene labels={sceneLabels} />
        <div className='relative mx-auto w-full max-w-7xl px-6 pb-14 pt-24 lg:px-8 xl:max-w-screen-2xl'>
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
                  className='rounded-full border border-blue-100 bg-white/70 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-900/5 backdrop-blur dark:border-white/20 dark:bg-white/10 dark:text-slate-100'
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
                href='#agent-marketplace'
                className='inline-flex h-11 items-center rounded-md border border-blue-200 bg-white/60 px-5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-white dark:border-white/35 dark:bg-transparent dark:text-white dark:hover:border-white dark:hover:bg-white/10'
              >
                {t('hero.secondaryAction')}
              </a>
            </div>
          </div>

          <div className='mt-12 grid gap-3 sm:grid-cols-3'>
            {metrics.map((metric) => (
              <div key={metric.label} className='border-l border-blue-200 bg-white/70 px-4 py-3 shadow-sm shadow-blue-900/5 backdrop-blur-sm dark:border-white/20 dark:bg-slate-950/24 dark:shadow-none'>
                <p className='text-2xl font-semibold text-slate-950 dark:text-white'>{metric.value}</p>
                <p className='mt-1 text-sm text-slate-600 dark:text-slate-300'>{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id='agent-marketplace' className='bg-linear-to-b from-blue-50 to-white py-16 dark:from-slate-900 dark:to-slate-950'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8 xl:max-w-screen-2xl'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{t('filters.eyebrow')}</p>
              <h2 className='mt-2 text-3xl font-bold text-slate-950 dark:text-white'>{t('filters.title')}</h2>
            </div>
            <p className='max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {t('filters.description')}
            </p>
          </div>

          <div className='mt-8 flex flex-wrap gap-2'>
            {filters.map((filter) => {
              const active = activeIndustry === filter.id;
              return (
                <button
                  key={filter.id}
                  type='button'
                  onClick={() => setActiveIndustry(filter.id)}
                  className={`h-10 rounded-md border px-4 text-sm font-medium transition ${
                    active
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-900/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-200'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className='mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {visibleAgents.map((agent) => (
              <article
                key={agent.name}
                className='flex min-h-[360px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/30'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex items-start gap-4'>
                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-200'>
                      <Icon name={agent.icon} className='h-5 w-5' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-blue-600 dark:text-blue-300'>{agent.type}</p>
                      <h3 className='mt-1 text-lg font-semibold text-slate-950 dark:text-white'>{agent.name}</h3>
                    </div>
                  </div>
                  <span className='rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-950/30 dark:text-cyan-200'>
                    {t('agents.available')}
                  </span>
                </div>

                <p className='mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                  {agent.description}
                </p>
                <div className='mt-5 rounded-md border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-400/15 dark:bg-blue-950/20'>
                  <p className='text-xs font-semibold text-blue-600 dark:text-blue-300'>{t('agents.valueLabel')}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200'>{agent.value}</p>
                </div>

                <ul className='mt-5 space-y-2'>
                  {agent.capabilities.map((capability) => (
                    <li key={capability} className='flex gap-2 text-sm text-slate-600 dark:text-slate-300'>
                      <Icon name='check' className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>

                <div className='mt-auto pt-5'>
                  <div className='flex flex-wrap gap-2'>
                    {agent.tags.map((tag) => (
                      <span
                        key={tag}
                        className='rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href='/signin'
                    className='mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500'
                  >
                    {t('agents.action')}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
