# 项目改造快速摘要

## 核心需求

- ✅ 页面展示框架（已完成）
- 📊 JSON → API 动态内容获取
- 🌍 中英文切换 (i18n)
- 🎨 深色/浅色/系统主题

## Week 1 任务（1-2天）

### 新增文件夹

```
public/data/                  # 内容 JSON
src/locales/                  # 翻译文件
  - zh-CN/
  - en-US/
```

### 新增文件

```
src/services/contentService.ts    # 内容加载
src/hooks/useContent.ts           # 内容 Hook
src/types/content.types.ts        # 内容类型
src/locales/index.ts              # 翻译导出
```

### 修改文件

```
src/stores/themeStore.ts          # 支持 'system' 主题
src/stores/i18nStore.ts           # 移除翻译，只保留状态
src/services/i18nService.ts       # 加载翻译文件
src/components/home/*.tsx         # 使用 useContent()
```

## 实施流程

1. **创建目录** - 新建数据和翻译文件夹
2. **导出内容** - 从组件提取内容到 JSON
3. **导出翻译** - 从 i18nStore 提取翻译文件
4. **创建服务** - contentService.ts 支持 API/JSON 降级
5. **创建 Hook** - useContent() 集成 React Query
6. **更新组件** - 使用 useContent() 替代硬编码数据
7. **升级主题** - 添加 'system' 选项和媒体查询
8. **简化 i18n** - 只保留 locale 状态管理
9. **测试验证** - 类型检查和功能测试
10. **提交变更** - 创建 git 提交

## 预期成果

- ✅ 内容与代码分离
- ✅ 翻译文件专门管理
- ✅ 支持系统主题检测
- ✅ 支持 API 数据源（带 JSON 降级）
- ✅ 无破坏性改动，向后兼容

## 详细指南

查看 `DIRECTORY_STRUCTURE.md` 获取完整细节

## 后续步骤（可选）

- Week 2: 集成 i18next（翻译工具）
- Week 3: 连接后端 API
- Week 4: 部署 Strapi CMS（内容管理）
