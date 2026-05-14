// ABI 84 Treff 2026 – Google Apps Script
// Einfügen in: Google Form → ⋮ → Script-Editor
// Trigger: onFormSubmit → Bei Formulareinreichung

// ── EINMALIG: Berechtigungen anfordern (löst OAuth-Dialoge aus) ────
// Nach Manifest-Änderungen muss neu autorisiert werden.
// Diese Funktion auswählen + ▶ Run, dann alle Berechtigungen erlauben.
function requestPermissions() {
  Logger.log('Anfordere Berechtigungen...');
  // Mail-Versand
  MailApp.getRemainingDailyQuota();
  Logger.log('✓ Mail OK');
  // Spreadsheet-Lesen (für Einladungs-Script)
  // (kein konkretes Sheet hier, nur die App initialisieren)
  Logger.log('✅ Berechtigungen erteilt — alles bereit.');
}

// ════════════════════════════════════════════════════════════════════
// TEST / MAIL-MERGE: Liste hier editieren, dann oben "sendTestEmails"
// auswählen und auf ▶ Run klicken.
// ════════════════════════════════════════════════════════════════════
function sendTestEmails() {
  const recipients = [
    { vor: 'Mark',     nach: 'Finnern', email: 'mark@finnern.com',    paket: 'XXL 200€ Do 27. – So 30. (3× ÜF + alle Events)' },
    { vor: 'Christine', nach: '',       email: 'ideenfunken@gmail.com', paket: 'XL 160€ Fr 28. – So 30. (2× ÜF + alle Events)' },
  ];

  recipients.forEach(r => {
    sendConfirmationEmail(r.vor, r.nach, r.email, r.paket);
    Logger.log('Test-Mail gesendet an: ' + r.email);
  });
}

// ── Konfiguration ──────────────────────────────────────────────────
const EARLY_BIRD_DEADLINE = new Date('2026-06-01T00:00:00+02:00'); // Anmeldung muss VOR diesem Datum eingehen
const EARLY_BIRD_DISCOUNT = 0.10; // 10%
const PACKAGE_PRICES = {
  'XXL': 200,
  'XL':  160,
  'L':   100,
  'M':    80,
  'S':    40
};

// Extrahiert Paket-Code (XXL, XL, L, M, S) aus dem Dropdown-Text
function extractPackageCode(paketText) {
  const match = paketText.match(/^(XXL|XL|L|M|S)\b/);
  return match ? match[1] : null;
}

function calculatePrice(paketText) {
  const code = extractPackageCode(paketText);
  const basePrice = PACKAGE_PRICES[code];
  if (!basePrice) return { basePrice: null, finalPrice: null, isEarlyBird: false, discount: 0 };

  const isEarlyBird = new Date() < EARLY_BIRD_DEADLINE;
  const finalPrice = isEarlyBird ? Math.round(basePrice * (1 - EARLY_BIRD_DISCOUNT)) : basePrice;
  const discount = basePrice - finalPrice;

  return { basePrice, finalPrice, isEarlyBird, discount };
}

// ── Trigger: läuft automatisch bei jeder Anmeldung ─────────────────
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

  sendConfirmationEmail(vor, nach, email, paket);
  sendOrgaNotification(vor, nach, email, paket, nachricht);
}

// ── Bestätigungs-Mail an den Anmelder ──────────────────────────────
function sendConfirmationEmail(vor, nach, email, paket) {
  const pricing = calculatePrice(paket);

  const priceDisplay = pricing.finalPrice
    ? (pricing.isEarlyBird
        ? `<span style="text-decoration:line-through;color:#999;">€${pricing.basePrice}</span> <strong style="color:#C9A84C;">€${pricing.finalPrice}</strong> <span style="background:#C9A84C;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;margin-left:6px;">FRÜHBUCHER −10%</span>`
        : `<strong>€${pricing.finalPrice}</strong>`)
    : '';

  const earlyBirdNote = pricing.isEarlyBird && pricing.finalPrice
    ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#f0f9e8;border:1px solid #7CB342;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#33691E;">🎉 Frühbucher-Bonus aktiv</p>
                <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                  Du sparst <strong>€${pricing.discount}</strong>, wenn die Zahlung bis zum <strong>31. Mai 2026</strong> bei uns eingegangen ist.
                  Danach gilt wieder der reguläre Preis von €${pricing.basePrice}.
                </p>
              </td>
            </tr>
          </table>`
    : '';

  const solidarityBox = `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#faf6ee;border-radius:8px;padding:20px;">
                <p style="margin:0 0 12px;font-size:14px;color:#444;line-height:1.7;">
                  <strong>Kein Geld? Kein Problem.</strong> 🤝<br>
                  Das Leben spielt manchmal nicht mit — aber das soll niemanden davon abhalten, dabei zu sein. Meld dich einfach kurz bei mir, wir finden gemeinsam einen Weg.
                </p>
                <p style="margin:0;font-size:14px;color:#444;line-height:1.7;">
                  <strong>Das Leben hat dir gut mitgespielt?</strong> 🙌<br>
                  Dann freuen wir uns, wenn du etwas drauflegst — damit am Ende alle dabei sind. Schreib mir kurz: <a href="mailto:mark@finnern.com" style="color:#C9A84C;">mark@finnern.com</a>
                </p>
              </td>
            </tr>
          </table>`;

  const subject = pricing.isEarlyBird
    ? `ABI 84 Treff 2026 – Wir freuen uns, ${vor}! 🎉 (Frühbucher: −€${pricing.discount})`
    : `ABI 84 Treff 2026 – Wir freuen uns, dass Du kommst, ${vor}! 🎉`;

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
                <p style="margin:0 0 8px;font-size:17px;font-weight:bold;color:#1a1a2e;">${paket}</p>
                ${priceDisplay ? `<p style="margin:0;font-size:18px;">${priceDisplay}</p>` : ''}
              </td>
            </tr>
          </table>

          ${earlyBirdNote}

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
            ${pricing.finalPrice ? `
            <tr>
              <td style="padding:8px 16px 8px 0;color:#999;text-align:right;border-top:1px solid #eee;">Betrag</td>
              <td style="padding:8px 0;font-weight:bold;color:#1a1a2e;border-top:1px solid #eee;">€${pricing.finalPrice}${pricing.isEarlyBird ? ' <span style="font-weight:normal;color:#999;font-size:12px;">(statt €' + pricing.basePrice + ')</span>' : ''}</td>
            </tr>` : ''}
          </table>

          ${solidarityBox}

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

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: 'ABI 84 Orga-Team'
  });
}

// ── Notification ans Orga-Team ─────────────────────────────────────
function sendOrgaNotification(vor, nach, email, paket, nachricht) {
  const pricing = calculatePrice(paket);
  const priceLine = pricing.finalPrice
    ? `\nBetrag:    €${pricing.finalPrice}${pricing.isEarlyBird ? ' (Frühbucher, statt €' + pricing.basePrice + ')' : ''}`
    : '';

  MailApp.sendEmail({
    to: 'mark@finnern.com',
    cc: 'abi@haroweb.de',
    subject: `✅ ABI 84 Anmeldung: ${vor} ${nach} – ${paket}`,
    body: `Neue Anmeldung eingegangen!\n\nName:     ${vor} ${nach}\nE-Mail:   ${email}\nPaket:    ${paket}${priceLine}\nNachricht: ${nachricht || '–'}\n\nViele Grüße,\nDein Google Forms Robot`
  });
}
