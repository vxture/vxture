# 多语言系统重构任务清单

**项目**：Vxture Locale System Refactor
**创建日期**：2026-03-16
**状态**：待开始

---

## 总体进度

- [✅] 阶段一：类型和常量重构
- [✅] 阶段二：@vxture/shared 更新
- [✅] 阶段三：@vxture/core-locale 更新
- [✅] 阶段四：website 前端更新
- [ ] 阶段五：测试验证
- [ ] 阶段六：文档和发布

---

## 阶段一：类型和常量重构

### 任务1.1：分析和准备

- [✅] 备份当前的类型和常量文件
- [✅] 创建专门的重构分支
- [✅] 列出所有使用 Locale 类型的文件
- [✅] 确认所有依赖 @vxture/shared 的包

### 任务1.2：更新类型定义

**文件**：`packages/shared/shared/src/types/locale.types.ts`

- [✅] 修改 `Locale` 类型：从 `'zh' | 'en'` 改为 `'zh-CN' | 'en-US'`
- [✅] 添加 `LocaleConfig` 接口，包含完整语言信息
- [✅] 确保类型定义与新方案一致

### 任务1.3：更新常量配置

**文件**：`packages/shared/shared/src/constants/locale.constants.ts`

- [✅] 更新 `SUPPORTED_LOCALES` 数组
- [✅] 更新 `DEFAULT_LOCALE` 值为 `'zh-CN'`
- [✅] 添加 `LOCALE_CONFIGS` 对象
- [✅] 移除 `LOCALE_INTL_MAP` 复杂映射
- [✅] 调整 `LOCALE_DEFAULT_CURRENCY`
- [✅] 保持其他常量不变

### 任务1.4：更新工具函数

**文件**：`packages/shared/shared/src/utils/format.utils.ts`

- [✅] 更新 `formatCurrency` 函数，直接使用新格式
- [✅] 更新 `formatDate` 函数，确保 Intl API 支持
- [✅] 更新 `formatNumber` 函数
- [✅] 添加 `getHtmlLang` 工具函数（可选）

### 任务1.5：验证类型安全

- [✅] 运行 `pnpm type-check` 确保无类型错误
- [✅] 运行 `pnpm lint` 确保代码质量
- [ ] 提交类型重构的 git commit

---

## 阶段二：@vxture/core-locale 更新

### 任务2.1：更新类型导入

**文件**：`packages/core/locale/src/index.ts`

- [✅] 确保从 @vxture/shared 正确导入类型
- [✅] 更新 re-export 的类型和常量
- [✅] 确保类型一致性

### 任务2.2：更新核心功能

**文件**：`packages/core/locale/src/utils/locale.utils.ts`

- [✅] 更新 `resolveLocale` 函数，支持新格式
- [✅] 简化 `localizeContent` 函数
- [✅] 移除 `getBaseLocale` 等复杂回退逻辑
- [✅] 确保与 shared 包逻辑一致

### 任务2.3：更新类型定义

**文件**：`packages/core/locale/src/types/locale.types.ts`

- [✅] 确保类型定义与 shared 一致
- [✅] 移除重复定义
- [✅] 确保类型导入正确

### 任务2.4：测试和验证

- [ ] 运行 core-locale 包的测试
- [✅] 运行 type-check
- [ ] 提交 core-locale 更新的 git commit

---

## 阶段三：website 前端更新

### 任务3.1：更新路由配置

**文件**：`portals/website/src/lib/i18n/routing.ts`

- [✅] 从 @vxture/shared 导入新的 Locale 类型
- [✅] 更新 routing 配置，支持新格式
- [✅] 确保类型安全

### 任务3.2：更新导航工具

**文件**：`portals/website/src/lib/i18n/navigation.ts`

- [✅] 更新类型定义
- [✅] 确保与 routing 配置一致

### 任务3.3：更新布局文件

**文件**：`portals/website/src/app/[locale]/layout.tsx`

- [✅] 更新 HTML lang 属性
- [✅] 更新 meta 标签
- [✅] 确保正确使用 BCP47 标签

### 任务3.4：更新语言切换组件

**文件**：`portals/website/src/components/ui/LocaleSwitcher.tsx`

- [✅] 从 @vxture/shared 导入 LOCALE_CONFIGS 和 SUPPORTED_LOCALES
- [✅] 更新显示文本
- [✅] 更新国旗图标（如果有）
- [✅] 确保语言切换功能正常

### 任务3.5：更新其他组件

- [✅] 检查所有使用 Locale 类型的组件
- [✅] 更新相关的类型导入
- [✅] 确保没有硬编码的 'zh' 或 'en' 字符串

### 任务3.6：更新请求工具

**文件**：`portals/website/src/lib/i18n/request.ts`

- [✅] 更新翻译加载逻辑
- [✅] 确保与新格式兼容
- [✅] 保持动态加载功能

### 任务3.7：更新翻译内容

**目录**：`portals/website/messages/`

- [✅] 创建 `zh-CN/` 目录
- [✅] 复制 `zh/` 目录内容到 `zh-CN/`
- [✅] 创建 `en-US/` 目录
- [✅] 复制 `en/` 目录内容到 `en-US/`
- [ ] 保留旧目录作为备用（临时）

### 任务3.8：更新 middleware

**文件**：`portals/website/src/middleware.ts`

- [✅] 更新语言检测逻辑
- [ ] 添加旧 URL 重定向逻辑（/zh/ → /zh-CN/）
- [✅] 确保新格式正确处理

### 任务3.9：前端验证

- [ ] 启动开发服务器
- [ ] 验证页面加载
- [ ] 验证语言切换
- [ ] 验证路由导航
- [ ] 验证 HTML 属性

---

## 阶段四：测试验证

### 任务4.1：类型安全检查

- [ ] 运行根目录的 type-check
- [ ] 运行 website 的 type-check
- [ ] 修复所有类型错误
- [ ] 确保无 any 类型

### 任务4.2：代码质量检查

- [ ] 运行根目录的 lint
- [ ] 运行 website 的 lint
- [ ] 修复所有 lint 警告
- [ ] 确保代码风格一致

### 任务4.3：功能测试

- [ ] 测试 URL 路由功能
- [ ] 测试语言切换功能
- [ ] 测试翻译内容显示
- [ ] 测试 Intl API 格式化
- [ ] 测试向后兼容性重定向

### 任务4.4：跨浏览器测试

- [ ] Chrome 浏览器测试
- [ ] Firefox 浏览器测试
- [ ] Safari 浏览器测试
- [ ] Edge 浏览器测试

### 任务4.5：响应式测试

- [ ] 桌面端测试
- [ ] 平板端测试
- [ ] 移动端测试

---

## 阶段五：文档和发布

### 任务5.1：清理工作

- [ ] 删除旧的 messages/zh/ 和 messages/en/ 目录（可选，保留备份）
- [ ] 清理临时文件
- [ ] 清理注释中的 TODO
- [ ] 确保无调试代码残留

### 任务5.2：更新文档

- [ ] 更新 README 文档
- [ ] 更新相关的注释
- [ ] 更新 API 文档（如果有）
- [ ] 更新开发者指南

### 任务5.3：最终构建测试

- [ ] 运行完整构建流程
- [ ] 验证生产环境构建
- [ ] 测试生产环境代码

### 任务5.4：发布准备

- [ ] 创建最终的 git commit
- [ ] 准备发布说明
- [ ] 准备回滚方案

### 任务5.5：部署验证

- [ ] 在预览环境部署
- [ ] 在预览环境验证
- [ ] 收集反馈

---

## 风险管理清单

### 高风险项（必须解决）

- [ ] 类型错误导致构建失败
- [ ] 路由导航异常
- [ ] 翻译内容丢失
- [ ] 语言切换功能异常

### 中风险项（需要关注）

- [ ] 旧 URL 访问异常
- [ ] 性能影响（无明显问题）
- [ ] 第三方库兼容性问题

### 低风险项（可以忽略）

- [ ] UI 样式微小调整
- [ ] 个别翻译文案不准确

---

## 验收标准

### 功能验收

- [ ] 所有页面正常加载
- [ ] 语言切换功能正常
- [ ] 翻译内容正确显示
- [ ] URL 路由正常工作
- [ ] HTML lang 属性符合规范

### 代码验收

- [ ] 无类型错误
- [ ] 无 lint 错误
- [ ] 无控制台错误
- [ ] 符合项目规范

### 性能验收

- [ ] 首次加载时间无显著影响
- [ ] 语言切换响应流畅
- [ ] 无明显内存泄漏

---

## 里程碑和进度追踪

### 里程碑1：类型重构完成
- [ ] 所有类型定义更新完成
- [ ] 所有常量配置更新完成
- [ ] 基础功能验证完成
- [ ] 预计时间：1天

### 里程碑2：前端更新完成
- [ ] 所有组件更新完成
- [ ] 路由配置更新完成
- [ ] 翻译内容准备完成
- [ ] 预计时间：2天

### 里程碑3：测试验证完成
- [ ] 所有功能测试通过
- [ ] 所有质量检查通过
- [ ] 所有文档更新完成
- [ ] 预计时间：1天

### 里程碑4：发布就绪
- [ ] 最终构建通过
- [ ] 发布说明准备完成
- [ ] 预计时间：半天

---

## 注意事项和最佳实践

1. **提交频率**：每个任务完成后立即提交
2. **测试策略**：边改边测，不要等全部改完再测试
3. **备份策略**：关键文件修改前必须备份
4. **文档同步**：代码变更后立即更新相关文档
5. **沟通机制**：遇到阻塞问题及时沟通
6. **回滚准备**：保留完整的回滚方案

---

## 附录：相关文档参考

- [多语言系统重构方案](./locale-system-refactor.md)
- [REVIEW_CHECKLIST.md](../portals/website/REVIEW_CHECKLIST.md)
- [CLAUDE.md](../CLAUDE.md)
- [架构文档](../docs/architecture/)

---

## 修改记录

| 日期 | 版本 | 作者 | 变更内容 |
|------|------|------|---------|
| 2026-03-16 | 1.0 | AI-Generated | 初始版本 |

---

**任务清单结束**
