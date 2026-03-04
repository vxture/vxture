// FooterHelpers.ts
import type { FooterContent } from '@/domain/layout/footer.model';
import { FALLBACK_FOOTER } from './FooterDefaults';

/**
 * normalizeFooterData
 * -------------------
 * 将传入的 Footer 数据和默认值合并：
 * 1. 保证所有必填字段都有值
 * 2. 避免前端直接操作 undefined 或缺失属性
 *
 * @param footer - Partial<FooterContent> 可选 Footer 数据
 * @returns FooterContent 完整的 Footer 数据
 */
export function normalizeFooterData(footer?: Partial<FooterContent>): FooterContent {
  return {
    ...FALLBACK_FOOTER,
    ...footer,
    brand: { ...FALLBACK_FOOTER.brand, ...footer?.brand },
    contact: {
      sales: { ...FALLBACK_FOOTER.contact.sales, ...footer?.contact?.sales },
      service: { ...FALLBACK_FOOTER.contact.service, ...footer?.contact?.service },
      chat: { ...FALLBACK_FOOTER.contact.chat, ...footer?.contact?.chat }
    },
    social: footer?.social ?? FALLBACK_FOOTER.social,
    sections: footer?.sections ?? FALLBACK_FOOTER.sections,
    legal: footer?.legal ?? FALLBACK_FOOTER.legal,
    icp: { ...FALLBACK_FOOTER.icp, ...footer?.icp },
    publicSecurity: { ...FALLBACK_FOOTER.publicSecurity, ...footer?.publicSecurity },
    copyright: { ...FALLBACK_FOOTER.copyright, ...footer?.copyright },
  };
}
