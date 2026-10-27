# ISP UI Template

React + TypeScript + Vite, Node.js 24. Root: `minimal`; `presets/isp-app`: custom ISP shell; `presets/isp-admin`: AdminBase. Read only the selected preset's README and AGENTS first; consult detailed docs as needed.

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

Create projects with `npm run create -- <new-directory> --preset <preset> --yes`. Omit `--public-path` unless explicitly requested. Do not copy the checkout manually. CLI: `bin/create-isp-ui.mjs`; implementation: `generator/create-project.mjs`; tests: `scripts/generator.test.mjs`.

- Preserve user changes; use npm and the checked-in lockfile.
- Confirm backend methods, DTOs, authentication and errors before implementing API calls. Never hide failures behind demo data.
- Use `import.meta.env.BASE_URL` for deployment-aware routes, assets and API URLs; typed helpers for `window.config`. No browser `process.env`.
- `PUBLIC_PATH` and `PROXY_URL` belong to Vite/server configuration; `VITE_*` values are public build settings; unprefixed `window.config` fields are runtime settings. Do not introduce `DEV_*`, `VITE_PROXY_URL` or `VITE_PUBLIC_PATH` aliases.
- Show loading, error, empty and success states separately. Check page access on direct URLs and action permissions separately; the backend must enforce permissions too.
- Do not edit `node_modules` or import neighboring checkouts.
- After code changes: `npm run check`, `npm run build`, `git diff --check`; verify affected UI flows and direct URLs in a browser, including subdirectory deployment.
- Preserve the Docker/nginx/shell-entrypoint contract in `docs/deployment.md`. Deployment changes require shell and container checks; a Vite build does not verify Docker.
- Keep `.env`, tokens, `node_modules` and `build` out of commits. Commit, push and publish only when requested.

Minimal needs no Redux, Ant Design or authentication. Add dependencies only for actual requirements. Presets are independent; synchronize shared infrastructure copies and verify every affected preset. Browser version: `window.AppVersion`; default title: `package.json` → `config.appName`.

Recipes: `docs/development.md`; CLI: `docs/generator.md`. For deployment changes run `npm run test:docker` when Docker is available; report any unavailable checks.
