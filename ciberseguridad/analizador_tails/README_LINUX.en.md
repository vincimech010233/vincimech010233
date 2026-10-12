# Disposable Linux quick start

[Español](README_LINUX.md) · [English](README_LINUX.en.md)

Read `README.en.md` first to prepare the VM, install dependencies, and read results. Inside the Debian/Ubuntu VM, from the extracted folder:

```bash
sudo apt update
sudo apt install -y python3-venv curl
python3 -m venv .venv
.venv/bin/python -m pip install playwright
.venv/bin/python -m playwright install --with-deps chromium
.venv/bin/python analizar.py 'https://YOUR-AUTHORIZED-SITE' --modo linux --salida resultado-linux-01 --segundos 15
```

Linux does not use Tor by default. The page executes JavaScript and may transmit data. NOT_VERIFIED: actual execution in Linux/VMware.

The command options, program help, and report text remain in Spanish. Keep the option names as shown.
