# Docker deployment contract

The generator preserves the original filesystem and startup contract, substituting the project/config names together.

| Part | Contract |
| --- | --- |
| Build | Node in `/usr/src/app`; output `/usr/src/app/build` |
| Runtime | `nginx:alpine-slim`, no Node installation; port 8001 |
| Application | `/opt/msp/project-name${PUBLIC_PATH}/` |
| Entrypoint | `/opt/msp/project-name${PUBLIC_PATH}/entrypoint.sh` |
| nginx config | `cfg/template_cfg.conf` → `/etc/nginx/conf.d/template_cfg.conf` |
| Runtime config | `config.js` beside `index.html`; public `window.config` |
| API | `<PUBLIC_PATH>api` rewritten to `/api/`; original proxy headers |
| SPA | `try_files $uri <PUBLIC_PATH>index.html` |

For `@team/orders-ui`, the generator substitutes `orders-ui` for `project-name` and renames the config to `orders-ui.conf`.

## Base path

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

Vite build, Docker copy destination and runtime must use the same path. `/admin` and `/admin/` are accepted; trailing slashes are normalized. Changing container env alone cannot relocate built assets.

```sh
docker build --build-arg PUBLIC_PATH=/admin/ -t my-ui .
docker run --rm -p 8001:8001 -e APP_TOKEN=public-application-token my-ui
```

Open http://localhost:8001/admin/. The image inherits `PUBLIC_PATH` from its build arg; omit it at runtime or pass the matching path. Generated Dockerfiles default both build args to the selected path.

## Gateway

The original `proxy_pass` stays commented until configured. Enable it manually in nginx or generate with:

```sh
npm run create -- ../orders-ui --preset isp-app --api-upstream http://isp-gate-service:9003 --yes
```

The container must reach the gateway through its deployment network. `PROXY_URL` configures only Vite's dev proxy. Preserve `client_max_body_size 10M`, API rewrite, `Host`, `X-Forwarded-For` and `X-Real-IP`.

## Runtime settings

The shell entrypoint writes `window.config`, then runs `exec nginx -g "daemon off;"`. Values can change between containers without rebuilding assets.

| Container variable | Type / default |
| --- | --- |
| `APP_TOKEN` | String; `default_token` |
| `CLIENT_NAME` | String; project name |
| `ENABLE_PASSWORD_LOGIN` | Boolean; `true` |
| `ENABLE_OAUTH_LOGIN` | Boolean; `false` |
| `OAUTH_LOGIN_BUTTON_TEXT` | String; “Войти с помощью OAuth” |
| `APP_NAME` | String, emitted only when explicitly supplied; otherwise build title remains |

Booleans accept `true`/`false`. The shell `json_string` helper safely serializes quotes, backslashes, Unicode, control characters and trailing newlines; tokens are not logged. Extend fields using the same helper; validate numeric/boolean values before emitting JavaScript. All values are public in the browser.

## Preserved behavior and optimizations

- One `npm ci`; Node 24, configurable through `NODE_VERSION`.
- Build-only `NODE_OPTIONS=--max-old-space-size=4096` supports the admin bundle.
- Original `/opt/msp`, nginx paths and shell startup remain.
- HTML is not cached; assets use gzip and one-week caching under the base path.
- Exact `config.js` location uses no-store to prevent stale runtime settings.
- Absolute `/login` redirects into a subdirectory for current AdminBase; root avoids a redirect loop.

## Verification

In the template repository: `npm run check` and `npm run test:docker`. The container matrix builds all three presets at root and in subdirectories (six images), including a build-arg path override without a trailing slash. Each image runs with default config and explicit Docker env (12 runtime scenarios). Checks cover filesystem paths, exact config values/types/escaping and optional title, SPA/assets/version, API rewrite/headers/body, cache/gzip, login and restart. Invalid booleans, relative paths and a mismatched runtime path must reject startup. Test-owned containers, network and image tags are cleaned up.

Generated applications retain shell deployment tests in `npm run check`; the full container matrix stays in the template repository. Verify each real image against its gateway, API and platform environment.
