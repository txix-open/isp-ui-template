# ISP App Starter

Independent React/TypeScript/Vite app with Ant Design and `isp-ui-kit`; custom layout, router, profile, session and RTK Query. Node.js 24, npm, own lockfile. Suitable for EKG/KKD-style apps; backend compatibility requires adaptation.

```sh
npm ci
npm run dev:demo
```

Open http://localhost:8002/. Accounts: `editor@example.test` (CRUD), `viewer@example.test` (read only), `blocked@example.test` (home/profile only); password `demo`. Demo is visibly marked, stores data/sessions in dev-server memory, rejects unknown operations and never proxies real services. Restart resets it. Production demo builds are forbidden.

## Backend contract

Copy `.env.example` to `.env`, set `PROXY_URL` and `VITE_APP_TOKEN`, then `npm run dev`. Normal dev has no mocks. Confirm the actual contract before adapting these teaching POST endpoints relative to `/api/`:

| Endpoint | Body | Response |
| --- | --- | --- |
| `example/auth/login` | `{ email, password }` | `{ headerName, token }` |
| `example/auth/profile` | `{}` | `{ id, displayName, email, permissions: string[] }` |
| `example/auth/logout` | `{}` | `{}` |
| `example/items/list` | `{ search, status, page, pageSize, order }` | `{ items: Item[], total }` |
| `example/items/create` | `{ name, status }` | `Item` |
| `example/items/update` | `{ id, name, status }` | `Item` |
| `example/items/delete` | `{ id }` | `{}` |

`Item = { id: string, name: string, status: 'active' | 'archived' }`. Empty status filter: `''`; name ordering: `asc`/`desc`; pages start at 1. Errors use HTTP status and `{ message: string }`.

Adapt `src/constants/apiPaths.ts`, `src/types/auth.ts`, `src/services/authApi.ts`, `itemsApi.ts`, `baseApi.ts`, and `src/utils/session.ts` / `access.ts`. The sample sends public `X-APPLICATION-TOKEN` plus the returned user `x-*` header; the user header cannot be `x-application-token`. Cookie/Bearer/SSO require transport/auth changes; OAuth is not implemented.

Sessions use `sessionStorage` per tab and `BASE_URL`. Protected 401 clears session/cache and returns to login; login 401 stays on the form. 403 preserves the session. Stale 401 from an old session must not clear a newer login. Logout clears local state and reports missing server confirmation on failure. Mutations are not automatically retried.

## Structure

- `src/index.tsx`: providers; `src/config`: theme/public config.
- `src/routes`, `src/layouts`: basename-aware routes, shell and navigation.
- `src/stores`: one store/session; `src/services/baseApi.ts`: one `createApi`, extended through `injectEndpoints`.
- `SessionGuard`: login/profile; `PageAccessGuard`: direct-URL permissions.
- `src/pages/ItemsPage`: filters, sorting, pagination in URL, CRUD and unsaved-change confirmation.
- `demo`: development backend only.

For a section, add API/DTO/cache tags, page, route, menu and page/action permissions. Register permissions on the backend; hiding menu items does not protect an API.

## Configuration and checks

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

`PROXY_URL` is dev-only. Public build settings: `VITE_APP_NAME`, `VITE_APP_TOKEN`; runtime `APP_NAME`/`APP_TOKEN` override them. Default name: `package.json` → `config.appName`. Local runtime values can use `public/config.js`; no server secrets. Browser paths use `import.meta.env.BASE_URL`.

Run `npm run check`, `npm run build`, `npm run preview`. Check covers TypeScript, lint, format and Node tests for access, sessions, return paths, demo API and deployment configuration. Verify login, forms, permissions, failures and subdirectories in a browser.

Docker preserves the original filesystem, nginx config and shell startup; configure a real gateway in `cfg/template_cfg.conf`. See [deployment](docs/deployment.md).

ISP UI requires Monaco peers and emits editor assets even though this starter does not initialize an editor; adding one requires worker setup. Large-chunk warnings remain visible. DOMPurify uses an override. Product APIs, SSO, WebSocket and domain behavior remain application work.

## OpenCode

This preset includes `AGENTS.md`, `.opencode/skills/isp-add-section`, `.opencode/skills/isp-check-deployment` and a skills-only `opencode.json`. Include hidden files when copying it into an independent project; no template checkout is required. Open the new directory in OpenCode and request a skill by name. See [OpenCode guide](docs/opencode.md).
