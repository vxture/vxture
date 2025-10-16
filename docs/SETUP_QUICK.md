# vxture — 开发环境 快速启动（一页版）

下面的步骤按「一键快速」和「手动分步」两条路径给出。把整段复制给同事即可在另一台机器上复现开发环境。

---

## 一键快速（推荐）

- Windows（PowerShell / pwsh）:

```powershell
git clone https://github.com/your-org/vxture.git
cd vxture
.\scripts\setup-dev.ps1
```

- Unix / macOS（bash）:

```bash
git clone https://github.com/your-org/vxture.git
cd vxture
./scripts/setup-dev.sh
```

说明：脚本会尝试安装 Volta、Node (LTS)、pnpm、创建 Python venv 并安装 `requirements.txt`，还会可选安装 VS Code 扩展。

---

## 手动分步（可选）

1. 克隆仓库：

```bash
git clone https://github.com/your-org/vxture.git
cd vxture
```

1. 安装 Node 与 pnpm（推荐 Volta）:

   Windows (PowerShell/pwsh):

   ```powershell
   iwr https://get.volta.sh -UseBasicParsing | iex
   volta install node
   volta install pnpm
   ```

   Unix/macOS:

   ```bash
   curl https://get.volta.sh | bash
   volta install node
   volta install pnpm
   ```

1. 安装前端依赖：

```bash
pnpm install
```

1. Python 虚拟环境与依赖：
1. Python 虚拟环境与依赖:

   Windows:

   ```powershell
   python -m venv .venv
   . '.\.venv\Scripts\Activate.ps1'  # use dot-source to activate in the current PowerShell session
   pip install -r requirements.txt
   ```

   Unix:

   ```bash
   python -m venv .venv
   . .venv/bin/activate
   pip install -r requirements.txt
   ```

1. 复制环境变量模板并编辑：

```bash
cp .env.local.template .env.local
# 编辑 .env.local 填写真实配置
```

1. 启动开发服务：

```powershell
# 同时启动前后端（Windows）
.\start-dev.ps1

# 或分别启动
pnpm dev       # 前端 http://localhost:3000
pnpm dev:api   # 后端 http://localhost:8000
```

---

## VS Code 设置与扩展

- 推荐打开 `.devcontainer`（如果使用 Docker）：在 VS Code 中选择 "Remote-Containers: Reopen in Container"。
- 手动安装扩展（如果未使用脚本）：

```bash
# 需要 VS Code CLI (code)
xargs -L1 code --install-extension < .vscode/extensions-list.txt
```

---

## 常见网络问题（无法访问 GitHub / 无法推送）

- 测试连通性（Windows PowerShell）：

```powershell
Test-NetConnection github.com -Port 443
```

- 或用 curl：

```bash
curl -v https://github.com
```

- 如在公司网络内遇到限制：尝试切换到家庭网络、启用 VPN，或配置 Git HTTP 代理：

```bash
git config --global http.proxy http://proxy.example:3128
git config --global https.proxy http://proxy.example:3128
```

---

## 验证（快速）

```bash
node -v   # 期望 18.x
pnpm -v
python -V # 期望 3.11+
```

---

如果需要，我可以把这份单页放在 README 顶部或生成一份 PDF/可打印版本供你分发。祝开发顺利！
