#!/usr/bin/env bash
set -euo pipefail
base=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf -- "$tmp"' EXIT
mkdir "$tmp/input"
gcc -Wall -Wextra -Werror -o "$tmp/input/benign-fixture" "$base/examples/benign.c"
printf 'synthetic text, not a program\n' > "$tmp/input/not-elf.txt"
out=$(bash "$base/elf_inventory.sh" "$tmp/input")
printf '%s\n' "$out" | grep -F $'ELF\t'
printf '%s\n' "$out" | grep -F $'NO_ELF_OR_INVALID\t'
if bash "$base/elf_inventory.sh" "$tmp/missing" >/dev/null 2>&1; then printf 'fallo: aceptó directorio ausente\n' >&2; exit 1; else rc=$?; [[ $rc -eq 2 ]]; fi
if bash "$base/elf_inventory.sh" >/dev/null 2>&1; then printf 'fallo: aceptó argumentos ausentes\n' >&2; exit 1; else rc=$?; [[ $rc -eq 2 ]]; fi
printf 'OK: fixture ELF detectado, texto rechazado y dos errores validados; ELF no ejecutado.\n'
