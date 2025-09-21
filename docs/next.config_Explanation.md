# next.config.js Configuration Explained

This document explains each section of the `next.config.js` file in the Vxture project, focusing on the current tech stack and best practices for a modern Next.js monorepo.
本文档详细解释了 Vxture 项目中 `next.config.js` 文件的各个部分及其作用，聚焦于当前技术栈和现代 Next.js 单体仓库的最佳实践。

## What is next.config.js?

## 什么是 next.config.js？

`next.config.js` is the main configuration file for a Next.js application. It customizes the build process, server behavior, routing, and more. The file exports a configuration object using CommonJS syntax.
`next.config.js` 是 Next.js 应用的主配置文件，用于自定义构建流程、服务器行为、路由等。该文件以 CommonJS 语法导出配置对象。

## Configuration Overview

## 配置文件概览

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing code...
  reactStrictMode: true,
};

module.exports = nextConfig;
```

## Configuration Options Explained

### Image Optimization (`images`)

```javascript
images: {
  domains: ['vxture.com', 'images.unsplash.com'],
  formats: ['image/avif', 'image/webp'],
}
```

| Option    | Value                                   | Description                                                                                   |
| --------- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `domains` | `['vxture.com', 'images.unsplash.com']` | Allow image optimization from these external domains.                                         |
| `formats` | `['image/avif', 'image/webp']`          | Supported image formats for optimization: AVIF (better compression), WebP (widely supported). |

**Usage Example:**

```jsx
import Image from "next/image";

export default function MyComponent() {
  return (
    <Image
      src="https://images.unsplash.com/photo-1234567890"
      alt="Description"
      width={800}
      height={600}
    />
  );
}
```

### HTTP Security Headers (`headers`)

```javascript
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
}
```

| Header                    | Value           | Description                                                                                             |
| ------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy` | complex string  | Controls allowed resources: restricts scripts, styles, images, fonts, and API connections for security. |
| `X-XSS-Protection`        | `1; mode=block` | Enables browser XSS protection and blocks page on attack detection.                                     |
| `X-Content-Type-Options`  | `nosniff`       | Prevents MIME type sniffing for enhanced security.                                                      |

**Scope:** `source: '/(.*)'` applies these headers to all routes and pages.

### Experimental Features (`experimental`)

```javascript
experimental: {
  serverActions: {
    allowedOrigins: ['localhost:3000'],
  },
}
```

| Option           | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `serverActions`  | Enables Next.js Server Actions (experimental feature).    |
| `allowedOrigins` | Allows server actions to be called from `localhost:3000`. |

**Server Actions Example:**

```jsx
// app/actions.js
"use server";

export async function submitForm(formData) {
  // Handle form data on the server
  return { success: true };
}

// app/page.js
import { submitForm } from "./actions";

export default function Page() {
  return (
    <form action={submitForm}>
      {/* form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Output File Tracing Excludes (`outputFileTracingExcludes`)

```javascript
outputFileTracingExcludes: {
  '*': [
    'node_modules/@swc/core-linux-x64-gnu',
    'node_modules/@swc/core-linux-x64-musl',
    'node_modules/esbuild/linux',
  ],
}
```

This option optimizes production builds by excluding unnecessary platform-specific binaries, reducing deployment size.

| Key   | Description                                                                |
| ----- | -------------------------------------------------------------------------- |
| `'*'` | Applies the exclude rule to all output files.                              |
| Files | Linux-specific binaries, not needed for Windows or other platform deploys. |

### React Strict Mode (`reactStrictMode`)

```javascript
reactStrictMode: true;
```

Enables React Strict Mode in development, providing extra checks and warnings to help catch potential issues. This does not affect production builds.

| Option            | Value  | Description                                |
| ----------------- | ------ | ------------------------------------------ |
| `reactStrictMode` | `true` | Enables extra checks for React components. |

Strict Mode helps with:

- Detecting unsafe lifecycle methods
- Warning about deprecated APIs
- Detecting unexpected side effects
- Validating React internal data structures
- Double-invoking components in development to surface side effects

## Notes

```javascript
// Note: i18n config is not supported in the App Router.
// Use the new built-in internationalization: https://nextjs.org/docs/app/building-your-application/routing/internationalization
```

This reminds developers that with the App Router (Next.js 13+), the old i18n config is deprecated. Use the new internationalization approach as documented by Next.js.

## Recommendations

1. **Security Policy**: Adjust the Content Security Policy (CSP) as needed when adding new external resources or APIs.
2. **Image Domains**: Add new domains to `images.domains` if you need to load images from additional sources.
3. **Experimental Features**: Be aware that experimental features may change or be removed in future Next.js releases.
4. **Deployment Optimization**: Adjust `outputFileTracingExcludes` for your deployment platform to optimize build output.
