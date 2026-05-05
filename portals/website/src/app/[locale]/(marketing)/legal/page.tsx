import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';

type LegalPolicySummary = {
  label: string;
  title: string;
  summary: string;
  updatedAt: string;
};

const POLICY_KEYS = ['terms', 'privacy', 'copyright', 'brand', 'cookies'] as const;

export default async function LegalIndexPage() {
  const t = await getTranslations('legal');

  return (
    <section className="vx-legal-page">
      <div className="vx-legal-container">
        <header className="vx-legal-hero">
          <span>{t('eyebrow')}</span>
          <h1>{t('index.title')}</h1>
          <p>{t('index.description')}</p>
        </header>

        <div className="vx-legal-grid" aria-label={t('index.title')}>
          {POLICY_KEYS.map((key) => {
            const policy = t.raw(`policies.${key}`) as LegalPolicySummary;
            return (
              <Link key={key} href={`/legal/${key}`} className="vx-legal-card">
                <span>{policy.label}</span>
                <strong>{policy.title}</strong>
                <p>{policy.summary}</p>
                <small>{t('updatedAt', { date: policy.updatedAt })}</small>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
