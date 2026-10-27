# Development recipes

## Page

Add `src/pages/ExamplePage/ExamplePage.tsx` with nearby styles/types. Register it in `src/components/App.tsx` for minimal, or the preset's routes/menu. Routes omit the deployment prefix; the router uses `import.meta.env.BASE_URL`. Use `Link`; show loading, empty and error states. Verify the direct URL after `npm run check` and `npm run build`.

## API and forms

Confirm backend methods, DTOs, authentication and error behavior first. Minimal has no mandatory API client. ISP App extends its shared `baseApi` through `injectEndpoints`; ISP Admin uses the library transport and `baseSetupStore`. Add cache tags and separate page/action permissions. Use React Hook Form with ISP fields, preserve server errors, block duplicate submissions and confirm unsaved changes.

## Configuration

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

`PUBLIC_PATH` and `PROXY_URL` are server settings; `VITE_*` values are public build settings. Browser paths use `import.meta.env.BASE_URL`; runtime fields use typed config helpers. Do not introduce `DEV_*` or separate `VITE_PROXY_URL` / `VITE_PUBLIC_PATH` aliases.

Default title is `package.json` → `config.appName`; `VITE_APP_NAME` can override it in minimal/ISP App. Add new public fields to types, helper fallbacks, README and `.env.example`. For runtime changes, extend the shell entrypoint using `json_string` and update deployment tests. Never expose server secrets.

## Shared infrastructure and generator

Presets must work independently; do not import template-root or neighboring checkout files. Synchronize shared infrastructure copies and check every affected preset. Preserve [deployment](deployment.md).

CLI: `bin/create-isp-ui.mjs`; copying/metadata: `generator/create-project.mjs`. Keep copying allowlisted. After generator changes, run root checks and verify affected generated projects with `npm ci`, `npm run check`, `npm run build`. See [CLI options](generator.md).
