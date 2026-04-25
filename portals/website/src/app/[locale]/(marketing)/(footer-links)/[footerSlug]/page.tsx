import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { FooterPlaceholderPage } from '@/components/marketing/FooterPlaceholderPage';
import { FOOTER_DATA } from '@/data/layout/footer.data';

type FooterLink = {
  href: string;
  labelKey: string;
};

type FooterPlaceholderRouteProps = {
  params: {
    footerSlug: string;
  };
};

const FOOTER_PLACEHOLDER_LINKS: FooterLink[] = [
  ...FOOTER_DATA.sections.flatMap((section) => section.links),
  ...FOOTER_DATA.legal,
].filter((link) =>
  [
    '/docs',
    '/faq',
    '/support',
    '/insights',
    '/certifications',
    '/careers',
    '/contact',
    '/terms-service',
    '/privacy-policy',
    '/copyright-policy',
    '/brand-policy',
    '/cookies-policy',
  ].includes(link.href),
);

function getLinkBySlug(slug: string) {
  return FOOTER_PLACEHOLDER_LINKS.find((link) => link.href.slice(1) === slug);
}

export const dynamicParams = false;

export function generateStaticParams() {
  return FOOTER_PLACEHOLDER_LINKS.map((link) => ({
    footerSlug: link.href.slice(1),
  }));
}

export default async function FooterPlaceholderRoutePage({ params }: FooterPlaceholderRouteProps) {
  const link = getLinkBySlug(params.footerSlug);

  if (!link) {
    notFound();
  }

  const t = await getTranslations('layout.footer');

  return <FooterPlaceholderPage title={t(link.labelKey)} />;
}
