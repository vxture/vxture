# 项目完整目录结构

## 当前结构（packages/web/src/）

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   ├── about/
│   ├── helloworld/
│   ├── products/
│   ├── test/
│   │   ├── localtest/
│   │   ├── pagetest/
│   │   ├── phase1/
│   │   ├── styles-demo1/
│   │   ├── styles-demo2/
│   │   └── theme-system/
│   ├── twtest/
│   ├── layout.tsx
│   ├── globals.css
│   ├── icon.tsx
│   └── apple-icon.tsx
│
├── components/
│   ├── about/
│   ├── aboutus/
│   ├── common/
│   ├── home/
│   ├── layout/
│   └── products/
│
├── constants/
│   ├── authConfig.ts
│   ├── i18nConfig.ts
│   └── themeConfig.ts
│
├── content/                    # 🆕 已有此目录
│
├── contexts/
│   └── GlobalContext.tsx
│
├── hooks/
│   ├── useScrollSnap.js
│   ├── useScrollSnap.ts
│   └── useWindowScrollSnap.ts
│
├── services/
│   ├── authService.ts
│   ├── i18nService.ts
│   └── themeService.ts
│
├── stores/
│   ├── authStore.ts
│   ├── i18nStore.ts
│   ├── notificationStore.ts
│   ├── persistHelper.ts
│   ├── themeStore.ts
│   └── persistOptions/
│
├── styles/
│   ├── base/
│   ├── components/
│   ├── themes/
│   ├── utilities/
│   ├── base.css
│   ├── components.css
│   ├── debug-dark.css
│   ├── force-dark.css
│   ├── themes.css
│   └── utilities.css
│
├── theme/
│   └── colorMap.ts
│
├── types/
│   ├── auth.types.ts
│   ├── i18n.types.ts
│   └── theme.types.ts
│
├── utils/
│   └── scroll.ts
│
└── global.d.ts
```

## 建议的新结构（Week 1 调整）

```
src/
├── app/                        # ✅ 保持不变
│   ├── (auth)/
│   ├── (main)/
│   ├── about/
│   ├── products/
│   ├── test/
│   ├── helloworld/
│   ├── twtest/
│   ├── layout.tsx
│   ├── globals.css
│   └── ...
│
├── components/                 # ✅ 保持不变
│   ├── about/
│   ├── common/
│   ├── home/
│   ├── layout/
│   └── products/
│
├── constants/                  # ✅ 保持不变
│   ├── authConfig.ts
│   ├── i18nConfig.ts
│   └── themeConfig.ts
│
├── content/                    # ✅ 保持
│
├── contexts/                   # ✅ 保持不变
│   └── GlobalContext.tsx
│
├── hooks/                      # 📝 新增 useContent
│   ├── useScrollSnap.ts
│   ├── useWindowScrollSnap.ts
│   └── useContent.ts           # 🆕 新增
│
├── locales/                    # 🆕 新增（替代 i18nStore 翻译）
│   ├── zh-CN/
│   │   ├── common.json
│   │   ├── nav.json
│   │   ├── home.json
│   │   ├── products.json
│   │   ├── about.json
│   │   └── footer.json
│   ├── en-US/
│   │   ├── common.json
│   │   ├── nav.json
│   │   ├── home.json
│   │   ├── products.json
│   │   ├── about.json
│   │   └── footer.json
│   └── index.ts
│
├── services/                   # 📝 修改 i18nService
│   ├── authService.ts
│   ├── i18nService.ts          # 📝 改成加载 locales/*.json
│   ├── contentService.ts       # 🆕 新增（加载 public/data/*.json）
│   └── themeService.ts
│
├── stores/                     # 📝 简化 i18nStore
│   ├── authStore.ts
│   ├── i18nStore.ts            # 📝 只保留 locale 状态
│   ├── notificationStore.ts
│   ├── themeStore.ts           # 📝 添加 'system' 主题
│   ├── persistHelper.ts
│   └── persistOptions/
│
├── styles/                     # ✅ 保持不变
│   ├── base/
│   ├── components/
│   ├── themes/
│   ├── utilities/
│   ├── base.css
│   ├── components.css
│   ├── themes.css
│   └── utilities.css
│
├── theme/                      # ✅ 保持不变
│   └── colorMap.ts
│
├── types/                      # 📝 新增 content.types
│   ├── auth.types.ts
│   ├── content.types.ts        # 🆕 新增
│   ├── i18n.types.ts
│   └── theme.types.ts
│
├── utils/                      # ✅ 保持不变
│   └── scroll.ts
│
└── global.d.ts
```

## public 目录新增

```
public/
├── data/                       # 🆕 新增（页面内容 JSON）
│   ├── hero.zh-CN.json
│   ├── hero.en-US.json
│   ├── features.zh-CN.json
│   ├── features.en-US.json
│   ├── products.zh-CN.json
│   ├── products.en-US.json
│   ├── cases.zh-CN.json
│   ├── cases.en-US.json
│   ├── cta.zh-CN.json
│   └── cta.en-US.json
├── images/
├── icons/
├── videos/
└── manifest.json
```

## 变更摘要

| 项                               | 类型    | 说明                             |
| -------------------------------- | ------- | -------------------------------- |
| `src/hooks/useContent.ts`        | 🆕 新增 | 加载内容数据的 Hook              |
| `src/locales/`                   | 🆕 新增 | 翻译文件（zh-CN/, en-US/)        |
| `src/services/contentService.ts` | 🆕 新增 | 加载 public/data/\*.json         |
| `src/types/content.types.ts`     | 🆕 新增 | 内容类型定义                     |
| `public/data/`                   | 🆕 新增 | 页面内容 JSON 文件               |
| `src/stores/i18nStore.ts`        | 📝 修改 | 移除翻译数据，只保留 locale 状态 |
| `src/stores/themeStore.ts`       | 📝 修改 | 添加 'system' 主题选项           |
| `src/services/i18nService.ts`    | 📝 修改 | 改为加载 src/locales/\*.json     |
| `src/components/home/*.tsx`      | 📝 修改 | 使用 useContent() 替代硬编码数据 |

## 实施优先级

**Week 1 必做：**

- ✅ 创建 `src/locales/` 和翻译文件
- ✅ 创建 `public/data/` 和内容 JSON
- ✅ 创建 `src/services/contentService.ts`
- ✅ 创建 `src/hooks/useContent.ts`
- ✅ 简化 `src/stores/i18nStore.ts`

**Week 2 可选：**

- 集成 i18next
- 优化缓存策略

**Week 3+ 可选：**

- API 集成（FastAPI）
- Strapi CMS 部署
