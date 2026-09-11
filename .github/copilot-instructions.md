# Copilot instructions

## Repository scope

- This repository contains two intentionally separate concerns:
  - A dependency-free Node.js 24 HTTP API in `src/`, with tests in `test/`.
  - A generic Java application delivery template in `.github/workflows/ci_process.yml`.
- Treat `package.json` and `.github/workflows/node-ci.yml` as authoritative for Node.js application validation.
- Treat [`.github/workflows/ci_process.yml`](workflows/ci_process.yml) as authoritative for Java build settings, delivery stages, job dependencies, artifact and image coordinates, security scans, and deployment behavior.

## Node.js development

- Use Node.js 24 or later and install dependencies with `npm ci` when a lockfile is present.
- Run linting with `npm run lint`.
- Run the full test suite with `npm test`; run it with coverage using `npm run test:coverage`.
- Run a single test file with `node --test test/app.test.js` or `node --test test/config.test.js`.
- Run a test selected by name with `node --test --test-name-pattern="<pattern>"`.
- The application uses ES modules and Node's built-in HTTP and test modules. Do not add a web framework or test framework unless the task requires capabilities the built-in modules cannot reasonably provide.

## Node.js architecture

- `src/app.js` constructs and returns the HTTP server without binding a port. Keep it independently startable on an ephemeral port in tests.
- `src/server.js` is the process entry point and owns configuration loading, listening, startup logging, and startup error handling.
- `src/config.js` owns environment parsing and validation. Keep configuration helpers pure and independently testable.
- API responses are JSON. Preserve the existing `{ "status": "ok" }`, `{ "error": "not_found" }`, and `{ "error": "method_not_allowed" }` response contracts unless an API change is intentional and covered by tests.

## Workflow boundaries

- `.github/workflows/node-ci.yml` validates the Node.js application with deterministic installation, linting, and coverage tests.
- Do not route Node.js validation through the Maven-based jobs in `ci_process.yml`.
- Do not convert, remove, or restructure the Java delivery workflow while changing the Node.js application unless the task explicitly requests a delivery-pipeline migration.
- When changing branch triggers shared by both workflows, keep their intended push and pull-request coverage aligned unless the task requires different behavior.

## CI/CD architecture

- The workflow delegates every stage to reusable workflows pinned to `v2.4.0`. Keep that version aligned across the reusable workflow calls unless upgrading the pipeline as a unit.
- The job graph is `prepare` -> `build` -> `sonarqube` -> `publish` -> `docker` -> `cxone-security-quality-gate` -> `cxone-container-security` -> `sign` -> `helm`.
- `prepare` resolves the version used by artifact publication, Docker packaging, and Helm publication. `publish` may emit `snapshot_version`; Docker falls back to the prepared version when that output is absent.
- The Docker job emits `image-tag`. Both CxOne jobs, container signing, and Helm publication consume that exact tag; preserve these output references and `needs` edges when changing the graph.
- The target runtime/toolchain is Java 25. The current Maven artifact ID and container image name are both `generic-app`.
- The delivery path is Maven artifact publication to JFrog, container build and publication, SAST/SCA and container scans, container signing, then Helm chart publication.
- The current image coordinate is `sdocker-dev.docker.dev/generic-app`. The Helm chart is expected at `charts/generic-app` and published under the `generic-app` target folder.

## Workflow conventions

- CI runs for pushes to `main` and branches matching `feature/reusable*`, for pull requests targeting `main`, and by manual dispatch.
- Concurrency is grouped by Git ref. New runs cancel an in-progress run for non-`main` refs, but not for `main`.
- Docker deployment environment selection is ref-based: `main` uses `production`; all other refs use `development`.
- The workflow is a generic template. When specializing it, update the application identity consistently across the workflow name, concurrency group, `PROJECT_NAME`, SonarQube identifiers, Maven artifact ID, Docker image and URI, CxOne project fields, and Helm chart directory/target.
- SonarQube and CxOne quality gates are currently report-only (`fail-on-quality-gate: false`). Preserve that setting unless rollout policy is intentionally changed; the workflow comments identify enabling enforcement before UAT and production as the intended future state.
- CxOne scanning is intentionally split into sequential SAST/SCA and container-security jobs. Both exclude `test` and scan the image produced by Docker.
- Helm publication runs only outside pull requests.
- Keep credentials in GitHub Actions secrets and pass only the minimum secrets required by each reusable workflow. Existing integrations use `JFROG_*`, `SONAR_*`, `CXONE_*`, and `SIGNUM_*` secrets.
- Preserve the branch comments that describe intentionally disabled broader `feature/*` triggers unless those triggers are deliberately enabled.
