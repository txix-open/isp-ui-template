# Minimal SPA

React + TypeScript + Vite, Node.js 24, npm. No backend or ISP libraries required for the first run.

- `npm run check`: types, lint, format and tests.
- `npm run build`: production assets and `build/version.json`.
- `npm run preview`: preview using the same `PUBLIC_PATH`.
- Pages: `src/pages`; routes: `src/components/App.tsx`. Use `Link` and `BASE_URL`.

Add pages/styles/routes, then verify direct URLs. Confirm API contracts before integration; show failures honestly and add dependencies only when needed.

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

`PROXY_URL` is the dev backend; `VITE_APP_NAME` and `VITE_APP_TOKEN` are public build values. `window.config` overrides defaults through `src/utils/configUtils.ts`. Keep secrets out. Generated `.env` is ignored by Git; safe settings belong in `.env.example`.

Deployment preserves `/opt/msp/<project><PUBLIC_PATH>`, nginx config and the shell entrypoint that writes runtime config and starts nginx. Production API needs a real gateway; see [deployment](docs/deployment.md).

Git history is not copied. After initializing your repository, run `npm run prepare` to install the local pre-commit hook. Exclude `.env`, `node_modules` and `build`.
