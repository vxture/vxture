# requirements.txt 配置文件详解

本文档详细解释了 Vxture 项目中 `requirements.txt` 文件的各个部分及其作用，帮助开发者理解 Python 后端依赖配置。

## 什么是 requirements.txt？

`requirements.txt` 是 Python 项目的依赖配置文件，列出了项目所需的所有 Python 包及其版本要求。这个文件用于确保所有开发环境和部署环境安装相同版本的依赖，保持一致性。

## 配置文件概览

```
# Python 后端依赖
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
pydantic>=2.6.0
pydantic-settings>=2.1.0
python-dotenv>=1.0.0
httpx>=0.27.0

# 数据库
psycopg>=3.1.18
psycopg-pool>=3.2.1
pgvector>=0.2.5
redis>=5.0.1
alembic>=1.13.1

# 智能体集成
langchain>=0.1.0
langchain-community>=0.0.20
langchain-openai>=0.0.3
dashscope>=1.15.0  # 阿里通义API
deepseek>=0.0.1

# 安全和工具
python-jose>=3.3.0
passlib>=1.7.4
bcrypt>=4.1.2
python-multipart>=0.0.7
tenacity>=8.2.3

# 测试
pytest>=8.0.0
pytest-asyncio>=0.23.5
httpx>=0.27.0

# 日志和监控
structlog>=24.1.0
prometheus-client>=0.18.0
```

## 依赖详解

### Web 框架和核心依赖

```
# Python 后端依赖
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
pydantic>=2.6.0
pydantic-settings>=2.1.0
python-dotenv>=1.0.0
httpx>=0.27.0
```

| 依赖                | 版本        | 说明                                                                    |
| ------------------- | ----------- | ----------------------------------------------------------------------- |
| `fastapi`           | `>=0.110.0` | 高性能 API 框架，基于 Starlette 和 Pydantic，用于构建 REST API          |
| `uvicorn[standard]` | `>=0.29.0`  | ASGI 服务器，用于运行 FastAPI 应用，`[standard]` 表示包含额外的标准功能 |
| `pydantic`          | `>=2.6.0`   | 数据验证和设置管理库，用于定义数据模型和验证请求/响应                   |
| `pydantic-settings` | `>=2.1.0`   | Pydantic 的扩展，用于管理应用配置和环境变量                             |
| `python-dotenv`     | `>=1.0.0`   | 从 `.env` 文件加载环境变量                                              |
| `httpx`             | `>=0.27.0`  | 现代 HTTP 客户端，支持异步请求，用于调用外部 API                        |

### 数据库依赖

```
# 数据库
psycopg>=3.1.18
psycopg-pool>=3.2.1
pgvector>=0.2.5
redis>=5.0.1
alembic>=1.13.1
```

| 依赖           | 版本       | 说明                                                      |
| -------------- | ---------- | --------------------------------------------------------- |
| `psycopg`      | `>=3.1.18` | PostgreSQL 数据库适配器，用于连接和操作 PostgreSQL 数据库 |
| `psycopg-pool` | `>=3.2.1`  | psycopg 的连接池实现，用于管理数据库连接                  |
| `pgvector`     | `>=0.2.5`  | PostgreSQL 向量扩展的 Python 客户端，用于向量相似性搜索   |
| `redis`        | `>=5.0.1`  | Redis 数据库客户端，用于缓存、会话存储和消息队列          |
| `alembic`      | `>=1.13.1` | 数据库迁移工具，用于管理数据库架构变更                    |

### 智能体集成

```
# 智能体集成
langchain>=0.1.0
langchain-community>=0.0.20
langchain-openai>=0.0.3
dashscope>=1.15.0  # 阿里通义API
deepseek>=0.0.1
```

| 依赖                  | 版本       | 说明                                              |
| --------------------- | ---------- | ------------------------------------------------- |
| `langchain`           | `>=0.1.0`  | LLM 应用开发框架，用于构建基于大语言模型的应用    |
| `langchain-community` | `>=0.0.20` | LangChain 社区组件，提供额外的集成和工具          |
| `langchain-openai`    | `>=0.0.3`  | LangChain 与 OpenAI API 的集成                    |
| `dashscope`           | `>=1.15.0` | 阿里云通义大模型 API 客户端，用于访问通义系列模型 |
| `deepseek`            | `>=0.0.1`  | DeepSeek AI 模型的 Python 客户端                  |

### 安全和工具

```
# 安全和工具
python-jose>=3.3.0
passlib>=1.7.4
bcrypt>=4.1.2
python-multipart>=0.0.7
tenacity>=8.2.3
```

| 依赖               | 版本      | 说明                                                    |
| ------------------ | --------- | ------------------------------------------------------- |
| `python-jose`      | `>=3.3.0` | JavaScript 对象签名和加密库的 Python 实现，用于处理 JWT |
| `passlib`          | `>=1.7.4` | 密码哈希库，用于安全存储用户密码                        |
| `bcrypt`           | `>=4.1.2` | 密码哈希算法，与 passlib 配合使用                       |
| `python-multipart` | `>=0.0.7` | 处理表单数据和文件上传的库                              |
| `tenacity`         | `>=8.2.3` | 重试库，用于在遇到临时错误时自动重试操作                |

### 测试工具

```
# 测试
pytest>=8.0.0
pytest-asyncio>=0.23.5
httpx>=0.27.0
```

| 依赖             | 版本       | 说明                                |
| ---------------- | ---------- | ----------------------------------- |
| `pytest`         | `>=8.0.0`  | Python 测试框架，用于编写和运行测试 |
| `pytest-asyncio` | `>=0.23.5` | pytest 的扩展，支持异步测试         |
| `httpx`          | `>=0.27.0` | 在这里用于测试 HTTP 接口            |

### 日志和监控

```
# 日志和监控
structlog>=24.1.0
prometheus-client>=0.18.0
```

| 依赖                | 版本       | 说明                                                    |
| ------------------- | ---------- | ------------------------------------------------------- |
| `structlog`         | `>=24.1.0` | 结构化日志库，产生易于解析的 JSON 格式日志              |
| `prometheus-client` | `>=0.18.0` | Prometheus 监控系统的 Python 客户端，用于收集和导出指标 |

## 版本说明

此配置文件使用 `>=` 操作符指定依赖的最低版本要求。这意味着：

- 安装时会安装不低于指定版本的最新可用版本
- 允许后续更新到更高版本，只要不破坏兼容性
- 适合开发阶段，但在生产环境部署前应考虑固定版本

## 安装和使用说明

### 安装所有依赖

```bash
pip install -r requirements.txt
```

### 创建虚拟环境并安装依赖

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境 (Windows)
venv\Scripts\activate

# 激活虚拟环境 (Linux/macOS)
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 生成依赖列表

如果您添加了新依赖，可以使用以下命令更新 `requirements.txt`：

```bash
pip freeze > requirements.txt
```

注意：`pip freeze` 会列出所有已安装的包，包括间接依赖。有时您可能需要手动编辑文件以保持其简洁性。

## 最佳实践

1. **依赖分组**：按功能将依赖分组并添加注释，提高可读性

2. **版本锁定**：
   - 开发环境：使用 `>=` 允许兼容性更新
   - 生产环境：考虑使用确切版本 `==` 确保一致性
   - 或使用 `pip-compile` 工具生成锁定文件

3. **依赖隔离**：始终在虚拟环境中安装依赖，避免系统级冲突

4. **定期更新**：定期检查和更新依赖，尤其是安全更新

5. **多环境配置**：考虑使用多个要求文件：

   ```
   requirements/
   ├── base.txt      # 核心依赖
   ├── dev.txt       # 开发依赖
   ├── test.txt      # 测试依赖
   └── prod.txt      # 生产依赖
   ```

6. **依赖安全扫描**：使用工具如 `pip-audit` 或 `safety` 定期检查已知漏洞
