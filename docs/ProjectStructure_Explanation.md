# Project Structure Overview

This document details the directory structure of the Vxture project, helping developers understand the purpose of each file and folder, and their relationships, based on the current monorepo organization.

## Top-level Directory Structure

```
vxture/
├── .github/            # GitHub workflows and config
├── docs/               # Project documentation
├── node_modules/       # Root dependencies (auto-generated)
├── packages/           # Main project source (monorepo)
│   ├── api/            # Backend (FastAPI)
│   └── web/            # Frontend (Next.js)
├── public/             # Static assets (if present)
├── .env*               # Environment variable files
├── package.json        # Root package config
├── pnpm-workspace.yaml # pnpm monorepo config
├── README.md           # Project overview
└── ...other config files
```

## Frontend Structure (`packages/web/`)

```
packages/web/
├── src/
│   └── app/            # Next.js App Router entry (e.g. globals.css)
├── package.json        # Frontend dependencies and scripts
├── tsconfig.json       # TypeScript config
├── next.config.js      # Next.js config
├── tailwind.config.js  # Tailwind CSS config
├── postcss.config.js   # PostCSS config
└── ...other files
```

- Uses Next.js 14+ App Router architecture.
- All business logic, components, and styles are under `src/`.
- TypeScript is used throughout.
- Tailwind CSS and PostCSS for styling.

## Backend Structure (`packages/api/`)

```
packages/api/
├── app/
│   ├── main.py         # FastAPI entry point
│   └── ...             # Other backend modules
├── scripts/            # Utility scripts (e.g. init.py, run_comprehensive_tests.py)
├── requirements.txt    # Python dependencies
├── .env*               # Backend environment variables
└── ...other files
```

- Uses FastAPI as the backend framework.
- Python dependencies managed via requirements.txt.
- Utility scripts for setup and testing.

## Documentation Structure (`docs/`)

- Contains configuration explanations, development guides, and technical stack documentation.
- All documentation files are Markdown format and named in English for consistency.

## Key Conventions

- All source code is organized under `packages/` for monorepo management.
- Configuration files are at the root and in each subproject as needed.
- Environment variables are managed via `.env` files (not committed).
- Component files use PascalCase; utility functions use camelCase.
- Import order: external libs → internal modules → types → styles.

## Example Routes

- `/` : Home page
- `/about` : About page
- `/dashboard`: User dashboard

## Evolution Suggestions

- Add new features by creating corresponding folders under `packages/web/src/app/`.
- As the component library grows, consider organizing by design system (Atoms/Molecules/Organisms).
- For large backend modules, consider microservice separation under `packages/api/`.

## Conclusion

Vxture adopts a modern Next.js + FastAPI monorepo architecture. The directory is clearly separated by responsibility, and following these conventions will help maintain code quality and scalability.
