# Inicio rápido en Linux desechable

Lee primero `README.md` para preparar la VM, instalar dependencias y leer resultados. Dentro de la VM Debian/Ubuntu, desde la carpeta extraída:

```bash
sudo apt update
sudo apt install -y python3-venv curl
python3 -m venv .venv
.venv/bin/python -m pip install playwright
.venv/bin/python -m playwright install --with-deps chromium
.venv/bin/python analizar.py 'https://TU-SITIO-AUTORIZADO' --modo linux --salida resultado-linux-01 --segundos 15
```

Linux no usa Tor por defecto. La página ejecuta JavaScript y puede transmitir datos. NOT_VERIFIED: ejecución real en Linux/VMware.
