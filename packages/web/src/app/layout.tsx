import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { useEffect } from 'react';
import { cookies, headers } from 'next/headers';

// 导入全局组件和Store
import Notifications from '@/components/common/Notifications';
import { useThemeStore } from '@/stores/themeStore';
import { useI18nStore } from '@/stores/i18nStore';
import { useAuthStore } from '@/stores/authStore';

// 类型导入
import type { Theme } from '@/stores/themeStore';
import type { Locale } from '@/stores/i18nStore';

const inter = Inter({ subsets: ['latin'] });

// 生成动态元数据（支持多语言）
export function generateMetadata(): Metadata {
  // 服务器端获取初始语言
  const initialLocale = getServerLocale();

  // 多语言标题和描述
  const titles = {
    'zh-CN': 'vxture AI | 释放数据潜力',
    'en-US': 'vxture AI | Unleash Data Potential',
  };

  const descriptions = {
    'zh-CN': '基于AI的虚拟自然探索平台',
    'en-US': 'AI-based virtual nature exploration platform',
  };

  return {
    title: titles[initialLocale],
    description: descriptions[initialLocale],
    openGraph: {
      title: titles[initialLocale],
      description: descriptions[initialLocale],
      images: ['/icons/favicon.ico'],
      type: 'website',
      url: 'https://vxture.com',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[initialLocale],
      description: descriptions[initialLocale],
      images: ['/icons/favicon.ico'],
    },
  };
}

// 服务器端获取用户主题偏好（避免客户端闪烁）
function getServerTheme(): Theme {
  const cookieStore = cookies() as ReadonlyRequestCookies;
  const savedTheme = cookieStore.get('theme-storage')?.value;

  try {
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      return parsed.theme === 'dark' ? 'dark' : 'light';
    }
  } catch (e) {
    console.error('解析主题失败:', e);
  }

  return 'light';
}

// 服务器端获取初始语言（优先用户设置，其次浏览器偏好）
function getServerLocale(): Locale {
  // 1. 从cookies获取用户保存的语言偏好
  const cookieStore = cookies();
  const savedLocale = cookieStore.get('i18n-storage')?.value;

  if (savedLocale) {
    try {
      const parsed = JSON.parse(savedLocale);
      if (['zh-CN', 'en-US'].includes(parsed.locale)) {
        return parsed.locale as Locale;
      }
    } catch (e) {
      console.error('解析语言失败:', e);
    }
  }

  // 2. 从请求头获取浏览器语言偏好
  const acceptLanguage = headers().get('Accept-Language') || 'zh-CN';
  const preferredLang = acceptLanguage.split(',')[0].split('-')[0];
  return preferredLang === 'en' ? 'en-US' : 'zh-CN';
}

// 客户端主题同步组件（确保主题变化时更新DOM）
function ThemeSync() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // 同步主题到HTML根元素
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);

  return null;
}

// 客户端语言同步组件（确保语言变化时更新DOM和元数据）
function LocaleSync() {
  const { locale, setLocale } = useI18nStore();

  useEffect(() => {
    // 1. 同步语言到HTML根元素
    document.documentElement.lang = locale;

    // 2. 同步语言到meta标签
    const langMeta = document.querySelector('meta[http-equiv="content-language"]');
    if (langMeta) {
      langMeta.setAttribute('content', locale);
    }

    // 3. 初始化时如果服务器语言与客户端存储不一致，以客户端为准
    const storedLocale = localStorage.getItem('i18n-storage');
    if (storedLocale) {
      try {
        const parsed = JSON.parse(storedLocale);
        if (parsed.locale && parsed.locale !== locale) {
          setLocale(parsed.locale as Locale);
        }
      } catch (e) {
        console.error('同步客户端语言失败:', e);
      }
    }
  }, [locale, setLocale]);

  return null;
}

// 认证状态同步组件（处理令牌过期等全局认证逻辑）
function AuthSync() {
  const { token, logout } = useAuthStore();

  useEffect(() => {
    // 检查令牌是否过期（示例逻辑，实际需根据令牌有效期实现）
    if (token) {
      // 假设令牌有效期24小时，这里简化处理
      const checkTokenExpiry = () => {
        const storedAuth = localStorage.getItem('auth-storage');
        if (storedAuth) {
          try {
            const parsed = JSON.parse(storedAuth);
            const now = Date.now();
            // 假设令牌创建时间在parsed中存储为timestamp
            if (parsed.timestamp && now - parsed.timestamp > 24 * 60 * 60 * 1000) {
              logout(); // 令牌过期，自动登出
            }
          } catch (e) {
            console.error('检查令牌过期失败:', e);
          }
        }
      };

      // 初始检查
      checkTokenExpiry();
      // 定时检查（每小时）
      const interval = setInterval(checkTokenExpiry, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [token, logout]);

  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 服务器端初始化主题和语言
  const serverTheme = getServerTheme();
  const serverLocale = getServerLocale();

  return (
    <html
      lang={serverLocale}
      data-theme={serverTheme}
      className={serverTheme === 'dark' ? 'dark' : ''}
    >
      <head>
        {/* 基础配置 */}
        <link rel='icon' href='/icons/favicon.ico' />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#0e1726' />

        {/* 图标配置 */}
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/favicon.ico' />
        <link rel='manifest' href='/manifest.json' />

        {/* SEO相关 */}
        <meta name='robots' content='index, follow' />
        <link rel='canonical' href='https://vxture.com' />
        <meta httpEquiv='content-language' content={serverLocale} />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='author' content='vxture Team' />

        {/* 多语言关键词 */}
        <meta
          name='keywords'
          content={
            serverLocale === 'zh-CN'
              ? 'AI, 数据, 智能, 决策, 虚拟, 平台, vxture'
              : 'AI, data, intelligence, decision, virtual, platform, vxture'
          }
        />

        {/* 性能优化 */}
        <meta name='referrer' content='no-referrer-when-downgrade' />
        <link rel='dns-prefetch' href='//vxture.com' />
        <link rel='preconnect' href='https://vxture.com' crossOrigin='' />
      </head>
      <body className={inter.className}>
        {/* 四大功能的客户端同步组件 */}
        <ThemeSync /> {/* 主题同步（客户端） */}
        <LocaleSync /> {/* 多语言同步（客户端） */}
        <AuthSync /> {/* 认证状态同步（客户端） */}
        {/* 全局通知组件 */}
        <Notifications />
        {/* 页面内容 */}
        {children}
      </body>
    </html>
  );
}
