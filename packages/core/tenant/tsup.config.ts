import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2023',
  treeshake: true,
  // 显式启用 swc 处理装饰器元数据
  experimentalDts: false,
  esbuildOptions(options) {
    options.keepNames = true;
  },
});
