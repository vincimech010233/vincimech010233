# Matomo LoginLdap: atributos LDAP y acceso de superusuario

[English](README.en.md)

## Resumen

Probé cómo una configuración de LoginLdap podía sincronizar el acceso de superusuario de Matomo a partir de un atributo LDAP. En un laboratorio local, una ACL que permitía al usuario escribir su propio atributo hizo posible cambiar el valor utilizado para esa decisión. Tras iniciar sesión de nuevo, observé que `superuser_access` pasó de `0` a `1`.

El resultado depende de esa ACL permisiva y de la configuración de sincronización. En un control con la ACL predeterminada probada en mi entorno, LDAP rechazó la modificación. No probé sistemas en producción ni demostré que se pueda eludir una ACL correcta.

**Estado de la evidencia:** este artículo recoge mis resultados comunicados y mi resumen de la respuesta de Matomo. Los registros originales de la prueba y la respuesta no están incluidos aquí ni se han podido contrastar durante la preparación de esta publicación. Los detalles que no constan en ellos no se dan por demostrados.

## Entorno y alcance

| Componente | Versión o configuración comunicada |
| --- | --- |
| Matomo | 5.14.2 |
| LoginLdap | 5.2.9 |
| Directorio | OpenLDAP, en un entorno local desechable |
| Sincronización de acceso | `enable_synchronize_access_from_ldap` activado |
| Atributo para superusuario | `ldap_superuser_access_field` configurado como `employeeType` |

La prueba se limitó a ese entorno y a las reglas de acceso que utilicé. No puedo extrapolar el resultado a otras instalaciones, directorios, configuraciones o versiones.

## Modelo de confianza

LDAP puede contener atributos de una cuenta. Una ACL —lista de control de acceso— determina quién puede leerlos o modificarlos. En la configuración probada, LoginLdap utilizaba `employeeType` como dato para sincronizar el acceso de superusuario en Matomo.

Por tanto, la protección de ese dato depende de los permisos de escritura en el directorio. Si una cuenta puede modificar el atributo que la aplicación consulta para asignarle privilegios, puede alterar un dato en el que la aplicación confía. En mi laboratorio, ese fue el supuesto que introduje mediante una ACL permisiva; no lo doy por supuesto en otros entornos.

## Prueba y control

1. Configuré la sincronización y el atributo indicados arriba.
2. Con la ACL de laboratorio que permitía la escritura propia, el usuario modificó su `employeeType` a `1`.
3. Tras un nuevo inicio de sesión, observé que `superuser_access` cambió de `0` a `1`.
4. En un control separado, con la ACL predeterminada probada en el laboratorio, LDAP rechazó la modificación con `Insufficient access (50)`.

| Condición | Resultado comunicado | Interpretación limitada |
| --- | --- | --- |
| ACL de laboratorio que permite escritura propia | Cambio de atributo aceptado; tras iniciar sesión, `superuser_access` de `0` a `1` | La configuración probada confía en un atributo que el usuario podía modificar. |
| ACL predeterminada probada | Modificación rechazada: `Insufficient access (50)` | La regla probada impidió ese cambio; no demuestra el comportamiento de todas las ACL predeterminadas. |

No incluyo comandos, reglas ACL exactas, capturas ni salidas de base de datos porque no he podido volver a consultar los registros originales. No sería correcto reconstruirlos de memoria como si fueran evidencia.

## Respuesta de Matomo

Comuniqué el caso a Matomo. Según la respuesta recibida, LoginLdap utiliza LDAP como fuente autorizada de roles y la ACL del directorio es el límite de confianza. Matomo cerró el informe como **Informative** y no elegible para recompensa. También reconoció que la documentación podría advertir mejor sobre esta dependencia.

Esta es una síntesis de la respuesta, no una cita textual. La comunicación original no está incluida aquí.

## Versiones y observación secundaria

Inspeccioné código de LoginLdap 6.0.6, pero no hice una prueba de extremo a extremo en esa versión. Por tanto, no afirmo que el resultado de laboratorio se reproduzca en ella.

También observé una referencia al tratamiento de valores vacíos: el docblock lo describe como intencional. No lo demostré de extremo a extremo y no lo presento como un hallazgo confirmado.

## Qué revisar en una integración

Para evaluar una configuración propia, conviene identificar el atributo que se usa para asignar privilegios y revisar quién puede modificarlo mediante las ACL efectivas del directorio. La prueba local muestra por qué esos dos elementos deben evaluarse juntos; no sustituye una revisión del entorno concreto.

La conclusión es acotada: se trata de un riesgo condicionado por la configuración y de una posible carencia documental. Matomo lo clasificó como informativo. No es una demostración de una vulnerabilidad general de todas las instalaciones.
