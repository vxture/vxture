import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/** @type {import('next').NextConfig} */

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/lib/i18n/request.ts'
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  // 类型化路由配置
  typedRoutes: true,

  // 输出配置
  // 使用环境变量控制 standalone 输出，便于在 CI 中启用而在本地保持兼容。
  output: process.env.NEXT_STANDALONE === '1' ? 'standalone' : undefined,

  // 环境变量配置
  env: {
    CUSTOM_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // 重定向配置
  async redirects() {
    return [
      // 示例重定向
    ];
  },

  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Webpack 配置
  webpack: (config) => {
    // 解析内部包路径
    config.resolve.alias['@vxture/shared'] = join(__dirname, '../../packages/shared/shared/src');
    config.resolve.alias['@vxture/core-api'] = join(__dirname, '../../packages/core/api/src');
    config.resolve.alias['@vxture/core-config'] = join(__dirname, '../../packages/core/config/src');
    config.resolve.alias['@vxture/core-locale'] = join(__dirname, '../../packages/core/locale/src');
    config.resolve.alias['@vxture/core-tenant'] = join(__dirname, '../../packages/core/tenant/src');
    config.resolve.alias['@vxture/core-auth'] = join(__dirname, '../../packages/core/auth/src');
    config.resolve.alias['@vxture/core-utils'] = join(__dirname, '../../packages/core/utils/src');
    config.resolve.alias['@vxture/design-system'] = join(__dirname, '../../packages/design/design-system/src');

    return config;
  },

  // 开发指示器配置
  devIndicators: {
    position: 'bottom-right',
  },

  // 编译器配置
  compiler: {
    // 移除 console.log (生产环境)
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default withNextIntl(nextConfig);