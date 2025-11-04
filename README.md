<!--
Tip: Add a logo at /public/logo.svg and uncomment below for stronger branding.

<p align="center">
  <img src="public/logo.svg" width="120" alt="InsightEdge" />
</p>
-->

<h1 align="center">InsightEdge</h1>

<p align="center">
  <strong>Composable, type‑safe analytics & dashboarding for modern web apps.</strong>
</p>

<p align="center">
  <a href="https://insightedge-bid.vercel.app"><img alt="Live Demo" src="https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge" /></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white&style=for-the-badge" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&style=for-the-badge" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white&style=for-the-badge" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#why-insightedge">Why?</a> •
  <a href="#features">Features</a> •
  <a href="#architecture-conceptual">Architecture</a> •
  <a href="#widgets">Widgets</a> •
  <a href="#roadmap-indicative">Roadmap</a> •
  <a href="#contributing">Contribute</a>
</p>

---

## 🌟 At a Glance

| Goal | How It Helps |
|------|--------------|
| Build dashboards fast | Register widgets + compose layouts |
| Keep code maintainable | Strict TypeScript + clear layering |
| Avoid vendor lock‑in | Pluggable data & chart adapters |
| Scale features incrementally | Start simple → add auth, streaming, multi-tenant |
| Ship confidently | Validation & performance minded design |

> Designed for product teams that want “BI-like insight” without dragging in an entire monolithic platform.

---

## 🚀 Quick Start

```bash
git clone https://github.com/Barath1018/studio
cd studio
pnpm install
cp .env.example .env.local  # if the example file exists
pnpm dev
# → http://localhost:3000
```

Minimal env (adjust as needed):

```dotenv
NEXT_PUBLIC_APP_NAME=InsightEdge Studio
NEXT_PUBLIC_API_BASE=https://api.example.com
AUTH_SECRET=CHANGE_ME
NEXTAUTH_URL=http://localhost:3000
```

---

## 💡 Why InsightEdge?

| Problem | Typical Pain | This Project’s Approach |
|---------|--------------|--------------------------|
| Ad-hoc dashboards | Spaghetti components | Formal widget contract |
| Inconsistent data handling | Unvalidated responses | Schema validation layer (Zod-ready) |
| Bloated bundles | Heavy chart libs everywhere | Lazy + dynamic imports |
| Hard to theme | Inline styling drift | Central tokens + dark/light |
| Hard to extend | Implicit coupling | Explicit registry + adapters |

---

## ✨ Features

| Category | Highlights |
|----------|------------|
| Dashboard Composition | Configurable / persistent layouts |
| Widgets System | Registry + typed config + optional fetchers |
| Data Adapters | Normalized, cache-aware, schema-validated |
| Visualizations | Bring your own chart library (Recharts / ECharts / D3) |
| Theming | Dark/light mode, utility-first tokens |
| Performance | SSR / ISR / dynamic imports / bundle trimming |
| Extensibility | Hooks, adapters, pluggable widget metadata |
| Dev Experience | pnpm, TypeScript strict, lint & format scripts |

---

## 🧱 Project Structure (Overview)

```bash
.
├─ app/                # Next.js (App Router) entry points
│  ├─ dashboard/       # Dashboard routes
│  └─ api/             # Route handlers / edge/server endpoints
├─ src/
│  ├─ widgets/         # Widget implementations + registry
│  ├─ components/      # UI primitives & composite parts
│  ├─ data/            # Fetchers, adapters, schemas
│  ├─ hooks/           # Reusable React hooks
│  ├─ lib/             # Formatting, helpers, utilities
│  ├─ config/          # Constants & runtime configuration
│  ├─ styles/          # Tailwind & global styles
│  └─ types/           # Shared TypeScript types
└─ public/             # Static assets (images, docs, icons)
```

> If your repo diverges, update this section for clarity.

---

## 🧩 Widgets

A widget = metadata + (optional) fetcher + render component.

```ts
// types/widgets.ts
export interface DashboardWidgetProps<TConfig = unknown, TData = unknown> {
  id: string;
  title: string;
  config: TConfig;
  data?: TData;
  loading?: boolean;
  error?: Error | null;
}

export interface RegisteredWidget<TConfig = any> {
  type: string;
  displayName: string;
  icon?: React.ComponentType;
  fetcher?: (config: TConfig) => Promise<unknown>;
  Component: React.ComponentType<DashboardWidgetProps<TConfig>>;
}
```

Register:

```ts
registerWidget({
  type: 'line-chart',
  displayName: 'Line Chart',
  fetcher: fetchTimeSeries,
  Component: LineChartWidget,
});
```

Add a fetcher with validation:

```ts
import { z } from 'zod';

const Point = z.object({ t: z.string(), value: z.number() });
const Series = z.array(Point);

export async function fetchTimeSeries(cfg: { metric: string }) {
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/metrics/${cfg.metric}`);
  if (!r.ok) throw new Error('Metric fetch failed');
  return Series.parse(await r.json());
}
```

---

## 🏗 Architecture (Conceptual)

```
Presentation (routes / layouts / server components)
    ↓
Widgets Layer (registry, config, rendering)
    ↓
Data Access (fetchers, adapters, validation, caching)
    ↓
Integration Boundary (REST / GraphQL / Streaming / Proxies)
```

Flow Example:
1. Dashboard route loads
2. Widget registry describes required data
3. Fetchers run (server or client)
4. Responses validated + cached
5. UI renders with graceful loading / error states
6. Optional streaming updates patch state

---

## ⚙️ Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| NEXT_PUBLIC_APP_NAME | Public | Display name in UI |
| NEXT_PUBLIC_API_BASE | Public | Base URL for data calls |
| AUTH_SECRET | Server | Session / token signing |
| NEXTAUTH_URL | Server | Auth callback base |
| SENTRY_DSN | Server | Error tracing (optional) |
| LOG_LEVEL | Server | Logging verbosity |

> Keep secrets out of Git history. Use Vercel / GitHub secrets.

---

## 🧪 Quality & Performance

| Area | Strategy |
|------|----------|
| Type Safety | Strict TS, narrow return types |
| Validation | Zod (or similar) at all external boundaries |
| Linting | ESLint + Prettier |
| Bundles | Dynamic import heavy charts + code splitting |
| Rendering | Server components for data-first pages |
| Caching | SWR or custom layered caching |
| Monitoring | Add Sentry / metrics exporters (optional) |

Performance checklist:

- [ ] Dynamic import large libs (`import('...')`)
- [ ] Avoid duplicate fetches (stable cache keys)
- [ ] Use `React.memo` where pure
- [ ] Eliminate unnecessary client JS in static routes
- [ ] Lighthouse pass (Perf / Accessibility)

---

## 🗺 Roadmap (Indicative)

| Milestone | Description | Status |
|-----------|-------------|--------|
| M1 | Core layout + widget registry | 🔄 In Progress |
| M2 | User auth + personalized layouts | ⏳ Planned |
| M3 | Real-time (WebSockets/SSE) | ⏳ Planned |
| M4 | Export / share dashboards | ⏳ Planned |
| M5 | Multi-tenant + RBAC | ⏳ Planned |
| M6 | Plugin manifest (3rd-party widgets) | 💡 Exploring |

Task Backlog:

- [ ] Add CONTRIBUTING.md / CODE_OF_CONDUCT.md
- [ ] Add test scaffold (Vitest + Testing Library)
- [ ] Introduce visual regression (Playwright / Storybook)
- [ ] Documentation: theming & tokens
- [ ] Add CI status badge (real workflow)
- [ ] Provide example dataset seeding script

---

## 🔐 Security Notes

| Topic | Note |
|-------|------|
| Secrets | Store only in deployment provider secrets vault |
| Input | Always validate API returns & user config |
| Auth | Centralize middleware & session logic |
| Rate Limiting | Add API middleware (e.g. sliding window) |
| Headers | Configure security headers via `next.config.js` |
| Dependencies | Dependabot / audit in CI |

Add a `SECURITY.md` for coordinated disclosure.

---

## 🔑 Enable Gemini AI (Optional)

To power AI Q&A and auto-map chart topics from your uploaded file using Google Gemini:

1. Create a `.env.local` in the repo root and add:

```dotenv
GOOGLE_AI_API_KEY=your_api_key_here
# Optional (defaults to gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash
```

2. Restart the dev server.

What you get:
- AI Insights tab will answer questions using Gemini with your dataset as context (cap applied for safety).
- After file upload, the app calls AI to infer best-fit columns (revenue/expenses/profit/date) and propose concise chart titles.
- Overview page charts use those titles automatically. Without a key, built-in heuristics are used.

---
## 🛠 Scripts (Adjust If Needed)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start local dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | ESLint checks |
| `pnpm type-check` | TypeScript noEmit |
| `pnpm format` | Prettier formatting |
| `pnpm test` | (Planned) test runner |

---

## 🤝 Contributing

1. Fork & clone
2. Branch: `git switch -c feat/your-feature`
3. Code + add tests
4. Run checks: `pnpm lint && pnpm type-check`
5. Open PR with:
   - Summary
   - Screenshots (UI changes)
   - Checklist (docs / tests done)

Commit style (examples):

```
feat(widgets): add heatmap widget
fix(data): handle 429 rate limiting
chore(ci): add dependency caching
```

---

## 🖼 Screenshots (Add Real Images)

| Light | Dark |
|-------|------|
| ![Light Placeholder](public/docs/screenshot-light.png) | ![Dark Placeholder](public/docs/screenshot-dark.png) |

> Add GIFs for drag + drop or widget creation flows.

---

## ❓ FAQ

<details>
<summary><strong>Can I use a different chart library?</strong></summary>
Yes. Wrap any chart lib in a widget component and register it. Keep props minimal & typed.
</details>

<details>
<summary><strong>Does it support streaming?</strong></summary>
Planned. Architecture leaves space for WebSocket/SSE adapters.
</details>

<details>
<summary><strong>Is multi-tenant supported?</strong></summary>
Foundational patterns exist (namespace in config). Full RBAC planned in roadmap.
</details>

---

## 📄 License

MIT — see [LICENSE](LICENSE).  
Attribution appreciated but not required.

---

## 🙌 Acknowledgements

- Next.js & React communities
- Open-source visualization ecosystems
- Contributors & reviewers

---

## 🔁 Quick Reference

```bash
pnpm install
pnpm dev
pnpm lint
pnpm type-check
pnpm build
pnpm start
```

---

<p align="center"><strong>Built for clarity, speed & extensibility. ✨</strong></p>
