# Vxture Tech Stack (Simplified v1.0)

A modern stack focused on the company website and account system
本技术栈专注于公司官网与账号系统。

## 🏗️ Core Architecture

### PNPM Monorepo Structure

```text
vxture/
├── packages/web/    # Next.js frontend
└── packages/api/    # FastAPI backend
```

## 📦 Technology Choices

### Frontend Stack (`packages/web`)

- **Framework:** Next.js 15 (App Router) + React 18 + TypeScript
- **Styling:** TailwindCSS
- **State Management:** TanStack Query
- **Data Validation:** Zod
- **Code Quality:** ESLint + Prettier + Husky

### Backend Stack (`packages/api`)

- **Framework:** FastAPI + Uvicorn[standard]
- **Database:** PostgreSQL + Redis
- **Authentication:** JWT (python-jose) + Password Hashing (passlib + bcrypt)
- **Data Validation:** Pydantic
- **DB Migration:** Alembic
- **Testing:** pytest + pytest-asyncio

### Removed Dependencies (v1.0 Simplified)

- ❌ OpenAI API
- ❌ Vector stores (ChromaDB, Qdrant, FAISS)
- ❌ AI toolchains (LlamaIndex, sentence-transformers)
- ❌ Complex monitoring (Prometheus, OpenTelemetry)
- ❌ Duplicate config files

## 🚀 Development Commands

```bash
# Install dependencies
pnpm install

# Start dev servers
pnpm dev          # Frontend (localhost:3000)
pnpm dev:api      # Backend (localhost:8000)

# Build & check
pnpm build        # Build frontend
pnpm lint         # Lint code
pnpm type-check   # TypeScript check
```

## 🎯 Core Features

1. **Website Presentation:** Company website and product showcase
2. **User System:** Registration, login, user center
3. **Access Control:** Roles and permissions
4. **Subscription Management:** User subscriptions and licensing

## 🌐 Service Integration

- **vxture:** Main platform (this project)
- **vxture-auth:** Standalone authentication service
- **ruins-agent:** Agent app (integrates with auth)

## 📝 Key Paths

- **Frontend entry:** `packages/web/src/app/page.tsx`
- **Backend entry:** `packages/api/app/main.py`
- **API utility:** `packages/web/src/lib/utils/apiResponse.ts`
- **Workspace config:** `pnpm-workspace.yaml`

---

**Version:** v1.0 Simplified | **Last updated:** Sep 21, 2025
