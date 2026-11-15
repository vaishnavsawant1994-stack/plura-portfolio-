(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const menu = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-nav');
  const theme = document.getElementById('theme-toggle');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  try {
    const saved = localStorage.getItem('plura-theme');
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch (_) { /* storage may be disabled */ }

  function syncTheme() {
    if (!theme) return;
    const light = root.dataset.theme === 'light';
    theme.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
    theme.setAttribute('aria-pressed', String(light));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = light ? '#f4f1e9' : '#242329';
  }
  syncTheme();
  theme?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('plura-theme', next); } catch (_) { /* optional */ }
    syncTheme();
  });

  function setMenu(open) {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('nav-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      setMenu(false); menu.focus();
    }
  });
  document.addEventListener('click', e => {
    if (nav?.classList.contains('nav-open') && !header?.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  const reveals = document.querySelectorAll('[data-reveal]');
  if (!motion.matches && 'IntersectionObserver' in window) {
    root.classList.add('js-motion');
    const show = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }, { threshold: 0.09, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => show.observe(el));
    motion.addEventListener('change', e => {
      if (e.matches) { root.classList.remove('js-motion'); show.disconnect(); }
    });
  }

  let prev = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 24);
    if (header) header.classList.toggle('header-hidden', y > 800 && y > prev + 5 && !nav?.classList.contains('nav-open'));
    if (y < prev - 5) header?.classList.remove('header-hidden');
    prev = y;
  };
  window.addEventListener('scroll', onScroll, { passive:true }); onScroll();

  const sectionIds = ['services', 'works', 'pricing', 'contact', 'faq'];
  if ('IntersectionObserver' in window) {
    const active = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        nav?.querySelectorAll('a').forEach(a => a.toggleAttribute('aria-current', a.hash === `#${entry.target.id}`));
      }
    }, { rootMargin:'-28% 0px -55% 0px' });
    sectionIds.forEach(id => { const el = document.getElementById(id); if (el) active.observe(el); });
  }

  // Spring-like cursor interpolation is deliberately disabled for touch and reduced-motion users.
  const finePointer = window.matchMedia('(pointer: fine)');
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (finePointer.matches && !motion.matches && dot && ring) {
    let mx = -200, my = -200, rx = -200, ry = -200, animating = false;
    const tick = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      if (Math.abs(mx-rx) + Math.abs(my-ry) > 0.25 && !motion.matches) requestAnimationFrame(tick);
      else animating = false;
    };
    window.addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      if (!animating) { animating = true; requestAnimationFrame(tick); }
    }, { passive:true });
    document.addEventListener('pointerover', e => { if (e.target.closest('a, button, summary, input, select, textarea')) document.body.classList.add('cursor-hover'); });
    document.addEventListener('pointerout', e => { if (e.target.closest('a, button, summary, input, select, textarea')) document.body.classList.remove('cursor-hover'); });
    root.classList.add('custom-cursor');
    motion.addEventListener('change', e => { if (e.matches) root.classList.remove('custom-cursor'); });
  }

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  document.querySelectorAll('[data-plan]').forEach(link => link.addEventListener('click', () => {
    const select = document.getElementById('contact-plan');
    if (select) select.value = link.dataset.plan;
  }));
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) { if(status) status.textContent = 'Please complete all required fields with valid information.'; return; }
    const button = form.querySelector('button[type="submit"]');
    if (button?.disabled) return;
    if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
    if (status) status.textContent = 'Sending your enquiry…';
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Message could not be delivered (${response.status}).`);
      if (status) status.textContent = 'Your message was sent successfully.';
      form.reset();
    } catch (err) {
      if (status) status.textContent = `${err.message || 'Service currently unavailable.'} Please try again later.`;
    } finally {
      if (button) { button.disabled = false; button.removeAttribute('aria-busy'); }
    }
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
