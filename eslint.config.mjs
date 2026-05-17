/**
 * Monorepo root ESLint config (ESLint v9 flat config).
 *
 * Used by lint-staged when it runs `eslint --fix` from the repo root.
 * Per-package eslint.config.mjs files are used by each package's own
 * `pnpm lint` script (run with CWD = package directory).
 *
 * Rules here intentionally stay minimal: the authoritative rule sets live
 * in per-package configs. This file only exists so ESLint can find a config
 * when invoked from the root (e.g. via lint-staged).
 */

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
  },
];
