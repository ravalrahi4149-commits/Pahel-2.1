
# ASGIP Frontend Build Plan

Frontend only. React + TypeScript on the existing TanStack Start template, Tailwind v4, Leaflet, Recharts. Backend/AI is out of scope — all data flows through a centralized API service layer with a `VITE_DEMO_MODE` mock adapter so the app runs standalone for the Pahel 2.0 demo and later swaps to the FastAPI backend without code changes.

## 1. Foundations

- **Env**: `VITE_API_BASE_URL`, `VITE_DEMO_MODE` (default `true` for demo).
- **Design tokens** in `src/styles.css` (`@theme`): government-grade palette (deep navy primary, slate neutrals, semantic success/warn/danger, subtle accent), Inter font via `<link>` in `__root.tsx`, consistent radii/shadows. No gradients-heavy look.
- **Shared UI**: shadcn primitives already present; add StatusBadge, PriorityBadge, SLAIndicator, KpiCard, PageHeader, EmptyState, ErrorState, Skeleton wrappers, DataTable (filter/search/sort), Timeline, FileDropzone, Stepper.
- **Auth context** in React (client-only, no Supabase) storing JWT + role in `localStorage`; `_authenticated` layout + role-guard layouts per portal.

## 2. Types (`src/types/`)

`User`, `Role` (`CITIZEN|OFFICER|DEPARTMENT_ADMIN|SUPER_ADMIN`), `Complaint`, `ComplaintStatus`, `ComplaintPriority`, `Department`, `Officer`, `AIAnalysis`, `DuplicateGroup`, `Notification`, `Analytics`, `SLA`, `AuditLog`, `Timeline event`.

## 3. API Service Layer (`src/services/api/`)

Modules: `authApi`, `complaintApi`, `departmentApi`, `officerApi`, `analyticsApi`, `notificationApi`, `aiApi`. Each module exports typed functions and internally delegates to either `httpClient` (axios/fetch wrapper reading `VITE_API_BASE_URL` + bearer token) or `mock/*` implementations when `VITE_DEMO_MODE=true`. Mocks live in `src/services/mock/` with in-memory seed data — clearly isolated, never imported outside the adapter.

## 4. Routing (TanStack file routes under `src/routes/`)

- `/` landing (public)
- `/auth/login`, `/auth/register`, `/auth/forgot`, `/auth/reset`
- `_citizen/` layout → `/citizen/dashboard`, `/complaints`, `/complaints/new`, `/complaints/$id`, `/notifications`, `/profile`
- `_officer/` layout → `/officer/dashboard`, `/complaints`, `/complaints/$id`, `/map`
- `_department/` layout → `/department/dashboard`, `/complaints`, `/analytics`, `/sla`
- `_admin/` layout → `/admin/dashboard`, `/users`, `/departments`, `/analytics`, `/audit-logs`, `/sla-config`

Each portal layout enforces role via `beforeLoad`; unauthorized → `/auth/login` or `/unauthorized`. Every leaf route sets its own `head()`.

## 5. Landing Page

Sections per spec: Hero (dual CTA), Problem, Solution (6 feature cards), How It Works (7-step flow diagram), AI Intelligence live-preview card, Impact metrics (labeled "Prototype Demonstration"), Disclaimer footer.

## 6. Citizen Portal

- Dashboard: KPI cards, recent complaints table, notifications preview.
- Multi-step Submit Complaint (Stepper): Basic → Category (with AI suggestion via `aiApi.suggestCategory`) → Location (Leaflet picker + GPS + address) → Evidence (image upload preview) → Review → success screen with complaint ID + `AIIntelligencePanel`.
- Complaint list + detail page with Timeline component, AI panel, duplicate group card.
- Notifications center, profile.

## 7. Officer Portal

- Dashboard KPIs (assigned, critical, high, overdue, today).
- Priority Queue DataTable with filters (priority/category/status/date/location), search, priority sort.
- Complaint detail with citizen info, evidence gallery, Leaflet map, AI Analysis panel (with disclaimer line), duplicate list, timeline, action buttons (Accept, Assign, Update Status, Add Remarks, Request Info, Escalate, Resolve) — each posts through `complaintApi`.
- Map view: Leaflet with colored priority markers + filters.

## 8. Department Admin Portal

- KPI dashboard + Recharts (category bar, priority donut, monthly trend line, resolution performance).
- SLA Monitoring page: compliance chart, overdue table, escalation alerts, On Track/At Risk/Overdue/Escalated badges.
- Complaints management table.

## 9. Super Admin Portal

- System dashboard (8 KPIs).
- User management (list, search, filter, role edit, activate/deactivate).
- Department management (list, add/edit, officers, analytics).
- SLA Configuration (per-priority resolution time + escalation rules).
- Audit Log table.
- Global analytics.

## 10. Cross-cutting

- **Leaflet**: dynamic import behind `<ClientOnly>` (SSR-safe), OpenStreetMap tiles, heatmap via `leaflet.heat` for hotspots with click-through detail popover.
- **AI Intelligence Panel**: reusable component displaying category, confidence bar, priority, urgency score, reason, recommended department, duplicate probability, similar reports — with mandatory verification disclaimer.
- **States**: every data screen renders loading (skeleton), empty, error+retry, success.
- **Responsive**: grid + `min-w-0` + `shrink-0` patterns; mobile nav drawer for portals; desktop-optimized tables collapse to cards on mobile.
- **No dead buttons**: every action wired to an API method (mock or real).

## Technical Details

- Data fetching via TanStack Query (already installed): `queryOptions` per resource, `ensureQueryData` in loaders, `useSuspenseQuery` in components.
- Form handling via `react-hook-form` + `zod` schemas mirroring backend contract.
- Charts: `recharts` (add).
- Maps: `leaflet` + `react-leaflet` + `leaflet.heat` (add), CSS via `<link>` in root head.
- HTTP client: thin `fetch` wrapper with interceptor for JWT + 401 redirect.
- Mock mode seeds ~30 complaints, 5 departments, 8 officers, 3 citizens across roles for a convincing live demo.

## Out of Scope

FastAPI backend, PostgreSQL, AI model code, real auth server — the frontend is fully decoupled and consumes the documented REST contract. Real backend swap requires only setting `VITE_DEMO_MODE=false` and `VITE_API_BASE_URL`.

Confirm and I'll build it.
