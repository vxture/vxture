import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const internalAliases = {
  '@vxture/shared': join(__dirname, '../../packages/shared/shared/src'),
  '@vxture/design-system': join(__dirname, '../../packages/design/design-system/dist/index.mjs'),
  '@vxture/platform-browser': join(__dirname, '../../packages/platform/browser/src'),
  '@vxture/agent-studio-vela': join(__dirname, '../../agent-studio/vela/src'),
};

const turboAliases = {
  '@vxture/shared': '../../packages/shared/shared/src',
  '@vxture/design-system': '../../packages/design/design-system/dist/index.mjs',
  '@vxture/platform-browser': '../../packages/platform/browser/src',
  '@vxture/agent-studio-vela': '../../agent-studio/vela/src',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: false,
  },
  transpilePackages: ['@vxture/agent-studio-vela'],
  turbopack: {
    resolveAlias: turboAliases,
  },
  async rewrites() {
    return [
      {
        source: '/vela/:path*',
        destination: `${process.env.VELA_BFF_DEV_URL ?? 'http://localhost:3010'}/vela/:path*`,
      },
    ];
  },
  webpack: (config) => {
    Object.assign(config.resolve.alias, internalAliases);
    return config;
  },
};

export default nextConfig;
