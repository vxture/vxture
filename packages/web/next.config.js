/** @type {import('next').NextConfig} */
const nextConfig = {
  // 类型化路由配置
  typedRoutes: true,

  // 输出配置
  output: "standalone",

  // 环境变量配置
  env: {
    CUSTOM_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },

  // 重定向配置
  async redirects() {
    return [
      // 示例重定向
    ];
  },

  // 图片优化配置
  images: {
    domains: ["localhost"],
    formats: ["image/webp", "image/avif"],
  },

  // Webpack 配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 自定义 webpack 配置
    return config;
  },

  // 开发指示器配置
  devIndicators: {
    position: "bottom-right",
  },

  // 编译器配置
  compiler: {
    // 移除 console.log (生产环境)
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
