# Local ELF Inventory

A small defensive utility that lists basic metadata for ELF files in a local folder: class, data format, type, and architecture.

## Usage

```sh
bash ./elf_inventory.sh ./authorized-folder
```

Requires Bash and GNU `readelf` (GNU Binutils). Output is TSV. File paths appear in the report and may reveal local names or folder structure.

The tool reads headers only. It does not execute binaries, inspect code, detect vulnerabilities, or determine whether a file is safe. Use it only on folders you own or are authorized to inspect.

## Tests

```sh
bash ./tests/test.sh
```

Tests compile and inspect a synthetic ELF, reject a text file, and check input errors. The ELF is never executed. No network is needed.

MIT; see `LICENSE`.
