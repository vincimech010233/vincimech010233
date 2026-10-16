#!/usr/bin/env bash
set -euo pipefail
if (( $# != 1 )); then printf 'Uso: bash %s DIRECTORIO\n' "$0" >&2; exit 2; fi
root=$1
if [[ ! -d "$root" ]]; then printf 'Error: no es un directorio accesible\n' >&2; exit 2; fi
printf 'STATUS\tPATH\tCLASS\tDATA\tTYPE\tMACHINE\n'
find -- "$root" -type f -print0 | while IFS= read -r -d '' f; do
  escaped=$(printf '%q' "$f")
  if header=$(readelf -h -- "$f" 2>/dev/null); then
    fields=$(printf '%s\n' "$header" | awk -F: '
      function trim(s) { gsub(/^[[:space:]]+|[[:space:]]+$/, "", s); return s }
      $1 ~ /^[[:space:]]*Class[[:space:]]*$/ { c=trim($2) }
      $1 ~ /^[[:space:]]*Data[[:space:]]*$/ { d=trim($2) }
      $1 ~ /^[[:space:]]*Type[[:space:]]*$/ { t=trim($2) }
      $1 ~ /^[[:space:]]*Machine[[:space:]]*$/ { m=trim($2) }
      END { printf "%s\t%s\t%s\t%s", c, d, t, m }
    ')
    printf 'ELF\t%s\t%s\n' "$escaped" "$fields"
  else
    printf 'NO_ELF_OR_INVALID\t%s\t-\t-\t-\t-\n' "$escaped"
  fi
done
