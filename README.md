# Agent Orchestrator Dashboard

Frontend dashboard for the **Agent Orchestrator API** – a Peer Agent–driven task routing system with ContentAgent and CodeAgent.

This application provides:

- Task execution via the Peer Agent router (with queue & status timeline).
- Task history with filters and detailed modal view.
- System monitor dashboard with real-time metrics and health.

Built for production with **Vue 3 + TypeScript + Vite + Pinia + Axios + Tailwind CSS + Chart.js**.

---

## 1. Overview

The dashboard integrates with the existing backend (`agent-orchestrator-api`) exposed at:

- Remote: `http://3.126.129.40:8000/`
- Local dev: `http://localhost:8000/`

Key features:

- **Execute Task** page:
  - Submit a free-form task to `POST /v1/agent/execute`.
  - Real-time tracking of `queued → processing → completed/failed` via **SSE with polling fallback**.
  - Display detailed result (Markdown content or syntax-highlighted code) and logged events.
- **Task History** page:
  - List all tasks from `GET /v1/tasks`.
  - Filter by agent type and status; search by summary.
  - View task details in a modal (`GET /v1/tasks/{task_id}`) with status timeline, output, and logs.
- **System Monitor** page:
  - Show queue depth, processed counts (current day, last 5 days, all-time), agent distribution, and latency from `GET /v1/system/metrics`.
  - Bar chart (daily task volume) and donut chart (agent distribution) using Chart.js.
  - Health section derived from `metrics.api_health` and `/health`.

---

## 2. Tech Stack

- **Core**
  - Vue 3, TypeScript, Composition API
  - Vite
  - Vue Router
  - Pinia
- **HTTP & Types**
  - Axios (single configured instance with interceptors)
  - Strongly typed domain models aligned to backend Pydantic models
- **Styling**
  - Tailwind CSS (with `dark` mode and typography plugin)
  - Custom components built following the provided Figma design
- **Charts**
  - Chart.js + vue-chartjs
- **Rendering**
  - marked + highlight.js + DOMPurify for safe Markdown/code rendering
- **Testing**
  - Vitest + Vue Test Utils
- **Dev Experience**
  - ESLint (Vue + TS + Tailwind)
  - Prettier
- **Deployment**
  - Docker (multi-stage build, Nginx serving SPA)
  - Example GitHub Actions CI workflow

---

## 3. Architecture

### 3.1 Folder Structure

```text
agent-orchestrator-dashboard/
  src/
    api/            # Axios instance + typed API modules
    components/     # Atomic design (atoms/molecules/organisms)
    composables/    # Cross-cutting hooks (SSE, polling, theme, error)
    config/         # Env & config helpers
    pages/          # Route-level pages
    router/         # Vue Router configuration
    store/          # Pinia stores (tasks, metrics, UI)
    styles/         # Tailwind & global styles
    types/          # Domain & API types
    utils/          # Shared formatting & log helpers
  tests/            # Vitest unit tests
  docker/           # Nginx config
  .github/workflows # CI example
```

### 3.2 Major Stores

- **`useTaskStore`**
  - State:
    - `currentTaskId`, `currentTask`
    - `history` (list of task summaries)
    - `filters` (`status`, `agent_type`, `search`)
    - `loading`, `polling`, `error`
  - Actions:
    - `executeTask(taskText, sessionId?)`
      - Calls `POST /v1/agent/execute`.
      - Fetches initial detail and starts tracking via `startTaskTracking`.
    - `fetchTaskDetail(taskId)`
    - `startTaskTracking(taskId)` / `stopTaskTracking()`
      - Uses `useSseOrPolling`.
    - `loadHistory()`
      - Calls `GET /v1/tasks` with status/agent filters.
    - `setStatusFilter`, `setAgentTypeFilter`, `setSearchFilter`.
  - Derived:
    - `currentTaskLogs` (derived from `TaskDetail` & `agent_runs` via `buildTaskLogs`).

- **`useMetricsStore`**
  - State:
    - `metrics`, `loading`, `error`
    - `autoRefresh`, `autoRefreshIntervalId`
    - `healthText` (raw `/health` response)
  - Actions:
    - `fetchMetrics()` → `GET /v1/system/metrics` + `GET /health`.
    - `startAutoRefresh(intervalMs)` / `stopAutoRefresh()`.

- **`useUiStore`**
  - State:
    - `theme: "light" | "dark"`
    - `isTaskDetailModalOpen`, `selectedTaskIdForModal`
    - `toasts[]` (ID, type, message)
  - Actions:
    - `setTheme`, `toggleTheme`
    - `openTaskDetailModal`, `closeTaskDetailModal`
    - `showToast`, `removeToast`

### 3.3 Composables

- **`useSseOrPolling`**
  - Tries to establish EventSource to `/v1/tasks/{task_id}/events` if **no API key** is configured.
  - If API key is configured (browser cannot send custom headers with native `EventSource`), logs this and falls back to polling.
  - Exposes `start`, `stop`, `isUsingSse`, `isActive`.

- **`usePolling`**
  - Generic interval polling with lifecycle-safe cleanup.

- **`useTheme`**
  - Resolves initial theme from `localStorage`/`prefers-color-scheme`.
  - Applies `dark`/`light` class to `<html>` and syncs with `useUiStore.theme`.

- **`useErrorHandler`**
  - Maps normalized `ApiError` (or generic `Error`) to user-facing message and shows toast.

### 3.4 SSE + Polling Fallback

1. After `POST /v1/agent/execute`, the store:
   - Stores `task_id`, fetches initial detail.
   - Calls `startTaskTracking(task_id)`.
2. `useSseOrPolling`:
   - If API keys **disabled**:
     - Connects native `EventSource` to `/v1/tasks/{task_id}/events`.
     - On each `status_changed` event, fetches detail and updates store.
   - If API keys **enabled** (current backend config):
     - Logs that SSE headers cannot be sent and directly starts polling:
       - `GET /v1/tasks/{task_id}` every 2.5 seconds.
3. Tracking stops when status is `completed` or `failed`.

---

## 4. API Integration

Configuration via `.env` / `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=test-api-key-1
VITE_APP_NAME=Agent Orchestrator Dashboard
VITE_ENVIRONMENT=local
```

The Axios instance (`src/api/httpClient.ts`):

- `baseURL` = `VITE_API_BASE_URL`.
- Request interceptors:
  - Set `Content-Type: application/json`.
  - Inject `X-API-Key` from `VITE_API_KEY` (if present).
  - Generate `X-Request-Id` UUID per request.
- Response interceptor:
  - Normalize backend error envelope (`{ error: { code, message, details } }`) into `ApiError`.
  - Log errors in local/dev mode.

Endpoints used:

- `POST /v1/agent/execute`
  - Execute a new task via Peer Agent.
- `GET /v1/tasks`
  - List task summaries with `status` and `agent_type` filters.
- `GET /v1/tasks/{task_id}`
  - Full task detail, result, error, and agent runs.
- `GET /v1/tasks/{task_id}/events`
  - SSE status events (used when API keys are disabled).
- `GET /v1/system/metrics`
  - Daily metrics (pending tasks, total tasks, per-agent counts, latency, health).
- `GET /health`
  - Raw health info (plain text).

---

## 5. Running Locally

### 5.1 Prerequisites

- Node.js 18+ (recommended 20 or 22)
- Backend (`agent-orchestrator-api`) running at `VITE_API_BASE_URL`
  - Ensure API keys match (`API_KEYS` in backend `.env` and `VITE_API_KEY` here).

### 5.2 Setup

```bash
git clone <this-repo>
cd agent-orchestrator-dashboard

cp .env.example .env
# adjust VITE_API_BASE_URL & VITE_API_KEY if needed

npm install
npm run dev
```

By default, Vite serves on `http://localhost:5173`.

---

## 6. Build & Production

### 6.1 Vite build

```bash
npm run build
npm run preview
```

### 6.2 Docker

Build and run the production image:

```bash
docker build -t agent-orchestrator-dashboard .
docker run -p 5173:80 agent-orchestrator-dashboard
```

The app is served via Nginx at `http://localhost:5173`.

> Note: Vite environment variables (`VITE_*`) are compiled at build time. Make sure your `.env` file is present with correct values **before** building he Docker image.

---

## 7. Testing

Run unit tests:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

Current coverage:

- `useTaskStore.spec.ts`:
  - Verifies `executeTask` calls backend and updates store state.
  - Verifies `loadHistory` populates history.
- `TaskExecutionPage.spec.ts`:
  - Mounts the page.
  - Simulates user typing into the textarea and clicking **Execute Task**.
  - Ensures the flow completes without errors using mocked APIs.

To extend test coverage:

- Add component tests for TaskHistoryPage (table + modal) and SystemMonitorPage (metrics & charts).
- Add more store-level tests (e.g., status transitions and log derivation from `agent_runs`).

---

## 8. Future Improvements

- **SSE proxy layer**:
  - Introduce an SSE proxy endpoint in the backend or via a gateway that injects `X-API-Key` so that SSE can be used even when API keys are enforced.
- **Pagination UX**:
  - Add full pagination controls with total counts once backend returns total results for `/v1/tasks`.
- **Session awareness**:
  - Display session history or allow user to pick from existing sessions.
- **Advanced metrics**:
  - Historical charts (last 7/30 days) using additional metrics endpoints.
  - Per-status breakdown charts for queue and throughput.
- **Performance**:
  - Infinite scroll for task history.
  - Client-side caching of task details.
- **Accessibility**:
  - Further ARIA roles for modals and focus trapping.
  - Keyboard shortcuts for navigation and actions.

This frontend is designed with SOLID and DRY principles to remain maintainable as the system grows (more agents, more metrics, more task types) while integrating tightly with the existing `agent-orchestrator-api` backend.
