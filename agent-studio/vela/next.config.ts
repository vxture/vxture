import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * 开发环境代理：将 /vela/chat 转发到 vela-bff（端口 3010）。
   * 生产环境由 Nginx 负责代理，此配置仅在 `next dev` 时生效。
   */
  async rewrites() {
    return [
      {
        source: '/vela/:path*',
        destination: `${process.env['VELA_BFF_DEV_URL'] ?? 'http://localhost:3010'}/vela/:path*`,
      },
    ];
  },
};

export default nextConfig;
