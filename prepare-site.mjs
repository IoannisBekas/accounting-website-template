import fs from 'node:fs';
import path from 'node:path';

const root = import.meta.dirname;
const output = path.join(root, 'docs');
const source = fs.readFileSync(path.join(root, 'index.template.html'), 'utf8');
const copyScript = fs.readFileSync(path.join(output, 'assets/copy.js'), 'utf8');
const copy = JSON.parse(copyScript.replace(/^window\.EKO_COPY\s*=\s*/, '').replace(/;\s*$/, ''));
const configScript = fs.readFileSync(path.join(output, 'assets/company.js'), 'utf8');
const company = JSON.parse(configScript.replace(/^window\.FIRM_CONFIG\s*=\s*/, '').replace(/;\s*$/, ''));
const publicUrl = new URL(company.publicUrl);
const basePath = publicUrl.pathname.replace(/\/?$/, '/');
const origin = publicUrl.origin + basePath.replace(/\/$/, '');
const routes = {sv:'/',en:'/en/'};
const titles = {sv:'Redovisning & ekonomisk rådgivning',en:'Accounting & financial advice'};
const get = (object, key) => key.split('.').reduce((item, part) => item?.[part], object);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
for (const [language, route] of Object.entries(routes)) {
  const text = copy[language];
  const name = company.name[language] || company.legalName;
  if (!name) throw new Error('Company name is required in both languages.');
  const translate = value => value.replaceAll('{{company}}', name);
  let html = source.replace(/<html lang="[^"]+">/, `<html lang="${language}">`);
  html = html.replaceAll('="/assets/', `="${basePath}assets/`);
  html = html.replace(/<([a-z0-9-]+)([^>]*\bdata-t="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g, (_, tag, attributes, key) => {
    const value = get(text, key);
    if (typeof value !== 'string') throw new Error(`Missing ${language}.${key}`);
    return `<${tag}${attributes}>${escape(translate(value))}</${tag}>`;
  });
  html = html.replaceAll('{{company}}', escape(name));
  const address = [company.address.street, [company.address.postalCode, company.address.locality].filter(Boolean).join(' '), company.address.countryCode].filter(Boolean).join('\n');
  const mapQuery = company.mapQuery || address.replaceAll('\n', ', ');
  const hidden = value => value ? '' : ' hidden';
  const setText = (className, value) => {
    const pattern = new RegExp('(<([a-z0-9-]+)[^>]*class="' + className + '[^"]*"[^>]*>)[\\s\\S]*?<\\/\\2>');
    html = html.replace(pattern, (_, open, tag) => open + escape(value) + '</' + tag + '>');
  };
  html = html.replace(/<a class="contact-email" hidden>/, `<a class="contact-email"${hidden(company.email)}${company.email ? ' href="mailto:' + escape(company.email) + '"' : ''}>`);
  html = html.replace(/(<a class="contact-email"[^>]*><span>)[\s\S]*?<\/span>/, (_, open) => open + escape(company.email) + '</span>');
  html = html.replace(/<a class="contact-phone" hidden><\/a>/, `<a class="contact-phone"${hidden(company.phone)}${company.phoneUri ? ' href="' + escape(company.phoneUri) + '"' : ''}>${escape(company.phone)}</a>`);
  html = html.replace('<p class="contact-empty"', '<p' + hidden(company.demo) + ' class="contact-empty"');
  html = html.replace('<div class="office-details">', '<div class="office-details"' + hidden(company.demo || address || company.organisationNumber) + '>');
  html = html.replace('<div class="hours-details">', '<div class="hours-details"' + hidden(company.demo || company.hours[language]) + '>');
  setText('contact-address', address || text.contact.addressPlaceholder);
  setText('contact-hours', company.hours[language] || text.contact.hoursPlaceholder);
  if (address) html = html.replace('class="contact-address contact-placeholder"', 'class="contact-address"');
  if (company.hours[language]) html = html.replace('class="contact-hours contact-placeholder"', 'class="contact-hours"');
  html = html.replace('<p class="contact-org" hidden></p>', `<p class="contact-org"${hidden(company.organisationNumber)}>${company.organisationNumber ? 'Org.nr ' + escape(company.organisationNumber) : ''}</p>`);
  html = html.replace('<a class="text-link map-link" hidden', `<a class="text-link map-link"${hidden(mapQuery)}${mapQuery ? ' href="https://www.google.com/maps?q=' + encodeURIComponent(mapQuery) + '"' : ''}`);
  setText('footer-location', company.address.locality);
  setText('map-location', company.address.locality || text.contact.addressPlaceholder);
  html = html.replace('<div class="map-shell">', '<div class="map-shell"' + hidden(company.demo || mapQuery) + '>');
  if (mapQuery) html = html.replace(/<div class="map-placeholder grid-paper">[\s\S]*?<\/div>/, `<iframe title="${escape(name + ' — ' + mapQuery)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&amp;output=embed" allowfullscreen></iframe><div class="map-placeholder grid-paper" hidden></div>`);
  if (company.logo) {
    html = html.replaceAll('class="logo"', 'class="logo custom-logo"').replaceAll('class="brand-lockup"', 'class="brand-lockup custom-logo"');
    html = html.replace(/data-brand-image src="[^"]+" width="128" height="128" alt=""/g, `data-brand-image src="${escape(new URL(company.logo, origin + '/').href)}" width="128" height="128" alt="${escape(name)}"`);
  }
  if (!company.demo) {
    setText('form-note', text.booking.liveNote);
    html = html.replace(/(<span data-t="booking.submit">)[\s\S]*?<\/span>/, (_, open) => open + escape(text.booking.liveSubmit) + '</span>');
    html = html.replace(/(<button[^>]*class="[^"]*contact-book[^"]*"[^>]*><span[^>]*>)[\s\S]*?<\/span>/, (_, open) => open + escape(text.navigation.book) + '</span>');
  }
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(titles[language])} | ${escape(name)}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(text.hero.subtitle)}">`);
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${origin}${route}">`);
  const alternates = Object.entries(routes).map(([code, pathname]) => `<link rel="alternate" hreflang="${code}" href="${origin}${pathname}">`).join('\n');
  html = html.replace('</head>', `<meta name="site-base" content="${basePath}">\n${alternates}\n<link rel="alternate" hreflang="x-default" href="${origin}/">\n<meta property="og:title" content="${escape(titles[language])} | ${escape(name)}">\n<meta property="og:description" content="${escape(text.hero.subtitle)}">\n<meta property="og:url" content="${origin}${route}">\n<meta property="og:type" content="website">\n</head>`);
  const target = path.join(output, route);
  fs.mkdirSync(target, {recursive:true});
  fs.writeFileSync(path.join(target, 'index.html'), html);
  if (language === 'sv') {
    fs.mkdirSync(path.join(output, 'sv'), {recursive:true});
    fs.writeFileSync(path.join(output, 'sv/index.html'), html);
  }
}
fs.writeFileSync(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
fs.writeFileSync(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.values(routes).map(route => `<url><loc>${origin}${route}</loc></url>`).join('')}</urlset>\n`);
console.log('Prepared and validated 2 language pages, Swedish alias, sitemap and robots.');
