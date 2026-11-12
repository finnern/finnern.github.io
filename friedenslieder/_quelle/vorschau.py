#!/usr/bin/env python3
"""Lokale Live-Vorschau des Liederbuchs.

Im Ordner friedenslieder/ starten:   python3 _quelle/vorschau.py
Dann http://localhost:8765/ öffnen. Bei jedem Speichern in _quelle/lieder/
(oder an build.py / template.html) wird index.html neu gebaut und der Browser
lädt sich selbst neu. Online geht dabei nichts: dafür weiterhin commit + push.
"""
import http.server
import pathlib
import subprocess
import sys
import threading
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent  # friedenslieder/
QUELLE = ROOT / "_quelle"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765

version = 0
fehler = ""

RELOAD_JS = b"""
<script>
(function(){var v=null;setInterval(function(){
 fetch("/__version",{cache:"no-store"}).then(function(r){return r.text()}).then(function(t){
  if(v===null){v=t}else if(t!==v){location.reload()}}).catch(function(){});
},1000)})();
</script>
"""


def stand():
    files = list((QUELLE / "lieder").glob("*.md")) + [QUELLE / "build.py", QUELLE / "template.html"]
    return {str(f): f.stat().st_mtime for f in files if f.exists()}


def bauen():
    global version, fehler
    r = subprocess.run(
        [sys.executable, str(QUELLE / "build.py"), str(QUELLE / "lieder"), str(ROOT / "index.html")],
        cwd=ROOT, capture_output=True, text=True,
    )
    zeit = time.strftime("%H:%M:%S")
    if r.returncode == 0:
        fehler = ""
        version += 1
        print(f"{zeit}  neu gebaut", flush=True)
    else:
        fehler = r.stderr or r.stdout
        version += 1
        print(f"{zeit}  FEHLER beim Bauen, alte Seite bleibt:\n{fehler}", flush=True)


def beobachten():
    alt = stand()
    while True:
        time.sleep(0.5)
        neu = stand()
        if neu != alt:
            time.sleep(0.3)  # Obsidian speichert manchmal in mehreren Schritten
            alt = stand()
            bauen()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        pfad = self.path.split("?")[0].split("#")[0]
        if pfad == "/__version":
            return self.antwort(str(version).encode(), "text/plain")
        if pfad in ("/", "/index.html"):
            html = (ROOT / "index.html").read_bytes()
            if fehler:
                box = ('<pre style="position:fixed;top:0;left:0;right:0;z-index:99;margin:0;padding:1rem;'
                       'background:#b00;color:#fff;white-space:pre-wrap">Fehler beim Bauen (alte Seite):\n'
                       + fehler.replace("&", "&amp;").replace("<", "&lt;") + "</pre>").encode()
                html = html.replace(b"<body>", b"<body>" + box, 1)
            html = html.replace(b"</body>", RELOAD_JS + b"</body>", 1)
            return self.antwort(html, "text/html; charset=utf-8")
        return super().do_GET()

    def antwort(self, data, typ):
        self.send_response(200)
        self.send_header("Content-Type", typ)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    bauen()
    threading.Thread(target=beobachten, daemon=True).start()
    print(f"Vorschau: http://localhost:{PORT}/   (beenden mit Ctrl+C)", flush=True)
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
