import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/** @type {import('next').NextConfig} */

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/lib/i18n/request.ts'
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── 内部包路径映射（两份，原因见下方说明）────────────────────────────────────────
//
// 为什么不能合并为一份？
//
// Turbopack 在 Windows 上存在已知限制：experimental.turbo.resolveAlias
// 的值必须是「相对路径字符串」，传入绝对路径（如 join(__dirname, ...)）
// 会触发 "windows imports are not implemented yet" 错误。
//
// Webpack 则相反，resolve.alias 标准用法要求绝对路径，相对路径无法正确解析。
//
// 因此两份 alias 的「值类型」本身不同，无法共用同一份数据：
//   internalAliases → 绝对路径，供 Webpack（next build）使用
//   turboAliases    → 相对路径，供 Turbopack（next dev --turbo）使用
//
// 所有包统一指向包根目录，由各包 package.json exports 字段路由到 dist/index.mjs。

// Webpack 用：绝对路径
const internalAliases = {
  '@vxture/shared':        join(__dirname, '../../packages/shared/shared'),
  '@vxture/core-api':      join(__dirname, '../../packages/core/api'),
  '@vxture/core-config':   join(__dirname, '../../packages/core/config'),
  '@vxture/core-locale':   join(__dirname, '../../packages/core/locale'),
  '@vxture/core-tenant':   join(__dirname, '../../packages/core/tenant'),
  '@vxture/core-auth':     join(__dirname, '../../packages/core/auth'),
  '@vxture/core-utils':    join(__dirname, '../../packages/core/utils'),
  '@vxture/design-system': join(__dirname, '../../packages/design/design-system'),
};

// Turbopack 用：相对路径（Windows 限制，不可改为绝对路径）
const turboAliases = {
  '@vxture/shared':        '../../packages/shared/shared',
  '@vxture/core-api':      '../../packages/core/api',
  '@vxture/core-config':   '../../packages/core/config',
  '@vxture/core-locale':   '../../packages/core/locale',
  '@vxture/core-tenant':   '../../packages/core/tenant',
  '@vxture/core-auth':     '../../packages/core/auth',
  '@vxture/core-utils':    '../../packages/core/utils',
  '@vxture/design-system': '../../packages/design/design-system',
};

const nextConfig = {
  typedRoutes: true,

  output: process.env.NEXT_STANDALONE === '1' ? 'standalone' : undefined,

  env: {
    CUSTOM_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  async redirects() {
    return [];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // ─── Turbopack 配置（next dev --turbo 专用）──────────────────────────────────
  // webpack() 回调在 Turbopack 模式下完全不执行，alias 必须在此处单独声明。
  experimental: {
    turbo: {
      resolveAlias: turboAliases,
    },
  },

  // ─── Webpack 配置（next build / next dev 无 --turbo）────────────────────────
  // Turbopack 模式下此回调不执行，两者互不干扰。
  webpack: (config) => {
    Object.assign(config.resolve.alias, internalAliases);
    return config;
  },

  devIndicators: {
    position: 'bottom-right',
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default withNextIntl(nextConfig);