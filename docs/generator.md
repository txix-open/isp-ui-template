# Project generator

Requires Node.js 24. Run from the template, or invoke its CLI from any directory:

```sh
npm run create -- ../orders-ui --preset isp-app --title "Orders" --yes
node /path/to/isp-ui-template/bin/create-isp-ui.mjs ../orders-ui --preset isp-app --yes
```

| Option | Default / behavior |
| --- | --- |
| `<directory>` | Required new output directory; existing directories are refused |
| `--preset minimal\|isp-app\|isp-admin` | `minimal` |
| `--name <npm-name>` | Directory basename; scoped names supported |
| `--title <title>` | Package name; stored in `config.appName` and HTML title |
| `--public-path /path/` | `/`; normalizes trailing slash |
| `--api-upstream <origin>` | Optional production proxy; HTTP(S) host/port only |
| `--install` | Run `npm ci` after generation |
| `--no-install` | Default: files only |
| `--yes` | Skip interactive prompts |
| `--help`, `-h` | Usage |

**Default `PUBLIC_PATH` is `/`. Change it only when the user explicitly specifies a deployment path. Never infer it from the directory, package name, application title, or routes.**

For agents, omit `--public-path` unless the user explicitly supplies it. A request to create `orders-ui` does not imply `/orders-ui/`. Do not ask for a path when the default suffices.

The generator copies an allowlist, resets runtime config, creates `.env` from safe examples, synchronizes manifest/lock metadata and writes standalone instructions and CI. It excludes local env files, dependencies, builds, Git history and symlinks. Installation failure preserves generated files; retry `npm ci` there. No automatic Git operations or npm publication.

```sh
cd ../orders-ui
npm ci
npm run check
npm run build
```

Use `npm run dev:demo` for ISP demo presets; normal dev/production requires real APIs. Confirm backend contracts before connecting a product.

Deployment uses `/opt/msp/<unscoped-package-name><PUBLIC_PATH>` and `cfg/<unscoped-package-name>.conf`; Dockerfile and entrypoint references are updated together. Production `--api-upstream` is independent of dev `PROXY_URL`. See [deployment](deployment.md).
