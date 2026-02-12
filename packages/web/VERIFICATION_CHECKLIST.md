# 四层架构验证清单

## 🚀 服务器状态

✅ **开发服务器已启动**
- 本地地址: http://localhost:3000
- 网络地址: http://10.1.5.128:3000
- 启动时间: 43.1 秒
- 状态: Ready ✓

## 📋 验证步骤

### 1. 基础功能验证

#### ✅ 访问首页
1. 打开浏览器访问 http://localhost:3000
2. 检查页面是否正常加载
3. 观察浏览器控制台是否有错误

**预期结果：**
- ✅ Hero 区块显示（标题、描述、按钮）
- ✅ Features 区块显示（3 个特性卡片）
- ✅ Header 导航栏显示（Logo、导航菜单）
- ✅ Footer 底部栏显示（链接、联系方式）

#### ✅ 数据加载验证
打开浏览器开发者工具（F12），查看：

**Network 标签页：**
- 应该看到以下请求：
  - `/data/sections/hero.zh-CN.json`
  - `/data/sections/features.zh-CN.json`
  - `/data/layout/header.zh-CN.json`
  - `/data/layout/footer.zh-CN.json`

**Console 标签页：**
- 不应该有错误（红色）
- 可能有验证警告（黄色，如果数据不完整）

### 2. 多语言切换验证

#### ✅ 切换语言
1. 点击 Header 右上角的语言切换按钮（地球图标）
2. 选择 "English"
3. 观察页面内容是否切换

**预期结果：**
- ✅ 所有文本内容切换为英文
- ✅ 自动加载英文 JSON 文件：
  - `/data/sections/hero.en-US.json`
  - `/data/sections/features.en-US.json`
  - `/data/layout/header.en-US.json`
  - `/data/layout/footer.en-US.json`

### 3. React Query 缓存验证

#### ✅ 缓存测试
1. 首次加载页面（观察 Network 请求）
2. 切换到另一个页面（如果有）
3. 返回首页
4. 观察 Network 标签页

**预期结果：**
- ✅ 第一次加载：发送所有 JSON 请求
- ✅ 5 分钟内返回：不发送新请求（使用缓存）
- ✅ 浏览器控制台显示 React Query DevTools（如果安装）

### 4. 加载状态验证

#### ✅ 加载状态显示
1. 刷新页面（Ctrl+R 或 F5）
2. 观察页面在数据加载时的状态

**预期结果：**
- ✅ 显示 "加载中..." 文本（短暂出现）
- ✅ 数据加载完成后显示实际内容
- ✅ 没有闪烁或布局跳动

### 5. 错误处理验证

#### ✅ 测试错误处理
1. 修改 JSON 文件路径（故意制造 404 错误）
2. 刷新页面
3. 观察错误处理

**预期结果：**
- ✅ 显示友好的错误信息
- ✅ 不会导致整个应用崩溃
- ✅ 浏览器控制台显示错误详情

### 6. 主题切换验证

#### ✅ 切换主题
1. 点击 Header 右上角的主题切换按钮（太阳/月亮图标）
2. 观察页面主题变化

**预期结果：**
- ✅ 主题在 light/dark 之间切换
- ✅ 颜色、背景正常变化

## 🔍 数据流验证

### 验证数据流路径

使用浏览器开发者工具验证完整的数据流：

```
1. JSON 文件 (public/data/)
   ↓
2. JsonAdapter.fetch()
   - 检查: Network 标签页看到 JSON 请求
   ↓
3. Mapper.toDomain()
   - 检查: Console 不应有类型错误
   ↓
4. Repository (缓存管理)
   - 检查: 第二次访问不发送请求
   ↓
5. Use Case (业务验证)
   - 检查: Console 可能有验证警告
   ↓
6. Hook (React Query)
   - 检查: React Query DevTools 显示缓存状态
   ↓
7. Component (UI 渲染)
   - 检查: 页面正确显示内容
```

## 🐛 常见问题排查

### 问题 1: 页面空白
**可能原因：**
- JSON 文件路径错误
- JSON 格式错误
- 组件导入路径错误

**排查方法：**
1. 检查浏览器 Console 错误信息
2. 检查 Network 标签页，看 JSON 请求是否 404
3. 验证 JSON 文件格式（使用 JSON 验证工具）

### 问题 2: 数据不显示
**可能原因：**
- `enabled: false` 在 JSON 中
- 数据映射错误
- 组件条件渲染逻辑问题

**排查方法：**
1. 检查 JSON 文件中的 `enabled` 字段
2. 在 Console 中打印 Hook 返回的数据
3. 检查组件的条件渲染逻辑

### 问题 3: 语言切换不工作
**可能原因：**
- useLocale Hook 未正确集成
- 对应语言的 JSON 文件缺失
- React Query 缓存 key 未包含 locale

**排查方法：**
1. 检查 useLocale Hook 是否正常工作
2. 验证所有语言的 JSON 文件都存在
3. 检查 React Query 的 queryKey 是否包含 locale

### 问题 4: 编译错误
**可能原因：**
- TypeScript 类型错误
- 导入路径错误
- 缺少依赖

**排查方法：**
1. 查看终端的编译错误信息
2. 运行 `npm run type-check` 检查类型错误
3. 检查 tsconfig.json 的路径别名配置

## ✅ 验证完成标准

所有以下项目都应该通过：

- [ ] 首页正常加载，显示所有区块
- [ ] Header 和 Footer 正常显示
- [ ] 数据来自 JSON 文件（Network 标签页可见请求）
- [ ] 语言切换正常工作
- [ ] 主题切换正常工作
- [ ] 加载状态正确显示
- [ ] 错误处理正常工作
- [ ] React Query 缓存正常工作
- [ ] 浏览器 Console 无严重错误
- [ ] 页面性能良好（无明显卡顿）

## 📊 性能指标

使用浏览器开发者工具的 Performance 标签页测量：

**目标指标：**
- ✅ 首次内容绘制（FCP）< 1.5 秒
- ✅ 最大内容绘制（LCP）< 2.5 秒
- ✅ 首次输入延迟（FID）< 100 毫秒
- ✅ 累积布局偏移（CLS）< 0.1

## 🎯 下一步优化

验证通过后，可以考虑：

1. **添加 React Query DevTools**
   ```typescript
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

   <ReactQueryDevtools initialIsOpen={false} />
   ```

2. **添加错误边界**
   ```typescript
   import { ErrorBoundary } from 'react-error-boundary'
   ```

3. **添加加载骨架屏**
   - 替换简单的 "加载中..." 文本
   - 使用 Skeleton 组件

4. **性能监控**
   - 添加 Web Vitals 监控
   - 添加错误上报

5. **SEO 优化**
   - 使用 Application Layer 的 SEO 工具
   - 生成 Metadata
   - 添加结构化数据

---

**验证日期**: 2026-02-12
**服务器地址**: http://localhost:3000
**状态**: 🚀 Ready for Testing