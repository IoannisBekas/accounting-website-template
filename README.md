# K.Y Redovisning & Ekonomi AB website

A responsive, bilingual accounting website with a Visify-inspired visual direction and original K.Y content.

Public website: https://ioannisbekas.github.io/ky-redovisning/

Repository: https://github.com/IoannisBekas/ky-redovisning

Publish updates to this GitHub repository only. Do not save or deploy development to ChatGPT Sites.

The green palette uses forest green `#165343`, light green `#b4e080`, green ink `#183429` and off-white `#f4f7f1`.

GitHub Pages serves `docs` from the `main` branch. The site uses plain HTML, CSS and JavaScript; no dependencies or bundler are needed. Swedish is the default at `/ky-redovisning/`, with an alias at `/ky-redovisning/sv/`. English is available at `/ky-redovisning/en/`.

Edit `index.template.html`, `docs/assets/styles.css`, `docs/assets/app.js` and the text in `docs/assets/copy.js`. Run `node prepare-site.mjs` to update the localized HTML pages and metadata before committing changes. Node.js 22 or newer is recommended for this preparation script.

Motion is in `docs/assets/motion.js` and `motion.css`: word-by-word scroll entrances, an original animated financial SVG collage, drawn annotations, pointer/scroll depth and lime hover shadows. Animations pause offscreen and can be paused by the visitor. The operating system's reduced-motion preference is respected. All graphics remain visible without the motion script.

Phone, email and opening hours are intentionally blank. Booking buttons and email submission are disabled until a recipient address is configured in the common copy data. The visiting address is Myrstuguvägen 145, 143 32 Vårby; organisation number 559337-5149.

Original K.Y vector wordmarks and a matching favicon replace the previous brand assets. These are redesign artwork, rather than an existing official company logo. DM Sans and Mynerve remain bundled with their license files.

Three original grayscale photographic collages introduce everyday bookkeeping, year-end accounts and advisory services. The artwork was generated with the built-in image generation tool and is decorative; the multilingual captions provide all service information. Layout and gentle drift animation are in `docs/assets/collage.css`. Existing pause, visibility and reduced-motion controls apply.

The 0–100% loading screen in `docs/assets/loader.js` and `loader.css` waits for eager image decoding and both fonts before revealing the page and starting its motion. Progress measures completed readiness tasks, rather than download bytes. Failed assets settle and a 20-second bootstrap failsafe prevents permanent blocking; without JavaScript the website remains visible. Google Maps loads independently.
