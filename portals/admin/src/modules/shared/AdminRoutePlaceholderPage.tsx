import { notFound } from 'next/navigation';
import { adminNavigationSections } from '@/config/navigation';
import { AdminPlaceholderPage } from './AdminPlaceholderPage';

export function AdminRoutePlaceholderPage({ href }: { href: string }) {
  const match = adminNavigationSections
    .flatMap((section) => section.items.map((item) => ({ section, item })))
    .find(({ item }) => item.href === href);

  if (!match) {
    notFound();
  }

  return <AdminPlaceholderPage item={match.item} sectionTitle={match.section.title} />;
}
