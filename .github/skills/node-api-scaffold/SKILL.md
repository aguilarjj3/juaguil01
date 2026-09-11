---
name: node-api-scaffold
description: Scaffold or repair this repository's dependency-free Node.js 24 HTTP API, tests, ESLint, and Node validation workflow while preserving the separate Java delivery pipeline.
user-invocable: true
disable-model-invocation: false
allowed-tools:
  - view
  - glob
  - rg
  - apply_patch
  - powershell
tags:
  - nodejs
  - api
  - testing
  - linting
  - ci
generated-by: forge-agent
---

# Node API Scaffold

## Purpose

Create or restore the repository's validated Node.js API baseline. This is a
**compositional** skill: it coordinates project metadata, native HTTP
architecture, tests, linting, CI validation, documentation, and final
verification.

## Conditions (C)

Use this skill when a task asks to initialize, rebuild, or repair the Node.js
API structure, tests, linting, or basic Node CI in this repository.

Required assumptions:

- The runtime baseline is Node.js 24 or later.
- The application uses ES modules.
- The API should remain dependency-free unless the task explicitly requires a
  capability that Node's built-in modules cannot reasonably provide.
- `.github/workflows/ci_process.yml` remains the separate Java delivery
  template.

Do not use this skill for:

- A feature-only change that does not affect project structure or validation.
- Migrating the Java delivery workflow to Node.js.
- Adding Docker, Helm, persistence, authentication, or a web framework unless
  the task explicitly requests it.

## Interface (R)

Invoke with:

- `target` (optional): repository root; default is the current repository.
- `healthPath` (optional): health endpoint; default `/health`.
- `defaultPort` (optional): validated default TCP port; default `3000`.
- `ciMode` (optional): `preserve-java-and-add-node` by default.
- `requestedChanges` (required): the user's requested scaffold, repair, or
  validation changes.

Expected artifacts, as applicable:

- `package.json` and `package-lock.json`
- `eslint.config.js`
- `src/app.js`, `src/server.js`, and `src/config.js`
- `test/*.test.js`
- `.github/workflows/node-ci.yml`
- `.gitignore` and `README.md`

Output a working scaffold plus concise verification results. Do not commit
unless explicitly requested.

## Policy (π)

1. **Adapt to the current task.**
   - Read the task and repository instructions completely.
   - List the requested files, endpoints, runtime values, scripts, and CI
     boundaries.
   - Map task-specific values to the Interface parameters. Use `/health`,
     port `3000`, and `preserve-java-and-add-node` only when the task does not
     override them.
   - Inspect existing files before editing and preserve unrelated worktree
     changes.

2. **Establish project metadata.**
   - Set `"type": "module"` and `"engines": { "node": ">=24" }`.
   - Provide these scripts unless the task requires different names:
     - `"start": "node src/server.js"`
     - `"dev": "node --watch src/server.js"`
     - `"test": "node --test"`
     - `"test:coverage": "node --test --experimental-test-coverage"`
     - `"lint": "eslint ."`
   - Use ESLint flat configuration with `@eslint/js`, `eslint`, and `globals`
     as development dependencies.
   - Keep runtime dependencies empty for the native HTTP baseline.

3. **Preserve the application boundaries.**
   - Make `src/app.js` construct and return the HTTP server without listening.
   - Make `src/server.js` load configuration, listen, log startup, and surface
     startup errors.
   - Make `src/config.js` parse environment values with pure, independently
     testable helpers.
   - Validate `PORT` as a decimal integer from `1` through `65535`; use the
     `defaultPort` only when `PORT` is unset or empty.

4. **Implement the initial HTTP contract.**
   - Use `node:http`.
   - Return JSON with `application/json; charset=utf-8`.
   - Return `{ "status": "ok" }` with status `200` for `GET healthPath`.
   - Return `{ "error": "method_not_allowed" }`, status `405`, and
     `Allow: GET` for unsupported methods on `healthPath`.
   - Return `{ "error": "not_found" }` with status `404` for unknown paths.

5. **Add deterministic tests.**
   - Use `node:test`, `node:assert/strict`, and an ephemeral loopback port.
   - Close each server through the test context cleanup hook.
   - Assert status, JSON content type, headers, and exact response bodies for
     health, unknown-route, and unsupported-method behavior.
   - Test default, valid, and invalid port parsing, including `0`, `65536`,
     negative, fractional, and nonnumeric values.
   - Run one file with `node --test test/app.test.js`; select one test with
     `node --test --test-name-pattern="<pattern>"`.

6. **Configure linting.**
   - Use ESLint's flat configuration and `@eslint/js` recommended rules.
   - Enable current Node globals and ES modules for `**/*.js`.
   - Ignore `node_modules/**` and `coverage/**`.

7. **Wire Node validation without changing Java delivery.**
   - Use Node `24`, `actions/checkout@v4`, and `actions/setup-node@v4`.
   - Enable npm caching, run `npm ci`, then `npm run lint`, then
     `npm run test:coverage`.
   - Keep `.github/workflows/ci_process.yml` unchanged unless migration is an
     explicit task requirement.
   - Preserve the existing `main` and `feature/reusable*` push coverage and
     `main` pull-request coverage unless the task changes branch policy.

8. **Document the usable interface.**
   - Document Node 24, `npm install` or `npm ci`, start/watch commands, `PORT`,
     the health contract, lint/test commands, and the separation between Node
     validation and Java delivery.

9. **Recover from local environment failures.**
   - If `node` is unavailable, inspect common installation paths and available
     package managers before concluding validation is blocked.
   - On Windows, after installing Node, add `C:\Program Files\nodejs` to the
     current command's `PATH` when the fresh shell has not inherited it.
   - Install tooling only when missing; do not silently lower the Node 24
     baseline.
   - If a check fails, fix the introduced issue and rerun the smallest failing
     check before the complete validation sequence.

10. **Verify the result.**
    - Generate and retain `package-lock.json`.
    - Run `npm ci --no-audit --no-fund`.
    - Run `npm run lint`.
    - Run `npm run test:coverage`; require all tests to pass.
    - Start the server on a non-default valid port and request `healthPath`;
      require the exact healthy JSON response.
    - Run `git diff --check`.
    - Confirm `git diff -- .github/workflows/ci_process.yml` is empty unless
      Java workflow migration was explicitly requested.

11. **Verify output constraints.**
    - Re-read the task before finalizing.
    - Confirm every required file path, endpoint, command, runtime version,
      response field, workflow boundary, and requested output format is
      satisfied.
    - If the task or tests define a different contract, the task and test
      oracle override this skill's defaults.

## Termination (T)

Success requires all applicable artifacts to exist, deterministic installation
to succeed, linting to pass, all tests to pass, the live health request to
return the exact expected JSON, `git diff --check` to pass, and the Java
delivery workflow to remain unchanged unless migration was requested.

Failure is any unmet requested artifact, unresolved lint/test/install error,
failed smoke test, invalid response contract, or unintended Java workflow
change. On failure, retain the strongest validated state, report the exact
blocker, and do not claim completion.

## Always do

- Read repository instructions and existing files before editing.
- Keep server construction separate from process startup.
- Use ephemeral ports in tests and close test servers.
- Preserve explicit error behavior and exact JSON contracts.
- Verify both automated checks and a live request.
- Reconcile this skill with the current task and its tests before finalizing.

## Never do

- Never replace the Java delivery workflow as an incidental Node change.
- Never add Express, Fastify, Jest, or another framework by default.
- Never hardcode a test port that can collide with another process.
- Never accept invalid `PORT` values through silent fallback.
- Never claim success after generating files without running validation.
- Never overwrite unrelated worktree changes.

## Gotchas / edge cases

- A newly installed Node executable may not appear on `PATH` in the current
  Windows shell; set the command-local path and verify `node --version`.
- `server.address()` can return a string or `null`; tests must guard before
  reading the assigned port.
- Await the server's `listening` and `close` events to avoid race conditions.
- Node's coverage report can include branch coverage below 100% while line
  coverage is complete; obey any explicit threshold in the current task.
- Derived behavior and response contracts in this skill reflect the repository
  baseline. Always verify them against the current task's tests or
  specification.

## Assets and scripts

No scripts or assets are included. The observed commands are short,
repository-specific validation steps and do not pass the script extraction
test.

## Scope boundaries

This skill covers the initial native Node.js API scaffold and its validation
surfaces. It does not define application-domain routes, production deployment,
the Java build implementation, artifact publication, security-gate policy, or
Helm packaging.
