# Agent Orchestrator Dashboard

Frontend dashboard for a **Peer Agent–driven task routing system** (ContentAgent + CodeAgent).

This project implements the **“Frontend Technical Test – Agent Task Management Panel”** using:

- **Vue 3 + Composition API + TypeScript**
- **Pinia** for state management
- **Axios** with interceptors
- **Tailwind CSS** for styling
- **Chart.js + vue-chartjs** for charts
- **Vitest** for tests  
- **Docker + Nginx** for production build

The application connects to the backend **Agentic API** (Peer Agent / CodeAgent / ContentAgent) and provides:

- A **Task Execution page** with queue-aware real-time updates
- A **Task History page** with filters and detail modal
- A **System Monitor page** with metrics, charts, and health

---

## Table of Contents

1. [Goals and Test Requirements](#goals-and-test-requirements)  
2. [High-Level Features](#high-level-features)  
3. [Screens and User Flows](#screens-and-user-flows)  
   - [Task Execution Page](#task-execution-page)  
   - [Task History Page](#task-history-page)  
   - [System Monitor Page](#system-monitor-page)  
4. [Architecture and Tech Stack](#architecture-and-tech-stack)  
5. [State Management (Pinia)](#state-management-pinia)  
6. [API Integration and Queue Handling](#api-integration-and-queue-handling)  
7. [UI / UX and Component Architecture](#ui--ux-and-component-architecture)  
8. [Environment Setup](#environment-setup)  
9. [Running the Project Locally](#running-the-project-locally)  
10. [Testing and Quality](#testing-and-quality)  
11. [Build and Deployment](#build-and-deployment)  
12. [How Requirements Are Met](#how-requirements-are-met)  
13. [Bonus Features](#bonus-features)  
14. [Future Improvements](#future-improvements)  

---

## Goals and Test Requirements

This dashboard is built to satisfy (and extend) the test specification:

> “🧪 Frontend Teknik Test – Agent Görev Yönetim Paneli”

The main goals are:

- Implement a **small, production-ready admin panel** for the backend Agentic API.
- Show how the **queue and async task lifecycle** work from a frontend perspective.
- Use **Vue 3 Composition API** in a clean, modular way.
- Demonstrate **state management, error handling, logging, and API integration**.
- Provide a **clear architecture** and **good UX** so the system is easy to understand and extend.

---

## High-Level Features

- **Task Execution**
  - Submit a natural language task to `POST /v1/agent/execute`.
  - Show **Task ID**, **selected agent (ContentAgent / CodeAgent)**, **status timeline**, and **result**.
  - Track task status from **queued → processing → completed/failed**.
  - Show human-readable **logs** derived from backend `agent_runs`.

- **Task History**
  - List historical tasks from `GET /v1/tasks`.
  - Filter by **agent type** and **status**.
  - Free-text search on summary / ID.
  - “View” button opens a **detail modal** with full metadata, result, and logs.

- **System Monitor**
  - Shows **queue depth**, **today’s processed tasks**, **agent usage percentages**, and **per-day volume**.
  - **Chart.js** bar chart: last 5 days of task volume.
  - **Chart.js** doughnut: agent distribution (Content vs Code vs Other).
  - Health section (API, Mongo, Redis, LLM provider) backed by `/v1/system/metrics` and `/health`.

- **Global UX**
  - **Sidebar navigation**: Execute / History / Monitor.
  - **Dark/Light theme toggle**, persisted in `localStorage`.
  - Toast notifications for errors / info.
  - Responsive layout (desktop side navigation, mobile-friendly main area).

---

## Screens and User Flows

### Task Execution Page

File: `src/pages/TaskExecutionPage.vue`  
Key components:
- `TaskInputCard.vue`
- `TaskResultCard.vue`
- `TaskLogsCard.vue`
- `TaskStatusTimeline.vue`

**User flow**

1. User types a task into the **textarea** in `TaskInputCard`:
   - Example:  
     `"Write a blog post about AI"`  
     or  
     `"Generate a TypeScript function to validate email addresses"`

2. When the user clicks **“Execute Task”**:
   - `TaskExecutionPage.execute()` calls `useTaskStore().executeTask(taskText, sessionId?)`.
   - The store:
     - Trims the text, validates it is not empty.
     - Calls `agentApi.executeTask` → `POST /v1/agent/execute` with:

       ```json
       {
         "task": "…",
         "session_id": null | "existing-session-id"
       }
       ```

     - Stores `currentTaskId`.
     - Immediately fetches full details from `GET /v1/tasks/{task_id}`.
     - Starts **real-time tracking** of the task via `startTaskTracking`.

3. Real-time queue status:
   - `useSseOrPolling` (see below) listens to `/v1/tasks/{task_id}/events` (**SSE**) if possible.
   - If SSE fails, it automatically falls back to **polling** `GET /v1/tasks/{task_id}` every 2.5s.
   - The UI updates:
     - **TaskStatusTimeline** animates the steps:
       - `queued` → `processing` → `completed`  
       - If task fails, last step shows a red **X** for “Failed”.
     - `TaskResultCard` shows:
       - Task ID
       - Selected agent (`selected_agent` from backend)
       - Peer routing reason (`peer_routing_reason`)
       - Result rendered as Markdown + highlighted code
       - Any `citations` as a reference list
       - Error banner if status is `failed`.

4. Logs:
   - `TaskLogsCard` shows a simple log view based on `buildTaskLogs(TaskDetail)`:
     - When the task was queued
     - When the Peer Agent routed it to a specific agent
     - When execution started
     - When it completed or failed
   - Times are shown in `HH:mm:ss` format (`formatTime`).

This page fulfills the **Task Execution** and **Queue visualization** requirements.

---

### Task History Page

File: `src/pages/TaskHistoryPage.vue`  
Key components:
- `TaskHistoryTable.vue`
- `EmptyStateCard.vue`
- `TaskDetailModal.vue`
- `BaseInput.vue`, `ToggleSwitch.vue`

**User flow**

1. On mount, the page calls `applyFilters()`:
   - Uses `useTaskStore().loadHistory()` with current filters.
   - `loadHistory()` calls `tasksApi.listTasks` → `GET /v1/tasks`.

2. Filters:
   - **Agent type filter**:
     - Dropdown: `All Agents / ContentAgent / CodeAgent`.
     - Maps to `agent_type` query param: `content | code`.
   - **Status filter**:
     - Dropdown: `All / queued / processing / completed / failed`.
   - **Search**:
     - Free text using `BaseInput`.
     - Stored in `filters.search` and applied on the client side to the loaded list
       (matching `summary` or `task_id` in lowercase).

3. Display:
   - When there are tasks:
     - `TaskHistoryTable` shows:
       - **Task Summary** (fallback to `No summary yet`)
       - **Agent Type / Selected Agent** (colored badge)
       - **Created At** (`formatDateTime`)
       - **Status** (`StatusBadge`)
       - **View** button
   - When there are no tasks:
     - `EmptyStateCard` shows a friendly “No tasks yet” state.

4. Detail view:
   - Clicking **“View”**:
     - Calls `uiStore.openTaskDetailModal(taskId)`.
     - `TaskDetailModal`:
       - On mount, loads **full TaskDetail** via `useTaskStore().fetchTaskDetail(taskId)` (if needed).
       - Shows:
         - Task ID
         - Full task input
         - Selected agent as pill
         - **TaskStatusTimeline**
         - Output (Markdown)
         - Logs (same logic as Task Logs card)
       - Can be closed via the top-right **X**.

This page covers the **Task History** requirements, including agent filter, status filter, and detail view in a modal.

---

### System Monitor Page

File: `src/pages/SystemMonitorPage.vue`  
Key components:
- `SystemMetricsGrid.vue`
- `SystemChartsPanel.vue`
- `HealthStatusRow.vue`
- `ToggleSwitch.vue`

**User flow**

1. On mount:
   - Calls `metricsStore.fetchMetrics()` which:
     - `metricsApi.getSystemMetrics()` → `GET /v1/system/metrics`
     - `metricsApi.getHealthRaw()` → `GET /health` (text)
   - Starts auto-refresh every 15 seconds: `metricsStore.startAutoRefresh(15000)`.

2. Metrics grid (`SystemMetricsGrid`):
   - Uses `SystemMetrics` from the backend:
     - `pending_tasks` → **Queued Tasks**
     - `total_tasks` (today) → **Today’s Processed**
     - `all_time.tasks_per_agent`:
       - Converted to **percentage usage** of ContentAgent and CodeAgent.
     - `tasks_per_agent` (today):
       - Used in helper text: “x tasks today”.
   - Each metric shows a **MetricCard** with an icon and helper text.

3. Charts (`SystemChartsPanel`):
   - **Bar chart** (last 5 days):
     - Uses `last_5_days: SystemMetricsDaySnapshot[]`.
     - X-axis: formatted date (e.g., `Nov 05`).
     - Y-axis: `total_tasks`.
   - **Doughnut chart** (agent distribution):
     - Uses `all_time.tasks_per_agent`.
     - Breaks down to `ContentAgent`, `CodeAgent`, `Other`.
     - Summary text includes percentages.

4. System health (`HealthStatusRow`):
   - Uses `metrics.api_health` keys:
     - `mongo`
     - `redis`
     - `llm_provider`
   - Each row shows **green** (up) or **red** (down), with a short description.
   - Overall API health label uses `healthText` from `/health`.

This page satisfies the **System Monitor** requirement with queue size, daily tasks, agent distribution, and health check.

---

## Architecture and Tech Stack

### Core Technologies

- **Vue 3** with **Composition API** and `<script setup>`
- **TypeScript** (strict mode)
- **Vite** as bundler
- **Pinia** for centralized state
- **Vue Router** for navigation
- **Axios** for HTTP
- **Tailwind CSS** for styling (with `@tailwindcss/typography`)

### Charts

- **Chart.js v4** + **vue-chartjs v5**
- Used for:
  - Daily task volume bar chart
  - Agent distribution doughnut chart

### Markdown and Code Rendering

- **marked**: Markdown parsing
- **highlight.js**: syntax highlighting (GitHub theme)
- **DOMPurify**: sanitization for safe HTML output

### Testing & Tooling

- **Vitest**: unit tests
- **@vue/test-utils**: Vue component testing
- **ESLint v9** flat config with Vue + TS + Tailwind plugins
- **Prettier**: formatting

### Folder Structure

```text
src/
  api/
    agentApi.ts        # POST /v1/agent/execute
    tasksApi.ts        # GET /v1/tasks, GET /v1/tasks/:id
    metricsApi.ts      # GET /v1/system/metrics, GET /health
    httpClient.ts      # Axios instance + interceptors

  components/
    atoms/             # Small reusable controls (Buttons, Inputs, Icons)
    molecules/         # Combined atoms (PageHeader, MetricCard, etc.)
    organisms/         # Higher-level blocks (TaskInputCard, tables, modals)
  
  composables/
    useSseOrPolling.ts # SSE + polling abstraction for task status
    usePolling.ts      # Generic polling helper
    useErrorHandler.ts # Shared error handling + toaster
    useTheme.ts        # Theme resolution + localStorage + HTML class

  config/
    env.ts             # Reads VITE_* env vars and defines appConfig

  pages/
    TaskExecutionPage.vue
    TaskHistoryPage.vue
    SystemMonitorPage.vue

  router/
    index.ts           # Routes and DefaultLayout

  store/
    useTaskStore.ts    # Tasks state + filters + tracking
    useMetricsStore.ts # System metrics + auto-refresh
    useUiStore.ts      # Theme + modal + toasts

  styles/
    tailwind.css       # Tailwind imports
    globals.css        # Global “card” styles, base box sizing

  types/
    domain.ts          # Task, metrics, events, etc. (mirrors backend models)
    api.ts             # ApiError type

  utils/
    taskHelpers.ts     # Date formatting, log building
    metricsHelpers.ts  # Agent breakdown and chart series helpers
````

---

## State Management (Pinia)

The test allows Pinia or a custom composable store. This project uses **Pinia** because:

* It gives **clear, centralized state** (tasks, metrics, UI).
* Works well with **TypeScript** and **Composition API**.
* Integrates nicely with **DevTools** (time travel, state inspection).
* Keeps domain logic (filters, tracking, derived data) near the data itself.

### Main Stores

#### `useTaskStore`

Responsibilities:

* Manage current task and history:

  * `currentTaskId`, `currentTask: TaskDetail | null`
  * `history: TaskSummary[]`
  * `filters: { status?, agent_type?, search? }`
* Manage loading state, polling state, and errors.
* Orchestrate **task execution** and **real-time tracking**.

Key actions:

* `executeTask(taskText: string, sessionId?: string)`

  * Validates input.
  * `POST /v1/agent/execute`.
  * Fetches `TaskDetail`.
  * Starts SSE/polling tracking.

* `fetchTaskDetail(taskId: string)`

  * `GET /v1/tasks/{task_id}`.

* `startTaskTracking(taskId: string)` / `stopTaskTracking()`

  * Uses `useSseOrPolling`.

* `loadHistory()`

  * `GET /v1/tasks` using `filters.status` and `filters.agent_type`.

* Filter setters:

  * `setStatusFilter(status?)`
  * `setAgentTypeFilter(agentType?)`
  * `setSearchFilter(search: string)`

Derived data:

* `currentTaskLogs`

  * Built from `TaskDetail` + `agent_runs` via `buildTaskLogs`.
* `history`

  * Base list from API, then filtered by `filters.search` on the client.

#### `useMetricsStore`

Responsibilities:

* `metrics: SystemMetrics | null`
* `healthText: string | null`
* `autoRefresh` toggle and interval ID
* `loading` and `error`

Key actions:

* `fetchMetrics()`

  * `GET /v1/system/metrics` + `GET /health`.
* `startAutoRefresh(intervalMs)`
* `stopAutoRefresh()`

#### `useUiStore`

Responsibilities:

* `theme: 'light' | 'dark'`
* Task detail modal state:

  * `isTaskDetailModalOpen`
  * `selectedTaskIdForModal`
* Toast messages:

  * `toasts[]` with auto-dismiss.

---

## API Integration and Queue Handling

### Environment Configuration

`.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=test-api-key-1
VITE_APP_NAME=Agent Orchestrator Dashboard
VITE_ENVIRONMENT=local
FRONTEND_HTTP_PORT=5173
```

* `VITE_API_BASE_URL` – Backend base URL.
* `VITE_API_KEY` – API key sent as `X-API-Key` header for all Axios calls.
* `VITE_APP_NAME` – Display name for the app.
* `VITE_ENVIRONMENT` – Controls debug logging (`local`, `development`, etc.).
* `FRONTEND_HTTP_PORT` – Frontend port when running via Docker Compose.

`src/config/env.ts` exposes this as:

```ts
export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiKey: import.meta.env.VITE_API_KEY || '',
  appName: import.meta.env.VITE_APP_NAME || 'Agent Orchestrator Dashboard',
  environment: import.meta.env.VITE_ENVIRONMENT || 'local'
};
```

### Axios Client and Interceptors

File: `src/api/httpClient.ts`

* `baseURL` from `appConfig.apiBaseUrl`.

* **Request interceptor**:

  * Ensures `Content-Type: application/json`.
  * Injects `X-API-Key` from `appConfig.apiKey` if not present.
  * Adds `X-Request-Id` (UUID) per request.
  * Logs basic request info when `isLocalEnv` is true.

* **Response interceptor**:

  * Normalizes backend error envelope:

    ```json
    {
      "error": {
        "code": "HTTP_ERROR",
        "message": "Missing API key."
      }
    }
    ```

    into a typed `ApiError` class.

  * Distinguishes:

    * `HTTP_ERROR`
    * `NETWORK_ERROR`
    * `UNKNOWN_ERROR`

  * In local env, logs full error details.

### Endpoints Used

* **Execute task**

  * `POST /v1/agent/execute` → `ExecuteTaskResponse`
* **List tasks**

  * `GET /v1/tasks`
  * Query params:

    * `status` (optional)
    * `agent_type` (`content | code`, optional)
    * `page`, `page_size` (for future extension)
* **Task detail**

  * `GET /v1/tasks/{task_id}`
* **Task events (SSE)**

  * `GET /v1/tasks/{task_id}/events`
* **System metrics**

  * `GET /v1/system/metrics`
* **Health**

  * `GET /health`

### Real-Time Queue Tracking: SSE + Polling

File: `src/composables/useSseOrPolling.ts`

* Input:

  * `taskId`
  * `onStatusEvent` (handles SSE messages)
  * `onPollingTick` (HTTP fallback refresh)
  * `pollingIntervalMs` (default 2500ms)
  * `onModeChange` callback

**Behaviour:**

1. Attempts to create:

   ```ts
   const sseUrl = `${apiBaseUrl}/v1/tasks/${taskId}/events`;
   eventSource = new EventSource(sseUrl);
   ```

2. On `onmessage`:

   * Parses `TaskStatusEvent` JSON.
   * Filters out events for other tasks.
   * Calls `onStatusEvent(data)` which fetches updated `TaskDetail` and checks status.

3. On `onerror` or initialization failure:

   * Closes the SSE connection.
   * Switches to **polling** mode:

     * `usePolling` runs `onPollingTick` every `pollingIntervalMs`.
     * Each tick refetches `TaskDetail`.
     * Stops when status is `completed` or `failed`.

> Note: Native `EventSource` in browsers does **not allow custom headers**, so if the backend requires `X-API-Key` for SSE, SSE may return `401`.
> In this case, the composable automatically falls back to **HTTP polling**, so the queue behavior is still correctly represented.
> In production, an SSE proxy (e.g., Nginx or BFF) can be used to inject headers on the server side.

---

## UI / UX and Component Architecture

### Design

* Layout and style inspired by the provided **Figma design**:

  * Sidebar with navigation and theme toggle.
  * Card-based content area.
  * Clean typography and subtle elevations.
* Tailwind CSS is used with a small set of custom tokens:

  * `pa-bg` (dashboard background)
  * `pa-blue` (primary blue)
  * `shadow-card`, `rounded-2xl` for cards

Global styles (`src/styles/globals.css`):

* Box sizing reset.
* `card` and `card-inner` utility classes using Tailwind `@apply`.

### Atomic Component Layers

* **Atoms (`src/components/atoms`)**

  * `BaseButton` – primary/secondary/ghost button variants with icon and loading states.
  * `BaseInput` – rounded input for search/filter.
  * `BaseTextarea` – main task editor field.
  * `Icon` – inline SVG icon set.
  * `BadgePill` – agent-type badges (content/code/neutral).
  * `StatusBadge` – task status label (queued/processing/completed/failed).
  * `ToggleSwitch` – used for Auto-refresh and theme toggle.
  * `LoaderSpinner` – spinner used across pages.

* **Molecules (`src/components/molecules`)**

  * `PageHeader` – title + subtitle per page.
  * `MetricCard` – metrics with icon + helper.
  * `MarkdownRenderer` – safe Markdown + code rendering.
  * `TaskStatusTimeline` – visual queue/progress indicator.
  * `HealthStatusRow` – a single health line (API/Mongo/Redis/LLM).

* **Organisms (`src/components/organisms`)**

  * `DefaultLayout` – main layout with sidebar and router outlet.
  * `SidebarNav` – navigation + theme toggle.
  * `ToastContainer` – global toast list.
  * `TaskInputCard` – textarea + execute button.
  * `TaskResultCard` – current task header + output + error/citations.
  * `TaskLogsCard` – logs list.
  * `TaskHistoryTable` – history list with action column.
  * `EmptyStateCard` – shown when no tasks exist.
  * `TaskDetailModal` – modal with full task details + logs.
  * `SystemMetricsGrid` – top metrics cards.
  * `SystemChartsPanel` – charts for volume and distribution.

### Theme Support (Light / Dark)

* Tailwind configured with `darkMode: 'class'`.
* `useTheme` composable:

  * Resolves initial theme from:

    * `localStorage['pa-theme']`
    * Or `prefers-color-scheme: dark`
  * Applies class `dark` on `<html>`.
* `SidebarNav` shows theme status (Sun/Moon icon) and includes `ToggleSwitch` to change it.
* Theme is persisted across reloads.

---

## Environment Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd agent-orchestrator-dashboard
   ```

2. Create `.env` from example:

   ```bash
   cp .env.example .env
   ```

3. Adjust values if needed:

   ```env
   VITE_API_BASE_URL=http://localhost:8000    # or your backend URL
   VITE_API_KEY=test-api-key-1                # must match backend API key
   VITE_APP_NAME=Agent Orchestrator Dashboard
   VITE_ENVIRONMENT=local
   FRONTEND_HTTP_PORT=5173
   ```

4. Make sure the backend API is running and reachable at `VITE_API_BASE_URL`.

---

## Running the Project Locally

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

* Default URL: `http://localhost:5173`

### Lint

```bash
npm run lint
```

* ESLint is configured via:

  * `eslint.config.mjs` (flat config for ESLint 9+)
  * Vue 3 + TypeScript rules
  * Tailwind CSS plugin
  * Prettier integration (`skip-formatting`)

---

## Testing and Quality

### Unit Tests

Run all tests:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

Configuration:

* `vite.config.ts`:

  * Uses `jsdom` test environment.
  * `tests/setupTests.ts` for global Vue Test Utils config.

Current tests:

1. **`tests/unit/TaskExecutionPage.spec.ts`**

   * Mocks `agentApi.executeTask` and `tasksApi.getTaskDetail`.
   * Mounts `TaskExecutionPage` with Pinia.
   * Simulates:

     * Typing into the textarea
     * Clicking “Execute Task”
   * Checks that the value is correctly bound and that the flow runs with mocked APIs.

2. **`tests/unit/useTaskStore.spec.ts`**

   * Mocks `agentApi` and `tasksApi`.
   * Verifies:

     * `executeTask` calls APIs, sets `currentTaskId`, and updates `currentTask`.
     * `loadHistory` populates task history from `listTasks`.

These tests are focused on the **core flows** required by the assignment: executing tasks and loading history.

You can extend them to:

* Cover `SystemMonitorPage` logic and metrics store.
* Test `useSseOrPolling` behavior in isolation.
* Test UI filters in `TaskHistoryPage`.

---

## Build and Deployment

### Build

```bash
npm run build
```

This produces a production build in `dist/`.

### Preview (local)

```bash
npm run preview
```

### Docker

The project includes a production-ready Docker setup:

* `Dockerfile` – Multi-stage build:

  1. **Build stage** (`node:22-alpine`)

     * Installs dependencies (using `npm ci` when `package-lock.json` exists).
     * Runs `npm run build`.
  2. **Runtime stage** (`nginx:1.27-alpine`)

     * Copies `dist` to `/usr/share/nginx/html`.
     * Uses `docker/nginx.conf` as Nginx config.

* `docker-compose.yml`:

  ```yaml
  services:
    frontend:
      build: .
      container_name: agent-orchestrator-dashboard
      ports:
        - '${FRONTEND_HTTP_PORT:-80}:80'
      restart: unless-stopped
  ```

**Important:**
Vite `VITE_*` variables are baked at build time.
Make sure `.env` is present (or baked into the image) before `docker build`.

### CI (GitHub Actions)

Workflow: `.github/workflows/ci-frontend.yml`

On push to `main`:

1. Checkout code
2. Setup Node (v22)
3. `npm ci`
4. `npm run test`
5. `npm run build`
6. If on `main`:

   * SSH into EC2
   * Pull latest `origin/main`
   * Optionally show `.env` (non-sensitive keys only)
   * `docker compose down`
   * `docker compose up -d --build`
   * Show running containers

This demonstrates a **full CI pipeline**: test → build → containerized deploy.

---

## How Requirements Are Met

Below is a direct mapping to the test criteria.

### 1. Task Execution Page

* **Task input via textarea**

  * `TaskInputCard` uses `BaseTextarea` to capture `task` text.

* **POST /v1/agent/execute**

  * `agentApi.executeTask()` sends `{ task, session_id }` as JSON.
  * Called from `useTaskStore.executeTask()`.

* **Show result**

  * `TaskResultCard` displays:

    * Task ID
    * Selected agent
    * Peer routing reason
    * Output (Markdown with highlight.js)
    * Error message if status is failed.

* **Show queue status (queued → processing → completed)**

  * `TaskStatusTimeline` visualizes each step.
  * Failure is shown with a red “failed” state on the last step.

* **Show logs**

  * `TaskLogsCard` + `buildTaskLogs` combine `agent_runs` into a readable timeline.

* **Real-time status**

  * `useSseOrPolling` composable:

    * Tries **SSE** first.
    * Falls back to polling when SSE is unavailable or fails.
  * Store stops tracking once status is `completed` or `failed`.

### 2. Task History Page

* **List task logs from backend**

  * `useTaskStore.loadHistory()` → `GET /v1/tasks`.

* **Display fields**

  * `TaskHistoryTable` shows:

    * Task summary
    * Agent type / selected agent
    * Created time
    * Status
    * Actions (View).

* **Detail view via modal**

  * `TaskDetailModal` fetches and shows full `TaskDetail` with logs.

* **Filtering (bonus)**

  * Agent type filter (All, ContentAgent, CodeAgent).
  * Status filter (All, queued, processing, completed, failed).
  * Text search on summary / ID.

### 3. System Monitor Page

* **Queue count**

  * `metrics.pending_tasks` displayed as **Queued Tasks**.

* **Daily tasks count**

  * `metrics.total_tasks` is **Today’s Processed**.
  * `metrics.last_5_days` used in **Daily Task Volume** bar chart.

* **Agent distribution**

  * `metrics.all_time.tasks_per_agent` used to compute:

    * ContentAgent vs CodeAgent vs Other counts and percentages.
  * Displayed in both metric cards and doughnut chart.

* **API health check**

  * `/v1/system/metrics.api_health` + `/health`:

    * Visualized via `HealthStatusRow` entries for API, Mongo, Redis, LLM provider.

### 4. Technical Requirements

* **Vue 3 + Composition API**

  * All major files use `<script setup>` and `ref`, `reactive`, `computed`, `watch`, `onMounted`.

* **State management**

  * **Pinia** stores (`useTaskStore`, `useMetricsStore`, `useUiStore`).
  * Explanation for using Pinia included above.

* **API structure**

  * Centralized Axios client with interceptors.
  * Env-based base URL and API key.
  * Clear separation of concerns: `agentApi`, `tasksApi`, `metricsApi`.

* **Error handling**

  * `ApiError` central class.
  * `useErrorHandler` maps errors to user toast messages.
  * Pages show inline error banners when needed.

* **Component architecture**

  * Atomic design: atoms / molecules / organisms / pages.
  * Reusable components (buttons, inputs, badges, timeline, cards).

* **Design**

  * Tailwind-based styling in line with Figma.
  * Clean typography, spacing, and consistent card usage.
  * Dark/Light theme support (bonus).

* **Tests**

  * Basic but meaningful tests using Vitest and Vue Test Utils.
  * At least one test for composable/store and one for a key page (as requested).

---

## Bonus Features

This section highlights features that go beyond the minimal requirements and align with the test’s bonus points.

1. **Real-Time Queue via SSE + Polling**

   * Custom composable `useSseOrPolling`:

     * Tries browser-native **EventSource**.
     * On failure (e.g., due to API key restrictions), automatically falls back to **HTTP polling**.
   * Provides a robust real-time experience even when SSE headers cannot be customized.

2. **Dark / Light Theme**

   * Theme toggle in `SidebarNav` using `ToggleSwitch`.
   * `useTheme` composable:

     * Persists theme in `localStorage`.
     * Applies `dark` class on `<html>` (Tailwind `darkMode: 'class'`).
   * All components styled to work correctly in both themes.

3. **System Metrics Dashboard with Charts**

   * `SystemMetricsGrid` and `SystemChartsPanel`:

     * Chart.js bar chart for daily tasks.
     * Chart.js doughnut for agent distribution.
   * Color scheme adapts to light/dark mode.

4. **Typed Domain Models**

   * `src/types/domain.ts` closely matches backend models:

     * `TaskDetail`, `TaskSummary`, `SystemMetrics`, `TaskStatusEvent`, etc.
   * Improves safety and clarity of API integration.

5. **Queue Timeline and Derived Logs**

   * `TaskStatusTimeline` provides a visual representation of queue progression.
   * `buildTaskLogs` converts raw `agent_runs` to user-friendly log entries:

     * “Task received and queued”
     * “Routed to ContentAgent”
     * “Processing started”
     * “Task completed successfully” or failure message.

6. **Global Toast Notifications**

   * `useUiStore` + `ToastContainer`:

     * Centralized UI for inline notifications.
     * Used by `useErrorHandler` to surface backend errors.

7. **CI Pipeline + Docker Deployment**

   * GitHub Actions workflow:

     * Runs tests and build on push to `main`.
     * Deploys to EC2 using Docker Compose.
   * Demonstrates a realistic CI/CD pipeline.

8. **Strict Linting and Formatting**

   * ESLint with TypeScript, Vue 3, Tailwind, and Prettier integration.
   * `npm run lint` fails on warnings for a stricter codebase.

9. **TypeScript Strict Settings**

   * `tsconfig.json` and `tsconfig.app.json` use strict type checking and modern module settings.

---

## Future Improvements

If this were to evolve beyond the test, good next steps would be:

* **Pagination for Task History**

  * Use backend pagination metadata to implement full pagination controls instead of only client-side filtering.

* **More Tests**

  * Add tests for:

    * `SystemMonitorPage` and `useMetricsStore`.
    * `TaskHistoryPage` filters.
    * `useSseOrPolling` under different scenarios.

* **Accessibility Enhancements**

  * Add ARIA attributes for modals and focus trapping.
  * Improve keyboard navigation.

* **Advanced Metrics**

  * Add more charts (e.g., per-status breakdown, long-term trends).
  * Show more queue statistics (average wait time, p95 latency by agent).

---

This README is designed to give a reviewer a complete, clear picture of:

* How the app works from a user’s perspective,
* How it satisfies the test requirements,
* How the architecture is structured, and
* How to run, test, and deploy the project.
