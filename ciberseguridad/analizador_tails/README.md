# Analizador web: Tails y Linux

[Español](README.md) · [English](README.en.md)

Consulta una página y guarda un informe. **Tails** descarga su respuesta por el proxy Tor, sin ejecutar JavaScript. **Linux con Playwright** permite observar JavaScript y obtener una captura.

**Descargas:** [ZIP Tails](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_tails_vm.zip) · [ZIP Linux](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_linux_vm.zip)

Ambos ZIP incluyen instrucciones en español e inglés. La ayuda del programa y los informes están en español.

## Tails en VMware: cuatro pasos

### 1. Arranca y descarga

Arranca Tails en VMware y espera a que **Tor Connection** indique que está conectado. Si aún no tienes Tails, descarga y verifica su [ISO oficial](https://tails.net/install/download-iso/index.en.html) y úsala como CD/DVD de arranque de la VM.

**Dentro de Tails**, abre esta guía con Tor Browser y pulsa **ZIP Tails**. Guarda el archivo y abre una terminal en la carpeta donde lo descargaste.

### 2. Extrae el ZIP

```bash
mkdir analizador-tails
python3 -m zipfile -e analizador_tails_vm.zip analizador-tails
cd analizador-tails
```

Si la carpeta ya existe, utiliza otro nombre en las tres líneas.

### 3. Ejecuta

Sustituye la URL por una página propia o autorizada:

```bash
python3 analizar.py 'https://TU-SITIO-AUTORIZADO' \
  --modo tails --tor-puerto 9050 --sin-dinamico \
  --salida resultado-tails-01
```

Necesitas Python 3, curl y el proxy Tor accesible en el puerto indicado. `--sin-dinamico` evita ejecutar JavaScript. Usa una carpeta de salida nueva en cada ejecución.

### 4. Abre el informe

En **Archivos**, entra en `resultado-tails-01` y abre `informe.html` con Tor Browser. Revisa las advertencias y errores; el JSON está en `informe.json`.

En este modo no hay captura ni texto renderizado. Si aparece **«no se detecta SOCKS»**, comprueba la conexión de Tor y su puerto: el programa aborta sin generar informe.

<details>
<summary><strong>Linux: observar JavaScript y obtener una captura</strong></summary>

Descarga **ZIP Linux** dentro de una VM Debian/Ubuntu desechable. Extráelo y abre una terminal en la carpeta que contiene `analizar.py`.

Instala las dependencias:

```bash
sudo apt update
sudo apt install -y python3-venv curl
python3 -m venv .venv
.venv/bin/python -m pip install playwright
.venv/bin/python -m playwright install --with-deps chromium
```

Ejecuta con una URL propia o autorizada:

```bash
.venv/bin/python analizar.py 'https://TU-SITIO-AUTORIZADO' \
  --modo linux --salida resultado-linux-01 --segundos 15
```

Abre `resultado-linux-01/informe.html`. Si la fase dinámica termina correctamente, encontrarás también `captura.png` y `contenido_visible.txt`. Linux no usa Tor por defecto.

</details>

## Antes de usarlo

Usa una VM dedicada, sin credenciales ni carpetas compartidas. La página puede enviar datos; NAT por sí solo no garantiza aislamiento. Un proxy accesible no demuestra anonimato. Guarda tus resultados antes de apagar Tails.

**VERIFIED:** ZIP y siete pruebas offline por paquete. **NOT_VERIFIED:** ejecución real en VMware.

[Verificación y límites](VERIFICACION.md) · [Sumas SHA-256](https://github.com/vincimech010233/vincimech010233/blob/main/ciberseguridad/analizador_tails/SHA256SUMS.txt)
