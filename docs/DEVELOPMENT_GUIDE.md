# Vxture Development Guide

This guide provides step-by-step instructions for setting up, developing, and maintaining the vxture monorepo, covering both frontend (Next.js) and backend (FastAPI) workflows.
本指南为 vxture 单体仓库的搭建、开发与维护提供分步说明，涵盖前端（Next.js）与后端（FastAPI）开发流程。

## 🚀 Quick Start

### System Requirements

- Node.js 18+
- Python 3.11+
- PNPM 8.15.0+
- PostgreSQL (production)
- Redis (optional, for cache/session)

### Installation & Startup

```bash
# Clone the repo
git clone <your-repo-url>
cd vxture

# Install PNPM (if not installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Start dev servers
pnpm dev         # Frontend (http://localhost:3000)
pnpm dev:api     # Backend (http://localhost:8000)
```

## 📂 Project Structure

```text
vxture/
├── packages/
│   ├── web/                 # Next.js frontend app
│   │   ├── src/
│   │   │   ├── app/         # Next.js App Router
│   │   │   ├── components/  # React components
│   │   │   ├── lib/         # Utilities
│   │   │   └── types/       # TypeScript types
│   │   ├── package.json
│   │   └── ...configs
│   └── api/                 # FastAPI backend app
│       ├── app/
│       │   ├── main.py      # FastAPI entrypoint
│       │   ├── models/      # Data models
│       │   ├── routers/     # API routers
│       │   └── core/        # Core config
│       ├── requirements.txt
│       └── package.json
├── docs/                    # Project docs
├── pnpm-workspace.yaml      # PNPM workspace config
└── package.json             # Root project config
```

## 🛠️ Development Commands

### Root Commands

```bash
# Development
pnpm dev         # Start frontend dev server
pnpm dev:api     # Start backend dev server

# Build
pnpm build       # Build frontend app

# Code Quality
pnpm lint        # Lint all packages
pnpm type-check  # TypeScript type check

# Clean
pnpm clean       # Clean all build files
```

### Per-Package Commands

```bash
# Frontend (packages/web)
cd packages/web
pnpm dev         # Dev server
pnpm build       # Build
pnpm lint        # ESLint
pnpm type-check  # TypeScript

# Backend (packages/api)
cd packages/api
pnpm dev         # Start FastAPI (uvicorn)
pnpm start       # Production start
pnpm test        # Run tests
pnpm lint        # Python lint
```

## 🏗️ Development Workflow

### Frontend

1. **Component development**: Create reusable components in `packages/web/src/components/`
2. **Page development**: Use App Router in `packages/web/src/app/`
3. **API integration**: Use `packages/web/src/lib/utils/apiResponse.ts` for API responses
4. **State management**: Use TanStack Query for server state
5. **Type safety**: Use Zod for validation and TypeScript inference

### Backend

1. **API development**: Create routers in `packages/api/app/routers/`
2. **Data models**: Define Pydantic models in `packages/api/app/models/`
3. **Database**: Use Alembic for migrations
4. **Auth**: Implement JWT authentication and permissions
5. **Testing**: Use pytest for unit/integration tests

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Commit code
git add .
git commit -m "feat: add your feature description"

# Lint & type check
pnpm lint
pnpm type-check

# Push and create PR
git push origin feature/your-feature-name
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vxture
REDIS_URL=redis://localhost:6379

# JWT
SECRET_KEY=your-secret-key
ALGORITHM=HS256

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### VS Code Setup

Recommended extensions:

- ESLint
- Prettier
- Python
- TypeScript and JavaScript Language Features

## 🚨 Troubleshooting

### PNPM

```bash
# If pnpm is not found
npm install -g pnpm

# Clean node_modules and reinstall
pnpm clean
pnpm install
```

### Dev Server Issues

```bash
# Port in use
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Python environment issues
cd packages/api
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 📚 References

- [Tech Stack](./TECH_STACK.md)
- [Project Structure](./项目结构解析.md)
- [API Docs](http://localhost:8000/docs) (dev only)

---

**Maintained by**: Vxture Dev Team | **Last updated**: Sep 21, 2025
