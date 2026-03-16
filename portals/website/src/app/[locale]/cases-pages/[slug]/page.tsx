/**
 * 案例详情页面路由
 * @package @vxture/website
 * @layer Presentation
 * @category Pages - Cases
 */

import CaseDetail from '@/components/cases/CaseDetail';

interface CaseDetailRouteProps {
  params: {
    slug: string;
  };
}

export default function CaseDetailRoutePage({ params }: CaseDetailRouteProps) {
  return <CaseDetail slug={params.slug} />;
}
