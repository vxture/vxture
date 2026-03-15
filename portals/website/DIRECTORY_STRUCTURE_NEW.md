# @vxture/website 完整目录清单（最新）

## 根目录配置文件
```
./CLAUDE.md
./DIRECTORY_STRUCTURE.md
./DIRECTORY_STRUCTURE_NEW.md
./eslint.config.mjs
./next.config.js
./next-env.d.ts
./package.json
./postcss.config.cjs
./REFACTOR_PLAN.md
./REFACTOR_TASK.md
./REVIEW_CHECKLIST.md
./tailwind.config.js
./tsconfig.json
./tsconfig.tsbuildinfo
```

## 翻译资源
```
./messages/en/about.json
./messages/en/auth.json
./messages/en/common.json
./messages/en/contact.json
./messages/en/features.json
./messages/en/home.json
./messages/en/pricing.json
./messages/zh/about.json
./messages/zh/auth.json
./messages/zh/common.json
./messages/zh/contact.json
./messages/zh/features.json
./messages/zh/home.json
./messages/zh/pricing.json
```

## Public 资源文件
```
./public/html/component-arch-diagram.svg
./public/html/component-system-architecture.html
./public/html/icon-architecture-diagram.svg
./public/html/icon-system-architecture.html
./public/icons/favicon.ico
./public/icons/favicon1.ico
./public/images/casessection/case-intro-01.jpg
./public/images/casessection/case-intro-02.jpg
./public/images/casessection/case-intro-03.jpg
./public/images/common/png/poster-dark.jpg
./public/images/common/png/poster-light.jpg
./public/images/common/svg/medal.svg
./public/images/common/svg/star.svg
./public/images/common/vxturelogo.png
./public/images/costomlogo/costom-logo-01.png
./public/images/costomlogo/costom-logo-02.png
./public/images/footer/WeChatOfficialAccounts.png
./public/images/footer/WeChatOfficialAccounts.webp
./public/images/header/vxture-logo.svg
./public/images/header/vxture-logo2.png
./public/images/header/vxture-logo-white.png
./public/images/herosection/banner-hero-poster-dark-01.png
./public/images/herosection/banner-hero-poster-fire-01.jpg
./public/images/herosection/banner-hero-poster-light-01.png
./public/images/productssection/Windows-Computer-Monitor-PNG-HD-Quality - 副本.png
./public/images/productssection/dualmonitor-frame.jpg
./public/images/productssection/dualmonitor-frame.png
./public/images/productssection/dualmonitor-frame1.png
./public/images/productssection/monitor-base.png
./public/images/productssection/monitor-frame.png
./public/images/productssection/new-product-intro-2603/product-intro-01.jpg
./public/images/productssection/new-product-intro-2603/product-intro-02.jpg
./public/images/productssection/new-product-intro-2603/product-intro-03.jpg
./public/images/productssection/new-product-intro-2603/product-intro-04.jpg
./public/images/productssection/product-intro-01.jpg
./public/images/productssection/product-intro-02.jpg
./public/images/productssection/product-intro-03.jpg
./public/images/productssection/product-intro-04.jpg
./public/images/productssection/simple-gaming-monitor-computer-monitor-mockup-computer-monitor-frame-icon-presented-on-white-background-vector.jpg
./public/manifest.json
./public/videos/herosection/banner-hero-011.mp4
./public/videos/herosection/banner-hero-011.webm
```

## 脚本文件
```
./scripts/verify-content-system.js
```

## 源代码 (src/)

### API 层
```
./src/api/auth.api.ts
./src/api/client.ts
./src/api/content.ts
./src/api/index.ts
```

### App Router
```
./src/app/[locale]/(auth)/signup/page.tsx
./src/app/[locale]/(auth)/singin/page.tsx
./src/app/[locale]/(marketing)/(main)/layout.tsx
./src/app/[locale]/(marketing)/(main)/page.tsx
./src/app/[locale]/(marketing)/about/layout.tsx
./src/app/[locale]/(marketing)/about/page.tsx
./src/app/[locale]/(marketing)/products/page.tsx
./src/app/[locale]/layout.tsx
./src/app/globals.css
./src/app/layout.tsx
./src/app/metadata.ts
```

### 组件
#### Marketing（营销页面组件）
```
./src/components/marketing/CaseSection.tsx
./src/components/marketing/CTASection.tsx
./src/components/marketing/FeaturesSection.tsx
./src/components/marketing/HeroSection.tsx
./src/components/marketing/index.ts
./src/components/marketing/ProductDetailPartOne.tsx
./src/components/marketing/SolutionSection.tsx
./src/components/marketing/StatsSection.tsx
./src/components/marketing/TestSection.tsx
```

#### Auth（认证页面组件）
```
./src/components/auth/index.ts
./src/components/auth/LoginForm.tsx
./src/components/auth/SignupForm.tsx
```

#### Layout（布局组件）
```
./src/components/layout/Footer.tsx
./src/components/layout/Header.tsx
./src/components/layout/index.ts
./src/components/layout/layoutHelpers.ts
./src/components/layout/Sidebar.tsx
```

#### UI（应用级 UI 组件）
```
./src/components/ui/index.ts
./src/components/ui/LocaleSwitcher.tsx
./src/components/ui/Notifications.tsx
./src/components/ui/PriceDisplay.tsx
./src/components/ui/ScrollToButton.tsx
./src/components/ui/ThemeSwitcher.tsx
./src/components/ui/ThemeSync.tsx
./src/components/ui/ThemeToggleButton.tsx
```

#### UI Panels（调试面板）
```
./src/components/ui/panels/index.ts
./src/components/ui/panels/SnapChoicePanel.tsx
./src/components/ui/panels/SnapDebugPanel.tsx
```

### 常量
```
./src/constants/auth.constants.ts
./src/constants/index.ts
./src/constants/routes.constants.ts
```

### Fallback 数据
```
./src/fallback/homepage.fallback.ts
./src/fallback/layout.fallback.ts
```

### Hooks
```
./src/hooks/index.ts
./src/hooks/useAuth.ts
./src/hooks/useHomepage.ts
./src/hooks/useLayout.ts
./src/hooks/useWindowScrollSnap.ts
```

### Lib
```
./src/lib/i18n/index.ts
./src/lib/i18n/navigation.ts
./src/lib/i18n/request.ts
./src/lib/i18n/routing.ts
./src/lib/persistHelper.ts
```

### Stores
```
./src/stores/auth.store.ts
./src/stores/notification.store.ts
./src/stores/theme.store.ts
```

#### Stores Persist Options
```
./src/stores/persistOptions/authPersist.ts
./src/stores/persistOptions/themePersist.ts
```

### Types
```
./src/types/api.types.ts
./src/types/auth.types.ts
./src/types/common.types.ts
./src/types/components.types.ts
./src/types/homepage.types.ts
./src/types/i18n.types.ts
./src/types/index.ts
./src/types/layout.types.ts
./src/types/theme.types.ts
```

### 临时文件
```
./src/tmp/ScreenInfo.tsx
```

### 其他
```
./src/global.d.ts
./src/middleware.ts
```

## 规范说明
### components/ 目录结构规范
```
src/components/
├── auth/               # 认证相关组件
├── layout/             # 布局组件
├── marketing/          # 营销页面组件
└── ui/                 # 应用级 UI 组件
    └── panels/         # 调试面板
```
