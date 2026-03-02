// FooterDefaults.ts
import type { FooterContent } from '@/domain/layout/footer.model';

/**
 * 网站全局 Footer 默认值
 * 用于 fallback 或数据规范化
 */
export const FALLBACK_FOOTER: FooterContent = {
  key: 'footer',
  enabled: true,
  brand: {
    name: 'Vxture Studio',
    shortname: 'vxture',
    logo: '/icons/favicon.ico',
    website: 'vxture.ai',
    description: '人工智能自然探索工作室',
    foundedYear: '2024',
    address: '陕西省西安市高新区科技路100号',
    timezone: 'GMT+8',
  },
  contact: {
    sales: { phone: '400-888-2345', email: 'sales@vxture.com' },
    service: { phone: '400-888-6789', email: 'support@vxture.com' },
    chat: { link: '/livechat', enabled: true },
  },
  social: [],
  sections: [],
  legal: [],
  icp: {
    label: '备案号',
    text: '00000000',
    link: 'https://beian.miit.gov.cn',
  },
  publicSecurity: {
    label: '公安备案',
    text: '00000000',
    link: 'https://beian.mps.gov.cn',
  },
  copyright: {
    label: 'copyright',
    text: `© ${new Date().getFullYear()} vxture.ai. All rights reserved.`,
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    companyName: 'vxture.ai',
    allRightsReserved: true,
  },
};
