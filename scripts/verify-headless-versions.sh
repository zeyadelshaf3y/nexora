#!/usr/bin/env bash
# Report version alignment: source package.json vs npm highest vs npm latest dist-tag.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

packages=(
  core overlay interactions listbox listbox-cdk dropdown popover menu
  tooltip snackbar select combobox mention headless
)

highest_npm() {
  npm view "@nexora-ui/${1}" versions --json 2>/dev/null | node "${script_dir}/highest-semver.mjs"
}

source_version() {
  node -e "console.log(require('${root}/libs/headless/${1}/package.json').version)"
}

issues=0
printf '%-14s %-10s %-10s %-10s %s\n' PACKAGE SOURCE NPM_MAX NPM_LATEST STATUS
printf '%-14s %-10s %-10s %-10s %s\n' ------- ------ ------- ---------- ------

for pkg in "${packages[@]}"; do
  source="$(source_version "$pkg")"
  npm_max="$(highest_npm "$pkg")"
  npm_latest="$(npm view "@nexora-ui/${pkg}" dist-tags.latest 2>/dev/null || echo '?')"

  status=OK
  if [[ "$source" != "$npm_max" ]]; then
    status="SOURCE≠NPM"
    ((issues++)) || true
  elif [[ "$npm_latest" != "$npm_max" ]]; then
    status="LATEST_STALE"
    ((issues++)) || true
  fi

  printf '%-14s %-10s %-10s %-10s %s\n' "$pkg" "$source" "$npm_max" "$npm_latest" "$status"
done

echo ""
if (( issues > 0 )); then
  echo "${issues} issue(s). Run: npm run release:sync-npm-dist-tags (requires npm publish auth)"
  exit 1
fi
echo "All versions aligned."
