# 项目改造 - 快速参考指南

## 🎯 4 大改造目标速览

### 1️⃣ 数据内容化 (JSON → API)

**目前**: 内容硬编码在组件中

```tsx
// ❌ 当前
const sections = [{ title: '特性', items: [...] }];
export function FeaturesSection() {
  return sections.map(...);
}
```

**目标**: 从 JSON 或 API 加载

```tsx
// ✅ 目标
export function FeaturesSection() {
  const { data: content } = useContent('features', locale);
  return content?.items?.map(...);
}
```

**改造路径**:

- Week 1: 导出 JSON → `public/data/features.zh-CN.json`
- Week 2-3: 连接 FastAPI 后端 API
- Week 4+: 可选集成 Strapi CMS

---

### 2️⃣ 完善 i18n

**目前**: 翻译硬编码在 Zustand store

```typescript
// ❌ 当前（i18nStore.ts 中）
const translations = {
  'zh-CN': { 'common.submit': '提交' },
  'en-US': { 'common.submit': 'Submit' },
};
```

**目标**: 模块化 + i18next

```typescript
// ✅ 目标
// src/locales/zh-CN/common.json
{ "common.submit": "提交" }

// 在组件中使用
const { t } = useTranslation('common');
<button>{t('submit')}</button>
```

**改造路径**:

- Week 1: 翻译文件 → `src/locales/`
- Week 2: 集成 i18next
- Week 3: 组件迁移使用 i18next

---

### 3️⃣ 主题系统升级

**目前**: Light / Dark 二选一

```typescript
// ❌ 当前
theme: 'light' | 'dark';
```

**目标**: 支持系统偏好

```typescript
// ✅ 目标
theme: 'light' | 'dark' | 'system';
// 'system' 时自动检测：用户系统设置 → dark 或 light
```

**改造路径**:

- Week 1: 添加系统主题检测
- Week 1: 添加媒体查询监听 (prefers-color-scheme)
- Week 1: 完善 TailwindCSS 色彩体系

---

### 4️⃣ 完整 API 架构

**目前**: 无后端支持
**目标**: 优雅降级

```
内存缓存 (5min)
    ↓ 若失败
API 调用 (FastAPI/Strapi)
    ↓ 若失败
静态 JSON (public/data/)
    ↓ 若失败
错误占位符
```

---

## 📦 项目文件变化速览

### 新增文件

```diff
+ src/
+   ├── locales/
+   │   ├── zh-CN/
+   │   │   ├── common.json          # 通用词汇
+   │   │   ├── navigation.json      # 导航
+   │   │   ├── home.json            # 首页
+   │   │   ├── products.json        # 产品
+   │   │   └── footer.json          # 页脚
+   │   └── en-US/                   # 英文翻译
+   ├── types/
+   │   └── content.types.ts         # 内容类型定义
+   ├── services/
+   │   ├── contentService.ts        # 内容加载
+   │   └── apiClient.ts             # API 客户端
+   └── stores/
+       └── contentStore.ts          # 内容状态（可选）
+
+ public/
+   └── data/
+       ├── hero.zh-CN.json          # 英雄部分
+       ├── hero.en-US.json
+       ├── features.zh-CN.json      # 特性
+       ├── features.en-US.json
+       ├── products.zh-CN.json      # 产品
+       ├── products.en-US.json
+       ├── cases.zh-CN.json         # 案例
+       └── cases.en-US.json
+
+ PROJECT_REFACTORING_PLAN.md        # 详细改造方案
+ ARCHITECTURE_DESIGN.md             # 架构设计
```

### 修改文件

```diff
  src/
    ├── stores/
    │   ├── i18nStore.ts            # 移除翻译数据，只保留状态
    │   └── themeStore.ts           # 添加 'system' 主题支持
    ├── services/
    │   ├── i18nService.ts          # 重写为加载翻译文件
    │   └── authService.ts          # (无需改动)
    └── components/
        └── layout/
            └── Header.tsx          # 更新为从 store 读取内容

  package.json                        # 可选：添加 i18next 依赖
```

---

## 🛠️ 实施清单 - 按优先级

### Phase 1️⃣: 数据分离 (Week 1)

- [ ] **创建内容类型定义**

  ```bash
  cat > src/types/content.types.ts << 'EOF'
  interface ContentBlock {
    id: string;
    type: string;
    locale: string;
    title: string;
    items?: any[];
  }
  EOF
  ```

- [ ] **导出静态数据为 JSON**

  ```bash
  mkdir -p public/data
  # 从各组件中提取内容，保存为 *.json
  ```

- [ ] **创建内容加载服务**

  ```typescript
  // src/services/contentService.ts
  export async function fetchContent(type, locale) {
    const data = await import(`@/data/${type}.${locale}.json`).then((m) => m.default);
    return data;
  }
  ```

- [ ] **更新组件使用加载的数据**
  ```tsx
  // 示例：components/home/FeaturesSection.tsx
  export function FeaturesSection() {
    const { data: content } = useContent('features', locale);
    return <div>{content?.items.map(...)}</div>;
  }
  ```

### Phase 2️⃣: i18n 模块化 (Week 1-2)

- [ ] **创建翻译文件结构**

  ```bash
  mkdir -p src/locales/{zh-CN,en-US}
  # 复制现有翻译到对应文件
  ```

- [ ] **更新 i18nService**

  ```typescript
  export function getTranslations(locale) {
    return require(`@/locales/${locale}/common.json`);
  }
  ```

- [ ] **更新 i18nStore (可选保持不动)**
  ```typescript
  // 保持向后兼容，但改为从文件加载
  const translations = await getTranslations(locale);
  ```

### Phase 3️⃣: 主题系统升级 (Week 1)

- [ ] **更新 themeStore 类型**

  ```typescript
  export type Theme = 'light' | 'dark' | 'system';
  ```

- [ ] **添加系统主题检测**

  ```typescript
  function detectSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  ```

- [ ] **监听系统主题变化**

  ```typescript
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    // 若当前为 'system'，重新应用主题
  });
  ```

- [ ] **更新 Header 主题按钮**
  ```tsx
  <select value={theme} onChange={(e) => setTheme(e.target.value)}>
    <option value='light'>☀️ Light</option>
    <option value='dark'>🌙 Dark</option>
    <option value='system'>🖥️ System</option>
  </select>
  ```

### Phase 4️⃣: API 集成准备 (Week 2-3)

- [ ] **创建 API 客户端**

  ```typescript
  // src/lib/apiClient.ts
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  export async function getContent(type, locale) {
    return fetch(`${API_URL}/api/content/${type}?locale=${locale}`).then((r) => r.json());
  }
  ```

- [ ] **更新内容加载服务（降级策略）**

  ```typescript
  export async function fetchContent(type, locale) {
    // 优先 API，失败降级到 JSON
    try {
      return await apiClient.getContent(type, locale);
    } catch {
      return import(`@/data/${type}.${locale}.json`).then((m) => m.default);
    }
  }
  ```

- [ ] **配置环境变量**
  ```bash
  # .env.local
  NEXT_PUBLIC_API_URL=http://localhost:8000
  NEXT_PUBLIC_USE_STATIC_DATA=true
  ```

### Phase 5️⃣: i18next 集成 (Week 2) - 可选

- [ ] **安装依赖**

  ```bash
  pnpm add i18next next-i18next i18next-browser-languagedetector
  ```

- [ ] **配置 i18next**

  ```typescript
  // i18next.config.ts
  i18n.init({
    lng: 'zh-CN',
    resources: { 'zh-CN': { common: {} }, 'en-US': { common: {} } },
  });
  ```

- [ ] **更新组件使用 i18next**

  ```tsx
  import { useTranslation } from 'react-i18next';

  export function Header() {
    const { t, i18n } = useTranslation();
    return <h1>{t('header.title')}</h1>;
  }
  ```

---

## 📊 对比表：改造前后

| 方面         | 改造前       | 改造后            |
| ------------ | ------------ | ----------------- |
| **数据管理** | 硬编码在组件 | JSON + API        |
| **翻译管理** | Store 中     | 专用文件目录      |
| **翻译工具** | Zustand      | i18next           |
| **主题选项** | light/dark   | light/dark/system |
| **缓存**     | 无           | React Query       |
| **可维护性** | ⭐⭐         | ⭐⭐⭐⭐⭐        |
| **可扩展性** | ⭐           | ⭐⭐⭐⭐⭐        |
| **团队协作** | 困难         | 容易              |

---

## 🚀 快速启动

### 第一周目标：数据 + 主题 + i18n 文件

```bash
# 1. 创建目录结构
mkdir -p src/locales/{zh-CN,en-US} public/data src/types

# 2. 导出当前翻译到文件
# 从 i18nStore.ts 中复制翻译数据到 src/locales/*/

# 3. 导出当前组件内容到 JSON
# 从各组件中提取 sections/products 等到 public/data/

# 4. 更新 types
cat > src/types/content.types.ts << 'EOF'
export interface ContentBlock {
  id: string;
  type: string;
  locale: string;
  title: string;
  items?: any[];
  metadata?: Record<string, any>;
}
EOF

# 5. 创建内容加载服务
cat > src/services/contentService.ts << 'EOF'
export async function fetchContent(type: string, locale: string) {
  return import(`@/data/${type}.${locale}.json`)
    .then(m => m.default)
    .catch(() => ({ id: '', type, items: [] }));
}
EOF

# 6. 更新主题 store（添加 system 选项）
# 修改 themeStore.ts

# 7. 测试
pnpm run type-check
pnpm run dev
```

---

## ⚠️ 注意事项

### 不要做的事

- ❌ 一次性重写整个项目（风险太大）
- ❌ 移除现有的 Zustand store（保持向后兼容）
- ❌ 立即删除硬编码的翻译（需要渐进迁移）
- ❌ 依赖尚未创建的后端 API（先用 JSON）

### 应该做的事

- ✅ 逐周迭代，每周交付可用功能
- ✅ 为每个改动创建新分支并 PR 审查
- ✅ 保持向后兼容，不破坏现有功能
- ✅ 编写迁移指南帮助团队理解

### 降级策略

```
✨ 理想情况
├─ React Query 缓存
└─ API 调用

🆗 缓降级
├─ API 不可用
└─ 静态 JSON

⚠️ 进一步降级
├─ JSON 加载失败
└─ 内存中的默认数据 + 错误提示

💥 最后手段
└─ 显示"暂无数据"占位符
```

---

## 📖 查看详细文档

- 📋 **PROJECT_REFACTORING_PLAN.md**: 4 大目标详细方案
- 🏗️ **ARCHITECTURE_DESIGN.md**: 完整架构设计和数据流
- 📝 **TYPESCRIPT_FIX_SUMMARY.md**: TypeScript 类型问题解决方案

---

## 💬 常见问题

**Q: 要从 JSON 改为 API 时，需要修改组件代码吗？**
A: 不需要！`contentService.ts` 处理所有变化，组件代码保持不动。

**Q: 可以暂时保持现有翻译方式吗？**
A: 可以！i18next 是可选的，Zustand store 可以继续用。

**Q: 如何在静态 JSON 和 API 之间切换？**
A: 通过环境变量 `NEXT_PUBLIC_API_URL` 切换，不需要改代码。

**Q: 主题系统的 'system' 选项会影响现有代码吗？**
A: 不会，是向后兼容的扩展。

**Q: 需要数据库吗？**
A: 不需要！静态 JSON 就够用。后续可选添加。

---

**Last Updated**: 2025-02-10
**Status**: Ready for Implementation ✅
