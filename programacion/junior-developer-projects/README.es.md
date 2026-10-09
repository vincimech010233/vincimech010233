# Colección de proyectos para desarrolladores junior

Selección de 12 ejercicios independientes y pequeños en Python, C++, JavaScript de navegador, Go, Java, Rust, SQLite y Node.js. Los datos son sintéticos o ficticios. Son ejemplos de aprendizaje, no herramientas de producción.

Son ejercicios de partida, no afirmaciones de trabajo profesional u original. Adapta el código, comprende las decisiones de diseño y describe solo el trabajo que puedas explicar personalmente.

## Proyectos

1. [Auditoría energética CLI](01-python-energy-audit/) — resumen CSV y heurística transparente de consumo alto.
2. [Triaje local de indicadores CTI](02-python-cti-triage/) — análisis offline de indicadores ficticios; las puntuaciones no atribuyen amenazas.
3. [Simulador 1D de difusión térmica](03-cpp-heat-diffusion/) — demostración numérica por diferencias finitas explícitas.
4. [Tablero accesible de tareas](04-js-accessible-task-board/) — lista de tareas del navegador con almacenamiento local.
5. [Ajuste de datos científicos](05-python-science-fit/) — ajuste lineal por mínimos cuadrados sin dependencias.
6. [API local de estado de servicio](06-go-local-health-api/) — endpoints HTTP de salud enlazados a localhost.
7. [Resumen de gastos](07-java-expense-summary/) — resumen CSV por categoría.
8. [Resumen de logs](08-rust-log-summary/) — recuento de severidades y mensajes de error frecuentes.
9. [Analítica de préstamos de biblioteca](09-sql-library-analytics/) — esquema y consultas SQLite con datos ficticios.
10. [API de inventario](10-node-inventory-api/) — API JSON en memoria enlazada a localhost.
11. [Planificador de presupuesto](11-js-budget-planner/) — registro de gastos del navegador con almacenamiento local.
12. [Análisis de logs CLI](12-node-log-insights/) — resumen de logs JSONL locales.

## Revisión y verificación

**VERIFIED:** Pasaron las pruebas Python de auditoría energética (2), triaje CTI (4) y ajuste científico (2); las pruebas Rust (3); las pruebas Node de la API de inventario (2) y de análisis de logs (2). El informe SQLite y los ejemplos de ejecución en Python, Rust y Node produjeron resultados. Node validó la sintaxis de JavaScript.

**NOT_VERIFIED:** No se pudieron ejecutar la compilación/pruebas C++, las pruebas Go ni la compilación Java porque el entorno no tiene CMake, Go ni `javac`. No se probó la interacción en un navegador real. Las ejecuciones de ejemplo no demuestran que sean aptos para producción.

**OBSERVED:** El ZIP incluía cachés de bytecode Python, excluidas de la colección. Durante la revisión se corrigió un error al agrupar mensajes Rust (detección de severidad sin distinguir mayúsculas frente a extracción sensible a mayúsculas) y la aceptación de IPv6 bajo la etiqueta `ipv4`, con pruebas de regresión para el caso Rust y la validación IPv4. La validación de tarifa energética ahora rechaza valores no finitos. Se corrigió el README de Go para dejar de afirmar que implementa apagado ordenado, función que el código no tiene.
