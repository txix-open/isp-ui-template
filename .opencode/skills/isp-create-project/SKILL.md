---
name: isp-create-project
description: Create an independent React/Vite application from ISP UI Template using its local generator. Use for new projects, not changes to an existing application.
---

Read the template's `AGENTS.md` and `docs/generator.md` from the repository root. Use `bin/create-isp-ui.mjs`; do not copy a checkout manually.

- Select `minimal` for a small SPA, `isp-app` for a custom ISP shell (EKG/KKD-style), or `isp-admin` for AdminBase. Follow an explicit choice; otherwise infer from the requested architecture. The CLI default is `minimal`.
- Use a new output directory. Directory/package/title and deployment path are independent. Omit `--public-path` unless the user explicitly supplies one; default `/` must never become the directory or package name.
- Keep `PROXY_URL` (dev) separate from optional `--api-upstream` (production nginx). Confirm actual backend contracts before connecting APIs; use explicit demo mode when a runnable ISP example is requested without a backend.

Example, from the template root:

```sh
npm run create -- ../orders-ui --preset isp-app --title "Orders" --yes
```

In the generated directory, install with `npm ci`, run `npm run check` and `npm run build`, and start the requested mode: `npm run dev` for minimal or `npm run dev:demo` for an ISP demo. If installing fails, retain the generated files and report the failure.

Read the generated `AGENTS.md` before application work. Report its directory, preset, effective public path, URL and actual verification results. Commit, push or publish only when requested.
