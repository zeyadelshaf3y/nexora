#!/usr/bin/env bash
# Point npm "latest" at the highest published semver for each @nexora-ui package.
#
# nx release can publish patch bumps for dependents without moving "latest" on
# transitive packages (e.g. overlay, dropdown). Consumers using @latest then get
# versions that no longer satisfy peer ranges on menu/select/combobox.
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

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

highest_version() {
  local pkg="$1"
  npm view "@nexora-ui/${pkg}" versions --json \
    | node "${script_dir}/highest-semver.mjs"
}

echo "Syncing npm dist-tag latest to highest published semver..."
for pkg in "${packages[@]}"; do
  version="$(highest_version "$pkg")"
  current="$(npm view "@nexora-ui/${pkg}" dist-tags.latest 2>/dev/null || true)"
  if [[ "$current" == "$version" ]]; then
    echo "  @nexora-ui/${pkg}@${version} (latest already correct)"
  else
    echo "  @nexora-ui/${pkg}: latest ${current:-<none>} -> ${version}"
    npm dist-tag add "@nexora-ui/${pkg}@${version}" latest
  fi
done

echo ""
echo "Done."
