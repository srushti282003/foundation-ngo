(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const hd = $('.hd'), nav = $('.nav'), bg = $('.burger'),
        up = $('.up'), pr = $('.prog'), sc = $('.scrim');

  /* ===== DRAWER NAV ===== */
  const setNav = o => {
    nav.classList.toggle('open', o);
    sc && sc.classList.toggle('show', o);
    document.body.classList.toggle('lock', o);
    bg.setAttribute('aria-expanded', o);
    bg.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  };
  bg.onclick = () => setNav(!nav.classList.contains('open'));
  sc && (sc.onclick = () => setNav(false));
  $$('.nav a').forEach(a => a.addEventListener('click', () => setNav(false)));
  addEventListener('resize', () => { if (innerWidth > 900) setNav(false); });

  /* ===== PAGE LOADER ===== */
  const pl = $('#page-loader');
  if (pl) {
    const orb = $('.ld-orb', pl), pc = $('.ld-pct', pl);
    let seen = false;
    try { seen = sessionStorage.getItem('ldSeen'); } catch (e) {}
    if (seen) {
      pl.remove();
    } else {
      let n = 0, done = false;
      const t0 = Date.now();
      const tick = () => {
        const cap = done ? 100 : 90;
        n = Math.min(cap, n + (done ? 7 : 1.8));
        orb.style.setProperty('--p', n + '%');
        pc.textContent = Math.round(n) + '%';
        if (n < 100) {
          requestAnimationFrame(tick);
        } else {
          setTimeout(() => {
            pl.classList.add('hide');
            setTimeout(() => pl.remove(), 750);
            try { sessionStorage.setItem('ldSeen', '1'); } catch (e) {}
          }, 160);
        }
      };
      tick();
      const fin = () => setTimeout(() => { done = true; }, Math.max(0, 700 - (Date.now() - t0)));
      document.readyState === 'complete' ? fin() : addEventListener('load', fin);
      setTimeout(() => { done = true; }, 3500);
    }
  }

  /* ===== IMAGE SHIMMER ===== */
  $$('.img>img').forEach(im => {
    const p = im.parentNode;
    p.classList.add('loading');
    const ok = () => { p.classList.remove('loading'); p.classList.add('ready'); };
    im.complete && im.naturalWidth ? ok() : (im.onload = ok, im.onerror = () => p.classList.remove('loading'));
  });

  /* ===== DESKTOP DROPDOWN ===== */
  const dd = $('.dd'), db = $('.ddb');
  if (db) {
    db.onclick = e => {
      e.stopPropagation();
      const o = dd.classList.toggle('open');
      db.setAttribute('aria-expanded', o);
    };
    document.onclick = e => {
      if (!dd.contains(e.target)) { dd.classList.remove('open'); db.setAttribute('aria-expanded', false); }
    };
  }

  /* ===== KEYBOARD SHORTCUTS ===== */
  document.onkeydown = e => {
    if (e.key === 'Escape') {
      dd && dd.classList.remove('open');
      lb.hidden = true;
      setNav(false);
    }
    if (!lb.hidden) {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    }
  };

  /* ===== SCROLL EFFECTS ===== */
  onscroll = () => {
    hd.classList.toggle('sc', scrollY > 10);
    up.classList.toggle('show', scrollY > 400);
    if (pr) pr.style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
  };
  up.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

  /* ===== SCROLL-REVEAL (re-triggers on every scroll) ===== */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      e.target.classList.toggle('in', e.isIntersecting);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  $$('.rv, .rv-l, .rv-r, .rv-z').forEach(el => {
    io.observe(el);
  });

  /* ===== FORMS (WhatsApp) ===== */
  const WA = '919326267560';
  $$('form[data-wa]').forEach(f => f.onsubmit = e => {
    e.preventDefault();
    let ok = true;
    let m = `*${f.dataset.wa}*\n`;
    $$('.fld', f).forEach(d => {
      const i = $('input,select,textarea', d), v = i.value.trim(), er = $('.err', d);
      let msg = '';
      if (i.required && !v) msg = 'This field is required.';
      else if (v && i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email.';
      else if (v && i.type === 'tel' && !/^(\+?91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ''))) msg = 'Enter a valid 10-digit mobile number.';
      er.textContent = msg; d.classList.toggle('bad', !!msg); if (msg) ok = false;
      if (v) m += `${i.name}: ${v}\n`;
    });
    const st = $('.status', f);
    if (!ok) { st.textContent = 'Please fix the highlighted fields.'; return; }
    open(`https://wa.me/${WA}?text=${encodeURIComponent(m)}`, '_blank');
    st.textContent = 'WhatsApp has been opened. Press Send in WhatsApp to deliver your message.';
  });

  /* ===== DONATION ===== */
  const am = $$('.am');
  if (am.length) {
    let cur = '', pur = 'General Support';
    const sa = $('#selAmt'), cu = $('#custom'), df = $('#dform');
    const upd = () => {
      if (sa) sa.textContent = cur ? '₹' + Number(cur).toLocaleString('en-IN') : 'Not chosen';
      const sp = $('#selPur'); if (sp) sp.textContent = pur;
      if (df && cur) { const inp = $('input[type=number]', df); if (inp) inp.value = cur; }
    };
    am.forEach(b => b.onclick = () => {
      am.forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      if (b.dataset.a === 'custom') { if (cu) { cu.hidden = false; cu.focus(); cur = cu.value; } }
      else { if (cu) cu.hidden = true; cur = b.dataset.a; }
      upd();
    });
    if (cu) cu.oninput = () => { cur = cu.value; upd(); };
    $$('.pu').forEach(b => b.onclick = () => {
      $$('.pu').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); pur = b.textContent; upd();
    });
  }

  /* ===== FEED FILTER ===== */
  $$('.chip').forEach(c => c.onclick = () => {
    $$('.chip').forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    $$('.fc').forEach(k => k.classList.toggle('hide', c.dataset.f !== 'all' && k.dataset.c !== c.dataset.f));
  });

  /* ===== FAQ ACCORDION ===== */
  $$('.aq').forEach(q => q.onclick = () => {
    const item = q.parentNode, o = item.classList.toggle('open');
    q.setAttribute('aria-expanded', o);
    const icon = $('i', q);
    if (icon) icon.className = 'fa-solid ' + (o ? 'fa-minus' : 'fa-plus');
  });

  /* ===== LIGHTBOX ===== */
  const lb = $('.lb'), lc = $('.lbc');
  let items = [], ix = 0;
  const show = () => { if (items[ix]) lc.textContent = items[ix].dataset.lb; };
  const go = d => { ix = (ix + d + items.length) % items.length; show(); };
  $$('.img[data-lb]').forEach(el => el.onclick = () => {
    items = $$('.img[data-lb]'); ix = items.indexOf(el); show(); lb.hidden = false;
  });
  $('.lbx').onclick = () => lb.hidden = true;
  $('.lbp').onclick = () => go(-1);
  $('.lbn').onclick = () => go(1);
  lb.onclick = e => { if (e.target === lb) lb.hidden = true; };

  /* ===== VIDEO MODAL ===== */
  $$('.vid').forEach(v => {
    const btn = $('.play', v);
    if (btn) btn.onclick = () => {
      lb.hidden = false;
      lc.innerHTML = `<video src="${v.dataset.video}" controls autoplay style="max-width:82vw;max-height:72vh;border-radius:12px"></video><p style="margin-top:12px;font-size:.9rem;opacity:.8">If nothing plays, add your video at ${v.dataset.video}</p>`;
      const c = () => { const vi = $('video', lc); vi && vi.pause(); };
      $('.lbx').addEventListener('click', c, { once: true });
    };
  });

})();