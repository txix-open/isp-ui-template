# ISP Admin Starter

Independent React/TypeScript/Vite project with `isp-admin-ui-kit` and `isp-ui-kit`. Node.js 24, npm, own lockfile; no dependencies on neighboring checkouts.

```sh
npm ci
npm run dev:demo
```

Open http://localhost:8001/. Accounts: `editor@example.test` (CRUD), `viewer@example.test` (read only), `blocked@example.test` (no item access, including direct URLs); password `demo`. Explicit demo stores data in dev-server memory, rejects unknown APIs and never proxies real services. Restart resets it; production demo builds are forbidden.

## Backend

Copy `.env.example` to `.env`, set `PROXY_URL` and `VITE_APP_TOKEN`, then `npm run dev`. Normal dev has no mocks. AdminBase supplies login, profile, navigation, base pages and routing; real ISP authentication/profile/design APIs are required.

The custom section uses teaching POST endpoints under `/api/example/items/`: `list` returns `{ id, name }[]`; `create` accepts `{ name }`; `update` accepts `{ id, name }`; both return the item; `delete` accepts `{ id }` and returns `{}`. Replace these with confirmed backend methods/DTOs. Register `example_item_view`, `example_item_create`, `example_item_edit`, `example_item_delete` in backend/profile permissions. UI checks do not replace server authorization.

## Structure

- `src/routes/index.tsx`: custom routes/menu; `PageAccessGuard`: direct-URL access.
- `src/constants/permissions.ts`: page/action permissions.
- `src/services/itemsApi.ts`: DTOs, RTK Query and cache invalidation.
- `src/stores/index.ts`: single store via `baseSetupStore`.
- `src/pages/ItemsPage`: search, pagination, forms and deletion confirmation.
- `src/setup/monaco.ts`: local workers; `demo/`: development backend.

AdminBase owns theme, shell, routing, authentication and profile. Do not wrap it in a second router/session system. Router 6 follows library peers; versions are locked.

## Configuration and deployment

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

Runtime fields: `APP_TOKEN`, `CLIENT_NAME`, `ENABLE_PASSWORD_LOGIN`, `ENABLE_OAUTH_LOGIN`, `OAUTH_LOGIN_BUTTON_TEXT`; local values may use public `public/config.js`. OAuth requires provider registration/configuration. Default generated title: `package.json` → `config.appName`; demo uses it, production AdminBase design comes from the backend.

Docker preserves `/opt/msp`, nginx config and shell-generated `window.config`. Configure a real API gateway in `cfg/template_cfg.conf`; `PROXY_URL` is dev-only. Runtime `PUBLIC_PATH` can be omitted because the image inherits the build value. See [deployment](docs/deployment.md).

Run `npm run check`, `npm run build`, `npm run preview`. Checks include app/Vite/demo types, lint, format and tests for config, CRUD, validation, permissions, demo logout and shell deployment. Browser verification remains separate.

## Integration limits

AdminBase includes Monaco and other heavy features; large-chunk warnings remain visible. DOMPurify is overridden to 3.4.17 within major 3 because Monaco 0.55.1 pins an older version; reconsider when upstream updates.

Dev/preview/nginx redirect absolute `/login` into `PUBLIC_PATH` for current AdminBase interceptors; preserve this behind other servers. Router 6 and Mermaid/KaTeX retain low/moderate audit findings in this dependency set. Router 7 requires library peer updates and compatibility checks. Do not force audit fixes that downgrade ISP packages or bypass peers.
