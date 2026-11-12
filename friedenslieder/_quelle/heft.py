#!/usr/bin/env python3
"""Druckheft: 8 A5-Seiten auf zwei A4-Blättern (beidseitig, ineinandergelegt und gefaltet oder geschnitten).

Aufruf (im Ordner friedenslieder/):
    python3 _quelle/heft.py [DRUCKORDNER]

DRUCKORDNER (Standard: ~/Documents/finnern/Friedenslieder-Druck) liegt bewusst
NICHT im Repo: dort stehen Texte, die nur gedruckt, aber nicht veröffentlicht
werden (gleichnamige .md-Dateien ersetzen die aus _quelle/lieder), dazu
banner.jpg (Titelblatt, volle Breite) und plakat.png (spaltenbreit). Ergebnis im DRUCKORDNER:
    Liedheft-A5.pdf        Seiten in Lesereihenfolge (zum Ansehen)
    Liedheft-Druck-A4-falten.pdf     A4 quer, beidseitig, kurze Kante wenden, in der Mitte falten
    Liedheft-Druck-A4-schneiden.pdf  dasselbe, aber in der Mitte schneiden: zwei A5-Blätter
Braucht Google Chrome und pypdf.
"""
import html, pathlib, re, subprocess, sys, tempfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
src = (HERE / "build.py").read_text()
ns = {}
exec(re.search(r"^EVENT = .*?$", src, re.M).group(0), ns)
exec(re.search(r"^SETLIST = \[.*?^\]", src, re.M | re.S).group(0), ns)
EVENT, SETLIST = ns["EVENT"], ns["SETLIST"]
DRUCK = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path.home() / "Documents/finnern/Friedenslieder-Druck"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL = "finnern.com/friedenslieder"
SEITEN = 8

# Bei diesen Liedern nur Strophe 1 (und Refrain) ganz, weitere Strophen als Anfangszeile
KURZ = {"kumbaya", "down-by-the-riverside", "we-shall-overcome"}
STATUS = re.compile(r"^(Tonart|GEMA|gemeinfrei|neu im|Text nicht|Melodie gemeinfrei|mit Erlaubnis)", re.I)
CH = re.compile(r"\[([^\]]+)\]")
esc = html.escape


def lade(name):
    f = DRUCK / f"{name}.md"
    if not f.exists():
        f = HERE / "lieder" / f"{name}.md"
    t = f.read_text()
    kopf, _, rest = t.partition("```")
    block = rest.partition("```")[0].strip("\n").splitlines()
    zeilen = kopf.strip().splitlines()
    titel = zeilen[0].lstrip("# ").strip()
    meta = {}
    credit = ""
    rufe = []
    for z in zeilen[1:]:
        z = z.strip()
        if not z:
            continue
        k, sep, v = z.partition(": ")
        if k == "Einstieg":
            meta["einstieg"] = v
        elif k == "Ruf":
            rufe.append(v.split("|")[0].strip())
        elif k in ("Link", "Bild", "Rufe", "Hinweis"):
            pass
        elif not credit:
            credit = " · ".join(p for p in z.split(" · ") if not STATUS.match(p.strip()))
    return titel, credit, meta, rufe, block


def zeile_html(z):
    out = ""
    for teil in re.split(r"(\[[^\]]+\])", z):
        m = CH.fullmatch(teil)
        if m:
            out += f'<b class="c">{esc(m.group(1).lstrip("~"))}</b> '
        else:
            out += esc(teil)
    return out


def lied_html(nr, name, neue_seite=False):
    titel, credit, meta, rufe, block = lade(name)
    # unsichtbare Marken: damit prüft das Skript, dass kein Lied auf die nächste Seite umbricht
    klasse = "lied neu" if neue_seite else "lied"
    h = [f'<section class="{klasse}"><h2><span class="mk">§A{nr}§</span><span class="nr">{nr}</span>{esc(titel)}</h2>']
    if credit:
        h.append(f'<p class="cr">{esc(credit)}</p>')
    if meta.get("einstieg"):
        kurz = " · ".join(meta["einstieg"].split(" · ")[:2])
        h.append(f'<p class="ein">{esc(kurz)}</p>')
    # in Strophen zerlegen
    strophen, cur = [], []
    for z in block + [""]:
        if z.strip().startswith("## "):
            if cur:
                strophen.append(cur)
            strophen.append([z.strip()]); cur = []
        elif z.strip():
            cur.append(z.rstrip())
        elif cur:
            strophen.append(cur); cur = []
    weitere = []
    erste_nummer_gesehen = False
    for st in strophen:
        num = st[0].strip() if re.fullmatch(r"\d+\.", st[0].strip()) else None
        if num:
            if name in KURZ and erste_nummer_gesehen:
                erste = next((CH.sub("", z).strip() for z in st[1:] if CH.sub("", z).strip() and not z.strip().startswith("(")), "")
                weitere.append(erste.rstrip(",.;:") + " …")
                continue
            erste_nummer_gesehen = True
        teile = []
        for z in (st[1:] if num else st):
            s = z.strip()
            plain = CH.sub("", s).strip()
            if s.startswith("## "):
                teile.append(f'<p class="sub">{esc(s[3:])}</p>')
            elif re.fullmatch(r"\(.*\)", plain) and not CH.search(s):
                teile.append(f'<p class="hin">{esc(plain)}</p>')
            elif re.fullmatch(r"[^\[]*:\s*(\[[^\]]+\]\s*)+", s):
                akk = " ".join(c.lstrip("~") for c in CH.findall(s))
                teile.append(f'<p class="prog"><span>{esc(plain)}</span> <b class="c">{esc(akk)}</b></p>')
            elif plain.endswith(":") and not CH.search(s):
                teile.append(f'<p class="lab">{esc(plain)}</p>')
            else:
                teile.append(f"<p>{zeile_html(s)}</p>")
        nummer = f'<span class="snr">{esc(num)}</span>' if num else ""
        h.append(f'<div class="st">{nummer}{"".join(teile)}</div>')
    if weitere:
        h.append(f'<p class="weiter"><i>Weitere Strophen:</i> {esc(" · ".join(weitere))}</p>')
    if rufe:
        h.append(f'<p class="weiter"><i>Rufe:</i> {esc(" · ".join(rufe))}</p>')
    h.append(f'<span class="mk">§E{nr}§</span></section>')
    return "\n".join(h)


def bild(name):
    for endung in (".jpg", ".jpeg", ".png"):
        f = DRUCK / f"{name}{endung}"
        if f.exists():
            return f.as_uri()


def seite(fs, plakat_nach=None, neu=()):
    """plakat_nach: Plakat (plakat.png, spaltenbreit) nach diesem Lied einsetzen."""
    font = (ROOT / "fonts").as_uri()
    ban = f'<img class="banner" src="{bild("banner")}" alt="">' if bild("banner") else ""
    qr = (ROOT / "qr-friedenslieder.png").as_uri()
    # Seitenumbruch im Mehrspaltensatz geht nur über einen neuen Spaltenblock
    teile = [('</main><main class="neu">' if str(i + 1) in neu else "") + lied_html(i + 1, n) for i, (n, _) in enumerate(SETLIST)]
    if bild("plakat") and plakat_nach is not None:
        teile.insert(plakat_nach, f'<figure class="plakat"><img src="{bild("plakat")}" alt=""></figure>')
    # Titelseite mit Foto, Plakat und QR-Code (feste Größen, unabhängig von der Liedschrift)
    pl = f'<img class="plakat-titel" src="{bild("plakat")}" alt="">' if bild("plakat") and plakat_nach is None else ""
    lieder = "\n".join(teile)
    return f"""<!doctype html><html lang="de"><meta charset="utf-8"><style>
@font-face {{ font-family: "AS"; font-weight: 500; src: url("{font}/alegreya-sans-latin-500-normal.woff2"); }}
@font-face {{ font-family: "AS"; font-weight: 800; src: url("{font}/alegreya-sans-latin-800-normal.woff2"); }}
@font-face {{ font-family: "AT"; font-weight: 700; src: url("{font}/atkinson-hyperlegible-latin-700-normal.woff2"); }}
@page {{ size: 148mm 210mm; margin: 8mm 8mm 9mm; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; font: 500 {fs}pt/1.22 "AS", sans-serif; color: #17202a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
.cover {{ text-align: center; height: 192mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; font-size: 11pt; break-after: page; }}
.cover h1 {{ font-size: 26pt; font-weight: 800; margin: 0; color: #2c4a17; line-height: 1.05; }}
.untertitel {{ font-size: 15pt; margin: 0; color: #56616a; }}
.termin {{ margin: 0; font-size: 11pt; }}
.plakat-titel {{ width: 66%; border-radius: 1.5mm; display: block; }}
.banner {{ width: 100%; display: block; border-radius: 2mm; }}
main {{ column-count: 2; column-gap: 5mm; column-fill: auto; }}
.lied {{ margin: 0 0 2.2mm; break-inside: avoid; }}
.neu {{ break-before: page; }}
.mk {{ font-size: 1px; color: #fff; line-height: 0; }}
.plakat {{ margin: 0 0 2.2mm; break-inside: avoid; }}
.plakat img {{ width: 100%; display: block; border-radius: 1.5mm; }}
h2 {{ font-size: 1.22em; font-weight: 800; margin: 0; color: #2c4a17; break-after: avoid; }}
.nr {{ display: inline-block; min-width: 1.2em; color: #86986e; }}
.cr, .ein, .hin, .weiter {{ font-size: .82em; color: #56616a; margin: 0; }}
.ein {{ font-style: italic; }}
.cr, .ein {{ break-after: avoid; }}
.st {{ margin: .9mm 0 0; break-inside: avoid; position: relative; padding-left: 1.2em; }}
.snr {{ position: absolute; left: 0; font-weight: 800; color: #86986e; }}
.st p {{ margin: 0; }}
.sub, .lab {{ font-weight: 800; }}
.prog span {{ color: #56616a; }}
.c {{ font-family: "AT", sans-serif; font-weight: 700; color: #3c5c1f; font-size: .92em; }}
.weiter {{ margin-top: .6mm; }}
.qr {{ text-align: center; }}
.qr img {{ width: 26mm; display: block; margin: 0 auto 1mm; }}
.qr p {{ margin: 0; font-size: 10pt; }}
</style>
<section class="cover"><h1>Friedenslieder-Singen</h1><p class="untertitel">Liedtexte</p>
<p class="termin">Friedensstimmen Schramberg<br>{esc(EVENT)}</p>{ban}{pl}
<div class="qr"><img src="{qr}" alt=""><p><b>Alle Lieder mit Akkorden fürs Handy</b><br>{URL}</p></div></section>
<main>{lieder}</main></html>"""


def drucke(fs, ziel, plakat_nach=None, neu=()):
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(seite(fs, plakat_nach, neu))
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    "--allow-file-access-from-files", f"--print-to-pdf={ziel}", pathlib.Path(f.name).as_uri()],
                   check=True, capture_output=True)
    from pypdf import PdfReader
    r = PdfReader(str(ziel))
    seite_von = {}
    for i, p in enumerate(r.pages):
        for m in re.findall(r"§([AE]\d+)§", p.extract_text() or ""):
            seite_von[m] = i
    umbruch = [k[1:] for k in seite_von if k[0] == "A" and seite_von.get("E" + k[1:]) != seite_von[k]]
    return len(r.pages), umbruch


def ausschiessen(a5, a4, bogen):
    """bogen: (links, rechts) je Druckseite. Wenden an der kurzen Kante: hinter links liegt rechts."""
    from pypdf import PdfReader, PdfWriter, Transformation, PageObject
    r = PdfReader(str(a5))
    seiten = list(r.pages) + [None] * (SEITEN - len(r.pages))
    w, h = 841.89, 595.28  # A4 quer
    out = PdfWriter()
    for links, rechts in bogen:
        blatt = PageObject.create_blank_page(width=w, height=h)
        for idx, x in ((links, 0), (rechts, w / 2)):
            p = seiten[idx - 1]
            if p is None:
                continue
            pw, ph = float(p.mediabox.width), float(p.mediabox.height)
            s = min((w / 2) / pw, h / ph)
            blatt.merge_transformed_page(p, Transformation().scale(s).translate(x + (w / 2 - pw * s) / 2, (h - ph * s) / 2))
        out.add_page(blatt)
    out.write(str(a4))


if __name__ == "__main__":
    DRUCK.mkdir(parents=True, exist_ok=True)
    a5 = DRUCK / "Liedheft-A5.pdf"
    stellen = [None]  # Plakat steht auf der Titelseite
    for fs in [x / 4 for x in range(48, 23, -1)]:  # 12 pt abwärts bis 6 pt
        ok = False
        for pos in stellen:
            # Lied, das auf die nächste Seite umbricht, auf einer neuen Seite beginnen lassen
            neu = set()
            for _ in range(4):
                n, umbruch = drucke(fs, a5, pos, neu)
                if not umbruch or n > SEITEN:
                    break
                neu |= set(umbruch)
            print(f"{fs:5.2f} pt, Plakat nach Lied {pos}: {n} Seiten" + (f", Lied {', '.join(umbruch)} bricht um" if umbruch else ""))
            if n <= SEITEN and not umbruch:
                ok = True
                break
        if ok:
            break
    else:
        sys.exit(f"Passt nicht auf {SEITEN} Seiten, auch nicht mit 6 pt.")
    # Falten: Blatt 1 (außen) vorne 8|1, hinten 2|7; Blatt 2 (innen) vorne 6|3, hinten 4|5
    ausschiessen(a5, DRUCK / "Liedheft-Druck-A4-falten.pdf", ((8, 1), (2, 7), (6, 3), (4, 5)))
    # Schneiden: jedes A4-Blatt ergibt zwei A5-Blätter: 1/2 und 3/4, 5/6 und 7/8
    ausschiessen(a5, DRUCK / "Liedheft-Druck-A4-schneiden.pdf", ((1, 3), (4, 2), (5, 7), (8, 6)))
    print(f"Schrift {fs} pt, fertig: {DRUCK}")
