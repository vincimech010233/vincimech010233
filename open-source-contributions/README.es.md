# Contribuciones Open Source

[Volver al portfolio](../README.es.md) · [Back to portfolio in English](README.md)

Esta área recoge contribuciones revisadas y aceptadas en proyectos mantenidos por otras personas. Separa el trabajo incorporado a proyectos externos de los proyectos de mis propios repositorios.

## Contribuciones presentadas (sin fusionar)

### Co4 — metadatos del paquete Python y visibilidad en PyPI

[Pull request #13](https://github.com/JerrettDavis/Co4/pull/13) · [Issue relacionada #12](https://github.com/JerrettDavis/Co4/issues/12)

- Presenté una modificación de `pyproject.toml` para añadir las URLs del proyecto y clasificadores Trove de PyPI, incluido el clasificador de licencia MIT exigido en la issue.
- Documenté la instalación editable aislada, la construcción de la wheel aislada, la compilación de Python y la comprobación de espacios. La inspección de metadatos de la wheel registró cinco URLs y ocho clasificadores.
- Resultado comunicado de los tests: 93 superados y 1 fallido; el test fallido esperaba `examples/worker.toml`, ausente y excluido por Git, fuera del alcance del cambio de metadatos.
- **Estado:** cerrada sin fusionar. Es una contribución propuesta y probada, no un cambio aceptado en el proyecto original; no afirmo que se incorporase la implementación.

**Evidencia:** [PR, diferencias propuestas, comprobaciones y estado final](https://github.com/JerrettDavis/Co4/pull/13)

## Contribuciones fusionadas

### Microsoft OpenTelemetry Python — corrección de recopilación predeterminada de logs

[Pull request #288](https://github.com/microsoft/opentelemetry-distro-python/pull/288) · [Repositorio original](https://github.com/microsoft/opentelemetry-distro-python)

- Corregí la recopilación predeterminada de logs de Python al asociar el handler de OpenTelemetry al logger raíz cuando el nombre se omite, es vacío o es `None`, manteniendo la protección contra handlers duplicados y el comportamiento de los loggers con nombre.
- Incorporé y reorganicé 23 casos de regresión en las suites existentes, incluidos niveles, propagación, configuración repetida y desactivación de logs.
- Añadí cobertura de integración simultánea de Azure Monitor y OTLP, comprobando un solo `LoggingHandler` y `LoggerProvider` con ambos procesadores/exportadores.
- Incorporé las observaciones del mantenimiento sobre ubicación de las pruebas y documentación concisa. La PR fue aprobada y fusionada en `main` el 16-10-2026.
- La publicación del paquete está prevista para la primera semana de noviembre de 2026, según el mantenedor; todavía no es una publicación confirmada.

**Evidencia:** [PR fusionada, cambios y revisiones](https://github.com/microsoft/opentelemetry-distro-python/pull/288) · [comentario sobre publicación](https://github.com/microsoft/opentelemetry-distro-python/pull/288#issuecomment-6218513273)

### PlasmaPy — orientación sobre unidades y partículas en `AGENTS.md`

[Pull request #3388](https://github.com/PlasmaPy/PlasmaPy/pull/3388) · [Repositorio original](https://github.com/PlasmaPy/PlasmaPy)

- Abordé el [issue #3285](https://github.com/PlasmaPy/PlasmaPy/issues/3285), que solicitaba orientación breve sobre `astropy.units` y `plasmapy.particles` para `AGENTS.md`, incluidas las entradas de temperatura expresadas en eV y los decoradores `@particle_input` y `@validate_quantities`.
- Amplié `AGENTS.md` con orientación sobre cantidades con unidades y conversiones; la equivalencia temperatura-energía para argumentos de temperatura que admiten unidades de energía como eV; y el uso de `Particle`, `CustomParticle`, `ParticleList`, `ParticleLike` / `ParticleListLike`, `@particle_input` y `@validate_quantities`.
- Añadí una entrada al changelog y el alias de contribuidor en `CITATION.cff`. El PR modificó únicamente `AGENTS.md`, `CITATION.cff` y `changelog/3388.internal.rst`; su alcance es la guía del repositorio y los metadatos de contribución, sin cambios al código de ejecución de PlasmaPy.
- La persona mantenedora aprobó el PR y sugirió un ajuste menor de redacción antes de fusionarlo. Se incorporó a `main` de upstream el 2026-10-05.

**Evidencia (VERIFIED):** [diff del PR](https://github.com/PlasmaPy/PlasmaPy/pull/3388/files) · [commit de merge](https://github.com/PlasmaPy/PlasmaPy/commit/5990ca662b6aab57ff1dfd62bdc4256ec13ec63c) · [issue que motivó el cambio](https://github.com/PlasmaPy/PlasmaPy/issues/3285)

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
