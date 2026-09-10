# Copilot instructions

## Repository scope

- This repository is currently a CI/CD orchestration template for a generic Java application.
- Treat [`.github/workflows/ci_process.yml`](workflows/ci_process.yml) as the authoritative source for build settings, delivery stages, job dependencies, artifact and image coordinates, security scans, and deployment behavior.

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
