// ABI 84 Treff 2026 – Feedback-Formular (Google Apps Script)
// ─────────────────────────────────────────────────────────────────────
// So geht's:
//   1. https://script.google.com  →  Neues Projekt
//   2. Diesen Code komplett hineinkopieren
//   3. Funktion "createFeedbackForm" auswählen  →  ▶ Run
//   4. Berechtigungen erlauben (einmalig)
//   5. Im Ausführungs-Log stehen zwei Links:
//        • BEARBEITEN  – zum Anpassen des Formulars
//        • TEILEN      – diesen Link an die ABI-84-Runde schicken
//
// Das Formular sammelt die Antworten automatisch in einer Google-Tabelle
// (Formular → Antworten → Tabellen-Symbol), falls gewünscht.
// ─────────────────────────────────────────────────────────────────────

function createFeedbackForm() {
  const form = FormApp.create('ABI 84 Treff 2026 – Wie war’s? 🌲')
    .setTitle('ABI 84 Treff 2026 – Wie war’s? 🌲')
    .setDescription(
      'Drei Tage Burgstüble, Schwarzwald und alte Freunde liegen hinter uns – ' +
      'jetzt seid ihr dran. Sagt uns in ein paar Minuten, wie euch das ' +
      'Wochenende gefallen hat und was wir beim nächsten Mal noch besser ' +
      'machen können. Ehrlich, kurz, von Herzen. Danke, dass ihr dabei wart! ❤️'
    )
    .setConfirmationMessage(
      'Merci vielmal für dein Feedback! Wir lesen jede Antwort. ' +
      'Bis zum nächsten Mal am Burgstüble. 🌲'
    )
    .setProgressBar(true)
    .setCollectEmail(false)      // anonym – niemand muss sich einloggen
    .setAllowResponseEdits(true)
    .setLimitOneResponsePerUser(false);

  // ── 1. Gesamteindruck ─────────────────────────────────────────────
  form.addScaleItem()
    .setTitle('Gesamteindruck: Wie war das Wochenende für dich?')
    .setBounds(1, 5)
    .setLabels('War okay', 'Ein Traum 🌟');

  // ── 2. Bestes Highlight ───────────────────────────────────────────
  form.addParagraphTextItem()
    .setTitle('Was war dein schönster Moment?')
    .setHelpText('Der eine Augenblick, an den du dich noch in Jahren erinnerst.');

  // ── 3. Einzelne Programmpunkte bewerten ───────────────────────────
  const gridRows = [
    'Location & Burgstüble',
    'Essen & Trinken',
    'Übernachtung / Zimmer',
    'Freitag: Band & Karaoke',
    'Samstag: Graffiti-Aktion',
    'Kuchenrunde & gemütliche Runden',
    'Organisation & Anmeldung',
    'Anfahrt & Wegbeschreibung'
  ];
  form.addGridItem()
    .setTitle('Wie fandest du die einzelnen Teile?')
    .setRows(gridRows)
    .setColumns(['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐', 'War nicht dabei']);

  // ── 4. Länge / Format ─────────────────────────────────────────────
  form.addMultipleChoiceItem()
    .setTitle('Die Länge des Treffens (Do–So) war für dich …')
    .setChoiceValues([
      'Genau richtig',
      'Etwas zu lang',
      'Etwas zu kurz – gerne länger!',
      'Ich war nur einen Teil dabei'
    ]);

  // ── 5. Was hat gefehlt / besser machen ────────────────────────────
  form.addParagraphTextItem()
    .setTitle('Was können wir beim nächsten Mal besser machen?')
    .setHelpText('Ideen, Wünsche, ehrliche Kritik – alles willkommen.');

  // ── 6. Nächstes Treffen ───────────────────────────────────────────
  form.addMultipleChoiceItem()
    .setTitle('Bist du beim nächsten ABI-84-Treffen wieder dabei?')
    .setChoiceValues([
      'Auf jeden Fall! 🙌',
      'Sehr wahrscheinlich',
      'Kommt drauf an',
      'Eher nicht'
    ]);

  // ── 7. Rhythmus ───────────────────────────────────────────────────
  form.addMultipleChoiceItem()
    .setTitle('Wie oft sollten wir uns treffen?')
    .setChoiceValues([
      'Jedes Jahr',
      'Alle zwei Jahre',
      'Alle drei bis fünf Jahre'
    ])
    .showOtherOption(true);

  // ── 7b. Jahreszeit ────────────────────────────────────────────────
  form.addMultipleChoiceItem()
    .setTitle('Zu welcher Jahreszeit wäre dir ein Jahrgangstreffen am liebsten?')
    .setChoiceValues([
      'Frühjahr',
      'Sommer',
      'Sommer – aber außerhalb der Schulferien',
      'Herbst',
      'Ist mir egal – Hauptsache wir treffen uns'
    ])
    .showOtherOption(true);

  // ── 8. Weiterempfehlung (NPS-Stil) ────────────────────────────────
  form.addScaleItem()
    .setTitle('Wie wahrscheinlich empfiehlst du so ein Treffen einem Mitschüler, der diesmal gefehlt hat?')
    .setBounds(0, 10)
    .setLabels('Unwahrscheinlich', 'Absolut');

  // ── 9. Gruß an die Runde ──────────────────────────────────────────
  form.addParagraphTextItem()
    .setTitle('Ein Gruß, ein Dank oder ein Spruch an die ganze Runde?')
    .setHelpText('Darf gerne beim nächsten Treffen vorgelesen werden. 😊');

  // ── 10. Fotos ─────────────────────────────────────────────────────
  form.addMultipleChoiceItem()
    .setTitle('Hast du Fotos vom Wochenende, die du teilen magst?')
    .setChoiceValues([
      'Ja – ich schicke sie',
      'Ja – aber sagt mir wohin',
      'Nein'
    ]);

  // ── 11. Name (optional) ───────────────────────────────────────────
  form.addTextItem()
    .setTitle('Dein Name (optional)')
    .setHelpText('Nur falls du magst – das Feedback geht auch anonym.');

  // ── Fertig: Links ins Log ─────────────────────────────────────────
  const editUrl = form.getEditUrl();
  const shareUrl = form.getPublishedUrl();
  Logger.log('✅ Formular erstellt!');
  Logger.log('✏️  BEARBEITEN: ' + editUrl);
  Logger.log('🔗 TEILEN (an die Runde schicken): ' + shareUrl);
  return { editUrl: editUrl, shareUrl: shareUrl };
}
