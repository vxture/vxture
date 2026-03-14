# Git 工作流规范

> Vxture Monorepo Git 工作流与版本管理规范

---

## 核心原则

1. **package.json**：使用行业标准三位版本号 `1.0.0`
2. **Commit/Tag**：格式为 `{包名}@V{package版本}.{日期}.{序号}`

---

## Commit Message 规范

### 格式

```
[{包名}@V{package版本}.{日期}.{序号}] {简短描述}
```

### 示例

```
[core-config@V1.0.0.260314.01] 新增 ChatGPT 和 Qwen 模型配置
[core-auth@V1.0.0.260315.01] 修复 JWT 验证逻辑
```

### 说明

- **package版本**：从对应包的 `package.json` 读取（如 `1.0.0`）
- **日期**：`YYMMDD` 格式（如 `260314`）
- **序号**：当日发布顺序（如 `01`、`02`）

---

## Tag 规范

### 标签格式

```
{包名}@V{package版本}.{日期}.{序号}
```

### 示例

```
core-config@V1.0.0.260314.01
core-auth@V1.0.0.260315.02
```

### Tag Message 格式

```
{包名} @ V{package版本}.{日期}.{序号} : {类型}: {描述}
```

### Tag Message 示例

```
core-config @ V1.0.0.260314.01 : feat: 新增 ChatGPT 和 Qwen 模型配置
core-auth @ V1.0.0.260315.02 : fix: 修复 JWT 验证逻辑
```

### 类型说明

| 类型       | 说明          |
| ---------- | ------------- |
| `feat`     | 新功能        |
| `fix`      | 修复          |
| `refactor` | 重构          |
| `docs`     | 文档          |
| `chore`    | 构建/工具相关 |

---

## 发布流程

### 1. 更新 package.json

```bash
cd packages/core/config
# 修改 version 字段为三位格式（如 1.0.0）
```

### 2. 构建测试

```bash
npm run build
npm run typecheck
```

### 3. 提交变更

```bash
cd ../../..
git add packages/core/config/
git commit -m "[core-config@V1.0.0.260314.01] 新增 ChatGPT 和 Qwen 模型配置"
```

### 4. 创建 Tag

```bash
git tag -a core-config@V1.0.0.260314.01 -m "core-config @ V1.0.0.260314.01 : feat: 新增 ChatGPT 和 Qwen 模型配置"
```

### 5. 推送到远程

```bash
git push
git push origin core-config@V1.0.0.260314.01
```

---

## 常用命令

| 命令                                             | 说明                          |
| ------------------------------------------------ | ----------------------------- |
| `git tag -l "core-config@*" --sort=-creatordate` | 查看 core-config 包的所有 tag |
| `git show core-config@V1.0.0.260314.01`          | 查看 tag 详情                 |
| `git log --grep="\[core-config\]"`               | 查看 core-config 包的提交     |

---

_版本：2.0.0 | 2026-03-14_
