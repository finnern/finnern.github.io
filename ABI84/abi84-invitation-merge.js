// ABI 84 Treff 2026 – EINLADUNGS-MAIL (Mass-Mailing)
// ════════════════════════════════════════════════════════════════════
// Diese Datei ALS NEUE DATEI im Google Apps Script Editor anlegen:
//   Im Editor links: ＋ neben "Files" → "Script" → benenne sie z.B.
//   "Einladung". Dann den ganzen Inhalt hier rein kopieren.
//
//   Sie liegt damit NEBEN dem onFormSubmit-Script und stört es nicht.
// ════════════════════════════════════════════════════════════════════

// ── EMPFÄNGER-LISTE ────────────────────────────────────────────────
// Hier Klassenkameraden eintragen. Erst mit kleiner Liste testen,
// dann erweitern. Doppelte Einträge raus, sonst bekommen sie 2 Mails.
const EINLADUNGS_EMPFAENGER = [
  { vor: 'Mark',      email: 'mark@finnern.com'    },
  { vor: 'Christine', email: 'ideenfunken@gmail.com' },
  // weitere hier ergänzen:
  // { vor: 'Mimi',  email: 'mimi@example.com' },
  // { vor: 'Rolf',  email: 'rolf@haroweb.de'  },
];

// ── TEST-FUNKTION ──────────────────────────────────────────────────
// Sendet an die obige Liste. Im Editor diese Funktion auswählen,
// dann ▶ Run klicken.
function sendeEinladungAnTestliste() {
  EINLADUNGS_EMPFAENGER.forEach((r, i) => {
    sendeEinladung(r.vor, r.email);
    Logger.log((i+1) + '/' + EINLADUNGS_EMPFAENGER.length + ' → ' + r.email + ' (' + r.vor + ')');
    Utilities.sleep(800); // kurze Pause zwischen Mails (Gmail Rate-Limit)
  });
  Logger.log('✅ Fertig — ' + EINLADUNGS_EMPFAENGER.length + ' Mails versendet.');
}

// ── EINZEL-FUNKTION ────────────────────────────────────────────────
function sendeEinladung(vor, email) {
  const subject = 'Eselbach und Zodiak an einem Wochenende — Anmeldung ist offen';
  const htmlBody = einladungsHtml(vor);
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: 'Mark Finnern (ABI 84 Orga)',
    replyTo: 'mark@finnern.com'
  });
}

// ── HTML-VORLAGE ───────────────────────────────────────────────────
function einladungsHtml(vor) {
  return `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9f7f2;font-family:'Open Sans',Arial,sans-serif;color:#333;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f2;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#1a1a2e;border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;">ABI-JAHRGANG 1984 · SCHRAMBERG</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:48px;color:#ffffff;">ABI <span style="color:#C9A84C;">84</span></h1>
          <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.7);">27.–30. August 2026 · Burgstüble Hohenschramberg</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#ffffff;padding:40px;font-size:15px;line-height:1.7;color:#333;">

          <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#1a1a2e;">
            Hallo ${vor},
          </h2>

          <p style="margin:0 0 16px;">
            die Vorfreude steigt — und endlich könnt ihr euch anmelden.
          </p>

          <p style="margin:0 0 16px;">
            Nachdem unser Voranmeldung-Mail rausgegangen ist, hat mich Michael Melvin angerufen:
            <em>„Ihr habt ja ein Wahnsinnsprogramm zusammengestellt. Als nächstes bitte den Katholikentag organisieren!"</em> 🙂
            Das war Ansporn für uns zu überlegen, ob wir noch eins draufsetzen können.
          </p>

          <p style="margin:0 0 16px;">
            Und tatsächlich — es gibt noch einen Ort in Schramberg, der seit unserer Kindheit fast unverändert ist:
            die <strong>Schwarzwald Stube Eselbach</strong>. Die Schlachtplatte gibt's dort immer noch, nur die
            Blutwurst ist dem Zahn der Geschmäcker zum Opfer gefallen. 😉
          </p>

          <p style="margin:0 0 24px;">
            Also wandern wir am Samstag hin — über die <strong>Ruine Schilteck</strong> runter zum
            <strong>Eselbach</strong>, zurück über den <strong>Tierstein</strong> hoch auf die Burg.
          </p>

          <!-- Highlight Box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td style="background:linear-gradient(135deg,#fdf6e3,#fbecc7);border-left:4px solid #C9A84C;border-radius:0 8px 8px 0;padding:20px 24px;">
                <p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#1a1a2e;line-height:1.5;">
                  <strong>Eselbach und Zodiak. An einem Wochenende.</strong><br>
                  <span style="color:#8B6914;">Mind blown. Auf keinen Fall entgehen lassen.</span>
                </p>
              </td>
            </tr>
          </table>

          <!-- Wochenende auf einen Blick -->
          <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#1a1a2e;letter-spacing:1px;text-transform:uppercase;">
            Das Wochenende auf einen Blick
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:12px 12px 12px 0;color:#C9A84C;font-weight:bold;width:90px;vertical-align:top;border-bottom:1px solid #eee;">Do 27.08.</td>
              <td style="padding:12px 0;color:#444;border-bottom:1px solid #eee;">Anreise ab 15 Uhr · Ankommen, Beine baumeln lassen, gemeinsames Kochen in Eigenregie. <em>Da freuen wir uns jetzt schon drauf.</em></td>
            </tr>
            <tr>
              <td style="padding:12px 12px 12px 0;color:#C9A84C;font-weight:bold;vertical-align:top;border-bottom:1px solid #eee;">Fr 28.08.</td>
              <td style="padding:12px 0;color:#444;border-bottom:1px solid #eee;">6:11 Uhr <strong>Mondfinsternis</strong> 🌒 · <strong>Stadttag Schramberg</strong> (Erfinderzeiten Museum, Hirschbrunnen, Spaghettieis beim Rino) · abends <strong>Open-Mic / Band-Karaoke im Zodiak</strong> mit Ulli Brauchle und der Old Vintage Band 🎸</td>
            </tr>
            <tr>
              <td style="padding:12px 12px 12px 0;color:#C9A84C;font-weight:bold;vertical-align:top;border-bottom:1px solid #eee;">Sa 29.08.</td>
              <td style="padding:12px 0;color:#444;border-bottom:1px solid #eee;"><strong>Wanderung</strong> Schilteck → Eselbach (Schlachtplatte!) → Tierstein → Burgstüble · abends <strong>Grillen, Lagerfeuer & Burggeschichten</strong> bis spät in die Nacht 🔥</td>
            </tr>
            <tr>
              <td style="padding:12px 12px 12px 0;color:#C9A84C;font-weight:bold;vertical-align:top;">So 30.08.</td>
              <td style="padding:12px 0;color:#444;">Frühstück, Auskehren, heulend nach Hause — inkl. Starthilfe 😉</td>
            </tr>
          </table>

          <p style="margin:0 0 24px;color:#444;">
            Volles Programm, alle Pakete und Fotos auf der Webseite:
          </p>

          <!-- CTA Buttons -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td align="center" style="padding-bottom:12px;">
                <a href="https://finnern.com/ABI84/" style="display:inline-block;padding:14px 32px;background:#1a1a2e;color:#C9A84C;text-decoration:none;border-radius:8px;font-weight:bold;letter-spacing:1px;">finnern.com/ABI84</a>
              </td>
            </tr>
            <tr>
              <td align="center">
                <a href="https://finnern.com/ABI84/#anmeldung" style="display:inline-block;padding:14px 32px;background:#C9A84C;color:#1a1a2e;text-decoration:none;border-radius:8px;font-weight:bold;letter-spacing:1px;">→ Direkt zur Anmeldung</a>
              </td>
            </tr>
          </table>

          <!-- Frühbucher -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td style="background:#f0f9e8;border:1px solid #7CB342;border-radius:8px;padding:16px 20px;">
                <p style="margin:0;font-size:14px;color:#33691E;line-height:1.6;">
                  🎉 <strong>Frühbucher-Bonus:</strong> Wer sich bis <strong>31. Mai</strong> anmeldet
                  <em>und</em> den Betrag überweist, bekommt <strong>10% Rabatt</strong>.
                  Das ist doch mal ein Angebot.
                </p>
              </td>
            </tr>
          </table>

          <!-- Solidaritäts-Box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td style="background:#faf6ee;border-radius:8px;padding:20px;">
                <p style="margin:0 0 12px;font-size:14px;color:#444;line-height:1.7;">
                  <strong>Kein Geld? Kein Problem.</strong> 🤝<br>
                  Das Leben spielt manchmal nicht mit — aber das soll niemanden davon abhalten, dabei zu sein.
                  Meld dich einfach kurz bei einem von uns, wir regeln das.
                </p>
                <p style="margin:0;font-size:14px;color:#444;line-height:1.7;">
                  <strong>Das Leben hat dir gut mitgespielt?</strong> 🙌<br>
                  Dann freuen wir uns, wenn du etwas drauflegst — damit am Ende alle dabei sind und wir
                  gemeinsam eine unvergessliche Zeit haben.
                </p>
                <p style="margin:14px 0 0;font-size:13px;color:#666;">
                  Kontakt: <a href="mailto:mark@finnern.com" style="color:#C9A84C;">mark@finnern.com</a>
                </p>
              </td>
            </tr>
          </table>

          <!-- Sign-off -->
          <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.8;">
            Bis bald auf der Burg,<br>
            <strong>Mark</strong>
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:#999;font-style:italic;">
            (im Namen des Orga-Teams: Mark, Mimi, Friedemann, Andrea, Susanne, Ulli, Rolf)
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#1a1a2e;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">
            ABI 84 Treff 2026 · Burgstüble Hohenschramberg · 27.–30. August 2026<br>
            <a href="https://finnern.com/ABI84/" style="color:#C9A84C;">finnern.com/ABI84</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
