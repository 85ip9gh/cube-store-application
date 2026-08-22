# Security gates: baseline

What the three gates found on their first run, before anything was fixed.

Captured 2026-08-21 local, from [run 32544605017](https://github.com/85ip9gh/cube-store-application/actions/runs/32544605017)
whose own timestamps are UTC and therefore read 2026-08-22,
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

---

# What was done about it

Added 2026-08-21. The baseline above is left exactly as first recorded. This
section says what happened to each finding, so the two can be read side by side.

## secrets: closed

The Stripe test key was rotated at Stripe, then removed from branch history with
`git filter-repo`. Verified before pushing: zero matches for the key pattern
against 102 before, 102 redaction markers, and **identical tree hashes on both
branches**, so only historical blobs moved and the current code is unchanged.
The gate passes.

**It is not fully gone.** `refs/pull/*` still carries the key, measured at 102
matches. GitHub pins every pull request's head commit and a force-push cannot
reach those refs, so only GitHub Support can purge them. **The rotation is what
closed the exposure. The scrub bought clean branch history and a green gate.**

## deps, filesystem: one fixed, twelve allowlisted

**`mongoose` was removed from `web-store/package.json`.** It is a MongoDB ODM
that cannot run in a browser, it was imported nowhere in `src/`, and it was
declared as a frontend dependency by mistake. Removing it dropped 17 packages
and cleared three CVEs including `CVE-2025-23061`, the only CRITICAL. That is a
fix, not a suppression.

The remaining twelve are Angular 16 and one dev-only transitive, and they are
allowlisted in `.trivyignore` with dated reasons. **The real fix for the Angular
block is a major-version migration**, since every published fix version is 19 or
later. The allowlist says so in its own header rather than pretending otherwise.

Each entry names why its specific path is unreachable, checked against this
repository rather than assumed: no SSR, no client hydration, no i18n, and a
read-only public deployment with no user-generated content. Four entries are
marked `[posture]` because they depend on that last property, which is a
deployment choice rather than a code property, and they must be reopened if the
demo ever accepts user content.

## deps, image: closed by deleting npm

**npm and yarn are removed from the production image**, in the same layer that
installs the dependencies. The container runs `node index.js` and its healthcheck
runs `node -e`, so neither tool is needed at runtime. This clears all 18
node-pkg findings, including `CVE-2026-59873`, because every one of them
belonged to npm's own bundled dependencies rather than to this application.

Surface reduction rather than suppression, and the image gets smaller as a side
effect.

That left the two Alpine findings, both `CVE-2026-45447` in `libcrypto3` and
`libssl3`. `node:20-alpine` ships openssl 3.5.6-r0 while Alpine has already
published 3.5.7-r0, so this was **the base image lagging its own distribution**
rather than a vulnerability with no answer. The Dockerfile now pulls those two
patched packages instead of waiting for the node image to rebuild. Targeted
rather than a blanket `apk upgrade`, so the drift stays readable, and it becomes
a no-op once the base image catches up.

The image scan is clean.

## iac: two fixed, two skipped in place

- `deploy/g7/Dockerfile` now declares its `HEALTHCHECK`. It always had one, but
  it lived in `compose.yaml` where a scanner reading the image cannot see it.
  It is now in both, so the image is self-describing wherever it runs.
- `web-store/server/Dockerfile` now sets `USER node` and a healthcheck, with
  `--chown=node:node` on the copies so the unprivileged user owns `/app`.
- `web-store/Dockerfile` carries two dated `#checkov:skip` comments instead.
  **It is dead code.** Nothing in the repository builds it, its only reference
  is `web-store/docker-compose.yml`, which pulls prebuilt Docker Hub images, and
  the workflow that published those was retired in PR #5. Making its nginx stage
  non-root needs a listen-port change and config this repository does not carry.
  Adding an untested `USER` to an image nothing builds would satisfy the scanner
  while risking a broken image. **Deleting the file is the correct fix and is
  not done here because it is a separate decision.**

## Proving the gates block, and the blind spot it found

Three gates passing is not evidence that three gates work. It can equally mean
they are looking at nothing. So each one was deliberately broken on a throwaway
branch: a fabricated Stripe-shaped string, `lodash@4.17.15` with known HIGH
advisories, and a Dockerfile with no `USER` and no `HEALTHCHECK`.

**Two caught their defect. Checkov did not.** The planted Dockerfile sat in
`.gate-proof` and passed cleanly. Moving that identical file to a visible path
made it fail immediately.

**Checkov skips dot-directories by default.** `.devcontainer/Dockerfile` is the
ordinary real case that would never have been scanned, and the gate would have
gone on reporting green while not looking. `CKV_IGNORE_HIDDEN_DIRECTORIES=false`
turns that off, with `.git` skipped explicitly because walking the object store
finds nothing and costs time.

Retested with the planted Dockerfile back inside the hidden directory: all three
gates fail. **That is the only reason there is any evidence these gates enforce
anything**, and it is worth more than the green run that preceded it.

## Still open

- The Angular 16 major-version migration, which is the real answer to twelve of
  the allowlist entries.
- `web-store/Dockerfile`, `web-store/docker-compose.yml` and
  `web-store/docker-entrypoint.sh` should be deleted as dead code.
- `web-store/server/node_modules` is still committed, 2,403 of 2,559 tracked
  files, and stale enough that `node index.js` fails on it with a missing
  `helmet`.
- `@stripe/stripe-js` is unused since the checkout moved to a session-URL
  redirect, but stays in `package.json`.
