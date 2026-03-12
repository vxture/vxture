# Website 包重构计划
**文档版本**: 2.0
**修订日期**: 2026-03-12
**修订人**: Stone Smoker
**联系方式**: yanhaoguo@gmail.com

## 项目概述

**项目名称**: Vxture 公开营销站点重构
**当前状态**: 架构严重不符，需要全面重构
**重构目标**: 使 website 包符合 Vxture 架构规范（Presentation 层）
**预计时间**: 3-4 周

---

## 1. 重构内容分析

### 1.1 当前架构问题分析

#### 目录结构问题
```
src/
├── app/                      # Next.js 15 路由（符合规范）
├── application/              # 应用层（过度工程化）
│   ├── hooks/                # 包含业务逻辑的 Hooks
│   └── usecases/             # 用例层（不应在 Frontend 存在）
├── domain/                   # 领域层（不应在 Frontend 存在）
├── infrastructure/           # 基础设施层（不应在 Frontend 存在）
├── presentation/             # 展示层（与 app/ 重叠）
│   ├── components/
│   │   └── panels/           # 调试/开发组件
│   └── views/               # 页面视图（与 app/ 重叠）
└── stores/                   # 全局状态（Zustand）
```

#### 架构层次问题
- ❌ **业务逻辑下沉到前端**: `application/usecases/` 包含领域逻辑（违反 Presentation 层职责）
- ❌ **过度分层**: Frontend 不应有 Domain / Infrastructure 层
- ❌ **服务层侵入**: 代码中存在对 `@vxture/service-*` 包的引用（违反边界约束）
- ❌ **内容系统过度设计**: `CONTENT_SYSTEM_GUIDE.md` 中描述的复杂架构不适合简单营销站点
- ❌ **依赖关系混乱**: 使用了 `@tanstack/react-query`, `puppeteer` 等不必要的依赖
- ❌ **展示层重叠**: `app/` 和 `presentation/views/` 功能重叠

---

### 1.2 重构后的目标架构

```
src/
├── app/                      # Next.js 15 路由（保持不变）
├── components/               # UI 组件
│   ├── common/              # 跨页面复用组件
│   ├── panels/              # 调试/开发组件（SnapChoicePanel, SnapDebugPanel）
│   └── {page}/              # 页面专属组件
├── hooks/                    # 前端专属 Hooks（数据获取、UI 逻辑）
├── api/                      # BFF 接口调用层
├── stores/                   # 全局状态（Zustand）
└── types/                    # 前端专属类型
```

#### 架构原则
- ✅ **Presentation 层职责**: 只负责 UI 渲染、用户交互、数据展示
- ✅ **API 边界**: 所有数据通过 BFF 层获取，HTTP 调用统一在 `api/` 目录
- ✅ **依赖约束**: 只依赖 `@vxture/design-system`, `@vxture/shared`, BFF（HTTP 调用）
- ✅ **组件复用**: 使用设计系统组件，不重复造轮子

---

### 1.3 内容迁移计划与决策

#### 迁移路径决策
| 原目录 | 内容类型 | 迁移目标 | 推荐方案 |
|--------|----------|----------|----------|
| `application/usecases/` | 领域逻辑 | `services/content/` 或 `bff/website-bff/` | `services/content/` |
| `application/hooks/` | 业务逻辑 Hooks | `bff/website-bff/` 或删除 | 删除 |
| 内容管理系统 | 复杂架构 | BFF 层简单 API | 简化为简单 API |
| `domain/entities/` | 实体类型 | `@vxture/shared` 或 BFF 层类型 | `@vxture/shared` |
| `domain/repositories/` | 数据仓库 | `services/content/` | `services/content/` |
| `infrastructure/adapters/` | 数据源适配器 | `bff/website-bff/` | `bff/website-bff/` |
| `infrastructure/clients/` | API 客户端 | `bff/website-bff/` | `bff/website-bff/` |

---

### 1.4 具体功能模块重构计划

#### 1.4.1 Theme System（主题含密度系统）
**当前状态**: 使用 `@vxture/design-system` 的 ThemeProvider
**重构方案**:
- 保持设计系统的 ThemeProvider 不变
- 移除自定义的 theme hooks
- 简化主题切换逻辑
- 密度系统使用设计系统的 DensityProvider

#### 1.4.2 i18n（国际化）
**当前状态**: 使用自定义的 `@vxture/shared` locale 功能
**重构方案**: 完全摒弃当前实现，引入 `react-i18next` 行业标准方案
- 使用 `react-i18next` + `i18next` 替代当前实现
- 语言文件按命名空间组织，放在 `public/locales/{locale}/{namespace}.json`
- 支持命名空间（namespace）按需加载
- 实现类型安全的翻译键
- 集成 Next.js 15 App Router
- 与 `@vxture/shared` 的 `I18N_CONSTANTS` 和类型保持兼容

**资源文件结构**:
```
public/locales/
├── zh-CN/
│   ├── common.json         # 通用翻译（按钮、表单等）
│   ├── home.json           # 首页翻译
│   ├── about.json          # 关于页面翻译
│   └── validation.json     # 验证消息翻译
└── en-US/
    ├── common.json
    ├── home.json
    ├── about.json
    └── validation.json
```

**核心依赖**:
- `i18next` ^24.0.0
- `react-i18next` ^15.0.0
- `i18next-http-backend` ^2.6.0 （按需加载翻译文件）
- `i18next-browser-languagedetector` ^8.0.0 （浏览器语言检测）

#### 1.4.3 Fullscreen（全屏系统）
**当前状态**: 使用设计系统的全屏组件
**重构方案**:
- 使用 `@vxture/design-system` 的 FullscreenContainer
- 简化全屏逻辑，移除自定义实现
- 支持 pseudo 和 native 两种模式

#### 1.4.4 Notification（通知系统）
**当前状态**: 无专门实现
**重构方案**:
- 集成设计系统的通知组件
- 创建简单的通知管理 Hook
- 支持全局通知和局部通知

#### 1.4.5 Auth（认证系统）
**当前状态**: 使用 JWT tokens 和 API 验证
**重构方案**:
- 保持现有认证机制
- 统一在 `api/auth.ts` 中实现
- 简化认证状态管理

#### 1.4.6 Scroll Snap（滚动快照）
**当前状态**: 自定义实现（`useWindowScrollSnap`）
**重构方案**:
- 重构 `useWindowScrollSnap` Hook
- 创建 `ScrollSnapContainer` 组件
- 支持多种滚动对齐方式
- 集成到设计系统

#### 1.4.7 Panel Components（调试组件）
**SnapChoicePanel** 和 **SnapDebugPanel** 重构方案:
```
src/components/panels/
├── SnapChoicePanel.tsx     # 滚动对齐选择面板
├── SnapDebugPanel.tsx      # 滚动调试面板
└── index.ts                # 统一导出
```

**设计原则**:
- 支持在任何需要的项目中复用
- 暴露统一的 API 和事件
- 提供 TypeScript 类型支持
- 可配置和可扩展


---

## 2. 工作阶段拆分与计划

### 阶段 1: 准备阶段（1 天）
- [ ] 分析现有代码质量和架构问题
- [ ] 制定详细的重构计划（本文件）
- [ ] 建立重构任务清单和时间估算
- [ ] 确认技术栈和依赖关系

### 阶段 2: 目录结构重构（2 天）
- [ ] 创建新的目录结构
- [ ] 移除不应该存在的层（domain, infrastructure, application/usecases）
- [ ] 重新组织 components, hooks, api, types 目录
- [ ] 更新 tsconfig.json 和路径配置

### 阶段 3: 核心功能重构（5 天）
- [ ] 重构首页（Hero, Features, Solutions, Cases, CTA）
- [ ] 重构布局组件（Header, Footer）
- [ ] 重构内容管理系统（简化为直接的 JSON 加载）
- [ ] 重构 API 调用层（统一到 api/ 目录）

### 阶段 4: 组件重构（5 天）
- [ ] 替换自定义组件为设计系统组件
- [ ] 重构所有页面组件（使用新的架构）
- [ ] 确保组件文件大小 < 150 行
- [ ] 实现组件懒加载

### 阶段 5: Hooks 和状态管理重构（3 天）
- [ ] 重构所有 Hooks（简化逻辑，移除业务逻辑）
- [ ] 更新 Zustand 状态管理
- [ ] 实现数据获取 Hook（统一 API 调用）

### 阶段 6: 依赖清理（2 天）
- [ ] 移除不必要的依赖（@tanstack/react-query, puppeteer 等）
- [ ] 更新 package.json 和 pnpm-lock.yaml
- [ ] 确保符合架构依赖约束

### 阶段 7: 测试与验证（3 天）
- [ ] 验证所有页面功能正常
- [ ] 测试响应式设计
- [ ] 检查 TypeScript 类型安全
- [ ] 执行 ESLint 和 Prettier 检查

### 阶段 8: 部署与监控（1 天）
- [ ] 部署到测试环境
- [ ] 监控页面加载性能
- [ ] 验证 SEO 功能
- [ ] 收集用户反馈

---

## 3. 技术栈重构

### 3.1 技术选型决策与推荐

#### 3.1.1 前端路由方案
**现状**: 使用 Next.js App Router（符合规范）
**推荐**: 保持 Next.js App Router，适合营销站点的 SSR/SSG 需求
**理由**: 营销站点需要良好的 SEO 和首屏性能，Next.js App Router 提供最佳的 SSR/SSG 支持

#### 3.1.2 状态管理方案
**现状**: 使用 Zustand
**推荐**: 继续使用 Zustand，适合中大型项目维护
**理由**: 轻量级、易于上手、性能优秀，无需 Redux 的复杂性，适合 Portal 级别跨组件共享数据

#### 3.1.3 UI 主题切换策略
**现状**: 使用设计系统的 ThemeProvider
**推荐**: 设计系统 theme + CSS variables，实现 light / dark / system 模式
**理由**: 统一的设计系统支持，CSS variables 提供灵活的主题切换能力

#### 3.1.4 国际化资源管理
**现状**: 使用自定义 JSON 文件方案
**推荐**: 模块化 JSON 文件，前端懒加载（react-i18next + i18next-http-backend）
**理由**: 符合行业最佳实践，支持按需加载和类型安全

### 3.2 保留的技术
- **Next.js 15**: 保持现有版本
- **React 19**: 保持现有版本
- **TypeScript 5.9**: 保持现有版本
- **Tailwind CSS 4**: 保持现有版本
- **@vxture/design-system**: 保持现有版本
- **Zustand**: 保持现有版本（状态管理）

### 3.3 需要更新的依赖
- **移除 @tanstack/react-query**: 使用简单的 fetch + React.cache
- **移除 puppeteer**: 不需要在前端使用
- **移除 @headlessui/react**: 使用设计系统组件
- **移除 @heroicons/react**: 使用设计系统图标
- **移除 lucide-react**: 使用设计系统图标

### 3.4 新增依赖（必要时）
- **axios**: 替代 fetch（可选）
- **react-intersection-observer**: 用于懒加载
- **i18next**: ^24.0.0 — 国际化核心库
- **react-i18next**: ^15.0.0 — React 绑定
- **i18next-http-backend**: ^2.6.0 — 按需加载翻译文件
- **i18next-browser-languagedetector**: ^8.0.0 — 浏览器语言检测

---

## 4. 内容管理系统重构

### 4.1 当前问题
- 过度复杂的 Content System Architecture
- 使用 JSON 文件 + 类型系统的复杂方案
- 不符合简单营销站点的需求
- 包含不必要的业务逻辑（如 `batchLoad`, `preloadPageContent`）

### 4.2 重构方案
- 简化内容管理：直接从 `public/data/` 加载 JSON 文件
- 移除复杂的内容服务和钩子
- 使用简单的 `useContent` Hook 直接获取数据
- 多语言支持完全由 `react-i18next` 处理
- 翻译资源文件按 `react-i18next` 最佳实践组织在 `public/locales/`
- 内容数据（非翻译文本）放在 `public/data/` 目录

### 4.3 BFF 集成方案
**如果需要更复杂的内容管理**：
```typescript
// src/api/content.ts
import { apiClient } from './client';

export async function getContent(key: string, locale: string) {
  const response = await apiClient.get(`/api/content/${key}`, {
    params: { locale }
  });
  return response.data;
}

export async function getPageContent(page: string, locale: string) {
  const response = await apiClient.get(`/api/content/page/${page}`, {
    params: { locale }
  });
  return response.data;
}
```

---

## 5. react-i18next 国际化实现方案

### 9.1 技术选型说明

完全摒弃当前自定义 i18n 实现，采用行业标准方案：

| 库 | 版本 | 用途 |
|---|---|---|
| `i18next` | ^24.0.0 | 国际化核心库 |
| `react-i18next` | ^15.0.0 | React 绑定层 |
| `i18next-http-backend` | ^2.6.0 | 通过 HTTP 按需加载翻译文件 |
| `i18next-browser-languagedetector` | ^8.0.0 | 自动检测浏览器语言 |

### 9.2 初始化配置

```typescript
// src/lib/i18n/index.ts
/**
 * i18n 配置 - react-i18next 初始化
 * @package @vxture/website
 *
 * Description: react-i18next 初始化配置，集成 http-backend 和 browser-languagedetector
 *
 * @author AI-Generated
 * @date 2026-03-12
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Presentation
 * @category i18n
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18N_CONSTANTS } from '@vxture/shared';

i18n
  // 通过 HTTP 加载翻译文件 (/locales/{lng}/{ns}.json)
  .use(Backend)
  // 自动检测浏览器语言
  .use(LanguageDetector)
  // 集成 react-i18next
  .use(initReactI18next)
  // 初始化配置
  .init({
    fallbackLng: I18N_CONSTANTS.DEFAULT_LOCALE,
    supportedLngs: I18N_CONSTANTS.AVAILABLE_LOCALES.map(l => l.locale),
    debug: process.env.NODE_ENV === 'development',

    // 命名空间配置
    defaultNS: 'common',
    ns: ['common', 'home', 'about', 'validation'],

    interpolation: {
      escapeValue: false, // React 已经安全转义
    },

    // 后端配置
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // 语言检测配置
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: I18N_CONSTANTS.STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### 9.2 Next.js App Router 集成

```typescript
// src/app/providers.tsx
/**
 * i18n Provider 组件
 * @package @vxture/website
 *
 * Description: Next.js App Router 的 i18n 提供者包装器
 *
 * @layer Presentation
 * @category i18n
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  // 确保 i18n 在客户端初始化
  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
```

### 9.3 类型安全实现

```typescript
// src/lib/i18n/types.ts
/**
 * i18n 类型定义 - 类型安全的翻译键
 * @package @vxture/website
 *
 * Description: 从翻译 JSON 文件生成类型，提供完整的 TypeScript 类型安全
 *
 * @layer Presentation
 * @category i18n
 */

import type { I18nResource } from '@vxture/shared';

// 导入翻译文件类型（通过 i18next-resources-for-ts 生成）
import type common from '../../../public/locales/zh-CN/common.json';
import type home from '../../../public/locales/zh-CN/home.json';
import type about from '../../../public/locales/zh-CN/about.json';
import type validation from '../../../public/locales/zh-CN/validation.json';

// 命名空间映射
export interface I18nNamespaces {
  common: typeof common;
  home: typeof home;
  about: typeof about;
  validation: typeof validation;
}

// 扩展 react-i18next 类型
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: I18nNamespaces;
  }
}
```

### 9.4 使用示例

#### 基础使用

```typescript
// 在组件中使用
import { useTranslation } from 'react-i18next';

function MyComponent() {
  // 使用 common 命名空间
  const { t, i18n } = useTranslation('common');

  // 切换语言
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.message', { name: 'User' })}</p>

      <button onClick={() => changeLanguage('zh-CN')}>
        简体中文
      </button>
      <button onClick={() => changeLanguage('en-US')}>
        English
      </button>
    </div>
  );
}
```

#### 多命名空间使用

```typescript
import { useTranslation } from 'react-i18next';

function HomePage() {
  // 同时加载多个命名空间
  const { t: tCommon } = useTranslation('common');
  const { t: tHome } = useTranslation('home');

  return (
    <div>
      <h1>{tHome('hero.title')}</h1>
      <button>{tCommon('button.getStarted')}</button>
    </div>
  );
}
```

#### 翻译文件示例

```json
// public/locales/zh-CN/common.json
{
  "button": {
    "getStarted": "开始使用",
    "submit": "提交",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除"
  },
  "snapChoice": {
    "title": "滚动对齐选择",
    "selectLabel": "选择对齐方式",
    "close": "关闭"
  },
  "snapDebug": {
    "title": "滚动调试信息",
    "activeSnap": "当前对齐",
    "none": "无",
    "scrollPosition": "滚动位置",
    "isSnapping": "正在对齐",
    "clear": "清除"
  },
  "common": {
    "yes": "是",
    "no": "否"
  }
}
```

### 9.5 跨包集成策略

#### 与 @vxture/shared 集成

- ✅ 继续使用 `@vxture/shared` 的 `I18N_CONSTANTS`（默认语言、可用语言列表等）
- ✅ 继续使用 `@vxture/shared` 的 `LocaleType` 和 `I18nConfig` 类型
- ❌ 不再使用 `@vxture/shared` 的任何 i18n 运行时代码
- ❌ 不再使用自定义的 `useLocale` Hook

#### 与其他 Portal / Agent Studio 包的一致性

- 所有包使用相同的 `react-i18next` 技术栈
- 共享相同的翻译文件结构规范
- 共享 `@vxture/shared` 的常量和类型
- 每个包独立管理自己的翻译资源

---

## 6. 页面重构计划

### 6.1 首页重构
- **Hero 区域**: 使用设计系统组件
- **Features**: 简化布局，使用 Grid 组件
- **Solutions**: 卡片布局，简化交互
- **Cases**: 案例展示，使用图片 + 文字
- **CTA**: 简化的 Call to Action 区域

### 6.2 其他页面重构
- **About 页面**: 重构为简单的文本 + 图片布局
- **Products 页面**: 使用设计系统的卡片组件
- **Test 页面**: 保留用于测试，但简化内容
- **Auth 页面**: 重构登录/注册表单
- **Scroll Snap 演示页面**: 保留用于技术演示

---

## 7. 组件重构计划

### 11.1 基础组件重构
所有组件使用 `@vxture/design-system` 组件替换自定义实现：

| 当前组件 | 设计系统替代 |
|---------|-------------|
| Button | Button |
| Card | Card |
| Input | Input |
| Dialog | Dialog |
| Badge | Badge |
| Avatar | Avatar |

### 11.2 特色组件重构

#### SnapChoicePanel（滚动对齐选择面板）
**重构方案**:
```typescript
// src/components/panels/SnapChoicePanel.tsx
import { Card, Select, Label, Button } from '@vxture/design-system';
import { useTranslation } from 'react-i18next';

interface SnapChoicePanelProps {
  options: SnapOption[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SnapChoicePanel({ options, selected, onSelect, onClose }: SnapChoicePanelProps) {
  const { t } = useTranslation('common');

  return (
    <Card className="p-6 max-w-sm">
      <h3 className="text-lg font-semibold mb-4">{t('snapChoice.title')}</h3>

      <div className="space-y-4">
        <div>
          <Label>{t('snapChoice.selectLabel')}</Label>
          <Select
            value={selected}
            onValueChange={onSelect}
            className="w-full"
          >
            {options.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Button onClick={onClose} className="w-full">
          {t('snapChoice.close')}
        </Button>
      </div>
    </Card>
  );
}
```

#### SnapDebugPanel（滚动调试面板）
**重构方案**:
```typescript
// src/components/panels/SnapDebugPanel.tsx
import { Card, Badge, Button, Label } from '@vxture/design-system';
import { useTranslation } from 'react-i18next';

interface SnapDebugPanelProps {
  activeSnap: string;
  scrollPosition: number;
  isSnapping: boolean;
  onClear: () => void;
}

export function SnapDebugPanel({ activeSnap, scrollPosition, isSnapping, onClear }: SnapDebugPanelProps) {
  const { t } = useTranslation('common');

  return (
    <Card className="p-6 max-w-sm">
      <h3 className="text-lg font-semibold mb-4">{t('snapDebug.title')}</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t('snapDebug.activeSnap')}</Label>
          <Badge variant={activeSnap ? 'default' : 'secondary'}>
            {activeSnap || t('snapDebug.none')}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <Label>{t('snapDebug.scrollPosition')}</Label>
          <span className="font-mono">{scrollPosition}px</span>
        </div>

        <div className="flex items-center justify-between">
          <Label>{t('snapDebug.isSnapping')}</Label>
          <Badge variant={isSnapping ? 'default' : 'secondary'}>
            {isSnapping ? t('common.yes') : t('common.no')}
          </Badge>
        </div>

        <Button variant="outline" onClick={onClear} className="w-full">
          {t('snapDebug.clear')}
        </Button>
      </div>
    </Card>
  );
}
```

### 6.3 组件复用能力提升

#### 设计原则
1. **单一职责**: 每个组件只负责一个功能
2. **可配置性**: 通过 props 提供灵活配置
3. **类型安全**: 完整的 TypeScript 类型支持
4. **国际化**: 集成 `useLocale` Hook
5. **主题兼容**: 自动适应 light/dark 主题

#### 使用模式
```typescript
// 页面中使用
import { SnapChoicePanel, SnapDebugPanel } from '@/components/panels';

function Page() {
  const [showChoice, setShowChoice] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  return (
    <>
      <Button onClick={() => setShowChoice(true)}>
        Select Scroll Snap
      </Button>

      <Button onClick={() => setShowDebug(true)}>
        Show Debug Info
      </Button>

      {showChoice && (
        <SnapChoicePanel
          options={snapOptions}
          selected={currentSnap}
          onSelect={handleSelect}
          onClose={() => setShowChoice(false)}
        />
      )}

      {showDebug && (
        <SnapDebugPanel
          activeSnap={activeSnap}
          scrollPosition={scrollPosition}
          isSnapping={isSnapping}
          onClear={handleClear}
        />
      )}
    </>
  );
}
```

---

## 8. 状态管理重构

### 8.1 Zustand 状态结构优化
**重构前**: 复杂的多模块状态
**重构后**: 简化的扁平状态结构

```typescript
// src/stores/useGlobalStore.ts
import { create } from 'zustand';

interface GlobalState {
  // 主题状态（由设计系统管理）
  // 语言状态（由 react-i18next 管理）
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

interface GlobalActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useGlobalStore = create<GlobalState & GlobalActions>((set) => ({
  isLoading: false,
  error: null,
  user: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setUser: (user) => set({ user }),
  clearError: () => set({ error: null })
}));
```

### 8.2 Scroll Snap 状态管理
```typescript
// src/stores/useScrollSnapStore.ts
import { create } from 'zustand';

interface ScrollSnapState {
  activeSnap: string;
  isSnapping: boolean;
  scrollPosition: number;
  history: ScrollSnapHistory[];
}

interface ScrollSnapActions {
  setActiveSnap: (snap: string) => void;
  setIsSnapping: (snapping: boolean) => void;
  setScrollPosition: (position: number) => void;
  addHistory: (entry: ScrollSnapHistory) => void;
  clearHistory: () => void;
}

export const useScrollSnapStore = create<ScrollSnapState & ScrollSnapActions>((set) => ({
  activeSnap: '',
  isSnapping: false,
  scrollPosition: 0,
  history: [],

  setActiveSnap: (snap) => set({ activeSnap: snap }),
  setIsSnapping: (snapping) => set({ isSnapping: snapping }),
  setScrollPosition: (position) => set({ scrollPosition: position }),
  addHistory: (entry) => set((state) => ({
    history: [...state.history, entry].slice(-50)
  })),
  clearHistory: () => set({ history: [] })
}));
```

---

## 9. API 层重构

### 9.1 API 客户端重构
```typescript
// src/api/client.ts
import axios from 'axios';
import { useGlobalStore } from '@/stores/useGlobalStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    useGlobalStore.getState().setLoading(true);
    return config;
  },
  (error) => {
    useGlobalStore.getState().setLoading(false);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    useGlobalStore.getState().setLoading(false);
    return response;
  },
  (error) => {
    useGlobalStore.getState().setLoading(false);
    useGlobalStore.getState().setError(error.message);
    return Promise.reject(error);
  }
);
```

### 9.2 内容 API
```typescript
// src/api/content.ts
import { apiClient } from './client';

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageContent {
  hero: ContentItem;
  features: ContentItem;
  solutions: ContentItem;
  cases: ContentItem;
  cta: ContentItem;
}

export async function getContent(key: string, locale: string): Promise<ContentItem> {
  const response = await apiClient.get('/content', {
    params: { key, locale }
  });
  return response.data;
}

export async function getPageContent(page: string, locale: string): Promise<PageContent> {
  const response = await apiClient.get(`/content/page/${page}`, {
    params: { locale }
  });
  return response.data;
}

export async function updateContent(data: Partial<ContentItem>): Promise<ContentItem> {
  const response = await apiClient.put('/content', data);
  return response.data;
}
```

### 9.3 认证 API
```typescript
// src/api/auth.ts
import { apiClient } from './client';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/login', data);
  localStorage.setItem('auth_token', response.data.token);
  return response.data;
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/signup', data);
  localStorage.setItem('auth_token', response.data.token);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('auth_token');
}

export async function getProfile(): Promise<User> {
  const response = await apiClient.get('/auth/profile');
  return response.data;
}
```

---

## 10. 质量保证计划

### 10.1 代码质量检查
- 执行 `npm run check` (lint + format + type-check)
- 确保所有 TypeScript 错误都已修复
- 执行 `npm run build` 检查构建成功

### 10.2 性能优化
- 使用 Vercel Analytics 检查页面加载时间
- 优化图片加载（使用 Next.js Image 组件）
- 实现组件懒加载

### 10.3 SEO 优化
- 检查 Meta 标签生成
- 验证结构化数据
- 检查页面可访问性

---

## 11. 风险评估与应对

### 12.1 技术风险
- **Next.js 15 稳定性**: 确保所有功能正常
- **设计系统组件可用性**: 确认所需组件已存在
- **BFF 接口变更**: 与后端团队协调 API 设计

### 12.2 进度风险
- **内容管理系统重构**: 可能比预期复杂
- **页面重构数量**: 10+ 页面需要重构
- **测试覆盖**: 确保所有功能都被测试到

### 12.3 应对措施
- 分阶段重构，每个阶段结束后进行测试
- 与后端团队保持密切沟通
- 建立测试环境，持续监控重构进度

---

## 12. 开发工具与工作流

### 12.1 开发环境配置
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm type-check

# Lint 检查
pnpm lint

# 格式化代码
pnpm format

# 运行所有检查
pnpm check
```

### 12.2 Git 工作流
1. 创建 feature 分支
2. 提交代码（遵循 Conventional Commits）
3. 打开 Pull Request
4. 代码审查
5. 合并到 main 分支

### 12.3 Conventional Commits
```
feat: 新增功能
fix: 修复 Bug
refactor: 重构代码
docs: 更新文档
style: 代码格式
test: 测试相关
```

---

## 13. 质量保证与验证

### 13.1 架构合规性检查清单
- [ ] 目录结构符合 Portals 架构规范
- [ ] 代码分层符合 Presentation 层职责
- [ ] 依赖关系符合架构边界约束
- [ ] 组件使用设计系统原语
- [ ] 无 domain/infrastructure 层残留
- [ ] 无业务逻辑在 Frontend

### 13.2 功能完整性检查清单
- [ ] 所有页面功能正常
- [ ] 响应式设计工作正常
- [ ] SEO 功能正常
- [ ] 内容管理系统工作正常
- [ ] 主题系统（含密度）正常
- [ ] i18n 多语言正常
- [ ] Fullscreen 全屏功能正常
- [ ] Notification 通知系统正常
- [ ] Auth 认证系统正常
- [ ] Scroll Snap 滚动功能正常

### 13.3 代码质量检查清单
- [ ] TypeScript 严格模式无错误
- [ ] 组件文件不超过 150 行
- [ ] ESLint 和 Prettier 检查通过
- [ ] 无未使用的导入和变量
- [ ] 所有 public API 有 JSDoc 注释
- [ ] 无 `any` 类型使用

### 13.4 性能检查清单
- [ ] 首次加载时间 < 2s
- [ ] Lighthouse 分数 > 90
- [ ] 图片懒加载实现
- [ ] 组件懒加载实现
- [ ] 无不必要的重渲染
- [ ] CSS 类名不直接操作 DOM

---

## 14. 验收标准

### 14.1 架构合规性
- ✅ 目录结构符合 Portals 架构规范
- ✅ 代码分层符合 Presentation 层职责
- ✅ 依赖关系符合架构边界约束
- ✅ 组件使用设计系统原语

### 14.2 功能完整性
- ✅ 所有页面功能正常
- ✅ 响应式设计工作正常
- ✅ SEO 功能正常
- ✅ 内容管理系统工作正常
- ✅ 主题系统（含密度）正常工作
- ✅ i18n 多语言正常工作
- ✅ Fullscreen 全屏功能正常工作
- ✅ Notification 通知系统正常工作
- ✅ Auth 认证系统正常工作
- ✅ Scroll Snap 滚动功能正常工作
- ✅ SnapChoicePanel 和 SnapDebugPanel 可复用

### 14.3 代码质量
- ✅ TypeScript 严格模式无错误
- ✅ 组件文件不超过 150 行
- ✅ ESLint 和 Prettier 检查通过
- ✅ 无未使用的导入和变量
- ✅ 所有 public API 有 JSDoc 注释

---

## 15. 后续维护计划

### 17.1 持续改进
- 定期检查和更新依赖
- 优化页面性能
- 收集用户反馈并改进

### 17.2 文档维护
- 更新 README.md 到当前架构
- **已完成**: 移除过时的 `CONTENT_SYSTEM_GUIDE.md`
- 添加新架构的使用指南

---

## 16. 批准与执行

### 16.1 需要确认的问题
- 是否同意当前的重构计划？
- 是否有其他需要包含的功能或页面？
- 是否有特定的技术要求或约束？

### 16.2 执行流程
1. 确认重构计划
2. 建立任务管理（使用 GitHub Issues 或项目管理工具）
3. 分阶段执行重构
4. 每个阶段结束后进行验收
5. 完成重构后进行最终验收

---

**重构负责人**: Stone Smoker
**技术审阅**: [Reviewer Name]
**预计开始日期**: 2026-03-12
**预计完成日期**: 2026-04-08
