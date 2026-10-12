# Web analyzer: Tails and Linux

[Español](README.md) · [English](README.en.md)

Visit a page and save a report. **Tails** downloads its response through the Tor proxy without running JavaScript. **Linux with Playwright** lets you observe JavaScript and take a screenshot.

**Downloads:** [Tails ZIP](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_tails_vm.zip) · [Linux ZIP](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_linux_vm.zip)

Both ZIPs include Spanish and English instructions. Program help and reports are in Spanish.

## Tails in VMware: four steps

### 1. Start and download

Start Tails in VMware and wait until **Tor Connection** says it is connected. If you do not have Tails yet, download and verify its [official ISO](https://tails.net/install/download-iso/index.en.html) and use it as the VM's boot CD/DVD.

**Inside Tails**, open this guide with Tor Browser and click **Tails ZIP**. Save the file and open a terminal in the folder where you downloaded it.

### 2. Extract the ZIP

```bash
mkdir analizador-tails
python3 -m zipfile -e analizador_tails_vm.zip analizador-tails
cd analizador-tails
```

If the folder already exists, use another name in all three lines.

### 3. Run

Replace the URL with a page you own or are authorized to analyze:

```bash
python3 analizar.py 'https://YOUR-AUTHORIZED-SITE' \
  --modo tails --tor-puerto 9050 --sin-dinamico \
  --salida resultado-tails-01
```

You need Python 3, curl, and an accessible Tor proxy on the specified port. `--sin-dinamico` prevents JavaScript execution. Use a new output folder for each run.

### 4. Open the report

In **Files**, enter `resultado-tails-01` and open `informe.html` with Tor Browser. Check the warnings and errors; the JSON is in `informe.json`.

This mode has no screenshot or rendered text. If you see **“no se detecta SOCKS”**, check the Tor connection and its port: the program aborts without creating a report.

<details>
<summary><strong>Linux: observe JavaScript and take a screenshot</strong></summary>

Download the **Linux ZIP** inside a disposable Debian/Ubuntu VM. Extract it and open a terminal in the folder containing `analizar.py`.

Install the dependencies:

```bash
sudo apt update
sudo apt install -y python3-venv curl
python3 -m venv .venv
.venv/bin/python -m pip install playwright
.venv/bin/python -m playwright install --with-deps chromium
```

Run with a URL you own or are authorized to analyze:

```bash
.venv/bin/python analizar.py 'https://YOUR-AUTHORIZED-SITE' \
  --modo linux --salida resultado-linux-01 --segundos 15
```

Open `resultado-linux-01/informe.html`. If the dynamic phase completes successfully, you will also find `captura.png` and `contenido_visible.txt`. Linux does not use Tor by default.

</details>

## Before using it

Use a dedicated VM without credentials or shared folders. The page may send data; NAT alone does not guarantee isolation. An accessible proxy does not establish anonymity. Save your results before shutting down Tails.

**VERIFIED:** ZIP integrity and seven offline tests per package. **NOT_VERIFIED:** actual execution in VMware.

[Verification and limits](VERIFICATION.en.md) · [SHA-256 checksums](https://github.com/vincimech010233/vincimech010233/blob/main/ciberseguridad/analizador_tails/SHA256SUMS.txt)
