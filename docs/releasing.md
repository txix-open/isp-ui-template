# Releases

Use Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...`, `test(scope): ...`, `chore(scope): ...`. Mark incompatible changes with `!` and explain them in a `BREAKING CHANGE:` footer.

Use SemVer `MAJOR.MINOR.PATCH`: fixes increment patch; new compatible capabilities increment minor; incompatible changes increment major after 1.0. During 0.x development, incompatible changes increment minor and require migration notes. The first versioned release is `0.1.0`. Choose the highest bump required by the release as a whole, not one bump per commit. Documentation, formatting and internal refactoring without behavior changes do not require a version bump; a commit request alone does not imply a release.

For each template release:

1. Follow the KKD/EKG/ISP changelog format: newest `## X.Y.Z` first, without brackets, dates, a document preamble or an Unreleased section. Use Russian category bullets (`Добавлено`, `Изменено`, `Исправлено`, `Обновлено`, `Удалено`) with indented change bullets; omit empty categories. Put required migration steps under `Несовместимые изменения` first. Describe concrete behavior; keep release procedures in this guide. The user-facing root README and changelog are Russian; agent instructions and technical guides remain in English.
2. Synchronize the root and preset `package.json` versions, lockfile top-level versions and `packages[""].version`. Do not alter dependency versions as part of a metadata bump.
3. Run each starter's checks/build. For deployment changes run `npm run test:docker`; verify `build/version.json` matches each package version.
4. Commit release metadata as `chore(release): X.Y.Z`. Push and create/publish tags only when requested.

Generated applications start at `0.1.0` independently of the template release; do not overwrite their versions when updating the template. This repository has no automatic release publishing.
