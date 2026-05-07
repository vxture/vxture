/**
 * console-entry.ts - Console Portal 跳转工具
 * @package @vxture/website
 * @layer Presentation
 * @category Navigation
 * @author AI-Generated
 * @date 2026-05-06
 */

import { encodePortalContext } from '@vxture/shared';

// =============================================================================
// 环境变量（构建时注入）
// =============================================================================

const CONSOLE_BASE_URL =
  process.env.NEXT_PUBLIC_CONSOLE_URL ?? 'https://console.vxture.com';

const WEBSITE_BASE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'https://vxture.com';

// =============================================================================
// 入口 URL 构建
// =============================================================================

/**
 * 构建跳转到 Console Portal 的完整 URL，携带来源上下文。
 *
 * Console 通过 `decodePortalContext` 解析上下文，渲染顶栏的来源标题和返回按钮。
 * 其他 Portal（如 agent-studio）应创建各自的 entry 函数，复用相同的 `encodePortalContext`。
 *
 * @param locale - 当前语言代码，用于构建正确的返回 URL
 * @returns 带上下文参数的 Console 入口完整 URL
 */
export function buildConsoleEntryUrl(locale: string): string {
  const queryString = encodePortalContext({
    from: 'website',
    returnTo: `${WEBSITE_BASE_URL}/${locale}`,
    caller: 'Vxture 官网',
    callerLogo: '/images/logo.png',
  });
  return `${CONSOLE_BASE_URL}?${queryString}`;
}
