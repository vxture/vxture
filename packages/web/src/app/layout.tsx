import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import "./globals.css";

export const metadata = {
  title: "vxture AI | 释放数据潜力",
  description: "AI-based virtual nature exploration平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/icons/favicon.ico" />

        {/* Charset */}
        <meta charSet="utf-8" />

        {/* Viewport for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Theme color for browser UI */}
        <meta name="theme-color" content="#0e1726" />

        {/* Apple Touch Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/favicon.ico"
        />

        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph for social sharing */}
        <meta property="og:title" content="vxture AI | 释放数据潜力" />
        <meta
          property="og:description"
          content="AI-based virtual nature exploration platform"
        />
        <meta property="og:image" content="/icons/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vxture.com" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="vxture AI | 释放数据潜力" />
        <meta
          name="twitter:description"
          content="AI-based virtual nature exploration platform"
        />
        <meta name="twitter:image" content="/icons/favicon.ico" />

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://vxture.com" />

        {/* Language */}
        <meta httpEquiv="content-language" content="zh-CN" />

        {/* X-UA-Compatible for IE */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Author */}
        <meta name="author" content="vxture Team" />

        {/* Keywords */}
        <meta
          name="keywords"
          content="AI, 数据, 智能, 决策, 虚拟, 平台, vxture"
        />

        {/* Referrer Policy */}
        <meta name="referrer" content="no-referrer-when-downgrade" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//vxture.com" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://vxture.com" crossOrigin="" />

        {/* Additional meta tags can be added below */}
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
