# Application guide

React + TypeScript + Vite, Node.js 24. Read README first. Pages: `src/pages`; routes: `src/components/App.tsx`. Add libraries only when needed; minimal requires no ISP packages, Redux or Ant Design.

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

- Preserve user changes; use npm and the checked-in lockfile.
- Confirm backend methods, DTOs, authentication and errors before implementing API calls. Never hide failures behind demo data.
- Use `import.meta.env.BASE_URL` for deployment-aware routes, assets and API URLs; typed helpers for `window.config`. No browser `process.env`.
- `PUBLIC_PATH` and `PROXY_URL` belong to Vite/server configuration; `VITE_*` values are public build settings; unprefixed `window.config` fields are runtime settings. Do not introduce `DEV_*`, `VITE_PROXY_URL` or `VITE_PUBLIC_PATH` aliases.
- Show loading, error, empty and success states separately. Check page access on direct URLs and action permissions separately; the backend must enforce permissions too.
- Do not edit `node_modules` or import neighboring checkouts.
- After code changes: `npm run check`, `npm run build`, `git diff --check`; verify affected UI flows and direct URLs in a browser, including subdirectory deployment.
- Preserve the Docker/nginx/shell-entrypoint contract in `docs/deployment.md`. Deployment changes require shell and container checks; a Vite build does not verify Docker.
- Keep `.env`, tokens, `node_modules` and `build` out of commits. Commit, push and publish only when requested.

Default title: `package.json` → `config.appName`; version: `package.json` → `version`.
