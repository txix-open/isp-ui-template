---
name: isp-check-deployment
description: Verify or fix an ISP UI Docker image, nginx routing, PUBLIC_PATH or runtime config.js generation. Use for container deployment work, not routine UI changes.
---

Read `AGENTS.md`, `docs/deployment.md`, Dockerfile, nginx config and shell entrypoint in the affected project. Preserve the documented `/opt/msp/<project><PUBLIC_PATH>` filesystem and startup contract.

- Default `PUBLIC_PATH` is `/`; change it only for an explicitly requested deployment path. Build base, image file destination and runtime path must agree. Changing runtime env alone cannot relocate compiled assets.
- `PROXY_URL` is dev-only. Production proxy needs a reachable gateway, the existing API rewrite and proxy headers.
- Keep shell-generated `window.config`, typed booleans, safe string serialization and optional `APP_NAME`. These values are public browser configuration.

Run `docker info` and the project's checks. If a Docker daemon is unavailable, report that container verification is blocked; do not describe a Vite build as a Docker test.

In the template repository, run `npm run test:docker`. It generates isolated fixtures, builds all presets at root and subdirectory paths, and tests default/explicit env, nginx routes/proxy/cache and restart. Do not run this command in a generated app: it has no template matrix.

For a generated application, build/run its own image with the intended public path and test gateway/network. Check `nginx -t`, SPA deep links, assets and missing assets, login routing, API rewrite/headers/body, `config.js` values/types/escaping/cache and restart. Exercise root/subdirectory configurations when changing shared path behavior. Isolate fixtures and clean up only resources created for the test.

Report build paths, container scenarios, actual results and any remaining real gateway/API/platform checks. This workflow does not authorize production deployment or publication.
