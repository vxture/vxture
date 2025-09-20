# next.config.js 配置文件详解

本文档详细解释了 Vxture 项目中 `next.config.js` 文件的各个部分及其作用，帮助开发者理解 Next.js 的配置选项。

## 什么是 next.config.js？

`next.config.js` 是 Next.js 应用的配置文件，用于自定义 Next.js 的构建过程、服务器行为、路由策略等。它是一个 CommonJS 模块，导出一个包含配置选项的对象。

## 配置文件概览

```javascript
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
};

module.exports = nextConfig;
```

## 配置选项详解

### 图像优化 (Images)

```javascript
images: {
  domains: ['vxture.com', 'images.unsplash.com'],
  formats: ['image/avif', 'image/webp'],
}
```

| 选项      | 值                                      | 说明                                                                                                                              |
| --------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `domains` | `['vxture.com', 'images.unsplash.com']` | 允许从这些外部域名加载和优化图像<br>- `vxture.com`: 网站自己的域名<br>- `images.unsplash.com`: Unsplash 图片服务                  |
| `formats` | `['image/avif', 'image/webp']`          | 指定 Next.js 图像优化支持的格式<br>- `image/avif`: AVIF 格式，提供更好的压缩<br>- `image/webp`: WebP 格式，广泛支持的高效图像格式 |

**使用示例：**

```jsx
import Image from 'next/image';

export default function MyComponent() {
  return (
    <Image src="https://images.unsplash.com/photo-1234567890" alt="描述" width={800} height={600} />
  );
}
```

### HTTP 安全头信息 (Headers)

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

| 头信息                    | 值              | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy` | 复杂策略字符串  | 内容安全策略，控制允许加载的资源：<br>- `default-src 'self'`: 默认只允许从当前域加载资源<br>- `script-src 'self' 'unsafe-inline'`: 允许当前域的脚本和内联脚本<br>- `style-src 'self' 'unsafe-inline'`: 允许当前域的样式和内联样式<br>- `img-src 'self' data: https:`: 允许当前域、data URI 和任何 HTTPS 域的图像<br>- `font-src 'self' data:`: 允许当前域和 data URI 的字体<br>- `connect-src 'self' https://api.openai.com`: 允许连接到当前域和 OpenAI API |
| `X-XSS-Protection`        | `1; mode=block` | 启用浏览器内置的 XSS 防护，发现攻击时阻止页面加载                                                                                                                                                                                                                                                                                                                                                                                                           |
| `X-Content-Type-Options`  | `nosniff`       | 防止浏览器尝试猜测（嗅探）文件的 MIME 类型                                                                                                                                                                                                                                                                                                                                                                                                                  |

**应用范围：** `source: '/(.*)' `表示这些头信息应用于所有页面和路由。

### 实验性功能 (Experimental)

```javascript
experimental: {
  // 启用服务器操作
  serverActions: {
    allowedOrigins: ['localhost:3000'],
  },
}
```

| 选项             | 说明                                            |
| ---------------- | ----------------------------------------------- |
| `serverActions`  | 启用 Next.js 的服务器操作（Server Actions）功能 |
| `allowedOrigins` | 允许从 `localhost:3000` 调用服务器操作          |

**服务器操作使用示例：**

```jsx
// app/actions.js
'use server';

export async function submitForm(formData) {
  // 在服务器端处理表单数据
  // ...
  return { success: true };
}

// app/page.js
import { submitForm } from './actions';

export default function Page() {
  return (
    <form action={submitForm}>
      {/* 表单内容 */}
      <button type="submit">提交</button>
    </form>
  );
}
```

### 输出文件追踪排除项 (OutputFileTracingExcludes)

```javascript
outputFileTracingExcludes: {
  '*': [
    'node_modules/@swc/core-linux-x64-gnu',
    'node_modules/@swc/core-linux-x64-musl',
    'node_modules/esbuild/linux',
  ],
}
```

此配置用于优化生产构建过程，通过排除不需要的平台特定的二进制文件，减小部署包的大小。

| 配置键     | 说明                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| `'*'`      | 适用于所有输出文件的排除规则                                             |
| 排除的文件 | 这些是特定于 Linux 平台的二进制文件，在 Windows 或其他平台上部署时不需要 |

### React 严格模式 (ReactStrictMode)

```javascript
reactStrictMode: true;
```

启用 React 的严格模式，它提供额外的开发时检查和警告，帮助发现潜在问题。这些检查仅在开发模式下运行，不影响生产构建。

| 选项              | 值     | 说明                                      |
| ----------------- | ------ | ----------------------------------------- |
| `reactStrictMode` | `true` | 启用 React 严格模式，对组件进行额外的检查 |

严格模式会：

- 检测不安全的生命周期方法
- 警告过时的 API 用法
- 检测意外的副作用
- 验证 React 内部的数据结构完整性
- 在开发中，组件会渲染两次以帮助发现副作用问题

## 注意事项

```javascript
// 注意：i18n 配置在 App Router 中不再支持
// 应改为使用内置的国际化支持：https://nextjs.org/docs/app/building-your-application/routing/internationalization
```

这个注释提醒开发者，在使用 App Router（Next.js 13+ 的新路由系统）时，不应使用旧的 i18n 配置方式。应该改用新的国际化方法，详情请参考 Next.js 文档。

## 使用建议

1. **安全策略调整**：根据项目需求，可能需要调整 CSP 策略，特别是当添加新的外部资源或 API 时。

2. **图像域名管理**：当需要从新的外部来源加载图像时，务必将域名添加到 `images.domains` 数组中。

3. **实验性功能**：实验性功能可能会在未来的 Next.js 版本中更改或移除，使用时应注意版本兼容性。

4. **部署优化**：如果部署到不同的平台，可能需要调整 `outputFileTracingExcludes` 以优化构建输出。
