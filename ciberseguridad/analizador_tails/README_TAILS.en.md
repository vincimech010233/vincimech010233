# Tails quick start

[Español](README_TAILS.md) · [English](README_TAILS.en.md)

Read `README.en.md` first to download from GitHub, prepare VMware, check the package, and read the report. Inside Tails, from the extracted folder:

```bash
python3 analizar.py 'https://YOUR-AUTHORIZED-SITE' --modo tails --tor-puerto 9050 --sin-dinamico --salida resultado-tails-01
```

This mode requires Python 3, curl, and an accessible Tor proxy. It does not execute JavaScript. An open port does not prove that the service is Tor. NOT_VERIFIED: actual execution in Tails/VMware.

The command options, program help, and report text remain in Spanish. Keep the option names as shown.
