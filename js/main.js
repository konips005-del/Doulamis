const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const header = document.querySelector('.site-header');

// Mobile navigation (menu starts right below the header, wherever it currently is)
const toggle = document.querySelector('.nav-toggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    document.documentElement.style.setProperty('--nav-top', header.getBoundingClientRect().bottom + 'px');
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.main-nav a').forEach(a =>
    a.addEventListener('click', () => document.body.classList.remove('nav-open'))
  );
}

// Assign reveal animations + stagger to elements that don't have them in the markup
const addReveal = (selector, anim, stagger = 0) => {
  document.querySelectorAll(selector).forEach(group => {
    const items = stagger ? group.children : [group];
    [...items].forEach((el, i) => {
      el.classList.add('reveal');
      if (anim) el.dataset.anim = anim;
      if (stagger) el.style.setProperty('--d', `${i * stagger}s`);
    });
  });
};
addReveal('.section-head');
addReveal('.split > .reveal:first-child', 'left');
addReveal('.split > .reveal:last-child', 'right');
addReveal('.cards', null, 0.12);
addReveal('.info-grid', null, 0.12);
addReveal('.contact-list', 'left', 0.08);
addReveal('.form', 'right');
addReveal('.cta-box', 'zoom');
addReveal('.map', 'zoom');
addReveal('.prose > h2, .prose > p, .prose > ul, .faq details');
addReveal('.aside', 'right', 0.12);
addReveal('.timeline', null, 0.08);

// Quote: split into words that light up in sequence
document.querySelectorAll('.quote blockquote').forEach(bq => {
  const text = bq.firstChild;
  if (!text || text.nodeType !== Node.TEXT_NODE) return;
  const frag = document.createDocumentFragment();
  text.textContent.trim().split(/\s+/).forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.style.setProperty('--i', i);
    span.textContent = w;
    frag.append(span, ' ');
  });
  bq.replaceChild(frag, text);
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

// Count-up numbers (2010, 24/7, 251 ΓΝΑ)
const countEls = document.querySelectorAll('.hero-stats strong');
const runCount = el => {
  const m = el.textContent.match(/^(\d+)(.*)$/);
  if (!m || reduceMotion) return;
  const target = +m[1], suffix = m[2];
  const start = target > 1000 ? target - 25 : 0;
  const t0 = performance.now(), dur = 1600;
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if (countEls.length && 'IntersectionObserver' in window) {
  const co = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
  }, { threshold: 0.6 });
  countEls.forEach(el => co.observe(el));
}

// Scroll-driven effects: progress bar, header shadow, back-to-top, parallax, timeline fill
const progress = document.createElement('div');
progress.className = 'scroll-progress';
document.body.prepend(progress);

const toTop = document.createElement('button');
toTop.className = 'to-top';
toTop.setAttribute('aria-label', 'Επιστροφή στην κορυφή');
toTop.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
document.body.append(toTop);

const parallaxEls = reduceMotion ? [] : [...document.querySelectorAll('.hero-visual .photo, .split .photo')];
const timeline = document.querySelector('.timeline');

let ticking = false;
const onScroll = () => {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  header.classList.toggle('scrolled', y > 40);
  toTop.classList.toggle('show', y > 700);

  parallaxEls.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    const offset = (r.top + r.height / 2 - vh / 2) * -0.06;
    el.style.transform = `translateY(${offset.toFixed(1)}px)`;
  });

  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const p = Math.min(Math.max((vh * 0.65 - r.top) / r.height, 0), 1);
    timeline.style.setProperty('--p', p.toFixed(3));
  }
  ticking = false;
};
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// Cards: 3D tilt + spotlight following the cursor
if (canHover && !reduceMotion) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transition = 'transform .1s ease-out, box-shadow .25s, border-color .25s';
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .25s, border-color .25s';
      card.style.transform = '';
    });
  });

  // Hero photo follows the mouse slightly
  const hero = document.querySelector('.hero');
  const badge = document.querySelector('.photo-badge');
  if (hero && badge) {
    hero.addEventListener('mousemove', e => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      badge.style.translate = `${x * -18}px ${y * -14}px`;
    });
  }
}

// Appointment form -> opens the visitor's email client with a prefilled message
const form = document.getElementById('booking-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = `Αίτημα ραντεβού – ${d.get('name')}`;
    const body = [
      `Ονοματεπώνυμο: ${d.get('name')}`,
      `Τηλέφωνο: ${d.get('phone')}`,
      `Email: ${d.get('email') || '-'}`,
      `Εξέταση: ${d.get('service')}`,
      `Προτιμώμενη ημέρα: ${d.get('day')}`,
      '',
      d.get('message') || ''
    ].join('\n');
    window.location.href =
      `mailto:doulamis.vasilios@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

// Footer year
document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
