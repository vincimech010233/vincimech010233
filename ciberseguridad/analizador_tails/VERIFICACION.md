# Verificación y procedencia

Fecha: 12 de octubre de 2026. Revisión documental y empaquetado asistidos por Codex.

## VERIFIED: comprobaciones locales

- Ambos ZIP originales superan la comprobación CRC de Python `zipfile`.
- Los scripts originales de Tails y Linux son idénticos y se conservan byte a byte en esta publicación.
- Se comprueba la sintaxis con `compile` y el comando `--help`.
- Siete pruebas offline pasan con HTTP y disponibilidad de proxy simulados: ayuda CLI, escape HTML del contenido, fallo de curl, ausencia de Playwright, aborto sin proxy, selección del proxy SOCKS con resolución remota y conservación de archivos antiguos al reutilizar la salida.
- La prueba de archivos antiguos verifica una limitación del programa, no una corrección: utiliza una carpeta de salida nueva.

Desde la carpeta extraída, puedes repetir las pruebas con:

```bash
python3 -m unittest discover -s tests -v
```

Son pruebas con fixtures locales. No establecen conexiones HTTP, no abren un navegador y no prueban Tor.

## OBSERVED: código suministrado

El modo estático utiliza curl; la fase dinámica usa el Chromium gestionado por Playwright. El script no automatiza Tor Browser ni instala sus dependencias. El HTML escapa el contenido recibido; el archivo `fuente_escapada.txt` contiene texto bruto. La captura, cuando existe, se consulta aparte.

El comentario que menciona evitar fugas WebRTC no acredita una desactivación explícita. El código no demuestra ausencia de fugas ni garantiza anonimato. Los informes pueden guardar datos sensibles recibidos del sitio, incluidas cabeceras y parámetros URL.

## NOT_VERIFIED: comprobaciones pendientes

- Arranque y ejecución en Tails/VMware y Linux/VMware reales.
- Descarga del paquete desde una VM Tails por Tor.
- Chromium/Playwright compatible y operativo en Tails.
- Contención efectiva de red, identificación del proxy como Tor y ausencia de fugas.
- Captura y renderizado reales con el navegador.

## Alcance de esta publicación

Se mejora la documentación, se incluyen pruebas offline y se reempaquetan los ZIP. No se añaden funciones de análisis al script original. Cada ZIP incluye guía, inicio rápido, verificación, pruebas y el README original para conservar la procedencia. Los archivos originales del usuario permanecen intactos.

La validación general del espacio de preparación falló por un problema previo de `event_id` ausente o no único en su registro histórico; se conserva el diagnóstico local. Ese resultado no se presenta como prueba satisfactoria del espacio ni de las VM.
