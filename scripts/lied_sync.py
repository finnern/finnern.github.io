#!/usr/bin/env python3
"""Aktualisiert die Lied-Weiterleitungen lied/01..12 aus dem Google Sheet.

Nur Standardbibliothek. Aufruf:
  python3 scripts/lied_sync.py              # lädt das Sheet
  python3 scripts/lied_sync.py --csv x.csv  # lokale CSV (Test)

Bei Download-Fehler oder weniger als 12 gültigen Zeilen wird nichts
geändert; das Skript endet trotzdem mit Exit-Code 0 (nur Warnung).
"""
import argparse
import csv
import html
import io
import re
import sys
import urllib.request
from pathlib import Path

SHEET_URL = ("https://docs.google.com/spreadsheets/d/"
             "1vpxAARyqn28LfJBgZ5MoYb4fSHXanrUEnswBsiNkSeI/gviz/tq?tqx=out:csv")
ROOT = Path(__file__).resolve().parent.parent
LIED_DIR = ROOT / "lied"

META_RE = re.compile(r'(<meta http-equiv="refresh" content="0; url=)([^"]*)(">)')
ZIEL_RE = re.compile(r'(<a id="ziel" href=")([^"]*)(")')
STRONG_RE = re.compile(r'(<strong>)(.*?)(</strong>)')

INDEX_HEAD = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Lieder des Monats – Verweilbänkle 2027</title>
<style>body{font-family:system-ui,sans-serif;background:#5f7075;color:#fff;margin:0;padding:2rem 1rem;text-align:center}a{color:#fff}main{max-width:32rem;margin:auto}li{margin:.5rem 0;text-align:left}</style>
</head>
<body><main>
<h1>Lieder des Monats</h1>
<p>Verweilbänkle Kalender 2027</p>
<ol>
"""
INDEX_FOOT = """</ol>
<p><a href="/baenkle">Zum Verweilbänkle</a></p>
</main>
</body></html>
"""


def warn(msg):
    # ::warning:: erzeugt in GitHub Actions eine sichtbare Annotation
    print(f"::warning::{msg}")


def load_csv(path):
    if path:
        return Path(path).read_text(encoding="utf-8")
    req = urllib.request.Request(SHEET_URL, headers={"User-Agent": "lied-sync"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def parse_rows(text):
    rows = {}
    for i, row in enumerate(csv.DictReader(io.StringIO(text)), start=2):
        nr = (row.get("Nr") or "").strip()
        monat = (row.get("Monat") or "").strip()
        lied = (row.get("Lied") or "").strip()
        ziel = (row.get("Ziel") or "").strip()
        if not nr.isdigit() or not 1 <= int(nr) <= 12:
            warn(f"Zeile {i}: ungültige Nr {nr!r} – übersprungen")
            continue
        if not ziel.startswith("https://") or '"' in ziel or "<" in ziel:
            warn(f"Zeile {i} (Nr {nr}): ungültiges Ziel {ziel!r} – übersprungen")
            continue
        if not lied or not monat:
            warn(f"Zeile {i} (Nr {nr}): Lied oder Monat leer – übersprungen")
            continue
        if int(nr) in rows:
            warn(f"Zeile {i}: Nr {nr} doppelt – übersprungen")
            continue
        rows[int(nr)] = {"monat": monat, "lied": lied, "ziel": ziel}
    return rows


def update_page(path, entry):
    old = path.read_text(encoding="utf-8")
    url = html.escape(entry["ziel"], quote=True)
    lied = html.escape(entry["lied"], quote=False)
    new, n_meta = META_RE.subn(lambda m: m[1] + url + m[3], old, count=1)
    # Fallback-Link für Browser ohne Meta-Refresh auf dasselbe Ziel setzen
    new = ZIEL_RE.sub(lambda m: m[1] + url + m[3], new, count=1)
    new, n_strong = STRONG_RE.subn(lambda m: m[1] + lied + m[3], new, count=1)
    if not (n_meta and n_strong):
        warn(f"{path.relative_to(ROOT)}: Meta-Refresh oder <strong> nicht gefunden – unverändert")
        return False
    if new != old:
        path.write_text(new, encoding="utf-8")
        return True
    return False


def write_index(rows):
    items = "".join(
        f'<li><a href="{nr:02d}/">{html.escape(rows[nr]["monat"], quote=False)}: '
        f'{html.escape(rows[nr]["lied"], quote=False)}</a></li>\n'
        for nr in range(1, 13))
    path = LIED_DIR / "index.html"
    new = INDEX_HEAD + items + INDEX_FOOT
    if path.read_text(encoding="utf-8") != new:
        path.write_text(new, encoding="utf-8")
        return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", help="lokale CSV statt Download")
    args = ap.parse_args()

    try:
        text = load_csv(args.csv)
    except Exception as e:  # Netzwerk, HTTP, Dekodierung
        warn(f"CSV konnte nicht geladen werden: {e} – nichts geändert")
        return 0

    rows = parse_rows(text)
    if len(rows) < 12:
        missing = sorted(set(range(1, 13)) - rows.keys())
        warn(f"Nur {len(rows)} gültige Zeilen (fehlend: {missing}) – nichts geändert")
        return 0

    changed = [f"lied/{nr:02d}/index.html" for nr in range(1, 13)
               if update_page(LIED_DIR / f"{nr:02d}" / "index.html", rows[nr])]
    if write_index(rows):
        changed.append("lied/index.html")
    print("Geändert: " + ", ".join(changed) if changed else "Keine Änderungen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
