# Ciberseguridad

[English](README.en.md)

## Proyecto de portafolio Application Security

- [URLPolicy Lab 1.0.1](urlpolicy-lab/README.md) — QA offline en Python para políticas de URL de webhooks: carga estricta de JSON local, etiquetas de incertidumbre, informes atómicos, 38 tests y fuzzing de robustez reproducible de 10.000 entradas. Incluye arquitectura, modelo de amenazas, evidencia sanitizada y material para entrevistas. Preparación y revisión asistidas por Codex; permiso de publicación MIT declarado por el titular y canal privado de reporte pendiente. No afirma protección durante la ejecución ni certificación externa.

## Analizador web para Tails y Linux en VMware

- [Guía en español](analizador_tails/README.md) · [English guide](analizador_tails/README.en.md) — documentación bilingüe incluida en ambos ZIP; instrucciones para descargar los ZIP desde GitHub dentro de Tails, ejecutar el modo estático por proxy Tor y preparar Playwright en Linux. Incluye informes HTML/JSON, sumas SHA-256 y siete pruebas offline. La ayuda y los informes del programa permanecen en español. **NOT_VERIFIED:** ejecución real en VMware y ausencia de fugas. El script no bloquea todos los envíos ni ofrece una sandbox completa.

## Repositorio

- [cibersecurity](https://github.com/vincimech010233/cibersecurity) — analizador de registros simulados y resumen de accesos fallidos de solo lectura, escáner TCP con localhost y rango pequeño por defecto, y laboratorio de inyección publicado en loopback. [PR #2 fusionada](https://github.com/vincimech010233/cibersecurity/pull/2) añadió pruebas para esas rutas y amplió CI. Las demás utilidades y laboratorios educativos requieren revisión independiente antes de ejecutarse.

## Investigación independiente

- **Independent Security Research** — Investigación independiente de seguridad de software mediante auditoría de código fuente en C++, análisis estático y pruebas locales con AddressSanitizer (ASan).

  **Tecnologías:** C++, AddressSanitizer (ASan), análisis de código fuente, pruebas de seguridad.

## Caso de estudio metodológico

- [Metodología de evaluación de seguridad — caso ficticio](fictional-security-assessment.md)

El caso de estudio no describe sistemas u organizaciones reales y no debe interpretarse como una auditoría real.

## Herramienta pequeña de triaje local

- [Inventario ELF local](elf-inventory/README.md) — enumera metadatos ELF básicos con `readelf`. Pruebas sintéticas, sin red y sin ejecutar binarios. No analiza código ni detecta vulnerabilidades. Los informes pueden mostrar rutas locales. Solo para carpetas autorizadas.
