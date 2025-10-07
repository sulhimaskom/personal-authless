# Repository Guidelines

Use this guide to contribute confidently to the Cloudflare-based MCP server hosted in this repo.

## Project Structure & Module Organization
- `src/index.ts`: entry point that registers MCP tools through the SDK.
- `src/github-handler.ts`, `src/utils.ts`, `src/workers-oauth-utils.ts`: GitHub OAuth handshake routes, helpers, and approval UI.
- `wrangler.jsonc` and `worker-configuration.d.ts`: Worker runtime config and generated types.
- `biome.json`, `tsconfig.json`, and `package.json`: shared tooling settings; keep updates minimal and well documented.
Place new source modules under `src/` and co-locate helper utilities or schemas near their consumers for quicker discovery.

## Build, Test, and Development Commands
- `npm run dev` (alias `npm start`): runs `wrangler dev` for a local Worker with live reload.
- `npm run deploy`: publishes the Worker via Wrangler using the active Cloudflare account.
- `npm run cf-typegen`: refreshes Cloudflare bindings and types after config changes.
- `npm run type-check`: verifies TypeScript without emitting JavaScript.
- `npm run format` / `npm run lint:fix`: applies Biome formatting and autofixes lint issues; run before submitting changes.

## Coding Style & Naming Conventions
TypeScript is required. Biome enforces 4-space indentation and a 100-character line width—do not override locally. Prefer `camelCase` for variables/functions, `PascalCase` for classes, Zod schemas, and exported tool names, and keep file names kebab-case. Use Biome’s autofix commands instead of manual tweaks whenever possible.

## Testing Guidelines
There is no dedicated test runner yet; rely on `npm run type-check`, targeted unit tests you add under `src/__tests__`, and manual validation through `npm run dev`. Name test files `<module>.test.ts` and prefer Zod validations or SDK mocks to cover tool behavior. Document any manual test steps in your PR description so others can reproduce them.

## Commit & Pull Request Guidelines
Write concise, imperative commit messages (e.g., "Add calculator tool binding"). For PRs, describe the change, list verification steps (commands run, manual checks), link related issues, and attach screenshots or logs if behavior is user-visible. Ensure CI passes locally before requesting review.

## Security & Configuration Tips
Do not commit secrets or account identifiers. Store `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `COOKIE_ENCRYPTION_KEY` via `wrangler secret put` and mirror them in `.dev.vars` for local work. Review Cloudflare access levels before deploying new tools to avoid exposing privileged operations, and update the `OAUTH_KV` binding IDs in `wrangler.jsonc` whenever you recreate the namespace.
