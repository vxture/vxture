import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Funnel_Display, Geist_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import {
  LOCALE_CONSTANTS,
  PREFERENCE_CONSTANTS,
  THEME_CONSTANTS,
  type Locale,
  type Theme,
} from "@vxture/shared";
import type { Density } from "@vxture/design-system";
import { ConsoleAppProviders } from "@/providers/ConsoleAppProviders";
import {
  loadConsoleMessageCatalog,
  loadConsoleMessages,
  normalizeConsoleLocale,
} from "@/lib/i18n";
import { themeBootstrapScript } from "@vxture/design-system";
import "./globals.css";

const fontBrand = Funnel_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--vx-font-loader-brand",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--vx-font-loader-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--vx-font-loader-mono",
});

export const metadata: Metadata = {
  title: "Vxture Admin",
  description:
    "Platform operations portal for Vxture supply-side capabilities.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = normalizeConsoleLocale(
    cookieStore.get(LOCALE_CONSTANTS.COOKIE_KEY)?.value,
  ) as Locale;
  const initialTheme = (cookieStore.get(THEME_CONSTANTS.COOKIE_KEY)?.value ??
    THEME_CONSTANTS.DEFAULT_THEME) as Theme;
  const densityCookie = cookieStore.get(
    PREFERENCE_CONSTANTS.DENSITY_COOKIE_KEY,
  )?.value;
  const initialDensity: Density =
    densityCookie === "compact" || densityCookie === "comfortable"
      ? densityCookie
      : "default";
  const messages = await loadConsoleMessages(locale);
  const messageCatalog = await loadConsoleMessageCatalog();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body
        className={`${fontBrand.variable} ${inter.variable} ${geistMono.variable}`}
      >
        <ConsoleAppProviders
          initialLocale={locale}
          initialMessages={messages}
          initialMessageCatalog={messageCatalog}
          initialTheme={initialTheme}
          initialDensity={initialDensity}
        >
          {children}
        </ConsoleAppProviders>
      </body>
    </html>
  );
}
