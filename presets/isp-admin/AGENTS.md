# ISP Admin guide

Read README first. React/TypeScript/Vite with ISP UI and AdminBase.

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

- AdminBase owns routing, profile, authentication and shell. Keep one store in `src/stores/index.ts` via `baseSetupStore`; do not add another router, Provider or session.
- Add section permissions in `src/constants/permissions.ts`, pages in `src/pages`, API in `src/services`, and register API in the store. Add routes/menu in `src/routes/index.tsx`; use `PageAccessGuard` for direct URLs.
- Use library `axiosBaseQuery`, typed DTOs and cache tags. `/api/example` is a teaching contract.
- Forms use React Hook Form + ISP `FormInput`: show server errors, prevent duplicate submissions and confirm unsaved changes.
- Demo runs only through `npm run dev:demo`. Check installed library types and peers before integration changes; do not use `--legacy-peer-deps`.
- Preserve user changes; use npm and the checked-in lockfile.
- Confirm backend methods, DTOs, authentication and errors before implementing API calls. Never hide failures behind demo data.
- Use `import.meta.env.BASE_URL` for deployment-aware routes, assets and API URLs; typed helpers for `window.config`. No browser `process.env`.
- `PUBLIC_PATH` and `PROXY_URL` belong to Vite/server configuration; `VITE_*` values are public build settings; unprefixed `window.config` fields are runtime settings. Do not introduce `DEV_*`, `VITE_PROXY_URL` or `VITE_PUBLIC_PATH` aliases.
- Show loading, error, empty and success states separately. Check page access on direct URLs and action permissions separately; the backend must enforce permissions too.
- Do not edit `node_modules` or import neighboring checkouts.
- After code changes: `npm run check`, `npm run build`, `git diff --check`; verify affected UI flows and direct URLs in a browser, including subdirectory deployment.
- Preserve the Docker/nginx/shell-entrypoint contract in `docs/deployment.md`. Deployment changes require shell and container checks; a Vite build does not verify Docker.
- Keep `.env`, tokens, `node_modules` and `build` out of commits. Commit, push and publish only when requested.

Browser checks: login, CRUD, viewer access, forbidden direct URLs, errors and subdirectory deployment.

This preset includes its own `.opencode/skills` and `opencode.json` for section/deployment workflows; see `docs/opencode.md`. Preserve these hidden files, `AGENTS.md` and docs when copying it independently. The creation skill belongs to the template.
