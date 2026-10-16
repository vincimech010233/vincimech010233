# Rick & Morty — Interdimensional Portal Observatory

Proyecto en React 19 y TypeScript sobre desplazamiento infinito y observabilidad de la interfaz.

## Qué demuestra

- Un fragmento de solución que conserva la primera página del starter con Suspense y carga las siguientes mediante `info.next` e `IntersectionObserver`.
- Una app Vite separada con tarjetas de personajes, portal verde animado, paginación automática, recuperación de errores y una cronología de solicitudes.
- Control de solicitudes duplicadas, cancelación, validación de respuestas, detección de ciclos de cursor, respeto a movimiento reducido y carga accesible por teclado cuando no existe `IntersectionObserver`.

## Tecnologías

React 19 · TypeScript · IntersectionObserver · REST API · Vite 6 · Vitest 4 · Testing Library

## Ejecutar y verificar

```sh
cd app
npm ci
npm test
npm run build
npm run dev
```

Usa Node.js 20 o posterior (la auditoría se ejecutó con Node 24).

La app usa datos simulados locales por defecto. Define `VITE_SOURCE=api` para usar la API pública de Rick and Morty.

Pasaron 19 pruebas locales; también pasaron la comprobación de TypeScript/build y `npm audit` informó 0 vulnerabilidades tras actualizar Vitest. El starter y el ejecutor oficiales no estaban en el archivo recibido, así que la compatibilidad con el starter y el resultado de las 12 pruebas oficiales siguen **NOT_VERIFIED**. Se revisó la app en navegador con tamaños de vista móvil y escritorio; no se hizo certificación automática de accesibilidad ni medición de rendimiento.

## Código y evidencias

- [Fragmento del reto](challenge/Characters.jsx)
- [App observatory](app/)
- [Informe de auditoría](INFORME.md)
- [Aprendizajes](LEARN.md)

Este repositorio es el perfil de GitHub. No hay una demo alojada disponible.
