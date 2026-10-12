# Analizador web: Tails y Linux

[Español](README.md) · [English](README.en.md)

Revisa una URL dentro de una VM dedicada para reducir la exposición de tus archivos y cuentas personales. Guarda evidencias para entender qué devuelve la página y, en modo dinámico, qué solicitudes genera. **No certifica que una URL sea segura.**

**¿A quién le sirve?** A estudiantes de ciberseguridad, analistas SOC y desarrolladores que revisan páginas propias o autorizadas y necesitan conservar un informe.

**Tails:** consulta HTTP por el proxy Tor, sin JavaScript en estos pasos. **Linux con Playwright:** ejecuta JavaScript y permite capturar la página.

**Descargas:** [ZIP Tails](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_tails_vm.zip) · [ZIP Linux](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_linux_vm.zip)

Ambos ZIP incluyen instrucciones en español e inglés. La ayuda del programa y los informes están en español.

## Tails en VMware: cuatro pasos

### 1. Arranca y descarga

Arranca Tails en VMware y espera a que **Tor Connection** indique que está conectado. Si aún no tienes Tails, descarga y verifica su [ISO oficial](https://tails.net/install/download-iso/index.en.html) y úsala como CD/DVD de arranque de la VM.

**Dentro de Tails**, abre esta guía con Tor Browser y pulsa **ZIP Tails**. Guarda el archivo y abre una terminal en la carpeta donde lo descargaste.

### 2. Extrae el ZIP

```bash
python3 -m zipfile -e ./analizador_tails_vm.zip "$HOME/analizador-tails-01"
cd "$HOME/analizador-tails-01"
ls analizar.py
```

El primer comando lee el ZIP de la carpeta actual y crea automáticamente `analizador-tails-01` en tu carpeta personal. El segundo entra en ella; el tercero confirma que está `analizar.py`. No hace falta `mkdir`.

Si esa carpeta ya existe, cambia `01` por `02` en las dos primeras líneas para evitar mezclar archivos.

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

**Qué obtendrás:**

- `informe.html` e `informe.json`: resumen de la consulta, códigos HTTP, advertencias y errores.
- `cabeceras.txt` y `respuesta.bin`: cabeceras y respuesta descargadas; pueden ser parciales si falla la transferencia.
- Con la fase dinámica de Linux: solicitudes del navegador en el JSON y, si se completan los pasos correspondientes, `captura.png` y `contenido_visible.txt`.

Tails en este modo no genera captura. Si aparece **«no se detecta SOCKS»**, comprueba Tor y su puerto: el programa aborta sin generar informe. Una petición registrada no demuestra por sí sola exfiltración.

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
