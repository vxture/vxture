import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';

type LegalPolicyKey = 'terms' | 'privacy' | 'copyright' | 'brand' | 'cookies';

type LegalPolicy = {
  label: string;
  title: string;
  summary: string;
  updatedAt: string;
  notice: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

type LegalPolicyPageProps = {
  params: {
    policy: string;
  };
};

const POLICY_KEYS = ['terms', 'privacy', 'copyright', 'brand', 'cookies'] as const;

function isPolicyKey(value: string): value is LegalPolicyKey {
  return POLICY_KEYS.includes(value as LegalPolicyKey);
}

export const dynamicParams = false;

export function generateStaticParams() {
  return POLICY_KEYS.map((policy) => ({ policy }));
}

export default async function LegalPolicyPage({ params }: LegalPolicyPageProps) {
  if (!isPolicyKey(params.policy)) {
    notFound();
  }

  const t = await getTranslations('legal');
  const policy = t.raw(`policies.${params.policy}`) as LegalPolicy;

  return (
    <article className="vx-legal-page">
      <div className="vx-legal-container vx-legal-document">
        <nav className="vx-legal-breadcrumb" aria-label={t('breadcrumbLabel')}>
          <Link href="/legal">{t('index.title')}</Link>
          <span>/</span>
          <span>{policy.label}</span>
        </nav>

        <header className="vx-legal-hero vx-legal-document__hero">
          <span>{policy.label}</span>
          <h1>{policy.title}</h1>
          <p>{policy.summary}</p>
          <small>{t('updatedAt', { date: policy.updatedAt })}</small>
        </header>

        <aside className="vx-legal-notice">{policy.notice}</aside>

        <div className="vx-legal-sections">
          {policy.sections.map((section) => (
            <section key={section.heading} className="vx-legal-section">
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
