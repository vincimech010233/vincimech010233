# Contribuciones Open Source

[Volver al portfolio](../README.es.md) · [Back to portfolio in English](README.md)

Esta área recoge contribuciones revisadas y aceptadas en proyectos mantenidos por otras personas. Separa el trabajo incorporado a proyectos externos de los proyectos de mis propios repositorios.

## Contribuciones fusionadas

### Axiomize Quantum Skills 2.0 — cobertura de regresión del oráculo numérico

[Pull request #11](https://github.com/Furox-Art/axiomize-quantum-skills-2.0/pull/11) · [Repositorio original](https://github.com/Furox-Art/axiomize-quantum-skills-2.0)

- Añadí cobertura de regresión para alternativas de palabras clave del oráculo numérico separadas por `|`.
- Cubrí alternativas válidas como `temperature rise: 50 K` y `dT 50 K`.
- Añadí pruebas negativas para valores fuera de tolerancia y para informes sin ninguna alternativa de palabra clave coincidente.
- Dejé intacta la lógica de producción y validé la contribución con 4 pruebas específicas superadas y la suite completa: 406 superadas, 8 omitidas.
- La contribución se fusionó en la rama `main` del proyecto original. La persona mantenedora confirmó explícitamente que estos casos eran la cobertura de regresión que necesitaba el grader y agradeció la contribución.

**Evidencia:** la implementación, las pruebas, los resultados de validación, el estado de fusión y la respuesta de la persona mantenedora están disponibles en el pull request fusionado.

### StockVeda — corrección de exposición de errores de API

[Pull request #74](https://github.com/CRS5226/StockVeda/pull/74) · [Repositorio original](https://github.com/CRS5226/StockVeda)

- Sustituí los detalles de excepciones internas inesperadas en las respuestas de la API por mensajes genéricos y mantuve las trazas completas en los registros del servidor.
- Conservé los mensajes descriptivos de validación de entradas y los códigos HTTP existentes.
- Añadí pruebas de regresión para comprobar las respuestas de la API y los registros del servidor en los controladores backend afectados.
- Verificación: 26 pruebas del backend superadas, compilación de Python y `git diff --check`.
- La contribución se fusionó en la rama `master` del proyecto original. La persona mantenedora confirmó que el cambio cerró dos alertas de CodeQL por exposición de trazas.

**Evidencia:** la implementación, las pruebas, las comprobaciones de CI y la respuesta de la persona mantenedora están en el pull request fusionado. Esta contribución documenta una corrección de seguridad acotada; no afirma que se haya realizado una auditoría completa de StockVeda.
