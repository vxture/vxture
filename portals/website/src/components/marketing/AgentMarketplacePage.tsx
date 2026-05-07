'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Link } from '@/lib/i18n/navigation';
import AnimatedHeroBg from './AnimatedHeroBg';

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

export default function AgentMarketplacePage() {
  const t = useTranslations('appcenter');
  const [activeIndustry, setActiveIndustry] = useState('all');
  const highlights = t.raw('hero.highlights') as string[];
  const metrics = t.raw('hero.metrics') as Metric[];
  const filters = t.raw('filters.items') as FilterItem[];
  const agents = t.raw('agents.items') as AgentItem[];

  const visibleAgents = useMemo(() => {
    if (activeIndustry === 'all') {
      return agents;
    }

    return agents.filter((agent) => agent.industries.includes(activeIndustry));
  }, [activeIndustry, agents]);

  return (
    <div className='min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100'>
            <section className='vx-hero-section'>
        <AnimatedHeroBg />
        <div className='vx-hero-content'>
          <div className='max-w-3xl'>
            <p className='mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-cyan-200'>{t('hero.eyebrow')}</p>
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
                href='#agent-marketplace'
                className='inline-flex h-11 items-center rounded-md border border-blue-200 bg-white/60 px-5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-white dark:border-white/35 dark:bg-transparent dark:text-white dark:hover:border-white dark:hover:bg-white/10'
              >
                {t('hero.secondaryAction')}
              </a>
            </div>
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
