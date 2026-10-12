# Analizador web desde terminal: Tails y Linux en VMware

[Español](README.md) · [English](README.en.md)

Esta herramienta descarga la respuesta de una URL y prepara un informe HTML para leer y un JSON con los resultados. Opcionalmente abre la página con Chromium para observar JavaScript, texto renderizado y solicitudes del navegador.

**Para empezar en Tails, usa el ZIP Tails y `--sin-dinamico`.** Así solo necesitas Python 3, curl y el proxy Tor accesible. Para observar JavaScript, usa una VM Linux desechable con Playwright instalado.

Los paquetes contienen el mismo `analizar.py`. Cambian las instrucciones y el modo que eliges al ejecutarlo. No incluyen Tails, VMware, Playwright ni Chromium.

Ambos ZIP incluyen la guía, los inicios rápidos y la verificación en español e inglés. Los nombres de los comandos, la ayuda del programa y los textos de los informes permanecen en español.

## 1. Descargas

- [Descargar ZIP Tails](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_tails_vm.zip)
- [Descargar ZIP Linux](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_linux_vm.zip)
- [Sumas SHA-256](https://github.com/vincimech010233/vincimech010233/blob/main/ciberseguridad/analizador_tails/SHA256SUMS.txt)
- [Código para revisar antes de ejecutarlo](analizar.py)
- [Comprobaciones y limitaciones](VERIFICACION.md)

Los enlaces descargan el paquete concreto. El botón **Code → Download ZIP** de la raíz descarga todo el repositorio, con otros proyectos; no es necesario para esta herramienta. [GitHub: archivos de código fuente](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives).

## 2. Qué hace cada modo

| Capacidad | Tails, modo estático | Tails, modo dinámico | Linux, modo dinámico |
| --- | --- | --- | --- |
| Control desde terminal | Sí | Sí | Sí |
| Proxy Tor configurado por el script | Sí | Sí | No |
| Descargar respuesta y cabeceras HTTP | Sí | Sí | Sí |
| Ejecutar JavaScript de la página | No | Requiere Playwright y su Chromium | Requiere Playwright y su Chromium |
| Texto renderizado y captura de pantalla | No | Si se completa la fase dinámica | Si se completa la fase dinámica |
| Eventos HTTP del navegador | No | Si arranca el navegador; pueden ser parciales | Si arranca el navegador; pueden ser parciales |
| Informe HTML y JSON | Si llega a la escritura del informe | Si llega a la escritura del informe | Si llega a la escritura del informe |
| Monitorizar procesos, kernel o toda la red | No | No | No |

**Estático** significa descargar una respuesta sin ejecutar su JavaScript. **Dinámico** significa cargar la página en un navegador real automatizado. Una página puede mostrar resultados distintos en ambos casos.

## 3. Preparar Tails en VMware

Si ya tienes Tails arrancado y conectado a Tor, pasa al apartado 4.

Haz estos pasos en el **anfitrión**, el sistema donde tienes instalado VMware:

1. Descarga y verifica la **imagen ISO** desde [Tails: descargar ISO](https://tails.net/install/download-iso/index.en.html). La imagen USB tiene otro uso.
2. Crea una VM y selecciona la ISO como unidad CD/DVD de arranque. Si el asistente no reconoce Tails, selecciona un sistema Linux de 64 bits compatible con Debian y evita la instalación automática.
3. Como punto de partida de laboratorio, asigna 4 GB de RAM y 2 CPU virtuales, si el anfitrión tiene capacidad. Son valores orientativos, no una configuración validada aquí. Tails arranca como sistema live desde la ISO.
4. Desactiva carpetas compartidas, portapapeles compartido, arrastrar y soltar y conexión automática de dispositivos del anfitrión. Las etiquetas cambian según la versión de VMware.
5. Configura conectividad para que Tails pueda conectar con Tor. NAT permite salir a Internet, pero por sí solo no bloquea el acceso al anfitrión o a la LAN; el aislamiento de red requiere reglas externas adecuadas.
6. Arranca la VM desde la ISO. En Tails, conecta la red y espera a que **Tor Connection** indique que la conexión está lista.

**NOT_VERIFIED:** estos pasos de VMware son orientación general; no se han probado con tus versiones. Tails documenta GNOME Boxes y virt-manager, y advierte que el anfitrión puede observar la sesión y dejar rastros en disco. [Tails: máquinas virtuales](https://tails.net/doc/advanced_topics/virtualization/index.en.html).

El proxy Tor cambia la ruta de las conexiones. No convierte este script ni Chromium en Tor Browser, que incorpora otras protecciones de privacidad. [Tails: Tor Browser](https://tails.net/doc/anonymous_internet/Tor_Browser/index.en.html).

## 4. Descargar el ZIP dentro de Tails

**A partir de aquí trabaja dentro de la ventana de Tails**, no en una terminal del anfitrión.

### Opción sencilla: Tor Browser

1. Abre Tor Browser en Tails.
2. Visita esta guía en GitHub y pulsa **Descargar ZIP Tails**.
3. Guarda el archivo en la carpeta que prefieras dentro de tu carpeta personal. Recuerda dónde lo guardaste.
4. En **Archivos**, abre esa carpeta y comprueba que se llama `analizador_tails_vm.zip`. Si se ha descargado dos veces, el navegador puede haber añadido un número.
5. Descarga también `SHA256SUMS.txt` mediante su botón de descarga de archivo sin formato en GitHub y guárdalo junto al ZIP.

GitHub público no exige iniciar sesión para descargar este paquete. Si ves una página web de error en lugar de un ZIP, no la ejecutes ni la renombres como paquete.

### Alternativa: terminal con proxy explícito

Abre **Terminal** en Tails. El siguiente ejemplo usa el puerto `9050`; comprueba primero que Tor ha conectado. No uses el puerto sin proxy como alternativa si falla.

```bash
mkdir -p "$HOME/analizador-descargas"
cd "$HOME/analizador-descargas"
curl --fail --location --connect-timeout 20 --max-time 180 \
  --proxy socks5h://127.0.0.1:9050 \
  --output analizador_tails_vm.zip \
  'https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_tails_vm.zip'
curl --fail --location --connect-timeout 20 --max-time 180 \
  --proxy socks5h://127.0.0.1:9050 \
  --output SHA256SUMS.txt \
  'https://raw.githubusercontent.com/vincimech010233/vincimech010233/main/ciberseguridad/analizador_tails/SHA256SUMS.txt'
```

En `socks5h`, el proxy resuelve el nombre del servidor. `--fail` evita tratar una respuesta HTTP de error como una descarga correcta. Estos comandos contactan GitHub para descargar los archivos. [Manual de curl](https://curl.se/docs/manpage.html).

## 5. Comprobar y extraer

Si descargaste desde el navegador, en **Archivos** entra en la carpeta que contiene el ZIP y abre una terminal allí mediante el menú contextual, si está disponible. También puedes escribir `cd `, arrastrar la carpeta a la terminal y pulsar Intro. En la alternativa de terminal ya estás en la carpeta correcta.

Comprueba las herramientas:

```bash
pwd
ls -l analizador_tails_vm.zip SHA256SUMS.txt
python3 --version
curl --version
```

Compara el resultado de `sha256sum analizador_tails_vm.zip` con la línea de ese archivo en `SHA256SUMS.txt`. Deben coincidir los 64 caracteres. La suma permite detectar diferencias respecto al archivo publicado; no es una firma del autor.

Extrae a una carpeta nueva sin necesidad de instalar `unzip`:

```bash
python3 -m zipfile -t analizador_tails_vm.zip
mkdir analizador-tails
python3 -m zipfile -e analizador_tails_vm.zip analizador-tails
cd analizador-tails
ls
python3 analizar.py --help
```

La comprobación ZIP debe terminar sin error. Verás `analizar.py`, `README.md` y documentos de apoyo. Si `mkdir` indica que la carpeta existe, elige otro nombre y úsalo también al extraer y hacer `cd`.

## 6. Ejecutar en Tails: primero estático

Utiliza únicamente una página propia o incluida en un alcance autorizado. Sustituye `https://TU-SITIO-AUTORIZADO` por su URL completa y conserva las comillas:

```bash
python3 analizar.py 'https://TU-SITIO-AUTORIZADO' \
  --modo tails --tor-puerto 9050 --sin-dinamico \
  --salida resultado-tails-01
```

| Parte del comando | Significado |
| --- | --- |
| `python3 analizar.py` | Ejecuta el programa de la carpeta actual. |
| URL entre comillas | Página que vas a consultar. |
| `--modo tails` | Configura las conexiones del script con el proxy local. |
| `--tor-puerto 9050` | Puerto SOCKS que debe corresponder a tu configuración. |
| `--sin-dinamico` | Descarga HTTP sin arrancar Chromium ni ejecutar JavaScript. |
| `--salida resultado-tails-01` | Carpeta para los archivos de esta ejecución. |

El detector solo comprueba que puede conectar a ese puerto; **no demuestra que sea Tor**. Si no puede conectar, el script aborta antes de generar los informes. Este caso no es un análisis terminado.

Usa una carpeta de salida nueva por ejecución (`resultado-tails-02`, etc.). El script original no limpia los archivos previos: reutilizar una carpeta puede mezclar evidencias antiguas y nuevas.

## 7. Leer los resultados

```bash
ls -lh resultado-tails-01
python3 -m json.tool resultado-tails-01/informe.json | less
```

Pulsa `q` para salir de `less`. En **Archivos**, entra en `resultado-tails-01` y abre `informe.html` con Tor Browser seleccionándolo mediante su diálogo de apertura de archivos. El informe escapa el texto de la página y restringe recursos externos mediante CSP. No necesitas publicar el informe ni iniciar un servidor para leerlo.

| Archivo | Cómo interpretarlo |
| --- | --- |
| `informe.html` | Presentación del informe y del texto disponible. |
| `informe.json` | Datos, advertencias y errores; revísalos aunque exista HTML. |
| `cabeceras.txt` | Cabeceras HTTP; puede contener varias respuestas por redirecciones. |
| `respuesta.bin` | Bytes recibidos; puede ser parcial si falló curl. No lo abras como programa. |
| `fuente_escapada.txt` | Copia de texto de la respuesta; pese al nombre, contiene texto bruto. El escape se aplica al insertarlo en el informe HTML. |
| `contenido_visible.txt` | Texto renderizado, solo si la fase dinámica llegó a extraerlo. |
| `captura.png` | Imagen de la página, solo si la captura tuvo éxito. Se abre aparte del informe. |
| `dom.html.txt` | DOM serializado como texto, solo si esa fase tuvo éxito. |

En `informe.json`, revisa `http_estatico.codigo_salida`, `http_estatico.resumen`, `advertencias` y `errores`. Un código de curl `0` significa que la transferencia terminó; no implica HTTP 200 ni que la página sea segura. Una respuesta 403, 404 o un CAPTCHA también pueden haberse descargado correctamente.

Sin fase dinámica, `solicitudes` puede estar vacío: esa lista registra eventos del navegador, no la descarga hecha con curl. Ver una petición tampoco demuestra exfiltración.

Antes de apagar Tails, guarda lo que quieras conservar en un medio destinado al laboratorio. Una sesión live no garantiza conservar tus archivos al reiniciar. Las instantáneas de VMware también pueden conservar memoria y datos de la sesión.

## 8. JavaScript y versión Linux

Quitar `--sin-dinamico` hace que el programa intente usar Playwright con su propio Chromium. Tor Browser no sirve como sustituto. **NOT_VERIFIED:** disponibilidad y funcionamiento de esa combinación en Tails. No necesitas instalar Playwright para el modo estático.

Para la fase dinámica, descarga **ZIP Linux** dentro de una VM Debian/Ubuntu desechable, extráelo a una carpeta nueva y abre una terminal en ella. Instala allí las dependencias:

```bash
sudo apt update
sudo apt install -y python3-venv curl
python3 -m venv .venv
.venv/bin/python -m pip install playwright
.venv/bin/python -m playwright install --with-deps chromium
.venv/bin/python analizar.py 'https://TU-SITIO-AUTORIZADO' \
  --modo linux --salida resultado-linux-01 --segundos 15
```

La instalación descarga dependencias y puede pedir privilegios para los paquetes del sistema; ejecuta el analizador como usuario normal. [Instalación de Playwright](https://playwright.dev/python/docs/intro).

`--segundos 15` espera 15 segundos después de cargar inicialmente el documento; el tiempo total es mayor. Solo observa lo que ocurre durante esa visita: el script no hace clic ni rellena formularios. La página sí puede enviar solicitudes por su cuenta. Linux no usa Tor por defecto.

## 9. Resolver problemas

| Mensaje o síntoma | Siguiente paso |
| --- | --- |
| `can't open file ... analizar.py` | Ejecuta `pwd` y `ls`; entra con `cd` en la carpeta extraída. |
| No se detecta SOCKS local | Espera a Tor Connection y comprueba el puerto con `ss -ltn`. Un puerto abierto no identifica el servicio. |
| curl no instalado | Detente y consulta la instalación de software de tu versión de Tails. No cambies al modo Linux para eludir el proxy. |
| ZIP inválido o suma distinta | Descarga de nuevo y revisa que descargaste el archivo correcto. |
| `No module named playwright` | Usa `--sin-dinamico` en Tails o prepara Playwright en Linux. |
| Chromium no encontrado | En Linux, ejecuta la instalación de Chromium con el Python del mismo entorno `.venv`. |
| Timeout, 403 o CAPTCHA | Lee el error y la respuesta; conserva el resultado como fallo o parcial. |
| Existe informe pero falta captura | Comprueba `errores`: la fase dinámica pudo fallar o no haberse solicitado. |
| No se abre el HTML | Selecciónalo desde el diálogo de archivos del navegador, o lee el JSON con el comando anterior. |

## 10. Límites y estado de verificación

**VERIFIED:** integridad ZIP, sintaxis y ayuda CLI comprobadas localmente; consulta [la evidencia de validación](VERIFICACION.md). **OBSERVED:** ambos paquetes originales tienen el mismo script. **NOT_VERIFIED:** descarga y ejecución reales dentro de Tails o Linux en VMware, comportamiento de Chromium en Tails y ausencia de fugas de red.

La herramienta es un observador de páginas, no una sandbox completa de malware. No monitoriza procesos del sistema ni todo el tráfico. No bloquea todos los envíos: GET puede transmitir datos en la URL y JavaScript puede generar POST u otras solicitudes. El comentario del código sobre WebRTC no corresponde a una desactivación explícita verificable.

El script puede guardar información sensible que un servidor incluya en cabeceras, URL, consola o contenido. No introduzcas cuentas, cookies, tokens ni datos personales; revisa los resultados antes de conservarlos o compartirlos. Los informes de análisis no se incluyen en estos ZIP.
