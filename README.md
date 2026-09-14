# Roberto Vazquez Tutoring

Marketing website for my one-on-one accounting and business tutoring service for Cal Poly SLO students.

**Live:** https://roberto-vazquez-tutoring.vercel.app

## What it does
- Presents the service, credentials, pricing (free 30-minute trial, then $15/hr), and policies
- **Session request form** with a live estimate ("quote") that updates as students fill it in. Submissions are emailed to me through [Web3Forms](https://web3forms.com)
- Optional Calendly booking embed
- `/qr` page that generates a printable QR code and mini flyer pointing at the live site

## Built with
Hand-written HTML, CSS, and vanilla JavaScript. No framework, no build step, no dependencies.

- Scroll-driven animation in a single `requestAnimationFrame` loop: velocity-reactive marquee, word-by-word text reveal, parallax collage, pinned horizontal-scroll section, and section-based background theming
- Page-load sequence with SVG stroke-drawing animation over the portrait
- Custom cursor and magnetic buttons on pointer devices
- Accessible: semantic landmarks, labeled form controls, inline validation, keyboard-friendly menu, visible focus, and full `prefers-reduced-motion` support
- Responsive from 320px phones to wide desktops
- SEO: meta description, Open Graph tags, JSON-LD structured data

## Project structure
```
index.html        single-page site
css/styles.css    design tokens and all styles
js/config.js      editable settings (email, form key, Calendly link, rate)
js/main.js        interactions, animation, form handling
qr.html           QR code + printable flyer generator
assets/           headshot and favicon
vercel.json       hosting config
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
