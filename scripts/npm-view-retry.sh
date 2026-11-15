#!/usr/bin/env bash
# Poll npm until registry metadata is consistent (replicas lag right after publish).
set -euo pipefail

usage() {
  echo "Usage: npm-view-retry.sh highest <package> [--attempts N] [--delay SEC]" >&2
  echo "       npm-view-retry.sh match <package> <expected-version> [--attempts N] [--delay SEC]" >&2
  exit 2
}

mode="${1:-}"
shift || usage

case "$mode" in
  highest | match) ;;
  *) usage ;;
esac

pkg="${1:-}"
shift || usage

expected=""
attempts="${NPM_REGISTRY_RETRY_ATTEMPTS:-30}"
delay="${NPM_REGISTRY_RETRY_DELAY_SEC:-2}"

while (($# > 0)); do
  case "$1" in
    --attempts)
      attempts="${2:-}"
      shift 2
      ;;
    --delay)
      delay="${2:-}"
      shift 2
      ;;
    *)
      if [[ "$mode" == match && -z "$expected" ]]; then
        expected="$1"
        shift
      else
        usage
      fi
      ;;
  esac
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read_highest() {
  npm view "@nexora-ui/${pkg}" versions --json 2>/dev/null \
    | node "${script_dir}/highest-semver.mjs"
}

read_latest() {
  npm view "@nexora-ui/${pkg}" dist-tags.latest 2>/dev/null || true
}

for ((i = 1; i <= attempts; i++)); do
  highest="$(read_highest)"
  latest="$(read_latest)"

  if [[ "$mode" == match ]]; then
    if [[ "$highest" == "$expected" && "$latest" == "$expected" ]]; then
      printf '%s' "$expected"
      exit 0
    fi
  elif [[ -n "$highest" && "$highest" == "$latest" ]]; then
    printf '%s' "$highest"
    exit 0
  fi

  if (( i < attempts )); then
    sleep "$delay"
  fi
done

if [[ "$mode" == match ]]; then
  echo "npm @nexora-ui/${pkg}: expected ${expected}, saw max=${highest:-?} latest=${latest:-?}" >&2
else
  echo "npm @nexora-ui/${pkg}: versions list and latest dist-tag did not align (max=${highest:-?}, latest=${latest:-?})" >&2
fi
exit 1