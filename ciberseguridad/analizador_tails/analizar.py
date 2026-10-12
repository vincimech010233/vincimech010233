#!/usr/bin/env python3
"""Análisis de URL en VM desechable. No usar en host."""
import argparse, base64, hashlib, html, ipaddress, json, os, pathlib, socket, subprocess, sys, time, urllib.parse
from datetime import datetime, timezone

def sha(b): return hashlib.sha256(b).hexdigest()
def safe_url(u):
    p=urllib.parse.urlsplit(u)
    if p.scheme not in ('http','https') or not p.hostname or p.username or p.password: raise ValueError('URL HTTP(S) válida sin credenciales requerida')
    return u

def socks_available(port):
    try:
        with socket.create_connection(('127.0.0.1',port),timeout=1): return True
    except OSError:return False

def main():
    ap=argparse.ArgumentParser(description='Análisis visual y dinámico dentro de una VM')
    ap.add_argument('url'); ap.add_argument('--modo',choices=['tails','linux'],required=True)
    ap.add_argument('--salida',default='resultado'); ap.add_argument('--segundos',type=int,default=15)
    ap.add_argument('--tor-puerto',type=int,default=9050)
    ap.add_argument('--sin-dinamico',action='store_true',help='Solo HTTP estático; útil si Playwright no está instalado')
    a=ap.parse_args(); url=safe_url(a.url)
    if a.segundos<0 or a.segundos>120: ap.error('--segundos debe estar entre 0 y 120')
    out=pathlib.Path(a.salida).resolve(); out.mkdir(parents=True,exist_ok=True)
    report={'fecha_utc':datetime.now(timezone.utc).isoformat(),'modo':a.modo,'objetivo':url,'observaciones':[], 'advertencias':[], 'solicitudes':[], 'respuestas':[], 'errores':[], 'descargas':[], 'consola':[]}
    proxy=f'socks5h://127.0.0.1:{a.tor_puerto}' if a.modo=='tails' else None
    if a.modo=='tails':
        if not socks_available(a.tor_puerto): sys.exit('ERROR: no se detecta SOCKS Tor local en el puerto indicado. Abortado, sin acceso directo.')
        report['advertencias'].append('SOCKS detectado, pero no demuestra que el proxy sea Tor ni que no existan fugas. Verificar configuración de Tails.')
    # Descarga estática por curl. No utilizar shell. Limitar tamaños y tiempo.
    cmd=['curl','--silent','--show-error','--location','--max-redirs','8','--max-time','35','--connect-timeout','12','--max-filesize','5242880','--user-agent','Mozilla/5.0 (compatible; URLAnalysisLab/1.0)','--dump-header',str(out/'cabeceras.txt'),'--output',str(out/'respuesta.bin'),'--write-out','%{http_code}\n%{url_effective}\n%{remote_ip}\n',url]
    if proxy: cmd[1:1]=['--proxy',proxy]
    try:
        p=subprocess.run(cmd,text=True,capture_output=True,timeout=42)
        report['http_estatico']={'codigo_salida':p.returncode,'resumen':p.stdout.splitlines(),'error':p.stderr[-1000:]}
        if p.returncode!=0: report['advertencias'].append('Falló la descarga estática; no se debe interpretar como página vacía.')
        elif (out/'respuesta.bin').exists():
            b=(out/'respuesta.bin').read_bytes(); report['http_estatico']['sha256']=sha(b)
            # Mostrar fuente como texto escapado, jamás ejecutarla en informe.
            (out/'fuente_escapada.txt').write_text(b.decode('utf-8','replace')[:1000000],encoding='utf-8')
    except (FileNotFoundError,subprocess.TimeoutExpired) as e: report['errores'].append('curl: '+str(e))
    if not a.sin_dinamico:
        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as pw:
                kw={'headless':True}
                if a.modo=='tails': kw['proxy']={'server':f'socks5://127.0.0.1:{a.tor_puerto}'}
                # require own Playwright-managed browser; never alter Tor Browser.
                browser=pw.chromium.launch(**kw)
                context=browser.new_context(accept_downloads=False,service_workers='block',ignore_https_errors=False,
                                            viewport={'width':1280,'height':900})
                page=context.new_page()
                def req(r):
                    item={'metodo':r.method,'url':r.url,'tipo':r.resource_type}
                    if r.method not in ('GET','HEAD'): item['aviso']='Puede transferir datos; cuerpo omitido por privacidad'
                    report['solicitudes'].append(item)
                page.on('request',req)
                page.on('response',lambda r:report['respuestas'].append({'status':r.status,'url':r.url}))
                page.on('requestfailed',lambda r:report['errores'].append({'url':r.url,'error':'solicitud fallida'}))
                page.on('console',lambda m:report['consola'].append({'tipo':m.type,'texto':m.text[:500]}))
                page.on('download',lambda d:report['descargas'].append({'url':d.url,'nombre_sugerido':d.suggested_filename}))
                # Avoid WebRTC candidate leakage, clipboard permissions and automatic downloads.
                try:
                    response=page.goto(url,wait_until='domcontentloaded',timeout=30000)
                    page.wait_for_timeout(a.segundos*1000)
                    report['pagina']={'url_final':page.url,'titulo':page.title(),'estado_inicial':response.status if response else None}
                    (out/'contenido_visible.txt').write_text(page.locator('body').inner_text(timeout=7000)[:200000],encoding='utf-8')
                    page.screenshot(path=str(out/'captura.png'),full_page=True,timeout=10000)
                    # Serialize current DOM for forensic reference; never load untrusted DOM in report.
                    (out/'dom.html.txt').write_text(page.content()[:1000000],encoding='utf-8')
                finally: context.close();browser.close()
                report['observaciones'].append('Solicitudes registradas desde Playwright. No equivale a inspección de todos los paquetes de red.')
        except Exception as e:
            report['errores'].append('Dinámico no completado: '+type(e).__name__+': '+str(e)[:500])
            report['advertencias'].append('Dinámico no verificado. Requiere playwright y navegador Chromium instalado para Playwright.')
    else: report['advertencias'].append('Dinámico deshabilitado expresamente.')
    report['advertencias'] += ['No monitoriza procesos/archivos a nivel de kernel, exploits ni tráfico fuera del navegador.', 'Las solicitudes GET también pueden enviar datos en parámetros URL.', 'No confirmar exfiltración únicamente por la presencia de una petición.', 'No importar cookies, cuentas ni datos personales en esta VM.']
    (out/'informe.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    def section(title,content): return f'<section><h2>{html.escape(title)}</h2><pre>{html.escape(content)}</pre></section>'
    result='<!doctype html><html lang="es"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:"><title>Informe URL aislado</title><style>body{font:15px system-ui;max-width:1050px;margin:2em auto;padding:0 1em;background:#111827;color:#e5e7eb}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#1f2937;padding:1em;border-radius:8px}section{margin-bottom:1.6em}h1,h2{color:#93c5fd}</style><h1>Informe local (contenido no ejecutable)</h1>'
    result+=section('Datos y eventos',json.dumps(report,ensure_ascii=False,indent=2))
    for f in ('contenido_visible.txt','fuente_escapada.txt'):
        if (out/f).exists(): result+=section(f,(out/f).read_text(encoding='utf-8')[:100000])
    result+='</html>'
    (out/'informe.html').write_text(result,encoding='utf-8')
    print('Informe:',out/'informe.html'); print('JSON:',out/'informe.json'); print('Eventos:',len(report['solicitudes']),'Errores:',len(report['errores']))
    if report['errores']: print('ATENCIÓN: hay errores; revise informe.json')
if __name__=='__main__': main()
