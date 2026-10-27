# ISP App guide

Read README first. This application owns its shell, router, session and transport.

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

- One store in `src/stores`; one `createApi` in `src/services/baseApi.ts`. Extend it with `injectEndpoints` and domain cache tags.
- Add a section's DTO/API, page, route, menu and permissions together. `SessionGuard` requires login; `PageAccessGuard` checks page access.
- `/api/example` is a teaching contract; adapt token headers, logout and 401/403 behavior to the actual backend.
- Sessions use `sessionStorage` scoped by `BASE_URL`; keep profiles in RTK Query and clear its cache on logout.
- Use ISP UI/Ant Design and React Hook Form. Preserve server errors, prevent duplicate submissions and confirm unsaved changes. Keep filters, pagination and sorting in the URL; reset the page when filters change.
- Demo runs only through `npm run dev:demo`; ordinary dev and production require a backend.
- Preserve user changes; use npm and the checked-in lockfile.
- Confirm backend methods, DTOs, authentication and errors before implementing API calls. Never hide failures behind demo data.
- Use `import.meta.env.BASE_URL` for deployment-aware routes, assets and API URLs; typed helpers for `window.config`. No browser `process.env`.
- `PUBLIC_PATH` and `PROXY_URL` belong to Vite/server configuration; `VITE_*` values are public build settings; unprefixed `window.config` fields are runtime settings. Do not introduce `DEV_*`, `VITE_PROXY_URL` or `VITE_PUBLIC_PATH` aliases.
- Show loading, error, empty and success states separately. Check page access on direct URLs and action permissions separately; the backend must enforce permissions too.
- Do not edit `node_modules` or import neighboring checkouts.
- After code changes: `npm run check`, `npm run build`, `git diff --check`; verify affected UI flows and direct URLs in a browser, including subdirectory deployment.
- Preserve the Docker/nginx/shell-entrypoint contract in `docs/deployment.md`. Deployment changes require shell and container checks; a Vite build does not verify Docker.
- Keep `.env`, tokens, `node_modules` and `build` out of commits. Commit, push and publish only when requested.

Browser checks: login, CRUD, viewer access, forbidden direct URLs, 401/403, forms, subdirectory and narrow screen.

This preset includes its own `.opencode/skills` and `opencode.json` for section/deployment workflows; see `docs/opencode.md`. Preserve these hidden files, `AGENTS.md` and docs when copying it independently. The creation skill belongs to the template.
