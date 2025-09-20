# requirements.txt 配置文件详解

本文档详细解释了 Vxture 项目中 `requirements.txt` 文件的各个部分及其作用，帮助开发者理解 Python 后端依赖配置。

## 什么是 requirements.txt？

`requirements.txt` 是 Python 项目的依赖配置文件，列出了项目所需的所有 Python 包及其版本要求。这个文件用于确保所有开发环境和部署环境安装相同版本的依赖，保持一致性。

## 配置文件示例

```text
# Core
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
pydantic>=2.6.0
pydantic-settings>=2.1.0
python-dotenv>=1.0.0
httpx>=0.27.0

# Database
psycopg>=3.1.18
psycopg-pool>=3.2.1
pgvector>=0.2.5
redis>=5.0.1
alembic>=1.13.1

# Optional vector stores / embeddings
chromadb>=0.4.22
qdrant-client>=1.7.0
faiss-cpu>=1.7.4
sentence-transformers>=2.6.0

# Document processing / RAG
llama-index>=0.10.0
pypdf>=4.0.0
beautifulsoup4>=4.12.0

# Security & utilities
python-jose>=3.3.0
passlib>=1.7.4
bcrypt>=4.1.2
python-multipart>=0.0.7
tenacity>=8.2.3
aiofiles>=23.2.1

# Testing
pytest>=8.0.0
pytest-asyncio>=0.23.5
pytest-cov>=4.1.0

# Observability
structlog>=24.1.0
prometheus-client>=0.18.0
opentelemetry-api>=1.22.0
opentelemetry-sdk>=1.22.0
```

## 依赖分组说明

### Web 框架与核心依赖

```text
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
pydantic>=2.6.0
pydantic-settings>=2.1.0
python-dotenv>=1.0.0
httpx>=0.27.0
```

| 依赖                | 版本        | 说明                                                                    |
| ------------------- | ----------- | ----------------------------------------------------------------------- |
| `fastapi`           | `>=0.110.0` | 高性能 API 框架，用于构建后端服务                                      |
| `uvicorn[standard]` | `>=0.29.0`  | ASGI 运行服务器                                                          |
| `pydantic`          | `>=2.6.0`   | 数据验证与模型定义                                                       |
| `pydantic-settings` | `>=2.1.0`   | 配置管理                                                                 |
| `python-dotenv`     | `>=1.0.0`   | 从 `.env` 加载环境变量                                                   |
| `httpx`             | `>=0.27.0`  | HTTP 客户端（同步/异步）                                                 |

### 数据库依赖

```text
psycopg>=3.1.18
psycopg-pool>=3.2.1
pgvector>=0.2.5
redis>=5.0.1
alembic>=1.13.1
```

| 依赖           | 版本       | 说明                                                      |
| -------------- | ---------- | --------------------------------------------------------- |
| `psycopg`      | `>=3.1.18` | PostgreSQL 客户端                                          |
| `psycopg-pool` | `>=3.2.1`  | 连接池实现                                                  |
| `pgvector`     | `>=0.2.5`  | PostgreSQL 向量扩展                                         |
| `redis`        | `>=5.0.1`  | Redis 客户端                                                |
| `alembic`      | `>=1.13.1` | 数据库迁移工具                                              |

### 智能体 / LLM 集成（外部服务）

> 本项目不会在主仓库内直接托管或运行大语言模型（LLM）或智能体（agent）运行时的依赖与服务。

如果需要 LLM/agent 功能，请在独立的服务或仓库中维护这些依赖并通过明确的 HTTP API 将其与本仓库后端集成，以便将敏感凭据与模型运行时隔离到单独的部署环境。

### 安全与工具

```text
python-jose>=3.3.0
passlib>=1.7.4
bcrypt>=4.1.2
python-multipart>=0.0.7
tenacity>=8.2.3
aiofiles>=23.2.1
```

### 测试工具

```text
pytest>=8.0.0
pytest-asyncio>=0.23.5
pytest-cov>=4.1.0
httpx>=0.27.0
```

### 日志与监控

```text
structlog>=24.1.0
prometheus-client>=0.18.0
opentelemetry-api>=1.22.0
opentelemetry-sdk>=1.22.0
```

## 安装与使用

```bash
pip install -r requirements.txt
```

在 Windows PowerShell 中创建并激活虚拟环境：

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 最佳实践

1. 在虚拟环境中安装依赖并使用分组注释提高可读性。
2. 开发环境可以使用范围版本（`>=`）；生产建议锁定具体版本以保证可重复性。
3. 所有需要运行模型或保有敏感凭据的功能，应在独立服务中维护并通过 HTTP API 集成，以避免将凭据或模型运行时直接托管在此仓库中。
