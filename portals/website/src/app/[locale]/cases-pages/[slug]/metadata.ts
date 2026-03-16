/**
 * 案例详情页元数据生成器
 * @package @vxture/website
 * @layer Presentation
 */

import type { Metadata } from 'next';
import { CASES_DATA } from '@/data/cases/cases.data';

interface CaseMetadataParams {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CaseMetadataParams): Promise<Metadata> {
  const { slug } = params;
  const caseItem = CASES_DATA.items.find((item) => item.slug === slug);

  if (!caseItem) {
    return {
      title: 'Case Not Found',
      description: 'The requested case study was not found.',
    };
  }

  return {
    title: caseItem.title,
    description: caseItem.description.slice(0, 160),
    keywords: caseItem.tags.join(', '),
    openGraph: {
      title: caseItem.title,
      description: caseItem.description.slice(0, 160),
      images: [
        {
          url: caseItem.cover.url,
          width: 1200,
          height: 630,
          alt: caseItem.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: caseItem.title,
      description: caseItem.description.slice(0, 160),
      images: [caseItem.cover.url],
    },
  };
}
