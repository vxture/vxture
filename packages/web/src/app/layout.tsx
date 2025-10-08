import './globals.css';

export const metadata = {
  title: 'vxture AI | 释放数据潜力',
  description: 'AI-based virtual nature exploration平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='zh-CN'>
      <head>
        {/* 保留所有meta标签、favicon等配置 */}
        <link rel='icon' href='/icons/favicon.ico' />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#0e1726' />
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/favicon.ico' />
        <link rel='manifest' href='/manifest.json' />
        <meta property='og:title' content='vxture AI | 释放数据潜力' />
        <meta property='og:description' content='AI-based virtual nature exploration platform' />
        <meta property='og:image' content='/icons/favicon.ico' />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://vxture.com' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='vxture AI | 释放数据潜力' />
        <meta name='twitter:description' content='AI-based virtual nature exploration platform' />
        <meta name='twitter:image' content='/icons/favicon.ico' />
        <meta name='robots' content='index, follow' />
        <link rel='canonical' href='https://vxture.com' />
        <meta httpEquiv='content-language' content='zh-CN' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='author' content='vxture Team' />
        <meta name='keywords' content='AI, 数据, 智能, 决策, 虚拟, 平台, vxture' />
        <meta name='referrer' content='no-referrer-when-downgrade' />
        <link rel='dns-prefetch' href='//vxture.com' />
        <link rel='preconnect' href='https://vxture.com' crossOrigin='' />
      </head>
      <body>{children}</body>
    </html>
  );
}
