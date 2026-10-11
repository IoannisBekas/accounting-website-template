(() => {
  'use strict';
  const copy = window.EKO_COPY;
  const business = window.FIRM_CONFIG;
  const languages = Object.keys(copy);
  const basePath = document.querySelector('meta[name="site-base"]').content;
  const origin = new URL(basePath, location.origin).href.replace(/\/$/, '');
  const icons = ['book', 'file', 'chart', 'advice'];
  const timeSlots = business.timeSlots;
  const bookingAvailable = business.demo || Boolean(business.email);
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
  const companyName = () => business.name[language] || business.legalName;
  const translate = value => {
    if (typeof value === 'string') return value.replaceAll('{{company}}', companyName());
    if (Array.isArray(value)) return value.map(translate);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translate(item)]));
    return value;
  };
  const dateString = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  form.elements.date.min = dateString(tomorrow);

  function validateDate() {
    const value = form.elements.date.value;
    const date = value ? new Date(`${value}T12:00:00`) : null;
    const invalid = date && (value < dateString(tomorrow) || !business.appointmentDays.includes(date.getDay()));
    form.elements.date.setCustomValidity(invalid ? copy[language].booking.dateError : '');
  }

  function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    menuButton.setAttribute('aria-label', copy[language].navigation[open ? 'close' : 'menu']);
  }

  function render() {
    const text = translate(copy[language]);
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
    document.querySelector('.desktop-nav').setAttribute('aria-label', text.navigation.mainLabel);
    mobileMenu.setAttribute('aria-label', text.navigation.mobileLabel);
    document.querySelectorAll('[data-t]').forEach(element => {
      const value = get(text, element.dataset.t);
      if (typeof value === 'string') element.textContent = value;
    });
    document.querySelectorAll('[data-company]').forEach(element => element.textContent = companyName());
    document.querySelectorAll('.logo').forEach(element => element.setAttribute('aria-label', companyName()));
    document.querySelectorAll('[data-brand-image]').forEach(image => {
      const src = business.logo ? new URL(business.logo, origin + '/').href : new URL('assets/brand-mark.svg?v=generic-1', origin + '/').href;
      if (image.src !== src) image.src = src;
      image.alt = business.logo ? companyName() : '';
      image.parentElement.classList.toggle('custom-logo', Boolean(business.logo));
    });
    const address = [business.address.street, [business.address.postalCode, business.address.locality].filter(Boolean).join(' '), business.address.countryCode].filter(Boolean).join('\n');
    const addressElement = document.querySelector('.contact-address');
    addressElement.textContent = address || text.contact.addressPlaceholder;
    addressElement.classList.toggle('contact-placeholder', !address);
    const org = document.querySelector('.contact-org');
    org.hidden = !business.organisationNumber;
    org.textContent = 'Org.nr ' + business.organisationNumber;
    document.querySelector('.office-details').hidden = !business.demo && !address && !business.organisationNumber;
    const hours = business.hours[language];
    document.querySelector('.contact-hours').textContent = hours || text.contact.hoursPlaceholder;
    document.querySelector('.contact-hours').classList.toggle('contact-placeholder', !hours);
    document.querySelector('.hours-details').hidden = !business.demo && !hours;
    document.querySelector('.contact-empty').hidden = !business.demo;
    document.querySelector('.footer-location').textContent = business.address.locality;
    const mapQuery = business.mapQuery || address.replaceAll('\n', ', ');
    const mapLink = document.querySelector('.map-link');
    mapLink.hidden = !mapQuery;
    if (mapQuery) mapLink.href = 'https://www.google.com/maps?q=' + encodeURIComponent(mapQuery);
    else mapLink.removeAttribute('href');
    const mapShell = document.querySelector('.map-shell');
    mapShell.hidden = !business.demo && !mapQuery;
    mapShell.querySelector('.map-placeholder').hidden = Boolean(mapQuery);
    mapShell.querySelector('.map-location').textContent = business.address.locality || text.contact.addressPlaceholder;
    let map = mapShell.querySelector('iframe');
    if (mapQuery) {
      if (!map) {
        map = document.createElement('iframe');
        map.loading = 'lazy';
        map.referrerPolicy = 'no-referrer-when-downgrade';
        map.allowFullscreen = true;
        mapShell.prepend(map);
      }
      const mapSrc = 'https://www.google.com/maps?q=' + encodeURIComponent(mapQuery) + '&output=embed';
      if (map.src !== mapSrc) map.src = mapSrc;
      map.title = companyName() + ' — ' + mapQuery;
    } else map?.remove();
    document.querySelector('.form-note').textContent = business.demo ? text.booking.demoNote : text.booking.liveNote;
    form.querySelector('[type="submit"] span').textContent = business.demo ? text.booking.submit : text.booking.liveSubmit;
    document.querySelector('.contact-book span').textContent = business.demo ? text.contact.cta : text.navigation.book;
    document.title = `${text.metaTitle} | ${companyName()}`;
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
    const structuredAddress = Object.fromEntries(Object.entries({streetAddress:business.address.street,postalCode:business.address.postalCode,addressLocality:business.address.locality,addressRegion:business.address.region,addressCountry:business.address.countryCode}).filter(([,value]) => value));
    schema.textContent = JSON.stringify({'@context':'https://schema.org','@type':business.demo ? 'WebSite' : 'AccountingService',name:business.legalName || companyName(),url:origin + '/',...(!business.demo ? {...(business.organisationNumber ? {identifier:{'@type':'PropertyValue',propertyID:'Org.nr',value:business.organisationNumber}} : {}),...(Object.keys(structuredAddress).length ? {address:{'@type':'PostalAddress',...structuredAddress}} : {}),...(business.email ? {email:business.email} : {}),...(business.phone ? {telephone:business.phone} : {})} : {})});
    document.querySelectorAll('[data-book]').forEach(button => {
      button.disabled = !bookingAvailable;
      if (!bookingAvailable) button.title = text.booking.unavailable;
      else button.removeAttribute('title');
    });
    form.querySelector('[type="submit"]').disabled = !bookingAvailable;
    document.dispatchEvent(new Event('eko:render'));
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-book]');
    if (trigger && bookingAvailable) {
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
    if (!bookingAvailable) return;
    validateDate();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    const text = translate(copy[language].booking);
    const service = copy[language].services.cards.find(card => card.id === values.service)?.title || text.otherService;
    const body = [text.emailIntro,'',`${text.name}: ${values.name}`,`${text.email}: ${values.email}`,`${text.phone}: ${values.phone}`,`${text.company}: ${values.company || '—'}`,`${text.service}: ${service}`,`${text.date}: ${values.date}`,`${text.time}: ${values.time}`,`${text.message}: ${values.message || '—'}`].join('\n');
    if (business.demo) {
      feedback.replaceChildren();
      const message = document.createElement('span');
      message.textContent = text.previewConfirmation;
      const heading = document.createElement('strong');
      heading.textContent = text.previewTitle;
      const preview = document.createElement('p');
      preview.textContent = body;
      feedback.append(message, heading, preview);
      feedback.hidden = false;
      feedback.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest'});
      return;
    }
    const mailto = `mailto:${encodeURIComponent(business.email)}?subject=${encodeURIComponent(text.emailSubject)}&body=${encodeURIComponent(body)}`;
    location.href = mailto;
    feedback.replaceChildren();
    const message = document.createElement('span');
    message.textContent = `${text.liveFeedback} `;
    const email = document.createElement('a');
    email.href = mailto;
    email.textContent = `${business.email} ↗`;
    email.style.textDecoration = 'underline';
    feedback.append(message, email);
    feedback.hidden = false;
  });
  render();
})();
