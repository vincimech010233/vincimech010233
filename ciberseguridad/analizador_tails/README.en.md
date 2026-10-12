# Terminal web analyzer: Tails and Linux in VMware

[Español](README.md) · [English](README.en.md)

This tool downloads a URL's response and creates an HTML report to read and a JSON file with the results. Optionally, it opens the page in Chromium to observe JavaScript, rendered text, and browser requests.

**To start in Tails, use the Tails ZIP and `--sin-dinamico`.** You only need Python 3, curl, and an accessible Tor proxy. To observe JavaScript, use a disposable Linux VM with Playwright installed.

Both packages contain the same `analizar.py`. The instructions and the execution mode you choose differ. Neither package includes Tails, VMware, Playwright, or Chromium.

Both ZIPs include the guide, quick starts, and verification notes in Spanish and English. Command names, program help, and report text remain in Spanish. Keep the option names exactly as shown in the commands below.

## 1. Downloads

- [Download Tails ZIP](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_tails_vm.zip)
- [Download Linux ZIP](https://github.com/vincimech010233/vincimech010233/raw/refs/heads/main/ciberseguridad/analizador_tails/analizador_linux_vm.zip)
- [SHA-256 checksums](https://github.com/vincimech010233/vincimech010233/blob/main/ciberseguridad/analizador_tails/SHA256SUMS.txt)
- [Source code to review before running](analizar.py)
- [Checks and limitations](VERIFICATION.en.md)

These links download the individual package. **Code → Download ZIP** at the repository root downloads the whole repository, including other projects; you do not need it for this tool. [GitHub: source code archives](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives).

## 2. What each mode does

| Capability | Tails, static mode | Tails, dynamic mode | Linux, dynamic mode |
| --- | --- | --- | --- |
| Terminal control | Yes | Yes | Yes |
| Tor proxy configured by the script | Yes | Yes | No |
| Download HTTP response and headers | Yes | Yes | Yes |
| Execute the page's JavaScript | No | Requires Playwright and its Chromium | Requires Playwright and its Chromium |
| Rendered text and screenshot | No | If the dynamic phase completes | If the dynamic phase completes |
| Browser HTTP events | No | If the browser starts; may be partial | If the browser starts; may be partial |
| HTML and JSON report | If execution reaches report writing | If execution reaches report writing | If execution reaches report writing |
| Monitor processes, kernel, or all network traffic | No | No | No |

**Static** means downloading a response without executing its JavaScript. **Dynamic** means loading the page in a real automated browser. A page may produce different results in each case.

## 3. Prepare Tails in VMware

If Tails is already running and connected to Tor, go to section 4.

Perform these steps on the **host**, the system where VMware is installed:

1. Download and verify the **ISO image** from [Tails: ISO download](https://tails.net/install/download-iso/index.en.html). The USB image serves a different purpose.
2. Create a VM and select the ISO as its boot CD/DVD drive. If the wizard does not recognize Tails, select a Debian-compatible 64-bit Linux system and avoid automatic installation.
3. As a starting point for the lab, allocate 4 GB of RAM and 2 virtual CPUs if the host has enough capacity. These are suggested values, not a configuration validated here. Tails boots as a live system from the ISO.
4. Disable shared folders, shared clipboard, drag and drop, and automatic connection of host devices. Labels vary between VMware versions.
5. Configure connectivity so Tails can connect to Tor. NAT allows Internet access but does not, by itself, block access to the host or LAN; network isolation requires appropriate external rules.
6. Boot the VM from the ISO. In Tails, connect the network and wait until **Tor Connection** says the connection is ready.

**NOT_VERIFIED:** these VMware steps are general guidance; they have not been tested with your versions. Tails documents GNOME Boxes and virt-manager and warns that the host can observe the session and leave disk traces. [Tails: virtual machines](https://tails.net/doc/advanced_topics/virtualization/index.en.html).

The Tor proxy changes the route used by connections. It does not turn this script or Chromium into Tor Browser, which includes additional privacy protections. [Tails: Tor Browser](https://tails.net/doc/anonymous_internet/Tor_Browser/index.en.html).

## 4. Download the ZIP inside Tails

**From here onward, work inside the Tails window**, not in a host terminal.

### Simple option: Tor Browser

1. Open Tor Browser in Tails.
2. Visit this guide on GitHub and click **Download Tails ZIP**.
3. Save the file in a folder of your choice inside your home folder. Remember where you saved it.
4. In **Files**, open that folder and check that the file is named `analizador_tails_vm.zip`. If downloaded twice, the browser may have added a number.
5. Also download `SHA256SUMS.txt` using GitHub's raw-file download button and save it beside the ZIP.

You do not need to sign in to download this package from public GitHub. If you receive a web error page instead of a ZIP, do not execute it or rename it as a package.

### Alternative: terminal with an explicit proxy

Open **Terminal** in Tails. The following example uses port `9050`; first check that Tor has connected. Do not fall back to a direct connection if the proxy fails.

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

With `socks5h`, the proxy resolves the server name. `--fail` avoids treating an HTTP error response as a successful download. These commands contact GitHub to download the files. [curl manual](https://curl.se/docs/manpage.html).

## 5. Check and extract

If you downloaded through the browser, open the folder containing the ZIP in **Files** and open a terminal there using the context menu, if available. Alternatively, type `cd `, drag the folder into the terminal, and press Enter. With the terminal download option, you are already in the correct folder.

Check the tools:

```bash
pwd
ls -l analizador_tails_vm.zip SHA256SUMS.txt
python3 --version
curl --version
```

Compare the output of `sha256sum analizador_tails_vm.zip` with that file's line in `SHA256SUMS.txt`. All 64 characters must match. The checksum detects differences from the published file; it is not an author's signature.

Extract into a new folder without installing `unzip`:

```bash
python3 -m zipfile -t analizador_tails_vm.zip
mkdir analizador-tails
python3 -m zipfile -e analizador_tails_vm.zip analizador-tails
cd analizador-tails
ls
python3 analizar.py --help
```

The ZIP check should finish without an error. You will see `analizar.py`, `README.md`, and supporting documents. If `mkdir` says the folder already exists, choose another name and use it when extracting and running `cd`.

## 6. Run in Tails: start with static mode

Use only a page you own or one included in an authorized scope. Replace `https://YOUR-AUTHORIZED-SITE` with its full URL and keep the quotes:

```bash
python3 analizar.py 'https://YOUR-AUTHORIZED-SITE' \
  --modo tails --tor-puerto 9050 --sin-dinamico \
  --salida resultado-tails-01
```

| Command part | Meaning |
| --- | --- |
| `python3 analizar.py` | Runs the program in the current folder. |
| Quoted URL | Page you will visit. |
| `--modo tails` | Configures the script's connections to use the local proxy. |
| `--tor-puerto 9050` | SOCKS port that must match your configuration. |
| `--sin-dinamico` | Downloads HTTP without starting Chromium or running JavaScript. |
| `--salida resultado-tails-01` | Folder for this run's files. |

The detector only checks whether it can connect to that port; **it does not prove that the service is Tor**. If it cannot connect, the script aborts before generating the reports. This is not a completed analysis.

Use a new output folder for every run (`resultado-tails-02`, etc.). The original script does not clean up previous files: reusing a folder can mix old and new evidence.

## 7. Read the results

```bash
ls -lh resultado-tails-01
python3 -m json.tool resultado-tails-01/informe.json | less
```

Press `q` to exit `less`. In **Files**, enter `resultado-tails-01` and open `informe.html` with Tor Browser by selecting it through the browser's file-open dialog. The report escapes page text and restricts external resources using CSP. You do not need to publish the report or start a server to read it.

| File | How to interpret it |
| --- | --- |
| `informe.html` | Report presentation and available text. |
| `informe.json` | Data, warnings, and errors; check these even when HTML exists. |
| `cabeceras.txt` | HTTP headers; may include multiple responses due to redirects. |
| `respuesta.bin` | Received bytes; may be partial if curl failed. Do not open it as a program. |
| `fuente_escapada.txt` | Text copy of the response; despite its name, it contains raw text. Escaping occurs when it is inserted into the HTML report. |
| `contenido_visible.txt` | Rendered text, only if the dynamic phase reached text extraction. |
| `captura.png` | Page image, only if the screenshot succeeded. Open it separately from the report. |
| `dom.html.txt` | DOM serialized as text, only if that step succeeded. |

In `informe.json`, check `http_estatico.codigo_salida`, `http_estatico.resumen`, `advertencias` (warnings), and `errores` (errors). A curl exit code of `0` means the transfer finished; it does not imply HTTP 200 or a safe page. A 403, 404, or CAPTCHA response may also have been downloaded successfully.

Without the dynamic phase, `solicitudes` (requests) may be empty: this list records browser events, not the curl download. Seeing a request does not establish exfiltration either.

Before shutting down Tails, save anything you want to keep on storage dedicated to the lab. A live session does not guarantee that files will survive a restart. VMware snapshots may also retain session memory and data.

## 8. JavaScript and the Linux version

Removing `--sin-dinamico` makes the program attempt to use Playwright with its own Chromium. Tor Browser cannot be used as a substitute. **NOT_VERIFIED:** availability and operation of that combination in Tails. You do not need to install Playwright for static mode.

For the dynamic phase, download the **Linux ZIP** inside a disposable Debian/Ubuntu VM, extract it into a new folder, and open a terminal there. Install the dependencies inside that VM:

```bash
sudo apt update
sudo apt install -y python3-venv curl
python3 -m venv .venv
.venv/bin/python -m pip install playwright
.venv/bin/python -m playwright install --with-deps chromium
.venv/bin/python analizar.py 'https://YOUR-AUTHORIZED-SITE' \
  --modo linux --salida resultado-linux-01 --segundos 15
```

Installation downloads dependencies and may require privileges for system packages; run the analyzer as a normal user. [Playwright installation](https://playwright.dev/python/docs/intro).

`--segundos 15` waits 15 seconds after the initial document load; total execution time is longer. It only observes what happens during that visit: the script does not click or fill in forms. The page can send requests on its own. Linux does not use Tor by default.

## 9. Troubleshooting

| Message or symptom | Next step |
| --- | --- |
| `can't open file ... analizar.py` | Run `pwd` and `ls`; use `cd` to enter the extracted folder. |
| Local SOCKS service not detected | Wait for Tor Connection and check the port with `ss -ltn`. An open port does not identify the service. |
| curl not installed | Stop and consult software installation instructions for your Tails version. Do not switch to Linux mode to bypass the proxy. |
| Invalid ZIP or checksum mismatch | Download again and check that you selected the correct file. |
| `No module named playwright` | Use `--sin-dinamico` in Tails or prepare Playwright in Linux. |
| Chromium not found | In Linux, install Chromium using the Python from the same `.venv` environment. |
| Timeout, 403, or CAPTCHA | Read the error and response; preserve the result as failed or partial. |
| Report exists but screenshot is missing | Check `errores`: the dynamic phase may have failed or may not have been requested. |
| HTML will not open | Select it through the browser's file dialog, or read the JSON using the command above. |

## 10. Limits and verification status

**VERIFIED:** ZIP integrity, syntax, and CLI help checked locally; see [verification evidence](VERIFICATION.en.md). **OBSERVED:** both original packages have the same script. **NOT_VERIFIED:** actual download and execution inside Tails or Linux in VMware, Chromium behavior in Tails, and absence of network leaks.

The tool observes pages; it is not a complete malware sandbox. It does not monitor system processes or all traffic. It does not block all outgoing data: GET can transmit data in the URL, and JavaScript can generate POST or other requests. The code comment about WebRTC does not correspond to an explicit, verifiable disabling mechanism.

The script can save sensitive information included by a server in headers, URLs, console output, or content. Do not introduce accounts, cookies, tokens, or personal data; review results before keeping or sharing them. Analysis reports are not included in these ZIPs.
