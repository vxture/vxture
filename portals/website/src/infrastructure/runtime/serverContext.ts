/**
 * 临时的服务器上下文，用于保持 layout.tsx 兼容性
 */

export async function resolveServerContext() {
  return {
    locale: 'zh-CN',
    theme: 'light',
  };
}
