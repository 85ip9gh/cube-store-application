# Security gates: baseline

What the three gates found on their first run, before anything was fixed.

Captured 2026-08-22 from [run 32544605017](https://github.com/85ip9gh/cube-store-application/actions/runs/32544605017)
on branch `security/supply-chain-gates`. Reports are attached to that run as
artifacts. This file is the permanent record, because artifacts expire.

All three gates failed. That was the expected outcome and the reason the
baseline was taken before any fix.

## secrets, gitleaks 8.30.1, full history

Four findings, all rule `stripe-access-token`, all the same Stripe **test** key
committed in 2024 and never rotated since.

| Commit | Date | File |
|---|---|---|
| `b8f2f22` | 2024-01-01 | `web-store/server/server.js` |
| `12f850b` | 2024-03-20 | `web-store/server/index.js` |
| `12f850b` | 2024-03-20 | `web-store/server/index.new.js` |
| `49e5593` | 2024-03-20 | `web-store/server/controllers/store.controller.js` |

The working tree is clean: PR #3 removed the key from the published controller.
Every one of these findings is reachable only through git history, which is
exactly why the gate scans history rather than the diff.

Checkout stays disabled until this key is rotated. The order matters: rotate at
Stripe first, then rewrite history. Rewriting first would leave a live value
behind if the scrub went wrong.

## deps, trivy 0.36, filesystem

17 vulnerabilities, 16 HIGH and 1 CRITICAL, all in one place.

| Target | Findings |
|---|---|
| `web-store/package-lock.json` | 17 (16 HIGH, 1 CRITICAL) |
| `web-store/server/package-lock.json` | 0 |

The backend is clean. Everything is in the Angular 16 frontend tree.

- **CRITICAL `CVE-2025-23061`, mongoose 8.2.1, search injection.** Fixed in
  8.9.5. Worth noting that `mongoose` is a MongoDB ODM and it is declared as a
  dependency of the *frontend* package, where it has no business being. Removing
  it is likely to be correct on its own merits and would clear the only
  CRITICAL.
- The 16 HIGH findings are Angular framework packages at 16.2.x: `@angular/common`
  (6 CVEs), `@angular/compiler`, `@angular/core`, plus a transitive `ip`
  (`CVE-2024-29415`). Angular 16 is out of support and every fix version is 19
  or later, so these close with a major-version migration, not a patch bump.

## deps, trivy 0.36, production image

The image built from `deploy/g7/Dockerfile`. Two separate groups.

| Target | Findings |
|---|---|
| `cubestore:scan` (alpine 3.23.4) | 2 HIGH |
| Node.js (node-pkg) | 18 (17 HIGH, 1 CRITICAL) |

- Alpine: `CVE-2026-45447` in `libcrypto3` and `libssl3` at 3.5.6-r0, fixed in
  3.5.7-r0. Closes on a base image rebuild.
- **None of the 18 node-pkg findings are application dependencies.** They are
  `brace-expansion`, `cross-spawn`, `glob`, `ip-address`, `minimatch`,
  `sigstore` and `tar`, which ship inside the `node:20-alpine` base image as
  bundled dependencies of the npm CLI. The CRITICAL is `CVE-2026-59873` in
  `tar` 6.2.1.

  The container runs `node index.js`. npm is a build-time tool and is not needed
  at runtime, so deleting it after `npm ci` removes all 18 findings and shrinks
  the image. That is a real reduction in attack surface rather than a
  suppression, and it is the recommended fix.

## iac, checkov 3.3.13

| Framework | Passed | Failed |
|---|---|---|
| dockerfile | 127 | 5 |
| github_actions | 128 | 0 |

The workflows are clean. All five failures are in Dockerfiles:

| Check | File |
|---|---|
| `CKV_DOCKER_2` no HEALTHCHECK | `deploy/g7/Dockerfile` |
| `CKV_DOCKER_2` no HEALTHCHECK | `web-store/Dockerfile` |
| `CKV_DOCKER_2` no HEALTHCHECK | `web-store/server/Dockerfile` |
| `CKV_DOCKER_3` no USER | `web-store/Dockerfile` |
| `CKV_DOCKER_3` no USER | `web-store/server/Dockerfile` |

`deploy/g7/Dockerfile` already sets `USER node`, which is why it appears once
rather than twice. Its healthcheck exists but is defined in `deploy/g7/compose.yaml`
rather than in the image, so checkov cannot see it. Moving it into the Dockerfile
would satisfy the check and make the image self-describing wherever it runs.

`web-store/Dockerfile` and `web-store/server/Dockerfile` are the older local
development images. Neither is used by the g7 deployment.

## Not covered by these gates

- **Compose files.** Checkov 3.3.13 has no `docker_compose` framework. Verified
  against the tool's own valid-framework list. `deploy/g7/compose.yaml` and
  `web-store/docker-compose.yml` are reviewed by hand.
- **`web-store/server/node_modules` is committed**, 2,403 of 2,559 tracked
  files. `web-store/.gitignore` lists it, which does nothing for paths that were
  already tracked. Trivy reads the lockfile rather than the vendored tree, so
  this did not distort the dependency numbers above, but it remains a repository
  hygiene problem worth its own change.
