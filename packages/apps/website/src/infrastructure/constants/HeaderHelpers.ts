// HeaderHelpers.ts
import type { HeaderContent } from '@/domain/layout/header.model';
import { FALLBACK_HEADER } from './HeaderDefaults';

/**
 * normalizeHeaderData
 * -------------------
 * 将传入的 Header 数据和默认值合并：
 * 1. 保证所有必填字段都有值
 * 2. 避免前端直接操作 undefined 或缺失属性
 *
 * @param header - Partial<HeaderContent> 可选 Header 数据
 * @returns HeaderContent 完整的 Header 数据
 */
export function normalizeHeaderData(header?: Partial<HeaderContent>): HeaderContent {
  return {
    ...FALLBACK_HEADER,
    ...header,
    logo: { ...FALLBACK_HEADER.logo, ...header?.logo },
    nav: header?.nav ?? FALLBACK_HEADER.nav,
    actions: header?.actions ?? FALLBACK_HEADER.actions,
    language: {
      ...FALLBACK_HEADER.language,
      ...header?.language,
      options: header?.language?.options ?? FALLBACK_HEADER.language.options,
    },
    theme: {
      ...FALLBACK_HEADER.theme,
      ...header?.theme,
      options: header?.theme?.options ?? FALLBACK_HEADER.theme.options,
    },
  };
}
