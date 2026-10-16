# Inventario ELF local

Pequeña herramienta defensiva para listar metadatos básicos de archivos ELF en una carpeta local: clase, formato de datos, tipo y arquitectura.

## Uso

```sh
bash ./elf_inventory.sh ./carpeta-autorizada
```

Necesita Bash y GNU `readelf` (GNU Binutils). El resultado es TSV. Las rutas aparecen en el informe y pueden revelar nombres o estructura local.

La herramienta solo lee cabeceras. No ejecuta los binarios, no inspecciona el código, no detecta vulnerabilidades y no determina si un archivo es seguro. Úsala solo en carpetas propias o autorizadas.

## Pruebas

```sh
bash ./tests/test.sh
```

Las pruebas compilan y examinan un ELF sintético, rechazan un archivo de texto y comprueban errores de entrada. No ejecutan el ELF. No se necesita red.

MIT; consulta `LICENSE`.
