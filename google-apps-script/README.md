# Contact form → Google Sheet

The form on lotfy.me writes each submission as a new row in the sheet
"lotfy.me — Contact form leads". Columns: Date, Topic, Name, Email, Phone, Message, Language.

## One-time setup

1. Open the sheet, then **Extensions → Apps Script**.
2. Delete what is there and paste the contents of `Code.gs`.
3. **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Approve the permissions and copy the **Web app URL** (ends in `/exec`).
5. Paste that URL into `SHEET_ENDPOINT` in `js/main.js`.

Until `SHEET_ENDPOINT` is filled in, the form falls back to opening the visitor's mail app.

After changing `Code.gs`, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
