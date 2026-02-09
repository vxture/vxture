# VS Code Tasks 使用指南

`.vscode/tasks.json` 定义了项目的常用开发任务。你可以在 VS Code 中快速运行这些任务，无需手动输入完整命令。

## 📋 定义的任务列表

| 任务名称                   | 命令                               | 用途                                     |
| -------------------------- | ---------------------------------- | ---------------------------------------- |
| **pnpm: 启动前端 (web)**   | `pnpm --filter web run dev`        | 启动 Next.js 前端开发服务器（端口 3000） |
| **pnpm: 启动后端 (api)**   | `pnpm --filter api run dev`        | 启动 FastAPI 后端开发服务器（端口 8000） |
| **pnpm: 安装依赖 (root)**  | `pnpm install`                     | 安装所有项目依赖                         |
| **TypeScript: 检查 (web)** | `pnpm --filter web run type-check` | 进行 TypeScript 类型检查                 |
| **Format: 全库**           | `pnpm run format`                  | 格式化整个仓库的代码                     |

---

## 🚀 如何使用

### 方式 1：使用快捷键（推荐）

1. **打开 Task 菜单**：
   - Windows/Linux：`Ctrl + Shift + P` → 输入 `Run Task` → 按 Enter
   - macOS：`Cmd + Shift + P` → 输入 `Run Task` → 按 Enter

2. **选择要运行的任务**：
   - 会显示所有可用任务列表
   - 选择其中一个（例如 "pnpm: 启动前端 (web)"）
   - VS Code 会在集成终端中运行该任务

### 方式 2：使用默认任务快捷键

- **快速运行默认任务**（启动前端）：`Ctrl + Shift + B`（Windows/Linux）或 `Cmd + Shift + B`（macOS）
- 这会直接执行 `pnpm: 启动前端 (web)` 任务（因为它在配置中标记为 `"isDefault": true`）

### 方式 3：通过命令面板快速启动

1. `Ctrl + Shift + P` 打开命令面板
2. 输入任务名称的一部分（例如 "前端" 或 "type-check"）
3. 选择对应的任务
4. 按 Enter 运行

### 方式 4：从终端面板启动

1. 打开 VS Code 集成终端（`Ctrl + ~`）
2. 点击终端面板右上角的 **"+"** 旁边的下拉菜单
3. 选择 "Run Task"
4. 选择你要运行的任务

---

## 💡 常见使用场景

### 场景 1：启动开发环境（前端 + 后端）

1. 快捷键 `Ctrl + Shift + B` 启动前端（自动打开新终端）
2. 再用 `Ctrl + Shift + P` → `Run Task` → 选择 "pnpm: 启动后端 (api)"
3. 现在前端和后端都在运行，你可以调试前端页面

**提示**：如果想在同一个终端看两个服务的日志，可以改为：

- 先用 `Ctrl + Shift + B` 启动前端
- 在新建的终端中手动输入 `pnpm --filter api run dev` 启动后端

### 场景 2：快速类型检查

在修改 TypeScript 代码后，快速验证没有类型错误：

1. `Ctrl + Shift + P` → `Run Task` → "TypeScript: 检查 (web)"
2. VS Code 会在输出面板显示检查结果
3. 如果有错误，点击错误行会跳转到问题代码处

### 场景 3：安装依赖

如果 `node_modules` 被误删或需要重新安装：

1. `Ctrl + Shift + P` → `Run Task` → "pnpm: 安装依赖 (root)"
2. 等待安装完成（可能需要几分钟）

### 场景 4：格式化代码

在提交前统一格式化代码：

1. `Ctrl + Shift + P` → `Run Task` → "Format: 全库"
2. 所有代码按 Prettier 规则格式化

---

## ⚙️ 任务配置说明

每个任务的配置项含义：

```json
{
  "label": "pnpm: 启动前端 (web)", // 任务显示名称
  "type": "shell", // 任务类型（shell = 运行 shell 命令）
  "command": "pnpm --filter web run dev", // 实际执行的命令
  "group": {
    // 任务分组
    "kind": "build", // 类型：build / test / etc
    "isDefault": true // 是否为默认任务（Ctrl+Shift+B 快捷键触发）
  },
  "presentation": {
    // 输出展示方式
    "reveal": "always", // 总是显示终端
    "panel": "shared" // 所有任务共享一个终端面板
  },
  "problemMatcher": [] // 用于解析错误信息（当前为空）
}
```

---

## 🔧 自定义任务

如果你想添加新的任务（例如启动数据库、运行测试等），可以在 `tasks.json` 中添加：

```json
{
  "label": "Database: 启动 PostgreSQL",
  "type": "shell",
  "command": "docker-compose up -d postgres", // 或其他命令
  "presentation": { "reveal": "always", "panel": "shared" },
  "problemMatcher": []
}
```

然后保存，下次就能在 Task 列表中看到这个新任务。

---

## 📖 快速参考

| 操作                     | 快捷键 / 菜单                        |
| ------------------------ | ------------------------------------ |
| 运行默认任务（启动前端） | `Ctrl + Shift + B`                   |
| 打开 Task 菜单           | `Ctrl + Shift + P` → 输入 "Run Task" |
| 终止当前任务             | 在终端中按 `Ctrl + C`                |
| 查看所有可用快捷键       | `Ctrl + K` + `Ctrl + S` 搜索 "task"  |

---

## ❓ 常见问题

**Q: 如何同时运行两个任务？**
A: 打开多个终端（`Ctrl + Shift + ~`），在每个终端中分别运行一个任务。或修改 `presentation.panel` 为 `"new"` 让每个任务在新终端打开。

**Q: 为什么任务没有在列表中显示？**
A: 检查 `tasks.json` 是否有语法错误（JSON 格式）。或者 VS Code 需要重新加载（按 `Ctrl + Shift + P` → "Developer: Reload Window"）。

**Q: 如何在任务中添加环境变量？**
A: 在任务中添加 `"options": { "env": { "VAR_NAME": "value" } }`。

---

## 🎯 推荐工作流

开发时的典型流程：

1. **早上启动**：`Ctrl + Shift + B` 启动前端
2. **后台启动后端**：新建终端，运行 `pnpm --filter api run dev`
3. **修改代码后验证**：`Ctrl + Shift + P` → "TypeScript: 检查 (web)"
4. **提交前格式化**：`Ctrl + Shift + P` → "Format: 全库"
5. **git commit/push**

---

## 📝 相关文件

- **VS Code 文档**：https://code.visualstudio.com/docs/editor/tasks
- **项目配置**：`.vscode/tasks.json`（当前文件）
- **调试配置**：`.vscode/launch.json`（已删除，如需恢复可从 git history 获取）
- **工作区设置**：`.vscode/settings.json`（团队共享配置）
- **推荐扩展**：`.vscode/extensions.json`
