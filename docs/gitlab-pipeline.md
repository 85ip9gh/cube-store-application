# The GitLab pipeline

The same three gates as `.github/workflows/security.yml`, running on GitLab CI
against a mirror of this repository. It exists so the gates are demonstrably not
a GitHub Actions trick.

**Status: the project, the mirror and the g7 runner all went live 2026-08-23.
The first pipeline ran that day and failed, on the workspace-ownership bug this
file now documents rather than on any gate.** `secrets` and `deps` passed, `iac`
never started. Nothing may claim GitLab CI as a skill until a pipeline is green.

The project is `gitlab.com/your-namespace/cube-store-application`. Two things about
the setup were not anticipated here and cost a round trip each:

- **Creating the project with a README made the first mirror push fail**, and
  not for the reason predicted below. `git push --force` handles the
  non-fast-forward fine. What blocks it is that GitLab protects the default
  branch on creation with force push disabled, so the push is refused by the
  pre-receive hook. `main` is unprotected on the GitLab side now, which is
  correct for a mirror nothing ever commits to.
- **GitLab.com requires identity verification before it will run any CI job**,
  including on a self-hosted runner. A brand new free account fails its first
  pipeline instantly with zero jobs and a valid YAML, which reads like a config
  error and is not one. Phone verification was enough; no card was needed.

## Why a mirror at all

GitLab pull mirroring, where GitLab fetches from GitHub on a schedule, is a
Premium feature. Verified 2026-08-20. On the free tier the push has to come from
the GitHub side, which is what `.github/workflows/mirror-gitlab.yml` does on
every push to `main`.

One direction only. GitHub is the source of truth, GitLab is a read-only copy
that exists to run a pipeline, and nothing is ever merged on the GitLab side, so
there is no divergence to reconcile.

## What was proved locally, 2026-08-22

Every command in `.gitlab-ci.yml` was run against this repository before the file
was committed, on Docker 29.7.2. A pipeline that has never executed its own
commands is a guess.

| gate | command | result |
|---|---|---|
| secrets | gitleaks 8.30.1, full history | 125 commits scanned, no leaks, exit 0 |
| deps, filesystem | trivy 0.74.0 `filesystem` | 0 findings at HIGH or CRITICAL, exit 0 |
| deps, image | trivy 0.74.0 `image` on the staged production image | 0 findings at HIGH or CRITICAL, exit 0 |
| iac | checkov 3.3.13, four frameworks | 305 passed, 0 failed, exit 0 |

The 125 commits matter more than the zero. A shallow clone would have scanned a
handful and reported the same clean result.

## The one line to not delete

```yaml
GIT_DEPTH: "0"
```

GitLab shallow-clones by default, where GitHub Actions clones fully unless told
otherwise. The known Stripe test key predates these gates, so a truncated clone
would let the secret gate pass while the value is still reachable in the
published history of a public repository. This is the same requirement as
`fetch-depth: 0` on the GitHub side, and it is easier to lose here because the
unsafe behaviour is the default.

## Why a shell runner and not the docker executor

The image gate builds the production image from a context staged at job time.
With the docker executor that context exists only inside the job container, and
the host daemon it hands the build to cannot see the path, so the build fails on
a directory that visibly exists.

The usual answer is a privileged docker-in-docker service. Introducing a
privileged container in the name of supply-chain security is a poor trade, so
the runner is a shell runner instead: the workspace is a real path on the host,
the daemon can read it, and every scanner still runs from a pinned image.

The cost is stated rather than hidden. A shell runner executes job scripts
directly on g7 as the runner user. That is acceptable here because the machine
runs one person's own repositories and nothing accepts jobs from a fork or a
stranger. It would not be acceptable on a shared or public project.

## The second cost of the shell runner: root-owned files in the workspace

There is a subtler price, and the first real pipeline found it. A shell runner
keeps one build directory on the host, owned by `gitlab-runner`. Every scanner
here runs in a container as root. Any file a container creates in that mounted
workspace is therefore owned by `root`, and the runner cannot clean up after
itself on the next job:

```
chmod: changing permissions of '.../trivy-image.txt': Operation not permitted
ERROR: Job failed: exit status 1
```

That is `get_sources` failing, before the job's script runs at all. So the job
that gets blamed is whichever one is scheduled *after* the offender, which makes
it read as an intermittent failure in an unrelated gate. On 2026-08-23 it failed
`iac` and checkov was never invoked.

The rule this generalises to: **let the runner's shell create files, not the
container.** `trivy --output <file>` writes from inside the container and is the
trap. A plain `> <file>` redirect is performed by the shell as `gitlab-runner`
and is safe. `checkov ... | tee` was already safe for the same reason.

This does not apply to the GitHub Actions side, where every job gets a fresh VM
and there is no persistent workspace to poison. It is specific to this executor.

## What checkov's gitlab_ci framework actually buys

Very little, and the file says so where the flag is set.

It has four checks. `CKV_GITLABCI_2`, the double-pipeline rule, is real: proved
to block on 2026-08-22 by planting rules matching both `merge_request_event` and
`push`, which failed with exit 1. `CKV_GITLABCI_3` reports which images a job
uses. `CKV_GITLABCI_1` **cannot fire on any GitLab file at all**: reading the
check out of the 3.3.13 image shows it is a CircleCI class bound to
`jobs.*.steps[]` looking for a `run` key, and a GitLab job has `script`, never
`steps` or `run`. It is a permanent pass rather than a clean bill of health.

Nine gitlab_ci checks pass on this file against 148 on the GitHub Actions side.
Scanning the pipeline definition is worth doing and it is not worth much.

Same lesson as the dependency gate that first reported clean because it had
found nothing to read: a passing scanner is a claim about the scanner.

## Setup, in order

**All of this was completed 2026-08-23.** Kept because it is the reproducible
procedure for the next repository, not because anything here is outstanding.

1. **Create the GitLab account and an empty project.** Do not initialise it with
   a README. The real reason is not the non-fast-forward, which `--force`
   absorbs: it is that GitLab protects the default branch on creation with force
   push disabled, so the pre-receive hook refuses the first mirror push. If you
   have already made this mistake, unprotect `main` rather than recreating the
   project, since deleting it takes the project runner with it.
2. **Create a project access token** with the `write_repository` scope. Copy it
   once; GitLab does not show it again.
3. **Add two GitHub repository secrets** so the mirror workflow stops skipping:
   - `GITLAB_MIRROR_URL`, the plain `https://gitlab.com/<namespace>/<project>.git`
     with no credentials in it
   - `GITLAB_TOKEN`, the project access token
4. **Install and register the runner on g7**, tagged `g7`. Untagged jobs are
   refused by default and every job in `.gitlab-ci.yml` carries that tag.
   On g7 as of 2026-08-23: `gitlab-runner` 19.3.0, registered as `g7-shell`,
   service active, and in the `docker` group. Host is Ubuntu noble.

   ```bash
   # On g7.
   curl --silent --show-error --fail --location \
     https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
   sudo apt-get install --yes gitlab-runner
   ```

   ```bash
   # The runner authentication token comes from the GitLab project under
   # Settings, CI/CD, Runners, after creating a project runner with the tag g7.
   sudo gitlab-runner register \
     --non-interactive \
     --url https://gitlab.com/ \
     --token "<runner authentication token>" \
     --executor shell \
     --description "g7-shell"
   sudo usermod --append --groups docker gitlab-runner
   sudo systemctl restart gitlab-runner
   ```

   The `usermod` line is not optional. Every gate shells out to Docker, and
   without it each one fails on a permission denied against the socket. The
   package installs its own `gitlab-runner` user, which is not in that group.

   Note what this grants. Membership of the `docker` group is root-equivalent on
   the host, because anyone who can talk to the socket can start a privileged
   container. Combined with the shell executor it means a job script on this
   runner can do anything on g7. That is the trade accepted above and it is the
   reason this runner must never be attached to a project that accepts merge
   requests from strangers.

5. **Create the trivy cache directory** the pipeline mounts, owned by the runner
   user, or the first scan fails on a path it cannot write:

   ```bash
   sudo install --directory --owner gitlab-runner --group gitlab-runner /var/cache/trivy
   ```

6. **Verify your identity at `/-/identity_verification`.** GitLab.com refuses to
   run any CI job for an unverified free account, self-hosted runner included.
   The pipeline fails instantly with zero jobs and no YAML error, which looks
   like a broken config. Phone is enough; a card is not required.
7. **Push to `main` and watch the mirror fire**, then confirm the GitLab pipeline
   runs all three jobs and goes green.
8. **Only then** add the `GitLab CI` row to `resume/skills.csv`.

## Cost

Zero. GitLab Free gives 400 shared-runner compute minutes a month per top-level
namespace, and self-hosted runners consume none of that quota on any plan, so
the minutes are never touched.
