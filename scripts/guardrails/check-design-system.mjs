#!/usr/bin/env node

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SCAN_ROOTS = ["portals", "packages", "agent-studio", "business"];
const SOURCE_EXTENSIONS = new Set([".css", ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".json"]);
const UPDATE_BASELINE = process.argv.includes("--update-baseline");
const BASELINE_PATH = path.join(ROOT, "scripts/guardrails/design-system-baseline.json");
const BASELINED_RULE_IDS = new Set([
  "ds/no-inline-design-style",
  "ds/no-native-primitive",
  "ds/no-app-vx-token-definitions",
  "ds/no-app-component-metric-token",
  "ds/no-app-hardcoded-scale",
  "ds/no-app-hardcoded-layout-scale",
]);
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
const DS_SEMANTIC_STYLE_PATHS = new Set([
  normalize("packages/design/design-system/src/styles/components.css"),
  normalize("packages/design/design-system/src/styles/platform.css"),
]);
const IMPORT_ONLY_STYLE_ENTRIES = new Map([
  [normalize("packages/design/design-system/src/styles/platform.css"), "DS platform.css"],
  [normalize("packages/design/design-system/src/styles/console.css"), "DS console.css"],
  [normalize("portals/admin/src/app/globals.css"), "admin globals.css"],
  [normalize("portals/console/src/app/globals.css"), "console globals.css"],
  [normalize("portals/admin/src/styles/admin-shell.css"), "admin shell.css"],
  [normalize("portals/admin/src/styles/admin-assistant.css"), "admin assistant.css"],
  [normalize("portals/admin/src/styles/admin-assistant-composer.css"), "admin assistant composer.css"],
  [normalize("portals/admin/src/styles/admin-assistant-conversation.css"), "admin assistant conversation.css"],
  [normalize("portals/admin/src/styles/admin-assistant-messages.css"), "admin assistant messages.css"],
  [normalize("portals/admin/src/styles/admin-auth-captcha.css"), "admin auth captcha.css"],
  [normalize("portals/admin/src/styles/admin-directory.css"), "admin directory.css"],
  [normalize("portals/admin/src/styles/admin-governance.css"), "admin governance.css"],
  [normalize("portals/admin/src/styles/admin-management.css"), "admin management.css"],
  [normalize("portals/admin/src/styles/admin-management-commerce.css"), "admin management commerce.css"],
  [normalize("portals/admin/src/styles/admin-management-commerce-overview.css"), "admin management commerce overview.css"],
  [normalize("portals/admin/src/styles/admin-management-commerce-subscriptions.css"), "admin management commerce subscriptions.css"],
  [normalize("portals/admin/src/styles/admin-management-commerce-transactions.css"), "admin management commerce transactions.css"],
  [normalize("portals/admin/src/styles/admin-management-directory.css"), "admin management directory.css"],
  [normalize("portals/admin/src/styles/admin-management-directory-commerce.css"), "admin management directory commerce.css"],
  [normalize("portals/admin/src/styles/admin-management-directory-commerce-transactions.css"), "admin management directory commerce transactions.css"],
  [normalize("portals/admin/src/styles/admin-management-core.css"), "admin management core.css"],
  [normalize("portals/admin/src/styles/admin-management-models.css"), "admin management models.css"],
  [normalize("portals/admin/src/styles/admin-management-models-rows.css"), "admin management models rows.css"],
  [normalize("portals/admin/src/styles/admin-management-models-shared.css"), "admin management models shared.css"],
  [normalize("portals/admin/src/styles/admin-management-models-strategy.css"), "admin management models strategy.css"],
  [normalize("portals/admin/src/styles/admin-management-pills.css"), "admin management pills.css"],
  [normalize("portals/admin/src/styles/admin-management-pills-commerce.css"), "admin management pills commerce.css"],
  [normalize("portals/admin/src/styles/admin-management-pills-products.css"), "admin management pills products.css"],
  [normalize("portals/admin/src/styles/admin-management-pills-responsive.css"), "admin management pills responsive.css"],
  [normalize("portals/admin/src/styles/admin-management-products.css"), "admin management products.css"],
  [normalize("portals/admin/src/styles/admin-management-products-capability.css"), "admin management products capability.css"],
  [normalize("portals/admin/src/styles/admin-management-products-service-plans.css"), "admin management products service plans.css"],
  [normalize("portals/admin/src/styles/admin-overview.css"), "admin overview.css"],
  [normalize("portals/admin/src/styles/admin-overview-business.css"), "admin overview business.css"],
  [normalize("portals/admin/src/styles/admin-overview-core.css"), "admin overview core.css"],
  [normalize("portals/admin/src/styles/admin-overview-metrics.css"), "admin overview metrics.css"],
  [normalize("portals/admin/src/styles/admin-overview-models.css"), "admin overview models.css"],
  [normalize("portals/admin/src/styles/admin-overview-products.css"), "admin overview products.css"],
  [normalize("portals/admin/src/styles/admin-overview-service.css"), "admin overview service.css"],
  [normalize("portals/admin/src/styles/admin-operations.css"), "admin operations.css"],
  [normalize("portals/admin/src/styles/admin-permissions.css"), "admin permissions.css"],
  [normalize("portals/admin/src/styles/admin-platform-autonomy.css"), "admin platform autonomy.css"],
  [normalize("portals/admin/src/styles/admin-products.css"), "admin products.css"],
  [normalize("portals/admin/src/styles/admin-roles.css"), "admin roles.css"],
  [normalize("portals/admin/src/styles/admin-service-health.css"), "admin service health.css"],
  [normalize("portals/admin/src/styles/admin-service-health-catalog.css"), "admin service health catalog.css"],
  [normalize("portals/admin/src/styles/admin-service-health-summary.css"), "admin service health summary.css"],
  [normalize("portals/admin/src/styles/admin-tenant-detail.css"), "admin tenant detail.css"],
  [normalize("portals/admin/src/styles/admin-tenant-detail-config.css"), "admin tenant detail config.css"],
  [normalize("portals/admin/src/styles/admin-tenant-detail-members.css"), "admin tenant detail members.css"],
  [normalize("portals/admin/src/styles/admin-tenant-detail-shell.css"), "admin tenant detail shell.css"],
  [normalize("portals/admin/src/styles/admin-shell-core.css"), "admin shell core.css"],
  [normalize("portals/admin/src/styles/admin-shell-nav.css"), "admin shell nav.css"],
  [normalize("portals/admin/src/styles/admin-shell-sidebar.css"), "admin shell sidebar.css"],
  [normalize("portals/admin/src/styles/admin-workspace-switcher.css"), "admin workspace switcher.css"],
  [normalize("portals/admin/src/styles/admin-permissions-tree-node.css"), "admin permissions tree node.css"],
  [normalize("portals/website/src/app/globals.css"), "website globals.css"],
  [normalize("business/ruyin/src/app/globals.css"), "Ruyin globals.css"],
  [normalize("agent-studio/vela/src/app/globals.css"), "Vela globals.css"],
]);
const FONT_LOADER_ALLOWLIST = [
  /^portals\/[^/]+\/src\/app\/layout\.tsx$/,
  /^portals\/[^/]+\/src\/app\/layout\.ts$/,
  /^agent-studio\/[^/]+\/src\/app\/layout\.tsx$/,
  /^agent-studio\/[^/]+\/src\/app\/layout\.ts$/,
  /^business\/[^/]+\/src\/app\/layout\.tsx$/,
  /^business\/[^/]+\/src\/app\/layout\.ts$/,
];
const DIRECT_UI_ENGINE_DEPENDENCIES = [
  "@phosphor-icons/react",
  "lucide-react",
  "react-icons",
  /^@radix-ui\//,
];
const ALLOWED_DS_IMPORTS = new Set([
  "@vxture/design-system",
  "@vxture/design-system/tokens",
  "@vxture/design-system/types",
  "@vxture/design-system/server",
  "@vxture/design-system/styles/auth.css",
  "@vxture/design-system/styles/components.css",
  "@vxture/design-system/styles/console.css",
  "@vxture/design-system/styles/fullscreen.css",
  "@vxture/design-system/styles/globals.css",
  "@vxture/design-system/styles/tokens.css",
  "@vxture/design-system/styles/typography.css",
]);

const rules = [
  {
    id: "ds/no-app-components-ui",
    description: "应用层不能创建 components/ui 或 components/primitives 基础组件目录；基础 UI 必须进入 DS。",
    checkFile(file) {
      if (!isFrontendSource(file)) return [];
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
      if (!isFrontendSource(file)) return null;
      if (/from\s+['"](?:@\/components\/(?:ui|primitives)|.*\/components\/(?:ui|primitives)|.*\/(?:ui|primitives))/.test(line)) {
        return violation(file, lineNumber, "改为从 @vxture/design-system 导入基础组件，业务组件使用语义目录。");
      }
      return null;
    },
  },
  {
    id: "ds/no-unauthorized-design-system-subpath",
    description: "应用和普通包只能使用 @vxture/design-system 公共入口与白名单子入口，禁止内部深层导入。",
    checkLine(file, line, lineNumber) {
      if (!isDesignSystemConsumerSource(file)) return null;
      const specifiers = findDesignSystemSpecifiers(line);
      const unauthorized = specifiers.find((specifier) => !ALLOWED_DS_IMPORTS.has(specifier));
      if (!unauthorized) return null;
      return violation(
        file,
        lineNumber,
        `${unauthorized} 不是允许的 DS 公共入口；只允许根入口、/tokens、/types、/server 和 package exports 暴露的 styles/*。`,
      );
    },
  },
  {
    id: "ds/no-direct-ui-engine-imports",
    description: "应用层不能直接导入 DS 底层图标库或 UI 引擎；必须通过 @vxture/design-system 公共入口。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file)) return null;
      if (/from\s+['"](?:@phosphor-icons\/react|lucide-react|react-icons(?:\/[^'"]*)?|@radix-ui\/[^'"]+)['"]/.test(line)) {
        return violation(file, lineNumber, "改为从 @vxture/design-system 导入 Icon、Popover、Tooltip 等 DS 公共组件。");
      }
      return null;
    },
  },
  {
    id: "ds/no-app-ui-engine-dependencies",
    description: "应用 package.json 不能声明 DS 底层图标库或 UI 引擎依赖；底层 UI 引擎只能由 DS 持有。",
    checkContent(file, content) {
      if (!isFrontendPackageManifest(file)) return [];
      const manifest = JSON.parse(content);
      const sections = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
      const items = [];

      for (const section of sections) {
        const dependencies = manifest[section];
        if (!dependencies || typeof dependencies !== "object") continue;
        for (const dependency of Object.keys(dependencies)) {
          if (!isDirectUiEngineDependency(dependency)) continue;
          items.push(
            violation(
              file,
              findLineNumber(content, `"${dependency}"`),
              `应用 package.json 不能声明 ${dependency}；通过 @vxture/design-system 公共入口消费图标和 UI 引擎能力。`,
            ),
          );
        }
      }

      return items;
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
      if (!/^(portals|agent-studio|business)\/[^/]+\/tailwind\.config\.(js|mjs|ts)$/.test(normalized)) return null;
      if (/\b(colors|fontFamily|borderRadius|boxShadow)\s*:/.test(line)) {
        return violation(file, lineNumber, "把 token 定义迁移到 @vxture/design-system。");
      }
      return null;
    },
  },
  {
    id: "ds/no-app-vx-token-definitions",
    description: "应用层不能新增 --vx-* token 定义；平台 token 和组件 token 必须回收到 DS。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file) || path.extname(file) !== ".css" || isGeneratedOrAsset(file)) return null;
      const text = stripLineComment(line);
      if (/^\s*--vx-[\w-]+\s*:/.test(text)) {
        return violation(
          file,
          lineNumber,
          "应用层不能定义新的 --vx-* token；把平台/组件语义 token 回收到 @vxture/design-system。",
          line,
        );
      }
      return null;
    },
  },
  {
    id: "ds/no-app-component-metric-token",
    description: "应用层不能直接消费 --vx-component-metric-* 兜底尺度 token；必须使用 DS 语义 token 或组件类。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file) || path.extname(file) !== ".css" || isGeneratedOrAsset(file)) return null;
      if (!/var\(--vx-component-metric-/.test(line)) return null;
      return violation(
        file,
        lineNumber,
        "应用 CSS 不能直接消费 --vx-component-metric-*；抽成 --vx-<domain>-* / --vx-<component>-* 语义 token，或迁移为 DS 组件样式。",
        line,
      );
    },
  },
  {
    id: "ds/no-app-portal-scale-token",
    description: "应用层不能消费 admin/console scale 兜底 token；必须使用按语义角色拆分后的 DS token。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file) || path.extname(file) !== ".css" || isGeneratedOrAsset(file)) return null;
      if (!/var\(--vx-(?:admin|console)-scale-/.test(line)) return null;
      return violation(
        file,
        lineNumber,
        "应用 CSS 不能消费 --vx-admin-scale-* / --vx-console-scale-*；改用 --vx-<portal>-space/size/radius/text/effect/track-* 语义 token。",
        line,
      );
    },
  },
  {
    id: "ds/no-extracted-style-role-dimension-token",
    description: "应用 src/styles 抽出模块不能消费角色尺度/布局 token；模块样式必须使用组件语义 token。",
    checkLine(file, line, lineNumber) {
      if (!isExtractedPortalStyleModule(file) || isGeneratedOrAsset(file)) return null;
      if (!/var\(--vx-(?:admin|console|website|vela)-(?:space|size|track|radius|line-width|text-size|text-line|text-tracking|effect|pattern|motion|grid-column|panel-max-height|dialog-max-width|dialog-width|layout|shadow-spread|shadow-blur|status-cutout|pattern-dot)-/.test(line)) {
        return null;
      }
      return violation(
        file,
        lineNumber,
        "抽出到 src/styles 的模块样式不能直接消费角色尺度/布局 token；请在 DS token 层补 --vx-<domain>-<component>-* 语义 token。",
        line,
      );
    },
  },
  {
    id: "ds/no-style-entry-rules",
    description: "大型样式入口只能作为 @import 聚合入口，具体规则必须进入分层模块。",
    checkContent(file, content) {
      const label = IMPORT_ONLY_STYLE_ENTRIES.get(normalize(file));
      if (!label) return [];

      const items = [];
      let inBlockComment = false;
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        const text = line.trim();
        if (!text) return;
        if (inBlockComment) {
          if (text.includes("*/")) inBlockComment = false;
          return;
        }
        if (text.startsWith("/*")) {
          if (!text.includes("*/")) inBlockComment = true;
          return;
        }
        if (/^@import\s+["'][^"']+["'];$/.test(text)) return;
        items.push(
          violation(
            file,
            index + 1,
            `${label} 只能保留 @import 聚合；具体选择器和规则应进入同目录分层模块。`,
            line,
          ),
        );
      });
      return items;
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
  {
    id: "ds/no-token-runtime-value-duplicates",
    description: "DS TS token 文件不能重复维护运行时颜色、间距、圆角、阴影、字号值。",
    checkLine(file, line, lineNumber) {
      const normalized = normalize(file);
      if (!/^packages\/design\/design-system\/src\/tokens\/(colors|spacing|radius|shadow|typography)\.ts$/.test(normalized)) {
        return null;
      }
      const text = stripLineComment(line);
      if (/["'][^"']*(?:#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%)\b)/.test(text)) {
        return violation(file, lineNumber, "运行时 token 值只能定义在 styles/tokens.css；TS token 只暴露 var(--vx-*) 引用。", line);
      }
      return null;
    },
  },
  {
    id: "ds/no-component-metric-in-ds-semantic-css",
    description: "DS 语义样式必须使用语义 token，不能直接消费兜底 metric token。",
    checkLine(file, line, lineNumber) {
      const normalized = normalize(file);
      if (!isDsSemanticStyleFile(normalized)) return null;
      if (!/var\(--vx-component-metric-/.test(line)) return null;
      return violation(
        file,
        lineNumber,
        "DS 语义样式只能使用 --vx-button-*、--vx-field-*、--vx-platform-*、--vx-shell-* 等语义 token；兜底 metric token 只允许在 token 层维护。",
        line,
      );
    },
  },
  {
    id: "ds/no-known-tailwind-typo",
    description: "禁止已知 Tailwind class 拼写错误进入源码。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file)) return null;
      if (line.includes("tranvx")) {
        return violation(file, lineNumber, "疑似 translate-* 被误替换为 tranvx-*，请修正为有效 Tailwind class。");
      }
      return null;
    },
  },
  {
    id: "ds/no-app-tailwind-arbitrary-scale",
    description: "应用层不能新增 Tailwind 任意尺度值；页面尺度必须进入 DS token 或 portal 语义 CSS。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file) || isGeneratedOrAsset(file)) return null;
      if (!hasTailwindArbitraryScale(line)) return null;
      return violation(
        file,
        lineNumber,
        "Tailwind arbitrary 尺度会绕过 DS 约束；迁移为 DS token、portal 语义 CSS 类或 Tailwind/DS 已暴露的标准 token。",
        line,
      );
    },
  },
  {
    id: "ds/no-inline-design-style",
    description: "应用层 inline style 只能承载动态变量或坐标，不能承载颜色、字体、间距、圆角、阴影等设计值。",
    checkContent(file, content) {
      if (!isFrontendSource(file) || isGeneratedOrAsset(file)) return [];
      return findInlineStyleViolations(file, content);
    },
  },
  {
    id: "ds/no-native-primitive",
    description: "业务源码默认不能直接写 button/input/select/textarea，应使用 DS 组件或补充 DS 能力。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file) || isGeneratedOrAsset(file)) return null;
      if (!/<(?:button|input|select|textarea)\b/.test(line)) return null;
      return violation(file, lineNumber, "使用 @vxture/design-system 的 Button/Input/Select 等组件；DS 不足时先补 DS。", line);
    },
  },
  {
    id: "ds/no-native-table",
    description: "业务源码默认不能直接写 table/thead/tbody/tr/th/td，应使用 DS DataTable 或补充 DS 表格能力。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file) || isGeneratedOrAsset(file)) return null;
      if (!/<(?:table|thead|tbody|tr|th|td)\b/.test(line)) return null;
      return violation(file, lineNumber, "使用 @vxture/design-system 的 DataTable；DS 不足时先补 DS 表格能力。", line);
    },
  },
  {
    id: "ds/no-app-hardcoded-scale",
    description: "应用层 CSS 不能新增硬编码 px/rem/em 设计尺度；尺寸、间距、字号、圆角、阴影应进入 DS token 或组件语义样式。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file) || path.extname(file) !== ".css" || isGeneratedOrAsset(file)) return null;
      if (isAllowlistedScaleLine(line)) return null;

      const match = line.match(/^\s*([\w-]+)\s*:\s*([^;]+);?/);
      if (!match) return null;

      const property = match[1] ?? "";
      const value = match[2] ?? "";
      if (!hasHardcodedScale(value) || isAllowlistedScaleDeclaration(property, value)) return null;

      return violation(
        file,
        lineNumber,
        "应用 CSS 不能新增硬编码 px/rem/em 设计尺度；使用 DS spacing/radius/typography/shadow token，或迁移为 DS 组件语义样式。",
        line,
      );
    },
  },
  {
    id: "ds/no-app-hardcoded-layout-scale",
    description: "应用层布局算法不能新增硬编码设计尺度；min/max/clamp/minmax 中的具体尺度应提升为 DS 语义 token。",
    checkLine(file, line, lineNumber) {
      if (!isFrontendSource(file) || path.extname(file) !== ".css" || isGeneratedOrAsset(file)) return null;
      const text = stripLineComment(line);
      if (!hasHardcodedScale(text)) return null;
      if (!/\b(?:calc|min|max|clamp|minmax)\(/.test(text) && !/^\s*grid-template-(?:columns|rows)\s*:/.test(text)) {
        return null;
      }
      return violation(
        file,
        lineNumber,
        "应用 CSS 布局算法不能新增硬编码 px/rem/em 设计尺度；把列宽、弹窗宽度、断点内尺寸等提升为 DS 语义 token。",
        line,
      );
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
  for (const rule of rules) {
    if (!rule.checkContent) continue;
    for (const item of rule.checkContent(file, content)) {
      violations.push({ rule, ...item });
    }
  }

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

if (UPDATE_BASELINE) {
  updateBaseline(violations);
  process.exit(0);
}

const baseline = readBaseline();
const activeViolations = violations.filter((item) => !isBaselineAllowed(item, baseline));

if (activeViolations.length > 0) {
  console.error("\nDesign System guardrails failed:\n");
  for (const item of activeViolations) {
    console.error(`- ${item.rule.id}: ${item.file}:${item.line}`);
    console.error(`  ${item.message}`);
  }
  console.error("\nFix rule: design tokens and primitives belong in @vxture/design-system; apps only compose them.\n");
  process.exit(1);
}

const baselineCount = violations.length - activeViolations.length;
console.log(
  baselineCount > 0
    ? `Design System guardrails passed. Existing DS debt locked by baseline: ${baselineCount}.`
    : "Design System guardrails passed.",
);

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

function hasHardcodedScale(value) {
  return /(?:^|[\s(,])[-+]?\d+(?:\.\d+)?(?:px|rem|em)\b/.test(value);
}

function hasTailwindArbitraryScale(line) {
  const text = stripLineComment(line);
  return /(?:^|[\s"'`{])!?[A-Za-z0-9:/_-]+-\[[^\]]*\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%)[^\]]*\]/.test(text);
}

function isAllowlistedScaleLine(line) {
  const text = stripLineComment(line).trim();
  if (!text) return true;
  if (text.startsWith("@media")) return true;
  return false;
}

function isAllowlistedScaleDeclaration(property, value) {
  const normalizedProperty = property.toLowerCase();
  const normalizedValue = value.trim();
  if (normalizedProperty.startsWith("--")) return true;
  if (/^(grid-template-columns|grid-template-rows|grid-auto-columns|grid-auto-rows)$/.test(normalizedProperty)) {
    return true;
  }
  if (
    /^(border|border-top|border-right|border-bottom|border-left|outline)$/.test(normalizedProperty) &&
    isHairlineOnly(normalizedValue)
  ) {
    return true;
  }
  if (
    /^(width|min-width|max-width|height|min-height|max-height)$/.test(normalizedProperty) &&
    /\b(?:calc|min|max)\(/.test(normalizedValue)
  ) {
    return true;
  }
  return false;
}

function isHairlineOnly(value) {
  const scaleValues = value.match(/[-+]?\d+(?:\.\d+)?(?:px|rem|em)\b/g) ?? [];
  return scaleValues.length > 0 && scaleValues.every((item) => item === "1px" || item === "0px");
}

function stripLineComment(line) {
  const commentIndex = line.indexOf("//");
  return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
}

function isFrontendSource(file) {
  return /^(portals|agent-studio|business)\//.test(normalize(file));
}

function isExtractedPortalStyleModule(file) {
  return /^(portals|agent-studio|business)\/[^/]+\/src\/styles\/.+\.css$/.test(normalize(file));
}

function isDesignSystemConsumerSource(file) {
  const normalized = normalize(file);
  if (normalized.startsWith(`${DS_ROOT}/`)) return false;
  return /^(portals|agent-studio|business|packages)\//.test(normalized);
}

function isFrontendPackageManifest(file) {
  return /^(portals|agent-studio|business)\/[^/]+\/package\.json$/.test(normalize(file));
}

function isDirectUiEngineDependency(dependency) {
  return DIRECT_UI_ENGINE_DEPENDENCIES.some((item) =>
    typeof item === "string" ? item === dependency : item.test(dependency),
  );
}

function isDsSemanticStyleFile(normalized) {
  return (
    DS_SEMANTIC_STYLE_PATHS.has(normalized) ||
    /^packages\/design\/design-system\/src\/styles\/platform-[\w-]+\.css$/.test(normalized)
  );
}

function findDesignSystemSpecifiers(line) {
  const specifiers = [];
  const patterns = [
    /from\s+["'](@vxture\/design-system(?:\/[^"']+)?)["']/g,
    /import\s+["'](@vxture\/design-system(?:\/[^"']+)?)["']/g,
    /@import\s+["'](@vxture\/design-system(?:\/[^"']+)?)["']/g,
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(line);
    while (match) {
      if (match[1]) specifiers.push(match[1]);
      match = pattern.exec(line);
    }
  }

  return specifiers;
}

function isDsTokenOwner(file) {
  const normalized = normalize(file);
  return DS_TOKEN_PATHS.some((tokenPath) => normalized === tokenPath || normalized.startsWith(`${tokenPath}/`));
}

function isGeneratedOrAsset(file) {
  const normalized = normalize(file);
  return /\/(dist|build|\.next|public|assets)\//.test(normalized);
}

function findInlineStyleViolations(file, content) {
  const lines = content.split(/\r?\n/);
  const items = [];
  let block = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (!block && /style=\{\{/.test(line)) {
      block = {
        line: lineNumber,
        lines: [line],
      };
      if (line.includes("}}")) {
        pushInlineStyleViolation(file, block, items);
        block = null;
      }
      return;
    }

    if (!block) return;
    block.lines.push(line);
    if (line.includes("}}") || block.lines.length >= 80) {
      pushInlineStyleViolation(file, block, items);
      block = null;
    }
  });

  return items;
}

function pushInlineStyleViolation(file, block, items) {
  const text = block.lines.join("\n");
  if (!hasInlineDesignValue(text)) return;
  items.push(
    violation(
      file,
      block.line,
      "inline style 只能用于 CSS 变量、坐标、transform、背景图片等动态值；颜色/字体/间距/圆角/阴影进入 DS。",
      text,
    ),
  );
}

function hasInlineDesignValue(text) {
  const compact = stripQuotedTemplateExpressions(text);
  if (/['"]--vx-[\w-]+['"]\s*:/.test(compact) && !hasUnsafeInlineStyleProperty(compact)) return false;
  return hasUnsafeInlineStyleProperty(compact);
}

function hasUnsafeInlineStyleProperty(text) {
  return /(?:^|[,{;\s])(?:background|backgroundColor|border|borderColor|borderRadius|boxShadow|color|display|alignItems|justifyContent|gap|fontFamily|fontSize|fontWeight|letterSpacing|lineHeight|margin|marginTop|marginRight|marginBottom|marginLeft|padding|paddingTop|paddingRight|paddingBottom|paddingLeft|minWidth|maxWidth|minHeight|maxHeight)\s*:/.test(
    text,
  );
}

function stripQuotedTemplateExpressions(text) {
  return text.replace(/`[^`]*`/g, "``").replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
}

function readBaseline() {
  if (!exists(BASELINE_PATH)) return new Set();
  const data = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  return new Set(Array.isArray(data.allowed) ? data.allowed : []);
}

function updateBaseline(allViolations) {
  const allowed = [...new Set(allViolations.filter((item) => BASELINED_RULE_IDS.has(item.rule.id)).map(signatureFor))].sort();
  const payload = {
    version: 1,
    description:
      "Existing DS inline-style/native-primitive/scale debt. The guardrail blocks new signatures; shrink this file as modules migrate to DS.",
    allowed,
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Design System baseline updated: ${allowed.length} existing violations recorded.`);
}

function isBaselineAllowed(item, baseline) {
  return BASELINED_RULE_IDS.has(item.rule.id) && baseline.has(signatureFor(item));
}

function signatureFor(item) {
  const source = item.source ? normalizeSnippet(item.source) : `${item.file}:${item.line}`;
  return `${item.rule.id}|${item.file}|${source}`;
}

function normalizeSnippet(value) {
  return value.replace(/\s+/g, " ").trim();
}

function findLineNumber(content, pattern) {
  const index = content.indexOf(pattern);
  if (index < 0) return 1;
  return content.slice(0, index).split(/\r?\n/).length;
}

function violation(file, line, message, source = "") {
  return {
    file: normalize(path.relative(ROOT, file)),
    line,
    message,
    source,
  };
}

function normalize(value) {
  return value.replaceAll("\\", "/").replace(/^([A-Za-z]:)?\/?MyWebSite\/vxture\//, "");
}
