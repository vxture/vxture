# Database Configuration Explained

This document details how database configuration is managed in the Vxture project, including environment variable setup, connection methods, and the main database technologies used.
本文档详细说明了 Vxture 项目的数据库配置管理方式，包括环境变量设置、连接方法及主要数据库技术。

## Basic Database Configuration

Database connection settings are managed via environment variables, primarily in the `.env.local` file (for local development). A template file `.env.local.template` is provided as a reference.

### Example Environment Variables

```dotenv
# Database configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/vxture
REDIS_URL=redis://localhost:6379/0
```

## Database Technology Choices

The project uses the following database technologies：

1. **PostgreSQL** – Primary database
   - Default port：5432
   - Uses the `pgvector` extension for vector search (for AI/RAG systems)
   - Connection string format：`postgresql://user:password@host:port/dbname`
2. **Redis** – Caching and session management
   - Default port：6379
   - Connection string format：`redis://host:port/db_index`
   - Main uses：cache, session storage, rate limiting

## Best Practices for Database Configuration

1. **Environment Separation**
   - Development：`.env.local` (not committed)
   - Testing：`.env.test`
   - Production：set via deployment platform (e.g. Vercel, Railway)
2. **Security**
   - Never hardcode credentials in code
   - Use strong passwords in production
   - Restrict DB user permissions
   - Rotate passwords regularly
3. **Connection Pooling**
   - Use a connection pool in the backend
   - Tune pool size based on app load

## Database Schema Design

The database schema follows these principles：

1. **Schema Organization**
   - Core business data in the main schema
   - Vector data may be in a dedicated schema
   - Security-related tables (users, permissions) managed separately
2. **Table Design**
   - Use UUIDs as primary keys
   - All tables include created/updated timestamps
   - Soft delete via `deleted_at` column
   - Foreign keys for data integrity

## Deployment Configuration

### Local Development

Local development typically uses Docker containers for PostgreSQL and Redis：

```bash
# Start PostgreSQL (with pgvector)
docker run -d --name vxture-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 ankane/pgvector

# Start Redis
docker run -d --name vxture-redis -p 6379:6379 redis
```

### Production

Production should use managed database services：

1. **PostgreSQL:**
   - AWS RDS for PostgreSQL (supports pgvector)
   - Railway PostgreSQL
   - Supabase PostgreSQL
2. **Redis:**
   - AWS ElastiCache
   - Upstash Redis
   - Railway Redis

## Example Code

Database connections are typically initialized in backend services, e.g.：

```python
# FastAPI backend example (backend/app/db/database.py)
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Vector Database Configuration

For vector search, the project uses PostgreSQL with the pgvector extension：

```sql
-- Initialize pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Example vector table
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(1536) NOT NULL, -- OpenAI embedding dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vector index
CREATE INDEX ON document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## Database Migration Management

Alembic is used for schema management and migrations：

```bash
# Create migration script
alembic revision --autogenerate -m "describe changes"

# Apply migration
alembic upgrade head
```

## Notes

1. Never commit sensitive DB credentials to version control
2. Always use environment variables or a secure secret manager for credentials
3. Regularly back up production databases
4. Use separate DB instances for different environments
5. Monitor DB performance and optimize as needed
