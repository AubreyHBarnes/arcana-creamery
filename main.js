/* ============================================================
   ARCANA CREAMERY — main.js
   Three self-contained IIFEs; each can be extracted as-is
   if the components are reused elsewhere.
   ============================================================ */

/* ============================================================
   COMPONENT: Header — scrolled state
   Adds .is-scrolled once the user scrolls past 10 px so the
   nav border + shadow only appear when they're useful.
   ============================================================ */
(function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ============================================================
   COMPONENT: Mobile Nav Toggle
   Toggles .is-open on the nav panel and animates the
   hamburger into an X via aria-expanded.
   ============================================================ */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('siteNav');
  if (!toggle || !nav) return;

  function close() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const opening = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', opening);
    toggle.setAttribute('aria-expanded', String(opening));
    document.body.style.overflow = opening ? 'hidden' : '';
  });

  // Close when a link is clicked (smooth-scroll to section)
  nav.querySelectorAll('.site-nav__link').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();


/* ============================================================
   COMPONENT: Testimonials Carousel
   - Reads quotes directly from the card text in the DOM.
   - Dot tabs, prev/next buttons, and arrow keys all drive the
     same goTo() function.
   - Auto-advances every 4.5 s; pauses on hover OR keyboard
     focus (WCAG 2.2.2 — auto-playing content must be
     pauseable without a mouse).
   ============================================================ */
(function initCarousel() {
  const dotsContainer = document.getElementById('carouselDots');
  const quoteEl       = document.getElementById('carouselQuote');
  const prevBtn       = document.getElementById('carouselPrev');
  const nextBtn       = document.getElementById('carouselNext');
  const carousel      = document.getElementById('carousel');
  const cards         = document.querySelectorAll('.testimonial-card');

  if (!dotsContainer || !quoteEl || !prevBtn || !nextBtn || !cards.length) return;

  // Derive a short pull-quote from each card's first sentence
  const quotes = Array.from(cards).map(card => {
    const text = card.querySelector('.testimonial-card__text').textContent.trim();
    const firstSentence = text.match(/^[^.!?]+[.!?]/);
    return `"${firstSentence ? firstSentence[0].trim() : text}"`;
  });

  const total   = quotes.length;
  let current   = 0;
  let autoTimer = null;

  // ── Build dot/tab buttons ──────────────────────────────────
  const dots = quotes.map((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Testimonial ${i + 1} of ${total}`);
    btn.setAttribute('aria-selected', String(i === 0));
    btn.setAttribute('aria-controls', 'carouselQuote');
    dotsContainer.appendChild(btn);
    btn.addEventListener('click', () => goTo(i));
    return btn;
  });

  // ── Core navigation ────────────────────────────────────────
  function goTo(index) {
    // Wrap around both ends
    index = ((index % total) + total) % total;
    if (index === current) return;

    quoteEl.classList.add('is-fading');

    setTimeout(() => {
      dots[current].classList.remove('is-active');
      dots[current].setAttribute('aria-selected', 'false');

      current = index;
      quoteEl.textContent = quotes[current];

      dots[current].classList.add('is-active');
      dots[current].setAttribute('aria-selected', 'true');
      quoteEl.classList.remove('is-fading');
    }, 300);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Arrow keys on prev/next buttons for keyboard power users
  [prevBtn, nextBtn].forEach(btn => {
    btn.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });
  });

  // Arrow keys within the dot tablist
  dotsContainer.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); dots[((current % total) + total) % total]?.focus(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); dots[((current % total) + total) % total]?.focus(); }
  });

  // ── Auto-rotation ──────────────────────────────────────────
  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  startAuto();

  // Pause on mouse hover
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  // Pause when keyboard focus enters the carousel (WCAG 2.2.2)
  carousel.addEventListener('focusin', stopAuto);
  carousel.addEventListener('focusout', e => {
    // Only restart if focus truly left the carousel (not moved between children)
    if (!carousel.contains(e.relatedTarget)) startAuto();
  });
})();
