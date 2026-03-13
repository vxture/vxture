/**
 * tsup.config.ts - tsup 打包配置
 * @package @vxture/shared
 *
 * Description: @vxture/shared 包的 tsup 打包配置
 *
 * @author AI-Generated
 * @date 2026-03-13
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 */

import { defineConfig } from 'tsup';

export default defineConfig({
  // 入口文件
  entry: ['src/index.ts'],

  // 输出格式：ES Module 和 CommonJS
  format: ['esm', 'cjs'],

  // 输出目录
  outDir: 'dist',

  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清除输出目录
  clean: true,

  // 最小化输出
  minify: false,

  // 分包（可选，按需启用）
  splitting: false,

  // 使用 swc 加速编译（需要安装 @swc/core）
  // 暂时不使用，保持简单
  // loader: { '.ts': 'tsx' },

  // 外部依赖（不打包到输出中）
  external: [],

  // 平台目标
  target: 'es2023',

  // 保持输出的目录结构
  keepNames: true,
});
