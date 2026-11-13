"""Build the brown edition: brown.html + css/brown.css from the main page and stylesheet.
Re-run after changing index.html or css/style.css so both editions stay in sync."""
import re, sys

site = sys.argv[1]

# ---- script: canvas colours come from CSS custom properties (falls back to the green edition) ----
jp = site + '/js/main.js'
j = open(jp, encoding='utf8').read()
if '--field-a' not in j:
    a = "  function draw(time) {"
    assert j.count(a) == 1
    j = j.replace(a, """  const css = getComputedStyle(document.documentElement);
  const FA = (css.getPropertyValue('--field-a') || '').trim() || '200,255,62';
  const FB = (css.getPropertyValue('--field-b') || '').trim() || '62,230,255';
  function draw(time) {""")
    j = j.replace("`rgba(200,255,62,${0.05 + fade * 0.16})`", "`rgba(${FA},${0.05 + fade * 0.16})`")
    j = j.replace("`rgba(62,230,255,${0.25 + fade * 0.7})`", "`rgba(${FB},${0.25 + fade * 0.7})`")
    j = j.replace("`rgba(200,255,62,${0.2 + fade * 0.8 * (0.45 + lift)})`", "`rgba(${FA},${0.2 + fade * 0.8 * (0.45 + lift)})`")
    assert 'rgba(200,255,62' not in j and 'rgba(62,230,255' not in j
    open(jp, 'w', encoding='utf8').write(j)

# ---- stylesheet: same rules, brown palette ----
c = open(site + '/css/style.css', encoding='utf8').read()
c = c.replace('200, 255, 62', '214, 160, 104').replace('62, 230, 255', '240, 214, 178')
c = c.replace("stroke='%23c8ff3e'", "stroke='%23d6a068'")
root = '''  --bg: #140d09;
  --bg-2: #1d140e;
  --panel: #241912;
  --line: rgba(240, 214, 178, .10);
  --line-2: rgba(240, 214, 178, .18);
  --text: #f4e9dc;
  --muted: #b29a85;
  --accent: #d6a068;
  --accent-2: #f0d6b2;
  --accent-ink: #1a110b;
  --field-a: 214, 160, 104;
  --field-b: 240, 214, 178;'''
c, n = re.subn(r'  --bg: #05070c;.*?  --accent-ink: #0a0f02;', root, c, count=1, flags=re.S)
assert n == 1
c += '''

/* ================= Brown edition: light latte sections ================= */
.section--alt {
  --bg: #f7efe5;
  --bg-2: #efe3d3;
  --panel: #fbf6ef;
  --line: rgba(58, 36, 22, .12);
  --line-2: rgba(58, 36, 22, .22);
  --text: #2b1a10;
  --muted: #6e5443;
  --accent: #9a5a2a;
  --accent-ink: #fbf6ef;
  background: var(--bg-2);
  color: var(--text);
}
.section--alt .btn--ghost:hover { color: var(--panel); }
.section--alt .btn::before { background: var(--text); }
.section--alt .offer--main { background: linear-gradient(165deg, rgba(154, 90, 42, .14), var(--bg) 55%); box-shadow: 0 30px 80px -40px rgba(154, 90, 42, .5); }
.section--alt .project:hover { box-shadow: 0 30px 70px -30px rgba(154, 90, 42, .45); border-color: rgba(154, 90, 42, .5); }
.section--alt .callout { background: linear-gradient(160deg, rgba(154, 90, 42, .12), transparent 60%); border-color: rgba(154, 90, 42, .4); }
.section--alt .step::after { background: linear-gradient(90deg, var(--accent), #d6a068); }
.section--alt .qa[open] { border-color: rgba(154, 90, 42, .45); }
.section--alt .spot::before { background: radial-gradient(340px circle at var(--x, 50%) var(--y, 50%), rgba(154, 90, 42, .12), transparent 65%); }
.band { background-color: #d6a068; }
::selection { background: #d6a068; color: #1a110b; }
'''
open(site + '/css/brown.css', 'w', encoding='utf8').write(c)

# ---- page: same markup, brown stylesheet ----
h = open(site + '/index.html', encoding='utf8').read()
a = '<link rel="stylesheet" href="css/style.css">'
assert h.count(a) == 1
h = h.replace(a, '<link rel="stylesheet" href="css/brown.css">')
h = h.replace('<meta name="theme-color" content="#05070c">', '<meta name="theme-color" content="#140d09">')
h = h.replace('<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">', '<link rel="icon" href="assets/favicon-brown.svg" type="image/svg+xml">')
open(site + '/brown.html', 'w', encoding='utf8').write(h)

fav = open(site + '/assets/favicon.svg', encoding='utf8').read()
open(site + '/assets/favicon-brown.svg', 'w', encoding='utf8').write(fav.replace('#05070c', '#140d09').replace('#c8ff3e', '#d6a068'))

# ---- preview copy for the artifact ----
scratch = sys.argv[2]
pv = open(scratch + '/lotfy-preview.html', encoding='utf8').read()
pv = pv.replace('<link rel="stylesheet" href="css/style.css">', '<link rel="stylesheet" href="css/brown.css">')
pv = pv.replace('<title>Mohamed Lotfy Portfolio</title>', '<title>Mohamed Lotfy Portfolio Brown</title>')
open(scratch + '/lotfy-brown.html', 'w', encoding='utf8').write(pv)
print('ok')
