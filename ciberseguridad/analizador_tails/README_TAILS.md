# Inicio rápido en Tails

[Español](README_TAILS.md) · [English](README_TAILS.en.md)

Lee primero `README.md` para descargar desde GitHub, preparar VMware, comprobar el paquete y leer el informe. Dentro de Tails, desde la carpeta extraída:

```bash
python3 analizar.py 'https://TU-SITIO-AUTORIZADO' --modo tails --tor-puerto 9050 --sin-dinamico --salida resultado-tails-01
```

Este modo requiere Python 3, curl y el proxy Tor accesible. No ejecuta JavaScript. El puerto abierto no prueba que el servicio sea Tor. NOT_VERIFIED: ejecución real en Tails/VMware.
