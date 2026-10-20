# AGENTS.md

## What this is

NestJS 11 REST API that serves Bible verses by **scraping YouVersion/bible.com at request time** (axios + cheerio). No database — the only local data is static JSON.

- Entry point: `src/main.ts` (Swagger UI at `/docs`, global `ValidationPipe`, port `PORT` or 3000).
- Endpoints (`src/verse/verse.controller.ts`): `GET /verse`, `GET /verse/random`, `GET /verse/today`.
- All bible.com fetching/parsing lives in `src/core/utils/verse.utils.ts`; book/version lookup in `src/core/utils/db.utils.ts` backed by `src/core/db/books.json` and `versions.json`.
- Runtime behavior requires internet access; tests do not hit the network.
- Deployed on Vercel: `vercel.json` builds `src/main.ts` directly with `@vercel/node` (not `dist/`). Don't "fix" the build config to point at `dist/main`.

## Commands

- `npm run start:dev` — dev server with watch
- `npm run build` — `nest build` → `dist/`
- `npm run lint` — eslint (typed lint via `projectService`) with `--fix`; covers `src` and `test`
- `npm run format` — prettier write
- `npm test` — unit tests. Jest config is inline in `package.json`; `rootDir` is `src`, so only `src/**/*.spec.ts` runs.
- `npm run test:e2e` — e2e tests via `test/jest-e2e.json` (`test/*.e2e-spec.ts`)
- Single test: `npx jest src/verse/verse.service.spec.ts`, or `npx jest -t "test name"`

There is no CI (`.github/` does not exist), no typecheck script (`tsc` runs via `nest build`), and no codegen/migrations.

## Test status — verify before blaming your change

All 4 test suites failed as of Oct 2026, pre-existing:

- `src/app.controller.spec.ts` and `test/app.e2e-spec.ts` expect `'Hello World!'`, but `AppService.getHello()` returns `"Hello World! We're live... Check docs (/docs)"`.
- `src/verse/verse.controller.spec.ts` omits `VerseService` and `src/verse/verse.service.spec.ts` omits `CacheService` from the testing module → Nest DI resolution errors.

`npm run test:e2e` also **hangs after tests finish**: the spec never closes the Nest app, and `CacheService.onModuleInit` schedules a `setInterval` to local midnight that keeps the event loop alive. Use `npx jest --config ./test/jest-e2e.json --forceExit` for a terminating run.

## Conventions & gotchas

- Indentation is **tabs**, single quotes, trailing commas (`.prettierrc`, `.editorconfig`). Some older files use spaces; follow the file you're editing.
- ESLint's prettier rule is off (`prettier/prettier: 'off'`); formatting is enforced only by `npm run format`.
- Line endings: the working tree currently has CRLF while the git index has LF, so `git diff` shows every line of most files as changed. Don't commit whole-file line-ending churn alongside real changes.
- Services `return` (not throw) `BadRequestException` / `InternalServerErrorException` instances from some paths — Nest handles this, but don't "clean it up" into a different error contract without checking callers.
- `SUPPORTED_LANGUAGES` (`['en', 'fr']`), `DEFAULT_VERSIONS` (KJV/LSG), and apocrypha book handling live in `src/core/constants/` and `src/core/types/`. Adding a language means updating the JSON DBs plus these constants.
- README documents the public API surface and is kept fairly current; keep it in sync when changing endpoints or query params.
