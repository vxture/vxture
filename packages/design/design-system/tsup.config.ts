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
  experimentalDts: false,
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.keepNames = true;
  },
  
  // React 和 React-DOM 不打包进产物，由消费方提供
  external: ['react', 'react-dom', 'react/jsx-runtime'],
});
