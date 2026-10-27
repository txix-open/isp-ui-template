# OpenCode skills

Repository skills use OpenCode's `.opencode/skills/<name>/SKILL.md` discovery format, YAML `name`/`description`, and English instructions. The minimal `opencode.json` registers the local skills directory explicitly; it configures no model, provider or permission override. See [OpenCode skills documentation](https://opencode.ai/docs/skills/).

| Skill | Scope |
| --- | --- |
| `isp-create-project` | Template only: generate an independent application |
| `isp-add-section` | Existing application: page, CRUD, API and permissions |
| `isp-check-deployment` | Docker/nginx/public path/runtime config verification |

Open the template directory in OpenCode to use all three. Ask the agent to use a skill by name in ordinary text; do not assume skill names are slash commands. Discovery exposes descriptions, and the agent loads the needed skill on demand. Existing user permissions still apply.

Each ISP preset carries its own `.opencode/skills`, `opencode.json`, `AGENTS.md` and OpenCode/deployment guides. Include hidden files when copying a preset independently. The generator copies only `isp-add-section` and `isp-check-deployment` from the selected starter into new applications. Their workflows use that application's `AGENTS.md`, scripts and deployment guide, without requiring the template. It writes a clean skills-only `opencode.json`; it never copies the template-only creation skill, local provider settings, credentials or session state.

Open generated applications in their own directory. Existing projects created before skills were added can receive just these two skill directories manually; do not regenerate over an existing project. Keep application skills synchronized between the root and both presets; verify generator copying after changes.

Validation: run `npm run check` for generator allowlist/protected-directory coverage. Check frontmatter/name constraints and, when available, OpenCode discovery separately. A structural check does not verify model behavior or permissions in every OpenCode setup.
