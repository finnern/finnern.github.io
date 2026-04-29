// ABI 84 Treff 2026 – Google Apps Script
// Einfügen in: Google Form → ⋮ → Script-Editor
// Trigger: onFormSubmit → Bei Formulareinreichung

function onFormSubmit(e) {
  const responses = e.response.getItemResponses();
  const data = {};
  responses.forEach(r => {
    data[r.getItem().getTitle()] = r.getResponse();
  });

  const vor      = data['Vorname'] || '';
  const nach     = data['Nachname'] || '';
  const email    = data['E-Mail-Adresse'] || '';
  const paket    = data['Interessiertes Paket / Service'] || '';
  const nachricht = data['Ihre Nachricht (Details zur Anfrage)'] || '';

  // ── Bestätigungs-Mail an den Anmelder ──────────────────────────────
  const htmlBody = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9f7f2;font-family:'Open Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f2;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#1a1a2e;border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;">ABI-JAHRGANG 1984 · SCHRAMBERG</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:48px;color:#ffffff;">ABI <span style="color:#C9A84C;">84</span></h1>
          <p style="margin:8px 0 0;font-size:16px;color:rgba(255,255,255,0.7);">Abiturtreff 2026 · 27.–30. August · Burgstüble Hohenschramberg</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#ffffff;padding:40px;">
          <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;color:#1a1a2e;">
            Hallo ${vor}! 🎉
          </h2>
          <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.7;">
            Wir freuen uns riesig, dass du dabei bist! Deine Anmeldung zum <strong>ABI 84 Treff 2026</strong> ist bei uns eingegangen.
          </p>

          <!-- Paket Box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#f9f7f2;border-left:4px solid #C9A84C;border-radius:0 8px 8px 0;padding:16px 20px;">
                <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Dein gewähltes Paket</p>
                <p style="margin:0;font-size:17px;font-weight:bold;color:#1a1a2e;">${paket}</p>
              </td>
            </tr>
          </table>

          <!-- Wichtig -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#fff8e6;border:1px solid #C9A84C;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#8B6914;">⚠️ WICHTIG – Zahlungsfrist: 1. Juli 2026</p>
                <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                  Deine Anmeldung gilt erst als verbindlich, sobald die Zahlung bei uns eingegangen ist.
                  Bitte überweise den Betrag bis zum <strong>1. Juli 2026</strong>.
                </p>
              </td>
            </tr>
          </table>

          <!-- Bankdaten -->
          <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#1a1a2e;letter-spacing:1px;text-transform:uppercase;">Bankverbindung</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;font-size:14px;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 16px 8px 0;color:#999;width:40%;text-align:right;border-bottom:1px solid #eee;">Kontoinhaber:in</td>
              <td style="padding:8px 0;font-weight:600;color:#1a1a2e;border-bottom:1px solid #eee;">Rolf Haberstroh</td>
            </tr>
            <tr>
              <td style="padding:8px 16px 8px 0;color:#999;text-align:right;border-bottom:1px solid #eee;">IBAN</td>
              <td style="padding:8px 0;font-family:monospace;font-weight:600;color:#1a1a2e;border-bottom:1px solid #eee;">DE93 1203 0000 1201 7082 76</td>
            </tr>
            <tr>
              <td style="padding:8px 16px 8px 0;color:#999;text-align:right;border-bottom:1px solid #eee;">BIC</td>
              <td style="padding:8px 0;font-family:monospace;color:#1a1a2e;border-bottom:1px solid #eee;">BYLADEM1001</td>
            </tr>
            <tr>
              <td style="padding:8px 16px 8px 0;color:#999;text-align:right;border-bottom:1px solid #eee;">Bank</td>
              <td style="padding:8px 0;color:#1a1a2e;border-bottom:1px solid #eee;">DKB</td>
            </tr>
            <tr>
              <td style="padding:8px 16px 8px 0;color:#999;text-align:right;">Verwendungszweck</td>
              <td style="padding:8px 0;font-weight:bold;color:#C9A84C;">Abifest 2026: ${vor} ${nach}</td>
            </tr>
          </table>

          <p style="margin:0 0 32px;font-size:14px;color:#666;line-height:1.7;">
            Sobald deine Zahlung bei uns eingegangen ist, bekommst du eine Bestätigung.<br>
            Bei Fragen einfach auf diese Mail antworten.
          </p>

          <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.8;">
            Wir freuen uns riesig auf das Wiedersehen! 🏰<br><br>
            Herzliche Grüße<br>
            <strong>Mark, Mimi, Friedemann, Andrea, Susanne, Ulli & Rolf</strong><br>
            <span style="color:#999;font-size:13px;">Euer Orga-Team</span>
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

  // Sende Bestätigung an Anmelder
  MailApp.sendEmail({
    to: email,
    subject: `ABI 84 Treff 2026 – Wir freuen uns, dass Du kommst, ${vor}! 🎉`,
    htmlBody: htmlBody,
    name: 'ABI 84 Orga-Team'
  });

  // Benachrichtigung ans Orga-Team
  MailApp.sendEmail({
    to: 'mark@finnern.com',
    cc: 'rolf@haroweb.de',
    subject: `✅ ABI 84 Anmeldung: ${vor} ${nach} – ${paket}`,
    body: `Neue Anmeldung eingegangen!\n\nName:     ${vor} ${nach}\nE-Mail:   ${email}\nPaket:    ${paket}\nNachricht: ${nachricht || '–'}\n\nViele Grüße,\nDein Google Forms Robot`
  });
}
