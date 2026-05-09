#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SCAN_ROOTS = ["portals", "packages"];
const SOURCE_EXTENSIONS = new Set([".css", ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const IGNORED_PARTS = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "storybook-static",
]);

const DS_ROOT = normalize("packages/design/design-system");
const DS_TOKEN_PATHS = [
  normalize("packages/design/design-system/src/tokens"),
  normalize("packages/design/design-system/src/styles/tokens.css"),
];
const FONT_LOADER_ALLOWLIST = [
  /^portals\/[^/]+\/src\/app\/layout\.tsx$/,
  /^portals\/[^/]+\/src\/app\/layout\.ts$/,
];

const rules = [
  {
    id: "ds/no-app-components-ui",
    description: "应用层不能创建 components/ui 或 components/primitives 基础组件目录；基础 UI 必须进入 DS。",
    checkFile(file) {
      if (!isPortalSource(file)) return [];
      const normalized = normalize(file);
      if (/\/src\/components\/(ui|primitives)\//.test(normalized)) {
        return [violation(file, 1, "移动到语义业务目录，或补充到 @vxture/design-system。")];
      }
      return [];
    },
  },
  {
    id: "ds/no-app-ui-imports",
    description: "应用层不能从本地 components/ui 或 components/primitives 导入基础组件。",
    checkLine(file, line, lineNumber) {
      if (!isPortalSource(file)) return null;
      if (/from\s+['"](?:@\/components\/(?:ui|primitives)|.*\/components\/(?:ui|primitives)|.*\/(?:ui|primitives))/.test(line)) {
        return violation(file, lineNumber, "改为从 @vxture/design-system 导入基础组件，业务组件使用语义目录。");
      }
      return null;
    },
  },
  {
    id: "ds/no-raw-color",
    description: "颜色只能在 DS token 层定义；应用层和普通包不能写 hex/rgb/hsl 硬编码颜色。",
    checkLine(file, line, lineNumber) {
      if (isDsTokenOwner(file) || isGeneratedOrAsset(file)) return null;
      if (hasRawColor(line)) {
        return violation(file, lineNumber, "使用 DS token：var(--vx-color-*)、text-vx-*、bg-vx-* 或补充 DS token。");
      }
      return null;
    },
  },
  {
    id: "ds/no-illegal-font-family",
    description: "字体族只能由 DS typography token 定义；应用层只允许加载字体变量。",
    checkLine(file, line, lineNumber) {
      if (isGeneratedOrAsset(file)) return null;
      if (line.includes("next/font") && !FONT_LOADER_ALLOWLIST.some((pattern) => pattern.test(normalize(file)))) {
        return violation(file, lineNumber, "next/font 只能在应用 app/layout 中加载，业务组件不得直接加载字体。");
      }

      const match = line.match(/font-family\s*:\s*([^;]+)/i);
      if (!match) return null;
      const value = match[1]?.trim() ?? "";
      const allowed = value.startsWith("var(") || ["inherit", "initial", "unset"].includes(value);
      if (!allowed) {
        return violation(file, lineNumber, "font-family 必须使用 var(--font-*) 或 inherit。");
      }
      return null;
    },
  },
  {
    id: "ds/no-app-tailwind-tokens",
    description: "应用层 Tailwind 配置不能自建 colors/fontFamily/radius/shadow tokens。",
    checkLine(file, line, lineNumber) {
      const normalized = normalize(file);
      if (!/^portals\/[^/]+\/tailwind\.config\.(js|mjs|ts)$/.test(normalized)) return null;
      if (/\b(colors|fontFamily|borderRadius|boxShadow)\s*:/.test(line)) {
        return violation(file, lineNumber, "把 token 定义迁移到 @vxture/design-system。");
      }
      return null;
    },
  },
  {
    id: "ds/no-token-duplicates",
    description: "颜色、字号、圆角等 token 文件只能存在于 DS token 包。",
    checkFile(file) {
      const normalized = normalize(file);
      if (normalized.startsWith(`${DS_ROOT}/`)) return [];
      if (/\/tokens\/(colors|typography|radius|spacing|shadow)\.(ts|tsx|js|mjs|css)$/.test(normalized)) {
        return [violation(file, 1, "token 文件只能维护在 packages/design/design-system/src/tokens。")];
      }
      return [];
    },
  },
];

const files = SCAN_ROOTS.flatMap((root) => collectFiles(path.join(ROOT, root))).filter((file) =>
  SOURCE_EXTENSIONS.has(path.extname(file)),
);

const violations = [];

for (const file of files) {
  for (const rule of rules) {
    if (rule.checkFile) {
      for (const item of rule.checkFile(file)) {
        violations.push({ rule, ...item });
      }
    }
  }

  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    for (const rule of rules) {
      if (!rule.checkLine) continue;
      const item = rule.checkLine(file, line, lineNumber);
      if (item) violations.push({ rule, ...item });
    }
  });
}

if (violations.length > 0) {
  console.error("\nDesign System guardrails failed:\n");
  for (const item of violations) {
    console.error(`- ${item.rule.id}: ${item.file}:${item.line}`);
    console.error(`  ${item.message}`);
  }
  console.error("\nFix rule: design tokens and primitives belong in @vxture/design-system; apps only compose them.\n");
  process.exit(1);
}

console.log("Design System guardrails passed.");

function collectFiles(target) {
  if (!exists(target)) return [];
  const stats = statSync(target);
  if (stats.isFile()) return [target];
  if (!stats.isDirectory()) return [];

  const dirName = path.basename(target);
  if (IGNORED_PARTS.has(dirName)) return [];

  return readdirSync(target).flatMap((entry) => collectFiles(path.join(target, entry)));
}

function exists(target) {
  try {
    statSync(target);
    return true;
  } catch {
    return false;
  }
}

function hasRawColor(line) {
  const text = stripLineComment(line);
  if (/#(?:[0-9a-fA-F]{3,8})\b/.test(text)) return true;
  if (/\b(?:rgb|rgba|hsl|hsla)\(\s*(?:\d|#)/i.test(text)) return true;
  return false;
}

function stripLineComment(line) {
  const commentIndex = line.indexOf("//");
  return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
}

function isPortalSource(file) {
  return normalize(file).startsWith("portals/");
}

function isDsTokenOwner(file) {
  const normalized = normalize(file);
  return DS_TOKEN_PATHS.some((tokenPath) => normalized === tokenPath || normalized.startsWith(`${tokenPath}/`));
}

function isGeneratedOrAsset(file) {
  const normalized = normalize(file);
  return /\/(dist|build|\.next|public|assets)\//.test(normalized);
}

function violation(file, line, message) {
  return {
    file: normalize(path.relative(ROOT, file)),
    line,
    message,
  };
}

function normalize(value) {
  return value.replaceAll("\\", "/").replace(/^([A-Za-z]:)?\/?MyWebSite\/vxture\//, "");
}
