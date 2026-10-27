# OpenCode skills

This application includes two English skills in `.opencode/skills`, registered by the local `opencode.json`. No template checkout or global skill installation is required. Model/provider configuration remains your own.

- `isp-add-section`: pages, CRUD, forms, API integration and permissions.
- `isp-check-deployment`: Docker/nginx/public paths and runtime configuration.

Open this application's directory in OpenCode and ask to use a skill by name in ordinary text. Read `AGENTS.md` for project architecture and `docs/deployment.md` for deployment. Existing permissions still apply; skills do not authorize publication or production deployment.

When copying the application, include hidden `.opencode/skills` along with `opencode.json`, `AGENTS.md` and `docs`. Do not copy `node_modules`, `build`, local `.env` or Git history. The creation skill is template-only and is intentionally absent here.
