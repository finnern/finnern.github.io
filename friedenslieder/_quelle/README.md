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
   Optional eine Zeile `Link: Beschriftung | https://…` für einen externen Link (z. B. Text & Akkorde).
   Optional Rufe (z. B. Give Peace a Chance): eine Zeile `Rufe: Überschrift`, dann pro Ruf `Ruf: Text | Richtung`.
   Die Rufe sind immer sichtbar, auch ohne Akkord-Ansicht.
3. Im Code-Block (zwischen den ```-Zeilen):
   - `1.`, `2.` … = Strophennummer in eigener Zeile
   - `Refrain:` = Überschrift in eigener Zeile
   - `[G]` = Akkord direkt vor der Silbe, `[~G]` = übertragener Akkord (heller dargestellt)
   - `‖:` und `:‖` = Wiederholung, `(Refrain)` = Hinweis „Refrain wiederholen"
   - Leerzeile = neue Strophe

## Reihenfolge ändern / Lied dazunehmen / Termin ändern
In `_quelle/build.py` die Liste `SETLIST` bzw. `EVENT` anpassen (Dateiname ohne `.md`).

## Seite bauen und prüfen
Live-Vorschau: im Finder `_quelle/Vorschau.command` doppelklicken, oder im Ordner `friedenslieder/`:
```
python3 _quelle/vorschau.py
```
Öffnet http://localhost:8765/. Bei jedem Speichern (z. B. in Obsidian) wird die Seite neu gebaut
und der Browser lädt sich selbst neu. Baufehler erscheinen als roter Kasten oben. Online ändert sich dabei nichts.

Nur einmal bauen, ohne Vorschau:
```
python3 _quelle/build.py _quelle/lieder index.html
```

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
