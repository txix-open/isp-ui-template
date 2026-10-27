# Project survey

Survey: 2026-10-26, 48 local directories in `/Users/foxxy/Documents/projects`. Structures/manifests and application entrypoints/providers were inspected; ISP libraries, AdminBase integrations, stores/APIs, permissions and selected custom SPAs received deeper review. Neighboring apps were not built or run. Manifest versions are observations, not a compatibility guarantee.

This is optional reference material; agents should start with the selected preset's README/AGENTS.

| Project | Observed architecture / role |
| --- | --- |
| `agentik` | Agent instructions, frontend/Go conventions and skills |
| `akid-ryazan-voring-service` | Go-embedded React/Vite/RTK Query UI; voting, sessions and analytics |
| `ekg-releases` | EKG release instructions |
| `ekg-ui` | Custom SPA: meetings, agendas, voting, analytics, permissions, WebSocket and Ant Design theme |
| `elect-admin-ui` | AdminBase plus voting settings and custom APIs |
| `elect-ballot-preview-ui` | Ballot preview: elect-ui-kit, compressed URL/API config, translations and printing |
| `elect-ballot-ui` | Public voting: elect-ui-kit, state contexts, translations, timers and selection limits |
| `elect-cms-ui` | Go-embedded CMS UI: pages/scripts, Monaco, versions/preview and Redux |
| `elect-gatekeeper-ui` | Public authentication/queue; profile/text contexts and custom UI |
| `elect-observer-ui` | Voting/transaction monitoring, charts/search/results; TanStack Query and contexts |
| `elect-pcr-ui` | Custom configuration editor; Redux, ISP UI and dynamically created APIs |
| `elect-printer-ui` | AdminBase: printers, queues, jobs, DLQ/templates and custom RTK Query APIs |
| `elect-registration-ui` | Public registration/SMS/voting stages; profile/statistics/text contexts |
| `elect-releases` | Election system release instructions |
| `elect-ui-kit` | Public voting components, texts and utilities; distributed as an archive |
| `elect-welcome-ui` | Static HTML; no mandatory Node/React stack |
| `fz44` | React/Vite calculator with Ant Design tables and modal forms |
| `isp-admin-ui` | Minimal AdminBase/baseSetupStore integration, Monaco and dayjs |
| `isp-admin-ui-kit` | Shared admin shell, routing, profile, authentication, permissions, pages and store/API |
| `isp-mapping-ui` | Custom SPA; app bootstrap/layout/routes, shared baseApi + injectEndpoints, theme/messages |
| `isp-releases` | ISP release instructions |
| `isp-stand-flow-ui` | Next.js: environments, reservations, links, server APIs and background tasks |
| `isp-stress-ui-2` | Custom SPA: projects, environments, tests/scenarios; Redux and ISP UI |
| `isp-ui-kit` | Form fields, layout, columns, editors and PCS components; Rollup/Storybook |
| `isp-ui-template` | React 19/Vite 7 template; minimal, ISP App and ISP Admin starters |
| `ispmini` | Local platform Docker Compose environment |
| `isvd-releases` | ISVD release instructions |
| `kkd-admin-ui` | Custom admin: configs/models/scripts/flows/users/roles; RTK Query, ISP UI, Monaco and React Flow |
| `kkd-releases` | KKD release instructions and supporting Go code |
| `kri-admin-ui` | No application source available for substantive analysis |
| `kvn-demo-service` | Go-embedded chat demo; TanStack Query and Ant Design |
| `kvn-service` | Go users/chats/messages service; KVN API contract source |
| `kvn-ui` | Chat/message SPA; TanStack Query, Ant Design, custom layout/router |
| `larchie-admin-ui` | AdminBase: accounts/statistics/prompts/datasets/experiments/billing; API extensions, guards and agent docs |
| `larchie-onboarding-ui` | Custom onboarding: TanStack Query, React Hook Form, i18next, analytics and progress recovery |
| `larchie-releases` | Current and archived Larchie release instructions |
| `mdm-admin-ui` | AdminBase plus flow debugging, custom APIs and shared profile |
| `msp-admin-ui` | Legacy React 16/Ant Design 3 in app/js; maintenance reference only |
| `my-transcription` | Next.js media upload, processing, preview and transcription |
| `next-app` | Next.js user pages and TanStack Query; separate lifecycle from Vite |
| `pdp-admin-ui` | AdminBase: application settings, protocols/PDF, placeholders/CSV specs; shared store and guards |
| `pdp-business-cfg` | Business configuration, Go generators, scripts and Jest; not a UI |
| `pdp-specification-ui` | AdminBase CSV specifications; functionality also moved to pdp-admin-ui |
| `react-scheduler` | Scheduling chart library and demo; Scheduler/type exports |
| `rid-ui` | AdminBase: employees/projects/constraints/calculations/Gantt; RTK Query and Zustand |
| `service-registry` | Go/JSON service registry; infrastructure context |
| `telegram-training-diary` | Next.js Telegram Mini App: workouts/calendar/statistics; Prisma/PostgreSQL |
| `telegram-trip-mini-app` | Next.js Telegram Mini App: trips, Firebase and Ant Design |

## Template decisions

- `minimal`: small React/TypeScript/Vite SPA without mandatory auth, Redux, Ant Design or editors.
- `isp-app`: custom ISP shell/session/permissions, shared RTK Query API and CRUD. References: EKG, KKD, mapping and stress.
- `isp-admin`: AdminBase + baseSetupStore, library-owned authentication/profile/router and custom sections. References: ISP, PDP, MDM, RID, Larchie and election admin/printer.
- All three are independent, have explicit demos where applicable, aligned env names, a local generator and the original Docker/nginx/entrypoint deployment contract with container tests.
- Go and Next.js are outside scope by user decision. Libraries, release repositories and infrastructure are references, not preset dependencies.

## Reusable references

Paths are relative to neighboring checkouts; generated projects must remain independent.

| Task | Reference |
| --- | --- |
| Admin bootstrap | `isp-admin-ui/src/index.tsx` |
| Extend shared store/API | `pdp-admin-ui/src/stores/index.ts` |
| Routes/menu/direct-URL guards | `pdp-admin-ui/src/routes/index.tsx`, `src/components/PageAccessGuard` |
| Larger admin/API extensions | `larchie-admin-ui/src/index.tsx`, `src/services/usersApi.ts` |
| Shared custom API | `isp-mapping-ui/src/services/baseApi.ts` |
| CRUD/forms | `kkd-admin-ui/src/pages/GroupsPage`, `src/components/GroupModal` |
| Custom ISP layout | `ekg-ui/src/components/LayoutComponent`, `kkd-admin-ui/src/components/Layout` |
| Connection lifecycle | `ekg-ui/src/services/socketService.ts` |
| Bootstrap separation | `isp-mapping-ui/src/app` |
| Onboarding/i18n | `larchie-onboarding-ui/src/pages/HomePage`, `src/i18n.ts` |
| Agent documentation | `pdp-admin-ui/AGENTS.md`, `docs/ai`; `larchie-admin-ui/AGENTS.md`, `docs` |
| Frontend conventions | `agentik/skills/front` |

Trace actual imports from `index.html`; unused App/HomePage files do not establish architecture.

## Integration constraints

Check installed peers/types: checkouts span React 16/18/19, Ant Design 3/5/6 and Router 6/7. ISP UI requires compatible Ant Design; AdminBase's Router 6 peer contract must be respected. Do not bypass peer validation.

Choose one appropriate data/cache layer rather than importing every project's approach. Confirm each backend's session headers and 401/403 behavior; do not assume shared wire contracts or retry mutations without idempotency guarantees. Page guards, action permissions and backend checks are separate responsibilities.

Keep asset base, router basename, API and runtime config aligned at root and subdirectories. Default `PUBLIC_PATH` is `/`; agents must never derive it from directory/package/title. Runtime config is public and must serialize values safely. Demo is explicit; network failures remain visible.

Add Monaco, React Flow, charts, PDF, WebSocket, i18n or onboarding only when needed; account for installed ISP peers and bundle effects. App owns domain behavior; admin kit owns common admin mechanisms; UI kits own reusable components; template owns reproducible startup, configuration, integration examples and instructions. Keep agent instructions short and aligned with actual scripts/CI. Type/build checks and browser/container verification serve different purposes.
