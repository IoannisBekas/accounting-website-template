import fs from 'node:fs';
import path from 'node:path';

const root = import.meta.dirname;
const output = path.join(root, 'docs');
const source = fs.readFileSync(path.join(root, 'index.template.html'), 'utf8');
const copyScript = fs.readFileSync(path.join(output, 'assets/copy.js'), 'utf8');
const copy = JSON.parse(copyScript.replace(/^window\.EKO_COPY\s*=\s*/, '').replace(/;\s*$/, ''));
const origin = 'https://ioannisbekas.github.io/eko-ratt';
const basePath = '/eko-ratt/';
const routes = {sv:'/',en:'/en/',el:'/el/',sq:'/sq/'};
const titles = {sv:'Redovisning & skatterådgivning i Vårby',en:'Accounting & tax services in Vårby',el:'Λογιστικές υπηρεσίες στο Vårby',sq:'Kontabilitet dhe këshillim tatimor në Vårby'};
const get = (object, key) => key.split('.').reduce((item, part) => item?.[part], object);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
for (const [language, route] of Object.entries(routes)) {
  const text = copy[language];
  let html = source.replace(/<html lang="[^"]+">/, `<html lang="${language}">`);
  html = html.replaceAll('="/assets/', `="${basePath}assets/`);
  html = html.replace(/<([a-z0-9-]+)([^>]*\bdata-t="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g, (_, tag, attributes, key) => {
    const value = get(text, key);
    if (typeof value !== 'string') throw new Error(`Missing ${language}.${key}`);
    return `<${tag}${attributes}>${escape(value)}</${tag}>`;
  });
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(titles[language])} | ${escape(copy.common.businessName)}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(text.hero.subtitle)}">`);
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${origin}${route}">`);
  const alternates = Object.entries(routes).map(([code, pathname]) => `<link rel="alternate" hreflang="${code}" href="${origin}${pathname}">`).join('\n');
  html = html.replace('</head>', `<meta name="site-base" content="${basePath}">\n${alternates}\n<link rel="alternate" hreflang="x-default" href="${origin}/">\n<meta property="og:title" content="${escape(titles[language])} | ${escape(copy.common.businessName)}">\n<meta property="og:description" content="${escape(text.hero.subtitle)}">\n<meta property="og:url" content="${origin}${route}">\n<meta property="og:type" content="website">\n</head>`);
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
console.log('Prepared and validated 4 language pages, Swedish alias, sitemap and robots.');
