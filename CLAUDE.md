# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev          # dev server, watch mode
npm run lint                # eslint --fix on src/test
npm run format               # prettier --write on src/test

npm test                     # unit tests (jest, all *.spec.ts)
npm test -- path/to.spec.ts  # single test file
npm test -- -t "name"        # single test by name
npm run test:watch
npm run test:cov
npm run test:e2e             # e2e tests, uses test/jest-e2e.json

npm run build                # nest build -> dist/

npm run migration:generate --name=AddFoo   # builds first, writes to src/shared/infrastructure/database/migrations
npm run migration:run
npm run migration:revert
```

Husky hooks already enforce quality gates: `pre-commit` runs lint-staged, `commit-msg` runs commitlint (Conventional Commits, enforced types: feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert, header ≤100 chars), `pre-push` runs `tsc --noEmit` + `npm test`. Don't bypass these with `--no-verify`.

## Architecture

This is DDD + Clean Architecture on NestJS. Every feature lives in `src/modules/<name>/` with four layers, each with hard import boundaries enforced by `eslint.config.mjs` (`no-restricted-imports` per directory glob — violations are lint errors, not style nits):

- **domain/** — entities, value objects, domain exceptions. Pure TypeScript only: no `@nestjs/*`, no `typeorm`, no `express`, no `class-validator`/`class-transformer`. Cannot import application/infrastructure/presentation, or `error-codes.ts` (only the composition root and specs touch the error catalog).
- **application/** — use cases (`UseCase<TInput, TOutput>`), the module's `QueryService` port, and its read-model (`View`) interface. No persistence/HTTP imports. Cannot import infrastructure/presentation.
- **infrastructure/** — TypeORM entities, mappers, repository/query-service implementations. Free to import anything below it.
- **presentation/** — controllers, DTOs. Talks to use cases only; cannot import `typeorm`/`@nestjs/typeorm` or anything under `infrastructure/`.

`src/shared/` mirrors the same four layers for cross-module kernel code, with the same boundary rules, plus: nothing under `shared/` may import from `src/modules/**` or `error-codes.ts`.

Use `/create-api` to scaffold a new feature end-to-end (route → controller → service → repository → DTO → migration → Swagger) following these conventions, rather than hand-rolling the stack.

### CQS (command/query split within a module)

Writes and reads never share a path:

- **Write side**: `Repository<TEntity>` port (`domain/*.repository.ts`) → `TypeOrmBaseRepository` impl (`infrastructure/persistence/*.typeorm-repository.ts`). Loads/saves whole aggregates; `delete()` is a soft delete (`softDelete`, backed by `DeleteDateColumn`) — load the aggregate first so its deletion rules run.
- **Read side**: `QueryService<TView>` port (`application/*.query.ts`) → `TypeOrmBaseQueryService` impl (`infrastructure/persistence/*.typeorm-query.ts`). Returns plain read-model `View`s straight from storage, never aggregates. Implement `toView()`; `findAll` already paginates via `Paginated<T>`.

Both ports are bound in the module (`todo.module.ts`) via DI symbols (`TODO_REPOSITORY`, `TODO_QUERY_SERVICE`) — `@Inject(SYMBOL)` on the interface type, concrete class behind it. Follow this symbol-token pattern for any new port.

A use case that creates/updates typically calls the repository to persist, then the query service (`getXViewOrThrow`-style helper) to return the up-to-date view — see `create-todo.use-case.ts`.

### Domain model base classes (`src/shared/domain/`)

- `Entity<TProps>` — id is a server-generated UUID (`randomUUID()`), `isActive` flag, `equals()` by id + constructor.
- `AggregateRoot<TProps>` extends `Entity`, adds a domain-event buffer (`addDomainEvent`/`pullDomainEvents`).
- `ValueObject<TProps>` — props frozen in the constructor, structural `equals()`.
- Pattern per aggregate: a `static create(input)` for new instances (runs validation) and a `static restore(props, id, isActive)` for rehydrating from persistence (trusted, no re-validation) — see `Todo` / `TodoTitle`.

### Error handling pipeline

Each module throws a `DomainException` subclass carrying a `DomainErrorType` (VALIDATION/UNAUTHORIZED/FORBIDDEN/NOT_FOUND/CONFLICT/BUSINESS_RULE) and a string error key (domain language, e.g. `TODO_NOT_FOUND` — never a technical/DB reason, those surface as 500s). The global `HttpExceptionFilter` (`src/shared/presentation/http/`) maps the `DomainErrorType` to an HTTP status and the key to a numeric code via `resolveErrorKey` (`src/error-codes.ts`, the single catalog — `ErrorCodes` is `as const satisfies Record<number, ThrownErrorKey>`, so a duplicate _code_ fails the build and an unthrown key fails the build too). A key thrown but missing from the catalog is sent as `900001 UNREGISTERED_ERROR_KEY` and logged — add the key to `error-codes.ts` in the same change that adds the exception.

When adding a module error: add the key to that module's `*ErrorKeyType` object next to the exception that throws it, then register its numeric code in `src/error-codes.ts` (ranges are assigned per module, e.g. `1001xx` for todo — see the comment there for the next free range). Never reuse a retired code.

All controller responses pass through `ApiResponseInterceptor`, which wraps results into `{ data, status }` (or `{ data, links, meta, status }` for a `Paginated` return) — don't hand-build response envelopes in controllers.

### Validation

`AppValidationPipe` (global, via `APP_PIPE`) is `whitelist + forbidNonWhitelisted + transform`; DTO validation failures raise `RequestValidationException`, caught separately in the filter from domain errors. DTOs use `class-validator`.

### Module wiring

A feature module (`*.module.ts`) registers: `TypeOrmModule.forFeature([OrmEntity])`, the controller, the mapper, the repository/query-service bound to their DI symbols, and each use case as a provider. Mirror `todo.module.ts` for new modules, and wire path aliases (`@/*`, `@shared/*`, `@config/*` — defined once in `tsconfig.json`, reused by `jest.config.ts` via `pathsToModuleNameMapper`) rather than relative `../../../` imports across module boundaries.

### Config

`src/config/configuration.ts` is the one place reading `process.env` (loaded via `ConfigModule.forRoot({ isGlobal: true, load: [configuration] })`); inject `ConfigService` elsewhere, don't read `process.env` directly. `envFilePath` switches to `.env.test` when `NODE_ENV=test`. The TypeORM CLI data source (`shared/infrastructure/database/data-source.ts`) runs outside Nest against compiled `dist/` output and discovers entities by filename glob (`**/*.orm-entity.js`) since it has no access to `forFeature()`.

### ORM entities

All TypeORM entities extend `BaseOrmEntity` (`shared/infrastructure/database/base.orm-entity.ts`): `id` (uuid, set by the domain layer — plain `PrimaryColumn`, not generated), `isActive`, full audit columns (`createdDate/By`, `updatedDate/By`, `deletedDate/By` as snake_case DB columns). `deletedDate` is a `DeleteDateColumn`, so soft-deleted rows are excluded from `find*` automatically. Mappers leave audit columns `undefined` on `toPersistence()` so updates don't clobber their stored values.

## Code style

- Tabs, single quotes, semicolons, trailing commas, 100-char print width (prettier-enforced, `prettier/prettier: error` in eslint).
- Comments explain _why_, not _what_ — this codebase already follows that; match it (e.g. the audit-column comment in `todo.mapper.ts`, the soft-delete comment in `typeorm.repository.base.ts`).
