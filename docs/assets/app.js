(() => {
  'use strict';
  const copy = window.EKO_COPY;
  const languages = ['sv', 'en'];
  const basePath = document.querySelector('meta[name="site-base"]').content;
  const origin = new URL(basePath, location.origin).href.replace(/\/$/, '');
  const icons = ['book', 'file', 'chart', 'advice'];
  const titles = {sv:'Redovisning & skatterådgivning i Vårby',en:'Accounting & tax services in Vårby'};
  const timeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30'];
  const pathLanguage = location.pathname.slice(basePath.length).split('/').filter(Boolean)[0];
  let language = languages.includes(pathLanguage) ? pathLanguage : 'sv';
  const dialog = document.getElementById('booking-dialog');
  const form = document.getElementById('booking-form');
  const languageSelect = document.getElementById('language');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-nav');
  const feedback = document.querySelector('.form-feedback');
  const get = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon = (name, className = 'icon') => `<svg class="${className}" aria-hidden="true"><use href="#${name}"/></svg>`;
  const dateString = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  form.elements.date.min = dateString(tomorrow);

  function validateDate() {
    const value = form.elements.date.value;
    const date = value ? new Date(`${value}T12:00:00`) : null;
    const invalid = date && (value < dateString(tomorrow) || [0,6].includes(date.getDay()));
    form.elements.date.setCustomValidity(invalid ? copy[language].booking.dateError : '');
  }

  function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    menuButton.setAttribute('aria-label', copy[language].navigation[open ? 'close' : 'menu']);
  }

  function render() {
    const text = copy[language];
    const business = copy.common;
    const emailLink = document.querySelector('.contact-email');
    emailLink.hidden = !business.email;
    emailLink.querySelector('span').textContent = business.email;
    if (business.email) emailLink.href = 'mailto:' + business.email;
    else emailLink.removeAttribute('href');
    const phoneLink = document.querySelector('.contact-phone');
    phoneLink.hidden = !business.phone;
    phoneLink.textContent = business.phone;
    if (business.phoneUri) phoneLink.href = business.phoneUri;
    else phoneLink.removeAttribute('href');
    document.documentElement.lang = language;
    languageSelect.value = language;
    document.querySelectorAll('[data-t]').forEach(element => {
      const value = get(text, element.dataset.t);
      if (typeof value === 'string') element.textContent = value;
    });
    document.title = `${titles[language]} | ${copy.common.businessName}`;
    document.querySelector('meta[name="description"]').content = text.hero.subtitle;
    document.querySelector('link[rel="canonical"]').href = `${origin}${language === 'sv' ? '/' : `/${language}/`}`;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = text.hero.subtitle;
    document.querySelector('meta[property="og:url"]').content = document.querySelector('link[rel="canonical"]').href;
    document.querySelectorAll('link[hreflang]').forEach(link => link.remove());
    for (const code of languages) {
      const alternate = document.createElement('link');
      alternate.rel = 'alternate';
      alternate.hreflang = code;
      alternate.href = `${origin}${code === 'sv' ? '/' : `/${code}/`}`;
      document.head.append(alternate);
    }
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `${origin}/`;
    document.head.append(defaultLink);
    document.querySelector('.dialog-close').setAttribute('aria-label', text.booking.closeLabel);
    document.querySelector('.scroll-link').setAttribute('aria-label', text.hero.secondaryCta);
    setMenu(false);
    document.getElementById('service-cards').innerHTML = text.services.cards.map((card, index) => `
      <article class="service-card">
        <div class="service-card-top"><span class="service-number">${escape(card.eyebrow)} /</span>${icon(icons[index], 'service-icon')}</div>
        <h3>${escape(card.title)}</h3><p class="service-card-description">${escape(card.description)}</p>
        <ul class="service-list">${card.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>
        <button class="text-link" data-book="${escape(card.id)}"><span>${escape(card.cta)}</span>${icon('arrow')}</button>
      </article>`).join('');
    document.getElementById('benefits').innerHTML = text.about.benefits.map(benefit => `<div class="benefit"><span aria-hidden="true">↗</span><div><h3>${escape(benefit.title)}</h3><p>${escape(benefit.description)}</p></div></div>`).join('');
    document.getElementById('process-steps').innerHTML = text.about.steps.map(step => `<article class="step"><span class="step-number">${escape(step.number)}</span><h3>${escape(step.title)}</h3><p>${escape(step.description)}</p></article>`).join('');
    document.getElementById('faq-items').innerHTML = text.faq.items.map(item => `<details><summary><span>${escape(item.question)}</span><span class="faq-plus" aria-hidden="true"></span></summary><p class="faq-answer">${escape(item.answer)}</p></details>`).join('');
    const selectedService = form.elements.service.value;
    form.elements.service.innerHTML = `<option value="">${escape(text.booking.servicePlaceholder)}</option>${text.services.cards.map(card => `<option value="${escape(card.id)}">${escape(card.title)}</option>`).join('')}<option value="other">${escape(text.booking.otherService)}</option>`;
    form.elements.service.value = selectedService;
    const selectedTime = form.elements.time.value;
    form.elements.time.innerHTML = `<option value="">—</option>${timeSlots.map(time => `<option value="${time}">${time}</option>`).join('')}`;
    form.elements.time.value = selectedTime;
    form.elements.message.placeholder = text.booking.messagePlaceholder;
    feedback.hidden = true;
    validateDate();
    document.getElementById('year').textContent = new Date().getFullYear();
    let schema = document.getElementById('business-schema');
    if (!schema) {
      schema = document.createElement('script');
      schema.id = 'business-schema';
      schema.type = 'application/ld+json';
      document.head.append(schema);
    }
    schema.textContent = JSON.stringify({'@context':'https://schema.org','@type':'AccountingService',name:business.businessName,url:origin,identifier:{'@type':'PropertyValue',propertyID:'Org.nr',value:business.organisationNumber},address:{'@type':'PostalAddress',streetAddress:business.address.street,postalCode:business.address.postalCode,addressLocality:business.address.locality,addressRegion:business.address.region,addressCountry:business.address.countryCode},...(business.email ? {email:business.email} : {}),...(business.phoneUri ? {telephone:business.phoneUri.slice(4)} : {})});
    document.querySelectorAll('[data-book]').forEach(button => {
      button.disabled = !business.email;
      if (!business.email) button.title = text.booking.unavailable;
      else button.removeAttribute('title');
    });
    form.querySelector('[type="submit"]').disabled = !business.email;
    document.dispatchEvent(new Event('eko:render'));
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-book]');
    if (trigger && copy.common.email) {
      setMenu(false);
      if (trigger.dataset.book) form.elements.service.value = trigger.dataset.book;
      feedback.hidden = true;
      dialog.showModal();
      document.body.classList.add('no-scroll');
      form.elements.name.focus();
    }
    if (event.target.closest('#mobile-nav a')) setMenu(false);
  });
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.querySelectorAll('.dialog-close,.dialog-cancel').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => document.body.classList.remove('no-scroll'));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileMenu.hidden) setMenu(false);
  });
  languageSelect.addEventListener('change', () => {
    language = languageSelect.value;
    history.pushState(null, '', `${basePath}${language === 'sv' ? '' : `${language}/`}${location.hash}`);
    render();
  });
  window.addEventListener('popstate', () => {
    const routeLanguage = location.pathname.slice(basePath.length).split('/').filter(Boolean)[0];
    const nextLanguage = languages.includes(routeLanguage) ? routeLanguage : 'sv';
    if (nextLanguage !== language) {
      language = nextLanguage;
      render();
    }
  });
  form.elements.date.addEventListener('change', validateDate);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!copy.common.email) return;
    validateDate();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    const text = copy[language].booking;
    const service = copy[language].services.cards.find(card => card.id === values.service)?.title || text.otherService;
    const body = [text.emailIntro,'',`${text.name}: ${values.name}`,`${text.email}: ${values.email}`,`${text.phone}: ${values.phone}`,`${text.company}: ${values.company || '—'}`,`${text.service}: ${service}`,`${text.date}: ${values.date}`,`${text.time}: ${values.time}`,`${text.message}: ${values.message || '—'}`].join('\n');
    const mailto = `mailto:${encodeURIComponent(copy.common.email)}?subject=${encodeURIComponent(text.emailSubject)}&body=${encodeURIComponent(body)}`;
    location.href = mailto;
    feedback.replaceChildren();
    const message = document.createElement('span');
    message.textContent = `${text.feedback} ${text.emailFallback} `;
    const email = document.createElement('a');
    email.href = mailto;
    email.textContent = `${copy.common.email} ↗`;
    email.style.textDecoration = 'underline';
    feedback.append(message, email);
    feedback.hidden = false;
  });
  render();
})();
