#!/usr/bin/env bash
# Sync git release tags with published npm versions so `nx release` bumps from the
# correct baseline (not stale tags that target already-published versions).
#
# Uses the highest semver on npm, not the "latest" dist-tag (which can point at an
# older version if a release retagged latest incorrectly).
set -euo pipefail

packages=(
  core
  overlay
  interactions
  listbox
  listbox-cdk
  dropdown
  popover
  menu
  tooltip
  snackbar
  select
  combobox
  mention
  headless
)

highest_version() {
  local pkg="$1"
  npm view "@nexora-ui/${pkg}" versions --json \
    | node -e "const v=JSON.parse(require('fs').readFileSync(0,'utf8')); const a=[].concat(v); a.sort((x,y)=>x.localeCompare(y,{numeric:true})); console.log(a.at(-1));"
}

echo "Fetching npm versions (highest published semver)..."
for pkg in "${packages[@]}"; do
  version="$(highest_version "$pkg")"
  tag="${pkg}@${version}"
  if git rev-parse "$tag" >/dev/null 2>&1; then
    echo "  $tag already exists"
  else
    git tag "$tag"
    echo "  tagged $tag"
  fi
done

echo ""
echo "Done. Push tags: git push origin --tags"
echo "Then run: npm run release:nx:dry-run"
