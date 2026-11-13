(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Language (English / Arabic) ---------- */
  const TITLES = {
    en: document.title,
    ar: 'محمد لطفي — ابنِ صح. حقّق الربحية. ثم توسّع.'
  };
  const langBtn = $('#langToggle');
  let lang = 'en';
  function applyLang(l) {
    lang = l;
    const root = document.documentElement;
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    $$('[data-ar]').forEach(el => {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = l === 'ar' ? el.dataset.ar : el.dataset.en;
      if (el.classList.contains('split')) splitEl(el);
      if (el.dataset.text !== undefined) el.dataset.text = el.textContent;
    });
    langBtn.textContent = l === 'ar' ? 'EN' : 'العربية';
    langBtn.setAttribute('aria-label', l === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    document.title = TITLES[l];
  }
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  applyLang(saved === 'ar' || saved === 'en' ? saved : ((navigator.language || '').startsWith('ar') ? 'ar' : 'en'));
  langBtn.addEventListener('click', () => {
    applyLang(lang === 'ar' ? 'en' : 'ar');
    try { localStorage.setItem('lang', lang); } catch (e) {}
  });

  /* ---------- Text scramble ---------- */
  const GLYPHS = '!<>-_\\/[]{}=+*^?#01';
  function scramble(el, text, duration = 900) {
    if (reduced || lang === 'ar') { el.textContent = text; return; }
    const start = performance.now();
    const offsets = [...text].map((_, i) => (i / text.length) * 0.6 + Math.random() * 0.15);
    (function frame(now) {
      const p = clamp((now - start) / duration, 0, 1);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === ' ' || p >= offsets[i] + 0.25) out += ch;
        else if (p < offsets[i]) out += ' ';
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame); else el.textContent = text;
    })(start);
  }

  /* ---------- Boot sequence ---------- */
  const boot = $('#boot');
  const lines = [
    '<b>$</b> ssh lotfy.me',
    'handshake ............... <b>ok</b>',
    'loading experience ...... <b>2013 → now</b>',
    'mounting products ....... <b>ok</b>',
    'building startups ....... <b>0 → scale</b>',
    '<b>ready.</b>'
  ];
  function start() {
    boot.classList.add('is-done');
    document.body.classList.remove('is-booting');
    document.body.classList.add('is-ready');
    $$('.hero .scramble').forEach(el =>
      setTimeout(() => scramble(el, el.dataset.text, 1100), +el.dataset.delay || 0));
    setTimeout(typeLoop, 1200);
    const trustIO = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      $$('.trust .count').forEach(count);
      trustIO.disconnect();
    }, { threshold: 0.2 });
    trustIO.observe($('.trust'));
  }
  if (reduced) {
    start();
  } else {
    const log = $('#bootLog'), bar = $('#bootBar'), pct = $('#bootPct');
    const total = 1500, t0 = performance.now();
    let shown = 0;
    (function tick(now) {
      const p = clamp((now - t0) / total, 0, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      bar.style.width = eased * 100 + '%';
      pct.textContent = Math.round(eased * 100);
      const want = Math.ceil(p * lines.length);
      while (shown < want) log.innerHTML += lines[shown++] + '\n';
      if (p < 1) requestAnimationFrame(tick); else setTimeout(start, 260);
    })(t0);
  }

  /* ---------- Typed roles ---------- */
  const ROLES = {
    en: ['from idea to launch.', 'from launch to customers.', 'from revenue to profit and scale.'],
    ar: ['من الفكرة إلى الإطلاق.', 'من الإطلاق إلى العملاء.', 'من الإيرادات إلى الربحية والتوسع.']
  };
  const typed = $('#typed');
  function typeLoop() {
    if (reduced) { typed.textContent = ROLES[lang][0]; return; }
    let r = 0, i = 0, del = false;
    (function step() {
      const list = ROLES[lang];
      const word = list[r % list.length];
      i += del ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let wait = del ? 28 : 55 + Math.random() * 40;
      if (!del && i >= word.length) { del = true; wait = 1700; }
      else if (del && i <= 0) { del = false; i = 0; r = (r + 1) % list.length; wait = 300; }
      setTimeout(step, wait);
    })();
  }

  /* ---------- Hero wave field (canvas) ---------- */
  const canvas = $('#field');
  const hero = $('#hero');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, heroVisible = true;
  const mouse = { x: 0.7, y: 0.3, tx: 0.7, ty: 0.3 };
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced) draw(0);
  }
  const css = getComputedStyle(document.documentElement);
  const FA = (css.getPropertyValue('--field-a') || '').trim() || '200,255,62';
  const FB = (css.getPropertyValue('--field-b') || '').trim() || '62,230,255';
  function draw(time) {
    const t = time * 0.00055;
    ctx.clearRect(0, 0, W, H);
    const small = W < 760;
    const cols = small ? 34 : 64, rows = small ? 22 : 30;
    const gap = 62, focal = 520;
    const cx = W / 2 + (mouse.x - 0.5) * -70;
    const horizon = H * 0.44 + (mouse.y - 0.5) * -34;
    const mxw = (mouse.x - 0.5) * cols * gap * 0.55;
    for (let j = rows - 1; j >= 0; j--) {
      const z = 70 + j * gap;
      const s = focal / (focal + z);
      const fade = 1 - j / rows;
      let px = 0, py = 0;
      for (let i = 0; i < cols; i++) {
        const x = (i - (cols - 1) / 2) * gap;
        const d = Math.hypot(x - mxw, z - 620) / 300;
        const bump = Math.exp(-d * d) * 95;
        const y = Math.sin(i * 0.33 + t * 2.1) * 26 + Math.cos(j * 0.42 + t * 1.6) * 30
                + Math.sin((i + j) * 0.21 - t * 1.3) * 18 - bump;
        const sx = cx + x * s;
        const sy = horizon + (240 + y) * s;
        const lift = clamp((40 - y) / 150, 0, 1);
        if (i > 0 && j % 2 === 0) {
          ctx.strokeStyle = `rgba(${FA},${0.05 + fade * 0.16})`;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
        }
        const r = Math.max(0.5, s * 2.5 * (0.6 + lift));
        ctx.fillStyle = lift > 0.72
          ? `rgba(${FB},${0.25 + fade * 0.7})`
          : `rgba(${FA},${0.2 + fade * 0.8 * (0.45 + lift)})`;
        ctx.fillRect(sx - r / 2, sy - r / 2, r, r);
        px = sx; py = sy;
      }
    }
  }
  function loop(time) {
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    if (heroVisible && !document.hidden) draw(time);
    requestAnimationFrame(loop);
  }
  resize();
  addEventListener('resize', resize);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
  if (!reduced) requestAnimationFrame(loop);

  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = (e.clientY - r.top) / r.height;
    hero.style.setProperty('--mx', mouse.tx * 100 + '%');
    hero.style.setProperty('--my', mouse.ty * 100 + '%');
  });

  /* ---------- Reveal on scroll ---------- */
  function splitEl(el) {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\s+/).map((w, i) =>
      `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
  }
  $$('.cards, .work, .videos, .stats, .talks, .quotes, .pains, .offers, .why, .steps, .faq').forEach(group =>
    [...group.children].forEach((c, i) => c.style.setProperty('--d', (i % 3) * 0.09 + 's')));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      if (el.classList.contains('scramble-in')) scramble(el, el.dataset.text, 800);
      $$('.count', el).forEach(count);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .split, .scramble-in').forEach(el => io.observe(el));

  // Icons draw themselves in; list items and checks pop in one after another.
  $$('.card__icon *').forEach(n => n.setAttribute('pathLength', '1'));
  $$('.offer__list, .contact__points, .trust').forEach(list =>
    [...list.children].forEach((li, i) => li.style.setProperty('--i', i)));

  function count(el) {
    const to = el.dataset.since ? new Date().getFullYear() - +el.dataset.since : +el.dataset.to;
    if (reduced) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 2200;
    (function f(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      const n = Math.round((1 - Math.pow(1 - p, 4)) * to);
      el.textContent = el.dataset.sep ? n.toLocaleString('en-US') : n;
      if (p < 1) requestAnimationFrame(f);
      else { const b = el.closest('b'); if (b) { b.classList.remove('is-landed'); void b.offsetWidth; b.classList.add('is-landed'); } }
    })(t0);
  }

  /* ---------- Scroll-driven: progress, nav, timeline, big text ---------- */
  const progress = $('#progress'), nav = $('#nav'), timeline = $('#timeline'), bigtext = $('#bigtext');
  const sections = $$('main section[id]');
  const contact = $('#contact'), stickyCta = $('#stickyCta');
  const links = $$('.nav__links a[href^="#"]');
  let lastY = 0, ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-stuck', y > 30);
    nav.classList.toggle('is-hidden', y > lastY && y > 500);
    lastY = y;


    const br = bigtext.getBoundingClientRect();
    if (br.top < vh && br.bottom > 0 && !reduced)
      bigtext.style.transform = `translateX(${-(vh - br.top) * 0.35}px)`;

    // Floating booking button: shown after the hero, hidden over the form.
    const hb = hero.getBoundingClientRect(), cb = contact.getBoundingClientRect();
    stickyCta.classList.toggle('is-on', hb.bottom < 0 && cb.top > vh * 0.6);

    let current = '';
    sections.forEach(s => { if (s.getBoundingClientRect().top < vh * 0.4) current = s.id; });
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $('#navToggle');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Spotlight cards ---------- */
  $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', e.clientX - r.left + 'px');
    el.style.setProperty('--y', e.clientY - r.top + 'px');
  }));

  /* ---------- Pointer-only effects ---------- */
  if (finePointer && !reduced) {
    // 3D tilt
    $$('.tilt').forEach(el => {
      const strength = el.id === 'portrait' ? 14 : 6;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${x * strength}deg) rotateX(${-y * strength}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    // Magnetic buttons
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    // Custom cursor
    const cur = $('#cursor'), dot = $('#cursorDot');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px)`;
      document.body.classList.add('has-cursor');
      cur.classList.toggle('is-hover', !!e.target.closest('a, button, .tilt, input, textarea, select, summary'));
    }, { passive: true });
    document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
    (function follow() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      cur.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- Topic shortcuts: preselect the form topic ---------- */
  $$('[data-topic]').forEach(el => el.addEventListener('click', () => {
    $('#f-stage').value = el.dataset.topic;
    track('cta', { topic: el.dataset.topic });
  }));

  /* ---------- Ad tracking (fires only if Meta Pixel / Google tag / TikTok pixel are on the page) ---------- */
  function track(kind, data) {
    try {
      if (kind === 'lead') {
        window.fbq && window.fbq('track', 'Lead', data);
        window.gtag && window.gtag('event', 'generate_lead', data);
        window.ttq && window.ttq.track('SubmitForm', data);
      } else {
        window.fbq && window.fbq('trackCustom', 'CTAClick', data);
        window.gtag && window.gtag('event', 'cta_click', data);
      }
    } catch (e) {}
  }

  /* ---------- Contact form → Google Sheet ---------- */
  // Paste the Google Apps Script web app URL here (see google-apps-script/README.md).
  // While it is empty the form cannot deliver and shows the failure note.
  const SHEET_ENDPOINT = '';
  const CONTACT_EMAIL = 'consult@lotfy.me';
  const MSG = {
    invalid: { en: '> please add your name, a valid phone number and email.', ar: 'يرجى كتابة الاسم ورقم جوال وبريد إلكتروني صحيحين.' },
    sending: { en: '> sending…', ar: 'جارٍ الإرسال…' },
    sent: { en: '> received. I will get back to you soon.', ar: 'تم استلام طلبك، وسأتواصل معك قريبًا.' },
    failed: { en: '> could not send. Please try again, or write to ' + CONTACT_EMAIL, ar: 'تعذّر الإرسال. حاول مرة أخرى أو راسلني على ' + CONTACT_EMAIL }
  };
  const form = $('#form'), note = $('#formNote');
  const say = key => { note.textContent = MSG[key][lang]; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { say('invalid'); form.reportValidity(); return; }
    const d = new FormData(form);
    if (d.get('website')) return; // bots fill the hidden field
    // Phones typed with Arabic-Indic digits are stored as Latin digits.
    d.set('phone', String(d.get('phone')).replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
    if (!SHEET_ENDPOINT) { say('failed'); return; }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    say('sending');
    try {
      const data = new URLSearchParams(d);
      data.set('lang', lang);
      const res = await fetch(SHEET_ENDPOINT, { method: 'POST', body: data });
      const out = await res.json();
      if (!out.ok) throw new Error('rejected');
      track('lead', { stage: d.get('stage') });
      form.reset();
      say('sent');
    } catch (err) {
      say('failed');
    } finally {
      btn.disabled = false;
    }
  });
})();
