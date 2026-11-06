# Friedenslieder-Liederbuch selbst bearbeiten

Veröffentlicht unter https://finnern.com/friedenslieder/ (GitHub Pages, Repo `finnern/finnern.github.io`).
Dieser Ordner ist die Master-Version.

## Inhalt
```
friedenslieder/
  index.html              erzeugt, öffentlich (nicht von Hand bearbeiten)
  qr-friedenslieder.png   QR-Code auf https://finnern.com/friedenslieder/, öffentlich
  fonts/                  selbst gehostete Schriften (Alegreya, Alegreya Sans, SIL OFL)
  _quelle/                nicht öffentlich: Jekyll veröffentlicht keine Ordner mit "_"
    build.py, template.html, README.md
    lieder/*.md           ein Lied pro Datei, Inline-Format `[Am]Ihr lieben Leute`
```

## Lied bearbeiten
1. Datei in `_quelle/lieder/` öffnen (z. B. in Obsidian oder einem Texteditor).
2. Kopfzeile: Urheber · Tonart · Status. Steht dort `Text nicht im Liederbuch`, zeigt die Seite nur Einstieg und Akkorde.
   Für ein Lied mit Text diesen Teil löschen.
3. Im Code-Block (zwischen den ```-Zeilen):
   - `1.`, `2.` … = Strophennummer in eigener Zeile
   - `Refrain:` = Überschrift in eigener Zeile
   - `[G]` = Akkord direkt vor der Silbe, `[~G]` = übertragener Akkord (heller dargestellt)
   - `‖:` und `:‖` = Wiederholung, `(Refrain)` = Hinweis „Refrain wiederholen"
   - Leerzeile = neue Strophe

## Reihenfolge ändern / Lied dazunehmen / Termin ändern
In `_quelle/build.py` die Liste `SETLIST` bzw. `EVENT` anpassen (Dateiname ohne `.md`).

## Seite bauen und prüfen
Im Ordner `friedenslieder/`:
```
python3 _quelle/build.py _quelle/lieder index.html
python3 -m http.server
```
Dann http://localhost:8000/ im Browser öffnen.

## Veröffentlichen
```
git add friedenslieder/
git commit -m "Liederbuch aktualisiert"
git push
```
Nach ein bis zwei Minuten ist die Änderung unter https://finnern.com/friedenslieder/ sichtbar.

## Troubleshooting
- Lied fehlt: Dateiname in `SETLIST` prüfen.
- Akkorde erscheinen als Text: eckige Klammer nicht geschlossen.
- Strophe klebt an der nächsten: Leerzeile fehlt.
