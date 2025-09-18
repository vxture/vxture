/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用图像优化
  images: {
    domains: ['vxture.com'],
    // 可添加其他外部图像域名
  },
  // 开发环境使用严格模式
  reactStrictMode: true,
}

module.exports = nextConfig