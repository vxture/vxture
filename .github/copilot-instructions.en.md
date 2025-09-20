# Copilot Instructions for vxture (English)

Goal: Help AI coding assistants get productive quickly in the `vxture` repository and provide actionable, runnable code changes.

Big-picture architecture:

- Frontend (Next.js 14+): code in `src/`, App Router. Key files: `src/app/page.tsx`.
- Backend (FastAPI): code in `backend/app/`. Main entry: `backend/app/main.py`.
- Data and vector stores: `backend/data/vectorstore` and related `backend/data/` folders.

Common developer workflows:

- Start frontend dev server: `npm run dev` from repo root.
- Type check frontend: `npm run type-check`.
- Start backend locally (Windows PowerShell):

  ```powershell
  cd backend
  python -m venv venv; .\venv\Scripts\Activate; pip install -r requirements.txt; python app/main.py
  ```

Project-specific conventions:

- API responses are wrapped with `ApiResponseHandler` in `src/lib/utils/apiResponse.ts`. Use it for consistent responses and error handling.
- Client components must include `'use client'` for interactive components.

Debugging notes:

- Backend CORS allows all origins during development (see `backend/app/main.py`).

Files to open first when making changes:

- `src/lib/utils/apiResponse.ts` — response wrapper.
- `src/types/` — shared types.
- `src/app/page.tsx` — main frontend entry.
- `backend/app/main.py` — backend entry and API definitions.

If uncertain: search the repo for `ApiResponseHandler` and other platform keywords to find usage examples before adding new cross-cutting contracts.
