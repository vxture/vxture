# requirements.txt Configuration Explained

This document explains the structure and role of the `requirements.txt` file in the Vxture project, focusing on the current backend technology stack and best practices for Python dependency management.

## What is requirements.txt?

`requirements.txt` is the standard Python dependency file. It lists all required Python packages and their version constraints for the backend (FastAPI) service. This ensures consistent environments for development, testing, and production.

## Example File Structure

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

## Dependency Groups

### Web Framework & Core

- **fastapi**: High-performance Python web framework for building APIs.
- **uvicorn[standard]**: ASGI server for running FastAPI apps.
- **pydantic**: Data validation and settings management.
- **pydantic-settings**: Typed settings management for Pydantic v2.
- **python-dotenv**: Loads environment variables from `.env` files.
- **httpx**: HTTP client for async/sync requests.

### Database

- **psycopg**: PostgreSQL database driver.
- **psycopg-pool**: Connection pooling for PostgreSQL.
- **pgvector**: Vector extension for PostgreSQL (for AI/RAG scenarios).
- **redis**: Redis client for Python.
- **alembic**: Database migrations for SQLAlchemy.

### Optional Vector Stores / Embeddings

- **chromadb**, **qdrant-client**, **faiss-cpu**, **sentence-transformers**: Used for advanced vector search, embeddings, and RAG scenarios. Not required for basic API functionality.

### Document Processing / RAG

- **llama-index**, **pypdf**, **beautifulsoup4**: For document parsing, PDF processing, and retrieval-augmented generation (RAG) workflows.

### Security & Utilities

- **python-jose**: JWT authentication.
- **passlib**, **bcrypt**: Password hashing and security.
- **python-multipart**: Multipart form data parsing.
- **tenacity**: Retry utilities for robust code.
- **aiofiles**: Async file operations.

### Testing

- **pytest**, **pytest-asyncio**, **pytest-cov**: Testing and coverage tools for Python.

### Observability

- **structlog**: Structured logging.
- **prometheus-client**: Prometheus metrics exporter.
- **opentelemetry-api**, **opentelemetry-sdk**: Distributed tracing and observability.

## Installation & Usage

Install all backend dependencies in a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Best Practices

1. Always use a virtual environment for Python development.
2. Use grouped comments in `requirements.txt` to clarify dependency purpose.
3. For production, consider pinning exact versions for reproducibility.
4. If you need LLM/agent/model runtime, keep those dependencies in a separate service and integrate via HTTP API—do not store model weights or sensitive credentials in this repo.

## Notes

This file is tailored for a FastAPI + PostgreSQL + Redis backend, with optional support for vector search, document processing, and modern observability tools. Adjust as needed for your deployment scenario.
