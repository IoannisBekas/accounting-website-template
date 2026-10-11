# Accounting website template

A reusable accounting-office demo by BISOLUTIONS.GROUP. Neutral branding, a green palette, animated financial graphics, original photographic collages and a 0–100% loading screen. Swedish is the default; English is the only other language.

Live demo: https://ioannisbekas.github.io/accounting-website-template/

Repository: https://github.com/IoannisBekas/accounting-website-template

Publish development to GitHub only. Do not save or deploy to ChatGPT Sites.

## Customize for a buyer

1. Copy this source into a separate repository for the buyer.
2. Edit `docs/assets/company.js`. Set both `name.sv` and `name.en` to the buyer's trading name, and `legalName` to its registered name when applicable.
3. Fill in the confirmed email, phone, `phoneUri` (for example `tel:+46000000000`), registration number, address and localized office hours. Empty values are omitted on a live client site. No real contact details are included in this demo.
4. To use the buyer's logo, put it in `docs/assets/` and set `logo` to `assets/client-logo.svg` (PNG also works). The default ledger symbol and text wordmark are replaced in the header, about section and footer. Replace `docs/assets/favicon.svg` to match.
5. Edit services and other wording in `docs/assets/copy.js` for both languages. `{{company}}` automatically uses the configured localized company name. Confirm that every advertised service is offered by the buyer.
6. Set `publicUrl` to the buyer's final HTTPS URL, including its repository subpath if hosted on GitHub Pages. The build derives asset paths, canonical links, sitemap and language links from it.
7. Set `demo` to `false` before publishing the buyer's site. Configure an email recipient to enable appointment requests. Review `appointmentDays` (0 = Sunday, 6 = Saturday) and `timeSlots`; these are preferred request times, not confirmed availability.
8. Run `node prepare-site.mjs`, preview the result and publish `docs/`.

The demo form creates a local preview only: it sends nothing, stores nothing and makes no appointment. In live mode, the form prepares a message in the visitor's email app; the visitor must send it, and the office must confirm any appointment. It is not a server-backed booking service. With no configured email, live-mode booking buttons are disabled.

A map is shown only when an address or `mapQuery` is configured. A neutral map placeholder appears in demo mode. Demo structured data describes a WebSite; live-mode AccountingService data includes only configured business details.

## Design and source

The site uses plain HTML, CSS and JavaScript with no dependencies or bundler. Node.js 22 or newer runs the preparation script. Edit `index.template.html` and run the script to regenerate root, Swedish alias (`sv/`) and English (`en/`) pages.

The palette is forest green `#165343`, light green `#b4e080`, green ink `#183429` and off-white `#f4f7f1`. Main colors are in `docs/assets/styles.css`; illustration colors are in the template, and collage recoloring is in its `collage-green` SVG filter.

Motion lives in `motion.js`, `motion.css` and `collage.css`. It pauses offscreen, has a visitor pause control and respects reduced motion. The loader waits for eager image decoding and both fonts; its percentage counts completed readiness tasks, rather than download bytes. Failed assets settle and a 20-second failsafe prevents permanent blocking. Google Maps loads independently.

The grayscale photographic collages are original AI-generated decorative artwork. DM Sans and Mynerve are bundled with their font license files; keep those files when distributing the site. The centered BISOLUTIONS.GROUP credit links to https://www.bisolutions.group/.

## GitHub Pages

For each buyer repository, select the `main` branch and `/docs` folder under Settings → Pages. Commit the generated pages and assets together. For a custom domain, configure it in GitHub Pages and update `publicUrl` before rebuilding.

For a local preview of this demo, serve a parent folder containing `accounting-website-template/` with the contents of `docs/` inside it, so the generated repository asset path resolves.
