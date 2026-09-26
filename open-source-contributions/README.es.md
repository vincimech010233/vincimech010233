# Contribuciones Open Source

[Volver al portfolio](../README.es.md) · [Back to portfolio in English](README.md)

Esta área recoge contribuciones revisadas y aceptadas en proyectos mantenidos por otras personas. Separa el trabajo incorporado a proyectos externos de los proyectos de mis propios repositorios.

## Contribuciones fusionadas

### StockVeda — corrección de exposición de errores de API

[Pull request #74](https://github.com/CRS5226/StockVeda/pull/74) · [Repositorio original](https://github.com/CRS5226/StockVeda)

- Sustituí los detalles de excepciones internas inesperadas en las respuestas de la API por mensajes genéricos y mantuve las trazas completas en los registros del servidor.
- Conservé los mensajes descriptivos de validación de entradas y los códigos HTTP existentes.
- Añadí pruebas de regresión para comprobar las respuestas de la API y los registros del servidor en los controladores backend afectados.
- Verificación: 26 pruebas del backend superadas, compilación de Python y `git diff --check`.
- La contribución se fusionó en la rama `master` del proyecto original. La persona mantenedora confirmó que el cambio cerró dos alertas de CodeQL por exposición de trazas.

**Evidencia:** la implementación, las pruebas, las comprobaciones de CI y la respuesta de la persona mantenedora están en el pull request fusionado. Esta contribución documenta una corrección de seguridad acotada; no afirma que se haya realizado una auditoría completa de StockVeda.
