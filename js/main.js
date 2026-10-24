// Mobile navigation
const toggle = document.querySelector('.nav-toggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.main-nav a').forEach(a =>
    a.addEventListener('click', () => document.body.classList.remove('nav-open'))
  );
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
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
