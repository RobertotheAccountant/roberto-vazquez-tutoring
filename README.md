# Roberto Vazquez Tutoring

Marketing website for my one-on-one accounting and business tutoring service for Cal Poly SLO students.

**Live:** https://roberto-vazquez-tutoring.vercel.app

## Pages
- **Home**: welcome screen that shrinks into a card as you scroll, how it works, example preview, about
- **Examples**: sample study guides and practice problems (journal entries, adjusting entries, income statement, FIFO/LIFO, bonds, study plan) that open in a reader
- **Pricing**: free 30-minute trial, $15/hour after, a weekly cost estimator, and FAQ/policies
- **Request**: a 4-step session request form with a live cost estimate. Submissions are emailed to me through [Web3Forms](https://web3forms.com)
- `/qr`: printable QR code and mini flyer for the live site

## Built with
Hand-written HTML, CSS, and vanilla JavaScript. No framework, no build step, no dependencies.

- Scroll-linked hero animation using `clip-path` and CSS custom properties, updated once per frame
- Cross-page fade transitions with the View Transitions API
- Multi-step form with per-step validation, a review screen, and an email fallback
- Accessible: semantic landmarks, labeled controls, keyboard-friendly dialog and menu, visible focus, and `prefers-reduced-motion` support
- Responsive from small phones to wide desktops

## Project structure
```
index.html, examples.html, pricing.html, request.html, 404.html
css/styles.css    design tokens and all styles
js/config.js      editable settings (email, form key, Calendly link, rate)
js/main.js        shared: nav, loader, reveals, scroll animation
js/examples.js    example reader dialog
js/request.js     multi-step request form
qr.html           QR code + printable flyer
assets/           headshot and favicon
```

## Run locally
```bash
python3 -m http.server 5173
```
Then open http://localhost:5173.

## Configure
Edit `js/config.js`:
- `web3formsKey`: free access key from web3forms.com. Until it's set, the form opens the student's email app with the request filled in.
- `calendlyUrl`: your Calendly scheduling link
- `siteUrl`: the live URL (or custom domain)

## Deploy
Push to GitHub, then import the repo at vercel.com. No build settings needed. To use a custom `.com`, add it under **Project → Settings → Domains** in Vercel.
