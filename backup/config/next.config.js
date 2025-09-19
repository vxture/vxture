/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用图像优化
  images: {
    domains: ['vxture.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // 内容安全策略
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com;",
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // 实验性功能
  experimental: {
    // 启用服务器操作
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  // 输出文件追踪排除项
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/esbuild/linux',
    ],
  },

  // 开发环境使用严格模式
  reactStrictMode: true,

  // 注意：i18n 配置在 App Router 中不再支持
  // 应改为使用内置的国际化支持：https://nextjs.org/docs/app/building-your-application/routing/internationalization
};

module.exports = nextConfig;
