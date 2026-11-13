/**
 * lotfy.me contact form → Google Sheet.
 * Deploy as a web app (Execute as: Me, Who has access: Anyone),
 * then paste the web app URL into SHEET_ENDPOINT in js/main.js.
 * Columns: Date, Stage, Name, Phone, Email, Message, Language
 */
const SHEET_ID = '19OucQY-ld4WzYyvN9-YHIRgr-YNNBVGpPO0kTpLkAcs';

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return json({ ok: true }); // hidden field: only bots fill it
  if (!p.name || !p.email || !p.phone) return json({ ok: false, error: 'missing fields' });

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  sheet.appendRow([new Date(), text(p.stage), text(p.name), text(p.phone), text(p.email), text(p.message), text(p.lang)]);
  return json({ ok: true });
}

// Keep values as plain text so "+966..." or "=..." is never read as a formula.
function text(v) {
  const s = String(v || '').slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
