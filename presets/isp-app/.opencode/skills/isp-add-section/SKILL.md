---
name: isp-add-section
description: Add or extend a page, CRUD section, form, API integration or permission in an existing ISP UI application. Use after project creation.
---

Read the application's `AGENTS.md` and inspect its entrypoint, package scripts and actual routes/store before editing. In the template repository, use the selected preset's files and instructions. Do not infer architecture from unused files.

Choose the existing integration path:

- **Minimal:** pages in `src/pages`, routes in `src/components/App.tsx`. Add a data layer or UI library only when the task needs it.
- **ISP App:** extend `src/services/baseApi.ts` through `injectEndpoints`; add DTOs/cache tags, page, `src/routes` entry, `src/layouts/navigation.tsx` menu and permissions. Reuse its session/profile guards.
- **ISP Admin:** AdminBase owns shell, router, authentication and profile. Register section API through the existing `baseSetupStore`, routes/menu in `src/routes/index.tsx`, and page access through `PageAccessGuard`. Do not create a second router, store or session.

Confirm real methods, DTOs, auth and 401/403 behavior from the backend contract. `/api/example` is teaching code. Extend it only for explicitly requested demo behavior, never as a silent fallback for failed real requests.

Keep page permissions effective on direct URLs and check mutation permissions separately. Reuse project form components; preserve server errors, prevent duplicate submission and confirm unsaved changes. Follow the existing list URL/filter/pagination conventions.

Preserve the current `PUBLIC_PATH`; use `import.meta.env.BASE_URL` and typed config helpers. A new route or directory does not change the deployment prefix.

Run the affected application's `npm run check` and `npm run build`. Verify the relevant login, list/form, permissions, error and direct-URL flows in a browser when available. State what was actually checked and what remains unverified.
