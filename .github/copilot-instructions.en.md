# Copilot Instructions for vxture (English)

Goal: Help AI coding assistants get productive quickly in the `vxture` repository and provide actionable, runnable code changes.

Big-picture architecture:

- Frontend (Next.js 14+): code in `src/`, App Router. Key files: `src/app/page.tsx`, `src/app/api/chat/route.ts` (edge runtime).
- Backend (FastAPI): code in `backend/app/`. Main entry: `backend/app/main.py`. Agents live in `backend/app/agents/` (`langgraph/` primary, `autogen/` optional).
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
- Shared types for chat live in `src/types/chat.ts`. Keep TypeScript types and Pydantic models in `backend/app/main.py` in sync when changing message shapes.
- Client components must include `'use client'` (see `src/components/features/chat/ChatClient.tsx`).
- `src/app/api/chat/route.ts` is an edge route that currently returns a mock — real agent runs on the backend FastAPI `/api/chat` endpoint.

Agent integration points:

- Primary agent implementation: `backend/app/agents/langgraph/simple_agent.py` with `process_chat_request(messages)` returning `{ response, conversation_id }`.
- `backend/app/main.py` will fall back to a mock `process_chat_request` if LangGraph or its modules cannot be imported — do not remove this fallback.
- Tools for agents live under `backend/app/agents/tools/implementation.py` and are referenced by LangGraph tool nodes (e.g., `ToolExecutor`).

Debugging notes:

- To have the frontend call the local backend during development, either update `src/app/api/chat/route.ts` to proxy to `http://localhost:8000/api/chat` or call the backend endpoint directly from the client.
- Backend CORS allows all origins during development (see `backend/app/main.py`).

Files to open first when making changes:

- `src/lib/utils/apiResponse.ts` — response wrapper.
- `src/types/chat.ts` — shared message types.
- `src/app/api/chat/route.ts` — edge route and mock.
- `backend/app/main.py` — backend entry and API definitions.
- `backend/app/agents/langgraph/simple_agent.py` — agent example and pattern.

If uncertain: search the repo for `ApiResponseHandler`, `process_chat_request`, and `ChatMessage` to find usage examples before adding new cross-cutting contracts.

If you'd like, I can also add a PR template and a minimal CI workflow that runs frontend type checks and basic backend tests.
