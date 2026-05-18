/**
 * AuthAppHeader.tsx - 控制台认证页顶栏接线。
 * @package @vxture/console
 * @layer Presentation
 * @category Auth
 * @author AI-Generated
 * @date 2026-05-17
 */

import { AuthChromeHeader, useTheme } from "@vxture/design-system";
import {
  setGlobalLocalePreference,
  setGlobalThemePreference,
} from "@vxture/platform-browser";
import type { Locale, Theme } from "@vxture/shared";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";

export function AuthAppHeader() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isZh = locale === "zh-CN";

  return (
    <AuthChromeHeader
      brandHref="/"
      brandLogoSrc="/brand/vxture-logo-white.png"
      brandLogoAlt="vxture.ai"
      brandLabel="vxture.ai"
      currentLocale={locale}
      currentTheme={theme}
      localeButtonLabel={isZh ? "选择语言" : "Language"}
      localePanelLabel={isZh ? "语言选择" : "Language"}
      lightThemeLabel={isZh ? "浅色模式" : "Light mode"}
      darkThemeLabel={isZh ? "深色模式" : "Dark mode"}
      onLocaleChange={(nextLocale) => {
        setGlobalLocalePreference(nextLocale);
        router.replace(pathname, { locale: nextLocale });
      }}
      onThemeChange={(nextTheme) => {
        setTheme(nextTheme);
        setGlobalThemePreference(nextTheme as Theme);
      }}
    />
  );
}
