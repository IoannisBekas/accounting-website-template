(() => {
  'use strict';
  function startMotion() {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.getElementById('motion-toggle');
  const hero = document.querySelector('.hero');
  const art = document.querySelector('.hero-art');
  const labels = {
    sv: {pause: 'Pausa rörelser', play: 'Starta rörelser'},
    en: {pause: 'Pause motion', play: 'Resume motion'}
  };
  let paused = false;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  const seen = new WeakSet();
  const running = new Set();
  const scenes = [...document.querySelectorAll('.motion-scene')];
  const canMove = () => !paused && !reducedMotion.matches;

  function updateToggle() {
    const text = labels[root.lang] || labels.sv;
    toggle.hidden = reducedMotion.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.querySelector('.motion-toggle-label').textContent = text[paused ? 'play' : 'pause'];
    root.classList.toggle('motion-paused', paused || reducedMotion.matches);
    if (!canMove()) {
      running.forEach(animation => animation.finish());
      art.style.removeProperty('--pointer-x');
      art.style.removeProperty('--pointer-y');
      art.style.removeProperty('--scroll-y');
    }
  }

  function entrance(element) {
    if (!canMove() || typeof element.animate !== 'function') return;
    const words = element.querySelectorAll('.motion-word');
    const targets = words.length ? [...words] : [element];
    targets.forEach((target, index) => {
      const animation = target.animate([
        {opacity: 0, transform: `translateY(${words.length ? 48 : 32}px)`},
        {opacity: 1, transform: 'translateY(0)'}
      ], {
        duration: words.length ? 600 : 550,
        delay: Math.min(index, 12) * 60 + Number(element.dataset.motionDelay || 0),
        easing: 'cubic-bezier(.22,.61,.36,1)',
        fill: 'backwards'
      });
      running.add(animation);
      animation.finished.then(() => running.delete(animation), () => running.delete(animation));
    });
  }

  const reveals = 'h1, h2, .intro-text, .section-description, .collage-panel, .service-card, .about-copy > p, .benefit, .process-heading > p, .step, .faq-items details, .contact-intro, .contact-book, .contact-details, .map-shell';
  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      seen.add(entry.target);
      entrance(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08}) : null;

  function prepare() {
    updateToggle();
    document.querySelectorAll('main h1, main h2:not(.sr-only)').forEach(heading => {
      if (heading.querySelector('.motion-word')) return;
      const fragment = document.createDocumentFragment();
      heading.textContent.split(/(\s+)/).forEach(word => {
        if (/^\s+$/.test(word)) fragment.append(document.createTextNode(word));
        else if (word) {
          const span = document.createElement('span');
          span.className = 'motion-word';
          span.textContent = word;
          fragment.append(span);
        }
      });
      heading.replaceChildren(fragment);
    });
    document.querySelectorAll('.service-card, .collage-panel, .step, .benefit').forEach(element => {
      const siblings = [...element.parentElement.children];
      element.dataset.motionDelay = String((siblings.indexOf(element) % 3) * 90);
    });
    document.querySelectorAll(`main ${reveals.split(', ').join(', main ')}`).forEach(element => {
      if (!seen.has(element)) revealObserver?.observe(element);
    });
  }

  if ('IntersectionObserver' in window) {
    const sceneObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('is-active', entry.isIntersecting);
    }), {threshold: 0.05});
    scenes.forEach(scene => sceneObserver.observe(scene));
  } else scenes.forEach(scene => scene.classList.add('is-active'));

  function updateDepth() {
    frame = 0;
    if (!canMove() || !finePointer.matches || !art.classList.contains('is-active')) return;
    art.style.setProperty('--pointer-x', `${pointerX}px`);
    art.style.setProperty('--pointer-y', `${pointerY}px`);
    const scroll = Math.min(Math.max(-hero.getBoundingClientRect().top * 0.075, -10), 42);
    art.style.setProperty('--scroll-y', `${scroll}px`);
  }
  function requestDepth() {
    if (!frame) frame = requestAnimationFrame(updateDepth);
  }
  hero.addEventListener('pointermove', event => {
    if (!canMove() || !finePointer.matches) return;
    const bounds = hero.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 16;
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
    requestDepth();
  });
  hero.addEventListener('pointerleave', () => {pointerX = 0; pointerY = 0; requestDepth();});
  window.addEventListener('scroll', requestDepth, {passive: true});
  document.addEventListener('visibilitychange', () => root.classList.toggle('motion-hidden', document.hidden));
  toggle.addEventListener('click', () => {paused = !paused; updateToggle();});
  reducedMotion.addEventListener('change', updateToggle);
  document.addEventListener('eko:render', prepare);
  root.classList.add('motion-ready');
  prepare();
  }
  if (window.EKO_PAGE_READY) window.EKO_PAGE_READY.then(startMotion);
  else startMotion();
})();
