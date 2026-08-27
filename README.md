# example-typescript-package

<!-- REPLACE: point these at your own package name -->
[![NPM version](https://img.shields.io/npm/v/example-typescript-package.svg?style=flat-square)](https://www.npmjs.com/package/example-typescript-package)
![NPM Downloads](https://img.shields.io/npm/dm/example-typescript-package)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Template for creating a new NPM package with ESM and CJS support.

## Toolchain

| Concern          | Tool                                                          |
| ---------------- | ------------------------------------------------------------- |
| Package manager  | [bun](https://bun.sh)                                          |
| Bundler          | [tsdown](https://tsdown.dev) (Rolldown)                        |
| Type checking    | TypeScript 7 (native compiler)                                 |
| Lint / format    | [biome](https://biomejs.dev)                                   |
| Tests            | [vitest](https://vitest.dev)                                   |
| Task runner      | [turbo](https://turbo.build)                                   |
| Versioning       | [changesets](https://github.com/changesets/changesets)         |
| Publishing       | npm OIDC trusted publishing (no long-lived token)              |

`bunfig.toml` sets `[run] bun = true`, so every script and `node_modules/.bin`
entry executes under Bun's runtime rather than deferring to its
`#!/usr/bin/env node` shebang. Building, type checking, linting and testing all
work with no Node.js installed at all.

The one exception is publishing: changesets shells out to the npm CLI, and npm
is what implements OIDC trusted publishing. So `release.yml` and
`release-snapshot.yml` still set up Node; `lint.yml` and `test.yml` do not.

## Install

- `bun install`
- `bunx lefthook install`

## Setup

Rename first — everything below assumes the package is no longer called
`example-typescript-package`:

- `package.json`: `name`, `description`, `version`, `author`, `keywords`,
  `repository`, `bugs`, `homepage`
- `.changeset/config.json`: the `repo` field
- `README.md`: the badge URLs above
- `LICENSE`: the copyright holder

`engines.node` is set to `>=26`, and `@types/node` is pinned to the matching
`26.x` line. Keep those two in step when you bump either — pairing an `engines`
floor with newer `@types/node` lets TypeScript accept APIs that do not exist on
the Node version you claim to support.

`engines.node` is the single source of truth for the Node version:

- the tsdown build target is derived from it (`node26`), so it cannot drift
- CI reads it via `node-version-file: package.json`, so no workflow pins a version
- `@types/node` is the one copy that cannot be derived, so
  `scripts/verify-engines.ts` asserts its major matches. It runs as part of
  `lint:packages`, which means pre-commit and every CI workflow already cover it

Change `engines.node` and everything else follows, except `@types/node`, which
the check will tell you to update.

Targeting the runtime beats targeting an ES year: an ES year still downlevels
syntax that postdates it — `using` declarations compile to ~1.8 kB of helpers
under `es2025`, versus 170 bytes emitted natively under `node26`.
`tsconfig.json` uses `ESNext` for `target`/`lib` so type checking allows
everything the runtime supports.

Note that Node 26 is the *Current* line; it becomes LTS in October 2026. Until
then this template asks consumers to run a non-LTS Node. If that floor is too
high for your package, lower `engines.node`, `@types/node` and the tsdown
`target` together.

In GitHub settings:

- `Actions > General > Workflow permissions`
  * `Read and write permissions`
  * `Allow GitHub Actions to create and approve pull requests`

On npmjs.com, for the package you are publishing:

- `Settings > Trusted publisher`
  * Publisher: `GitHub Actions`
  * Repository: your `owner/repo`
  * Workflow filename: `release.yml`

Trusted publishing replaces `NPM_TOKEN`. The package must already exist on npm
before a trusted publisher can be attached, so the very first release needs a
manual `npm publish` (or a temporary token).

## Development workflow / Add a new CHANGELOG.md entry + package versioning

- Create a branch and make changes.
- Create a new changeset entry: `bun run changeset`
- Commit your changes and create a pull request.
- Merge the pull request
- A new PR will be created with the changeset entry/ies.
- When the PR is merged, the package versions will be bumped and published and the changelog updated.

## Scripts

| Script                    | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `bun run build`           | Bundle to `dist/`, then validate with publint + attw |
| `bun run test`            | Run the test suite once                              |
| `bun run test:watch`      | Run the test suite in watch mode                     |
| `bun run verify-types`    | Type check without emitting                          |
| `bun run lint`            | Lint and format `src/`                               |
| `bun run lint:packages`   | Check `package.json` dependency ranges               |
| `bun run syncpack:update` | Update all dependencies to their latest versions     |
