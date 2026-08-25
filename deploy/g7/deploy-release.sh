#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: deploy-release.sh <commit-sha> <frontend-archive>" >&2
  exit 64
fi

sha="$1"
artifact="$2"
deploy_root="/home/deploy/cube-store"
deployer_root="/home/deploy/cube-store-deployer"
repository="$deployer_root/repository"
releases_root="$deploy_root/releases"

if [[ ! "$sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "invalid commit SHA" >&2
  exit 65
fi

artifact="$(readlink -f "$artifact")"
case "$artifact" in
  "$deployer_root"/artifacts/*) ;;
  *)
    echo "artifact is outside the deployer directory" >&2
    exit 65
    ;;
esac

if [[ ! -f "$artifact" || ! -s "$artifact" ]]; then
  echo "frontend artifact is missing" >&2
  exit 66
fi

if [[ ! -f "$deploy_root/app.env" || ! -d "$deploy_root/data/cubes" ]]; then
  echo "production environment or image volume is missing" >&2
  exit 66
fi

tar -tzf "$artifact" >/dev/null
if tar -tzf "$artifact" | grep -Eq '(^/|(^|/)\.\.(/|$))'; then
  echo "frontend artifact contains an unsafe path" >&2
  exit 65
fi

mkdir -p "$releases_root"

if [[ ! -d "$repository/.git" ]]; then
  git clone --filter=blob:none https://github.com/85ip9gh/cube-store-application.git "$repository"
fi

git -C "$repository" fetch --force --prune origin main
main_sha="$(git -C "$repository" rev-parse origin/main)"
if [[ "$main_sha" != "$sha" ]]; then
  echo "requested commit is not the current main commit" >&2
  exit 65
fi

release_dir="$releases_root/$sha"
incoming=""

cleanup() {
  if [[ -n "$incoming" && -d "$incoming" ]]; then
    rm -rf -- "$incoming"
  fi
}
trap cleanup EXIT

if [[ ! -d "$release_dir" ]]; then
  incoming="$(mktemp -d "$releases_root/.incoming-$sha.XXXXXX")"
  mkdir -p "$incoming/frontend" "$incoming/source"
  tar -xzf "$artifact" -C "$incoming/frontend"

  if [[ ! -f "$incoming/frontend/index.html" ]]; then
    echo "frontend artifact does not contain index.html" >&2
    exit 65
  fi

  git -C "$repository" archive "$sha" \
    web-store/server/index.js \
    web-store/server/package.json \
    web-store/server/package-lock.json \
    web-store/server/controllers \
    web-store/server/middleware \
    web-store/server/Models \
    web-store/server/routes \
    | tar -x -C "$incoming/source"

  mv "$incoming/source/web-store/server" "$incoming/server"
  rm -rf -- "$incoming/source"

  printf '%s\n' "$sha" > "$incoming/.release-sha"

  ln -s "$deploy_root/app.env" "$incoming/app.env"
  ln -s "$deploy_root/data" "$incoming/data"

  image_stage="$(mktemp -d "$releases_root/.images-$sha.XXXXXX")"
  git -C "$repository" archive "$sha" web-store/server/cubes | tar -x -C "$image_stage"
  rsync -a "$image_stage/web-store/server/cubes/" "$deploy_root/data/cubes/"
  rm -rf -- "$image_stage"

  mv "$incoming" "$release_dir"
  incoming=""
fi

if git -C "$repository" cat-file -e "$sha:deploy/g7/Dockerfile" 2>/dev/null; then
  git -C "$repository" show "$sha:deploy/g7/Dockerfile" > "$release_dir/Dockerfile"
  git -C "$repository" show "$sha:deploy/g7/compose.yaml" > "$release_dir/compose.yaml"
  git -C "$repository" show "$sha:deploy/g7/.dockerignore" > "$release_dir/.dockerignore"
else
  cp "$deployer_root/runtime/Dockerfile" "$release_dir/Dockerfile"
  cp "$deployer_root/runtime/compose.yaml" "$release_dir/compose.yaml"
  cp "$deployer_root/runtime/.dockerignore" "$release_dir/.dockerignore"
fi

previous_release=""
if [[ -L "$deploy_root/current" ]]; then
  previous_release="$(readlink -f "$deploy_root/current")"
elif [[ -f "$deploy_root/compose.yaml" ]]; then
  previous_release="$deploy_root"
fi

rollback() {
  if [[ -n "$previous_release" && -f "$previous_release/compose.yaml" ]]; then
    echo "restoring the previous release" >&2
    docker compose -p cube-store -f "$previous_release/compose.yaml" up -d --build --remove-orphans || true
  fi
}

if ! docker compose -p cube-store -f "$release_dir/compose.yaml" up -d --build --remove-orphans; then
  rollback
  exit 70
fi

healthy=false
for attempt in $(seq 1 36); do
  if curl --silent --show-error --fail --max-time 4 http://100.100.100.100:4242/healthz >/dev/null; then
    healthy=true
    break
  fi
  sleep 5
done

if [[ "$healthy" != "true" ]]; then
  echo "new release did not become healthy" >&2
  docker compose -p cube-store -f "$release_dir/compose.yaml" logs --tail=100 >&2 || true
  rollback
  exit 70
fi

current_link="$deploy_root/.current-$sha"
rm -f -- "$current_link"
ln -s "$release_dir" "$current_link"
mv -Tf "$current_link" "$deploy_root/current"
printf '%s\n' "$sha" > "$deploy_root/deployed-sha"

echo "deployed $sha"
