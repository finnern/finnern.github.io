# Baut das Friedenslieder-Liederbuch (eine HTML-Seite) aus den Lied-Dateien in lieder/*.md.
# Schreibt ein vollständiges HTML-Dokument (template.html enthält doctype, head usw.).
# Aufruf (im Ordner friedenslieder/): python3 _quelle/build.py _quelle/lieder index.html
import html, re, sys, pathlib

SRC = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2])

EVENT = "Samstag, 14. November 2026, 11 Uhr · Rathausplatz Schramberg"

SETLIST = [
    ("bella-ciao-friedensstrophen", "Willkommen"),
    ("give-peace-a-chance", None),
    ("kumbaya", None),
    ("die-gedanken-sind-frei", None),
    ("sag-mir-wo-die-blumen-sind", None),
    ("der-erste-friede", None),
    ("down-by-the-riverside", None),
    ("freude-schoener-goetterfunken", None),
    ("we-shall-overcome", None),
    ("lass-die-hoffnungsmaschine-laufen", "Abschluss"),
]
OPTIONAL = []
VORTRAG = [
    ("Es ist an der Zeit", "Hannes Wader, nach Eric Bogle"),
    ("Le Déserteur / Der Deserteur", "Boris Vian"),
    ("Nein, meine Söhne geb ich nicht", "Reinhard Mey"),
    ("Leben einzeln und frei", "Hannes Wader"),
    ("Streets of Minneapolis", "Bruce Springsteen"),
    ("Für die Liebe", ""),
    ("Gegen das Geläut der Leute", ""),
    ("Schon so lang (Bin auf meinem Weg)", ""),
]

CHORD = re.compile(r"\[(~?)([^\]]+)\]")
E = html.escape


def parse(path):
    raw = path.read_text(encoding="utf-8")
    title = re.search(r"^# (.+)$", raw, re.M).group(1).strip()
    head, _, rest = raw.partition("```")
    body = rest.split("```")[0].strip("\n")
    meta, einstieg, hinweis, link = "", "", "", None
    for l in head.splitlines()[1:]:
        l = l.strip()
        if not l:
            continue
        if l.startswith("Einstieg:"):
            einstieg = l[9:].strip()
        elif l.startswith("Link:"):
            label, _, url = l[5:].rpartition("|")
            link = (label.strip() or url.strip(), url.strip())
        elif l.startswith("Hinweis:"):
            hinweis = l[8:].strip().replace("`", "")
        elif not meta:
            meta = l
    return dict(slug=path.stem, title=title, meta=meta, einstieg=einstieg,
                hinweis=hinweis, link=link, body=body,
                protected=("Text nicht im Liederbuch" in meta or "Text auf unserer Postkarte" in meta),
                postcard="Text auf unserer Postkarte" in meta)


def render_line(line):
    # Akkorde stehen im Text (wie in der .md-Datei), nicht darüber: spart Platz auf dem Handy.
    if not CHORD.sub("", line).strip():  # reine Akkordzeile
        chips = "".join(f'<b class="chip{" tl" if m.group(1) else ""}">{E(m.group(2))}</b>' for m in CHORD.finditer(line))
        return f'<div class="l crow">{chips}</div>'
    out, i = [], 0
    for m in CHORD.finditer(line):
        out.append(E(line[i:m.start()]))
        out.append(f'<b class="c{" tl" if m.group(1) else ""}">{E(m.group(2))}</b>')
        i = m.end()
    out.append(E(line[i:]))
    return f'<div class="l">{"".join(out)}</div>'


def render_body(song):
    blocks, cur = [], []
    for l in song["body"].splitlines():
        if l.strip() == "":
            if cur:
                blocks.append(cur)
            cur = []
        else:
            cur.append(l.rstrip())
    if cur:
        blocks.append(cur)
    html_out = []
    for b in blocks:
        num, lab, lines = None, None, []
        for l in b:
            s = l.strip()
            if s.startswith("## "):
                html_out.append(f'<h4 class="grp">{E(s[3:])}</h4>')
            elif re.fullmatch(r"\d+\.", s):
                num = s[:-1]
            elif "[" not in s and s.endswith(":"):
                lab = s[:-1]
            elif re.fullmatch(r"\(.*\)", s):
                lines.append(f'<div class="cue">{E(s[1:-1])}</div>')
            elif ":" in s and "[" in s and s.index(":") < s.index("[") and not CHORD.sub("", s.split(":", 1)[1]).strip():
                l_lab, l_ch = s.split(":", 1)
                lines.append(f'<div class="prog"><span class="plab">{E(l_lab)}</span>{render_line(l_ch.strip())}</div>')
            else:
                lines.append(render_line(s))
        if not lines:
            continue
        cls = "st" + (" has-n" if num else "")
        head = f'<span class="vn">{num}</span>' if num else ""
        labh = f'<div class="lab">{E(lab)}</div>' if lab else ""
        html_out.append(f'<div class="{cls}">{head}{labh}{"".join(lines)}</div>')
    return "\n".join(html_out)


def chips(meta, protected):
    parts = [p.strip() for p in meta.split("·")]
    credit, key, tags = [], "", []
    for p in parts:
        if p.startswith("Tonart"):
            key = p
        elif p == "GEMA-pflichtig":
            tags.append(("gema", "GEMA"))
        elif p in ("Text nicht im Liederbuch", "Text auf unserer Postkarte"):
            continue
        elif p == "mit Erlaubnis der Urheber":
            tags.append(("own", "mit Erlaubnis der Urheber"))
        elif p.startswith("gemeinfrei"):
            tags.append(("free", "gemeinfrei"))
            if "eigen" in p:
                tags.append(("own", "eigener Text"))
        elif p.startswith("Melodie gemeinfrei"):
            tags.append(("free", "Melodie gemeinfrei"))
            tags.append(("own", "eigener Text"))
        elif p == "neu im Programm":
            tags.append(("new", "neu"))
        elif p == "optional":
            tags.append(("opt", "optional"))
        else:
            credit.append(p)
    t = "".join(f'<span class="tag {k}">{E(v)}</span>' for k, v in tags)
    if key:
        t += f'<span class="tag key chords-only">{E(key)}</span>'
    return " · ".join(E(c) for c in credit), t


def render_song(song, nr):
    credit, tags = chips(song["meta"], song["protected"])
    steps = [s.strip() for s in song["einstieg"].split("·") if s.strip()]
    ein = "".join(f"<li>{E(s)}</li>" for s in steps)
    note = ""
    if song["postcard"]:
        note = '<p class="nolyr">Den Text findest du auf unserer Friedensstimmen-Postkarte.</p>'
        body = f'<div class="chords-only progs"><div class="plabel">Akkorde für die Begleitung</div>{render_body(song)}</div>'
    elif song["protected"]:
        note = ('<p class="nolyr">Den Text findest du hier nicht, er ist urheberrechtlich geschützt. '
                'Den Refrain lernen wir vor Ort nach Gehör.</p>')
        body = f'<div class="chords-only progs"><div class="plabel">Akkorde für die Begleitung</div>{render_body(song)}</div>'
    else:
        body = f'<div class="lyr">{render_body(song)}</div>'
    if song["link"]:
        note += (f'<p class="ext"><a href="{E(song["link"][1])}" target="_blank" rel="noopener">'
                 f'{E(song["link"][0])} ↗</a></p>')
    h = "Hellere Akkorde sind aus Strophe 1 übertragen, bitte beim Einspielen prüfen." if "[~X]" in song["hinweis"] else song["hinweis"]
    hint = f'<p class="hint chords-only">{E(h)}</p>' if h else ""
    return f'''<section class="song" id="{song["slug"]}">
  <header class="sh"><span class="nr">{nr}</span><div class="sht"><h3>{E(song["title"])}</h3>
  <p class="credit">{credit}</p><div class="tags">{tags}</div></div></header>
  <div class="ein"><div class="einl">Einstieg</div><ul>{ein}</ul></div>
  {note}{hint}{body}
</section>'''


songs = {p.stem: parse(p) for p in sorted(SRC.glob("*.md"))}
toc, sections, n = [], [], 0
for slug, note in SETLIST:
    n += 1
    if slug == "__ruhe":
        toc.append(f'<li class="slot"><span class="tn">{n}</span><span class="tt">{E(note)}</span></li>')
        continue
    s = songs[slug]
    _, tags = chips(s["meta"], s["protected"])
    extra = f'<span class="tnote">{E(note)}</span>' if note else ""
    toc.append(f'<li><a href="#{slug}"><span class="tn">{n}</span><span class="tt">{E(s["title"])}</span>{extra}</a></li>')
    sections.append(render_song(s, n))
for slug in OPTIONAL:
    s = songs[slug]
    toc.append(f'<li class="opt"><a href="#{slug}"><span class="tn">+</span><span class="tt">{E(s["title"])}</span><span class="tnote">optional</span></a></li>')
    sections.append(render_song(s, "+"))

vortrag = "".join(f"<li><span>{E(t)}</span>{f' <em>{E(c)}</em>' if c else ''}</li>" for t, c in VORTRAG)

tpl = (pathlib.Path(__file__).parent / "template.html").read_text(encoding="utf-8")
page = (tpl.replace("{{EVENT}}", E(EVENT))
           .replace("{{TOC}}", "\n".join(toc))
           .replace("{{SONGS}}", "\n".join(sections))
           .replace("{{VORTRAG}}", vortrag))
OUT.write_text(page, encoding="utf-8")
print(f"{len(sections)} Lieder → {OUT}")
