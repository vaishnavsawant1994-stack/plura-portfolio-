# Plura Portfolio — reference-led implementation

A standalone, dependency-light creative portfolio website modeled on the public structure of https://plura.framer.website/.

> **Status: original implementation, not a verified pixel-perfect copy.** The reference's Framer Marketplace license is listed as **Limited**. Original media, fonts, proprietary source files, and motion code have **not** been copied. The visual artwork and copy here are newly authored illustrative equivalents; they are not claimed to be the original template's licensed assets.

## Sections

One-page website: hero, services, works (Massui, AltAll, Kalo, Tano), testimonials, pricing, contact, FAQ, and footer. Separate `404.html` is provided. Responsive navigation, reveal animations, animated abstract shapes, a fine-pointer follower, theme switching, keyboard focus, FAQ disclosures, and client-side form validation are implemented.

## Development

Requires Node.js 20+ and no external npm dependencies.

```sh
npm run dev
# Open http://localhost:4173
npm run check
```

The optional Google Fonts import requires Internet access; system fallbacks work offline.

## Contact form setup

`/api/contact.js` is a Vercel serverless function using Resend's API. Add these **server-only** environment variables in Vercel:

- `RESEND_API_KEY` — provider key
- `CONTACT_FROM` — verified sender email address
- `CONTACT_TO` — destination email address

Without them, the endpoint intentionally returns `503` and the UI displays a failure message. It never simulates successful delivery. Add bot protection/rate limiting before accepting large volumes of public enquiries.

## Deployment

This project is a static site with a single Vercel serverless API function. Connect the repository to Vercel with Framework Preset **Other** and Root Directory `/`. Vercel can serve the root HTML/CSS/JS files directly. Build is checked by `npm run check`, which can be configured as the project's Build Command if needed; Output Directory should be left blank for this root-static setup.

## Original reference and asset permissions

The reference is a third-party Framer template. The Framer listing describes a limited license. Do not add the source site's images, illustrations, videos, fonts, or proprietary Framer code unless separately authorized. See `docs/DISCOVERY.md` for observed details and `docs/VALIDATION.md` for verification evidence and limitations.

## Scope limitations

- A live browser replay of the reference at matched viewport sizes and video frame checkpoints was not available in this environment; exact visual and motion parity is **not verified**.
- Original illustration assets and image-based project compositions are missing by design due to unconfirmed reuse rights.
- The client portfolio descriptions and the testimonial are original demonstration copy rather than borrowed material.
- The portfolio external preview links are replaced with working contact calls to action; no fake client sites are presented.
- The contact form requires provider configuration before it can send email.
