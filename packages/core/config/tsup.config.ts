import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // NestJS 装饰器需要保留元数据
  esbuildOptions(options) {
    options.keepNames = true;
  },
});
