# Architecture — ZaloPay AI Creative Platform

> Sprint 4.8 — Production Readiness Edition  
> Version: 2.0.0 | Framework: Next.js 15 (App Router)

---

## Table of Contents

1. [Overview](#overview)
2. [Folder Structure](#folder-structure)
3. [Routing & Layouts](#routing--layouts)
4. [UI Component System](#ui-component-system)
5. [State Management](#state-management)
6. [AI Backend Services](#ai-backend-services)
7. [Data Layer (CMS)](#data-layer-cms)
8. [AI Extension Points](#ai-extension-points)
9. [Error Handling](#error-handling)
10. [Performance Patterns](#performance-patterns)
11. [Security Model](#security-model)
12. [Environment Variables](#environment-variables)
13. [Future CMS Integration](#future-cms-integration)
14. [Future AI Integration](#future-ai-integration)

---

## Overview

ZaloPay AI Creative Platform is a Next.js 15 App Router SaaS application that provides:

- **AI Brand Checker** — Upload designs and receive brand compliance analysis via Gemini
- **AI Content Generators** — Banner, Image, Video, Prompt Studio (roadmap)
- **Team Workspace** — Projects, asset library, history, favorites

The backend is entirely serverless Next.js API Routes. The LLM provider is Google Gemini via `@google/generative-ai`.

---

## Folder Structure

```
/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (Providers, metadata)
│   ├── page.tsx                # Root redirect → /dashboard
│   ├── not-found.tsx           # Global 404 page
│   ├── error.tsx               # Global error boundary (html/body wrapper)
│   ├── globals.css             # Design tokens + global styles
│   │
│   ├── (shell)/                # Route group — all pages use ShellClient layout
│   │   ├── layout.tsx          # Mounts ShellClient
│   │   ├── error.tsx           # Shell-level error boundary
│   │   ├── loading.tsx         # Shell-level loading skeleton
│   │   ├── dashboard/
│   │   ├── brand-checker/
│   │   ├── banner-generator/
│   │   ├── image-generator/
│   │   ├── video-generator/
│   │   ├── creative-studio/
│   │   ├── prompt-studio/
│   │   ├── asset-library/
│   │   ├── projects/
│   │   ├── history/
│   │   ├── favorites/
│   │   ├── team/
│   │   ├── settings/
│   │   └── design-system/      # Internal component showcase (dev only)
│   │
│   └── api/                    # Server-side API routes
│       ├── analyze/route.ts    # POST /api/analyze — brand compliance check
│       ├── compare/route.ts    # POST /api/compare — design comparison
│       ├── brand-guideline/    # GET /api/brand-guideline — serve guideline JSON
│       └── health/route.ts     # GET /api/health — uptime check
│
├── components/
│   ├── providers.tsx           # ThemeProvider (next-themes)
│   ├── radar-chart.tsx         # Chart.js radar chart for brand scores
│   ├── report-panel.tsx        # Markdown report renderer + PDF/image export
│   ├── shell/                  # Shell chrome (always rendered)
│   │   ├── shell-client.tsx    # Top-level state: sidebar open/close, panel open/close
│   │   ├── sidebar.tsx         # Left navigation sidebar
│   │   ├── top-nav.tsx         # Top navigation bar + search + theme toggle
│   │   ├── right-panel.tsx     # Sliding right panel (content injected by pages)
│   │   └── search-modal.tsx    # ⌘K command palette
│   ├── modules/                # Feature-specific components (one per module)
│   │   ├── brand-checker/
│   │   │   ├── workspace.tsx   # Main brand checker UI (upload → analyze → report)
│   │   │   └── panel.tsx       # Right panel content for brand-checker route
│   │   ├── banner-generator/panel.tsx
│   │   ├── creative-studio/panel.tsx
│   │   ├── image-generator/panel.tsx
│   │   ├── prompt-studio/panel.tsx
│   │   └── video-generator/panel.tsx
│   └── ui/                     # Primitive design-system components (reusable)
│       ├── index.ts            # Barrel export — import all from "@/components/ui"
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown.tsx
│       ├── empty-state.tsx
│       ├── generate-button.tsx
│       ├── input.tsx
│       ├── progress.tsx
│       ├── section.tsx         # WorkspaceHeader + PageContainer + Section
│       ├── skeleton.tsx
│       ├── spinner.tsx
│       ├── status-indicator.tsx
│       ├── tabs.tsx
│       ├── tooltip.tsx
│       └── upload-area.tsx     # UploadArea + FileCard
│
├── contexts/
│   ├── right-panel-context.tsx # RightPanelContext — pages inject their panel JSX
│   └── search-context.tsx      # SearchContext — drives ⌘K modal open/close
│
├── data/                       # CMS-replaceable data layer (see § Data Layer)
│   └── dashboard.ts            # Dashboard mock data (projects, assets, stats, news)
│
├── lib/                        # Shared utilities and backend logic
│   ├── cn.ts                   # clsx + tailwind-merge utility
│   ├── config.ts               # App config (LLM key, model, language) from env vars
│   ├── icons.ts                # Lucide icon re-exports for nav config
│   ├── llm-client.ts           # Gemini API client (retry, fallback, JSON repair)
│   ├── nav-config.ts           # Sidebar navigation items definition
│   ├── prompt-builder.ts       # Builds Gemini messages for analyze / compare
│   ├── report.ts               # Post-processes LLM response → AnalysisResult
│   └── types.ts                # TypeScript types for analysis and comparison results
│
├── services/                   # Service layer (frontend → backend abstraction)
│   └── ai/                     # AI service extension points (see § AI Extension Points)
│       ├── index.ts            # Barrel export
│       ├── types.ts            # Shared AI service types
│       ├── analyze.ts          # Brand analysis (wraps /api/analyze)
│       ├── generate-image.ts   # Image generation stub (future: Imagen 3)
│       ├── generate-banner.ts  # Banner generation stub (future: Imagen 3 + templates)
│       ├── generate-video.ts   # Video generation stub (future: Veo 2)
│       └── prompt-studio.ts    # Prompt optimization stub (future: Gemini)
│
├── assets/                     # Brand reference images (served at build time)
│   └── *.png                   # ZaloPay logos, trademark variants
│
├── brand-guideline.json        # ZaloPay brand rules (colors, typography, logo rules)
│
├── next.config.ts              # Security headers + outputFileTracingIncludes
├── tailwind.config.ts          # Design tokens (all via CSS variables)
├── tsconfig.json               # Strict TypeScript (excludes legacy src/)
└── Dockerfile                  # Production container
```

---

## Routing & Layouts

All user-facing pages live under the `(shell)` route group, which mounts `ShellClient`:

```
RootLayout (app/layout.tsx)
  └── Providers (ThemeProvider)
        └── ShellClient (components/shell/shell-client.tsx)
              ├── TopNav          ← always rendered
              ├── Sidebar         ← always rendered, responsive overlay on mobile
              ├── app-workspace   ← page content renders here via {children}
              └── RightPanel      ← sliding panel, content injected by pages
```

**Right Panel Pattern:** Pages call `useRightPanel().setContent(<MyPanel />)` in a `useEffect`. The panel renders on desktop and as a bottom drawer on mobile. Pages clean up with `setContent(null)` on unmount.

---

## UI Component System

All primitives are in `components/ui/` and exported through `components/ui/index.ts`.

**Design tokens** are CSS custom properties defined in `app/globals.css`:
- `--bg-*` — background surfaces
- `--fg-*` — foreground text
- `--border-*` — borders
- `--brand-*` — ZaloPay brand blue (#0033C9)
- `--accent-*` — accent purple
- `--radius-*` — border radii
- `--shadow-*` — elevation shadows

Dark mode is handled by next-themes (`attribute: "class"`). The sidebar always renders in dark mode via a token override block.

---

## State Management

No external state library. State lives at the lowest useful scope:

| Concern | Location | Mechanism |
|---|---|---|
| Theme (dark/light) | `providers.tsx` | next-themes context |
| Sidebar open/close | `shell-client.tsx` | `useState` |
| Right panel content | `right-panel-context.tsx` | React Context + `useState` |
| Search modal open/close | `search-context.tsx` | React Context + `useState` |
| Page-local form state | Each page/module | `useState` / `useReducer` |
| Body scroll lock | `shell-client.tsx` | `useEffect` → `document.body.style.overflow` |

---

## AI Backend Services

Three active API routes handle all AI interactions:

### `POST /api/analyze`
Analyzes a single design image against ZaloPay brand guidelines.

**Flow:**
1. Receives `{ image: base64DataUrl, designName?: string }`
2. Reads `brand-guideline.json` and reference logo images from `assets/`
3. Builds Gemini prompt via `lib/prompt-builder.ts`
4. Calls Gemini via `lib/llm-client.ts` (with retry + model fallback)
5. Parses JSON response via `extractJson` + `safeParseLlmResponse`
6. Returns `AnalysisResult`

### `POST /api/compare`
Compares two designs head-to-head.

### `GET /api/brand-guideline`
Returns the parsed `brand-guideline.json` for client-side use.

### LLM Client (`lib/llm-client.ts`)
- Primary model: `GEMINI_API_KEY` + `LLM_MODEL` env var
- Fallback chain: `LLM_FALLBACK_MODELS` (comma-separated)
- Retry policy: primary model retried 2× with exponential backoff (1s → 2s)
- JSON repair: `extractJson` handles fenced code blocks, invalid escapes, truncated JSON
- Error classes: `QuotaExceededError` for 429 / RESOURCE_EXHAUSTED

---

## Data Layer (CMS)

The `data/` directory holds mock data with full TypeScript types. Each file is annotated with `TODO (CMS)` comments marking where to swap in real API calls.

### `data/dashboard.ts`
Exports typed mock data for the dashboard:
- `RECENT_PROJECTS: DashboardProject[]`
- `RECENT_ASSETS: DashboardAsset[]`
- `PLATFORM_STATS: PlatformStat[]`
- `NEWS_ITEMS: NewsItem[]`
- `PROJECT_STATUS_CONFIG`

**To connect a CMS:** replace each export with a server-side data fetch, or wrap them in a `getDashboardData()` async function that calls your CMS API. The TypeScript interfaces define the contract.

---

## AI Extension Points

The `services/ai/` directory provides a typed service layer for all future AI modules.

### Currently active
| Service | File | Routes |
|---|---|---|
| Brand analysis | `services/ai/analyze.ts` | `POST /api/analyze` |

### Stubs ready for integration
| Module | Service file | Future provider |
|---|---|---|
| Image Generator | `services/ai/generate-image.ts` | Google Imagen 3 |
| Banner Generator | `services/ai/generate-banner.ts` | Imagen 3 + templates |
| Video Generator | `services/ai/generate-video.ts` | Google Veo 2 |
| Prompt Studio | `services/ai/prompt-studio.ts` | Gemini Flash |

Each stub file contains:
1. Full TypeScript `Input` / `Output` types
2. Integration steps in JSDoc comments
3. A `status: "error"` return so the UI can handle the "coming soon" state

**To activate a module:**
1. Create the corresponding `app/api/generate/<module>/route.ts`
2. Add the API key to `.env`
3. Replace the `void input; return { status: "error" }` stub with a real `fetch()` call

---

## Error Handling

| Layer | File | Description |
|---|---|---|
| Root (critical) | `app/error.tsx` | Wraps html/body, catches app-startup errors |
| Shell (module) | `app/(shell)/error.tsx` | Renders inside the workspace, retry button |
| 404 | `app/not-found.tsx` | Unknown routes, link back to dashboard |
| Loading | `app/(shell)/loading.tsx` | Skeleton shown during shell hydration |
| LLM errors | `lib/llm-client.ts` | Quota errors, JSON parse failures, retries |
| API responses | Each route.ts | `try/catch` → structured error JSON |

---

## Performance Patterns

- **`lucide-react` tree-shaking** — `experimental.optimizePackageImports` in `next.config.ts` eliminates unused icon code at build time
- **Heavy components lazy-loaded** — `RadarChartComponent` (Chart.js) uses `next/dynamic` in `brand-checker/workspace.tsx`
- **PDF/export lazy-loaded** — `html2canvas` and `jspdf` are dynamic imports in `report-panel.tsx`
- **No external CDN scripts** — Lucide UMD bundle from unpkg removed (was loading ~200KB at runtime)
- **CSS-driven animations** — All transitions use CSS custom properties (`--duration-*`, `--ease`)
- **Tailwind purge** — Content paths configured in `tailwind.config.ts` for accurate tree-shaking

---

## Security Model

- **API keys server-only** — `GEMINI_API_KEY` accessed only in `lib/config.ts` (used by API routes, never client bundles)
- **Security headers** — CSP-adjacent headers in `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`
- **No `dangerouslySetInnerHTML`** with user input — The report panel sanitizes via `marked` (markdown → HTML) but only processes LLM output, not raw user input
- **Brand guideline is not secret** — `brand-guideline.json` is served via `/api/brand-guideline`; it contains no credentials

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |
| `LLM_MODEL` | No | Primary Gemini model (default: `gemini-2.0-flash`) |
| `LLM_FALLBACK_MODELS` | No | Comma-separated fallback models |
| `REPORT_LANGUAGE` | No | Output language: `vi` (default) or `en` |
| `BRAND_GUIDELINE_PATH` | No | Override path to brand guideline JSON |
| `LOGO_PATH` | No | Override path to primary logo PNG |

---

## Future CMS Integration

**Recommended approach:** Add a `lib/cms.ts` data-fetching module that exports the same types as `data/dashboard.ts` but fetches from a headless CMS (Contentful, Sanity, Strapi).

1. Create `lib/cms.ts`:
```ts
export async function getDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${process.env.CMS_API_URL}/dashboard`);
  return res.json();
}
```

2. Update `data/dashboard.ts` to re-export from `lib/cms.ts` (or replace the mock arrays)
3. Mark routes as `dynamic` if they depend on CMS data:
```ts
// app/(shell)/dashboard/page.tsx
export const dynamic = "force-dynamic";
```

---

## Future AI Integration

To add a new AI module (example: Creative Studio generation):

1. **Define types** in `services/ai/types.ts` — add `CreativeInput` / `CreativeOutput`
2. **Create service** `services/ai/generate-creative.ts` — implement `generateCreativeDesign()`
3. **Create API route** `app/api/generate/creative/route.ts`
4. **Add env variable** for any new API key
5. **Update `services/ai/index.ts`** barrel export
6. **Wire to module panel** in `components/modules/creative-studio/panel.tsx`

The `AIServiceResult<T>` wrapper ensures the UI always handles `idle | loading | success | error | quota_exceeded` states consistently.
