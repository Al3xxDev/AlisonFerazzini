# Alison Ferazzini Photography — Official Portfolio

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Lighthouse 100/100](https://img.shields.io/badge/Lighthouse-100%2F100-00CC66?style=for-the-badge&logo=lighthouse&logoColor=white)](https://developer.chrome.com/docs/lighthouse/)
[![Netlify Status](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **Official portfolio and client inquiry platform for Alison Ferazzini**, professional photographer and visual content creator specializing in nightlife & DJ sets, weddings, private celebrations, food & beverage, and social media content creation across **Lake Garda**, **Bergamo**, and **Brescia**, Italy.

*Italian documentation available in [README.it.md](README.it.md).*

---

## 1. Visual Identity & Creative Direction

- **Concept**: *Editorial elegance meets immersive storytelling and contemporary energy.*
- **Color Palette**:
  - **Surfaces**: Warm ivory and soft white (`#FAF7F2`, `#FFFFFF`).
  - **Typography & Contrasts**: Charcoal and deep graphite (`#181615`, `#22201E`, `#5A544F`).
  - **Accents**: Soft blush pink (`#E6B5CB`, `#D48EA8`, `#9A496B` ensuring WCAG AA contrast compliance), sampled from the camera accent in Alison's authentic logo.
  - **Visual Priority**: Organic, vibrant photography treated as the true focal point.
- **Typography**:
  - *Cormorant Garamond*: Refined editorial serif for titles and impactful statements.
  - *Plus Jakarta Sans*: Contemporary, high-legibility geometric sans-serif for UI, navigation, and body copy.
- **Branding & Logo Integration**:
  - Preserves the original asset in `images/logo.jpg`.
  - Optimized web derivatives cropped to eliminate dead space (from 542×542 to 455×153) provided in transparent (`logo-transparent.webp`), natural background (`logo-trimmed.webp`), and dark-mode/white (`logo-white.webp`) variations.

---

## 2. Key Features & Architecture

### 1. Navigation & Header
- Dynamic transparent header with backdrop blur on scroll (`glass-header`).
- Interactive desktop menu linked to Portfolio, Services, About, Method, and Contact.
- Touch-friendly mobile drawer with focus trap, backdrop blur, and scroll-lock management.

### 2. Editorial Hero Section
- Core headline: *"Racconto momenti. Custodisco emozioni."* ("I capture moments. I preserve emotions.")
- Asymmetric layout featuring a sunset golden-hour photograph on Lake Garda, floating DJ set badge, and clean negative space.

### 3. Continuous Infinite Marquee Ticker
- Automated horizontal continuous loop banner displaying Alison's photographic disciplines (`animate-marquee`).
- Pure fluid CSS implementation: zero scrollbars, zero track stutter, hover-to-pause, and full `prefers-reduced-motion` compliance.

### 4. Curated Portfolio & Accessible Lightbox
- **24 authentic photography assets** categorized into 5 disciplines:
  - *All Works* (24)
  - *DJ Set & Nightlife* (3)
  - *Events & Lake* (5)
  - *Food & Drink* (4)
  - *Weddings & Ceremonies* (6)
  - *Private & Brands* (6)
- Responsive masonry grid without aspect ratio distortion.
- **Accessible Lightbox Modal**:
  - Full keyboard navigation (`Escape` to close, `ArrowLeft` / `ArrowRight` to navigate).
  - Mobile touch swipe gestures (left/right swipe detection).
  - Strict focus trapping and body scroll locking.
  - Contextual CTA to directly request services matching the active photo.

### 5. Six Commercial Service Offerings
1. **DJ Set — Day & Night**: Takeover Night, high-energy stage, crowd, and nightlife captures.
2. **Private & Corporate Events**: Birthdays, brand activations (Proud of Me Milan), executive milestones.
3. **Food & Drink Photography**: Restaurant aesthetics, cocktail close-ups, culinary storytelling (Yume Sushi Fusion, AperiPirlo).
4. **Ceremonies & Weddings**: Spontaneous reportage, authentic emotion, cake cutting, reception atmosphere.
5. **Social Media Video Recaps**: Dynamic vertical 9:16 captures optimized for Instagram Reels and TikTok.
6. **Social Media Management for Hospitality**: Complete visual content calendars and feeds for bars and restaurants.

### 6. Interactive Inquiry Assistant
- Zero-friction client consultation assistant without heavy backend dependencies.
- Allows clients to choose service type, event location, and preferred date.
- Dynamically prepares a pre-filled `mailto:` email or one-click copyable Instagram DM template.

---

## 3. Performance & Quality Benchmarks

Audited locally and in CI using Google Lighthouse (headless Chrome):

| Metric / Category | Mobile (390×844) | Desktop (1440×900) | Target Standard |
| :--- | :---: | :---: | :---: |
| **Performance** | **100** | **100** | $\ge 90$ |
| **Accessibility** | **100** | **100** | $\ge 95$ |
| **Best Practices** | **100** | **100** | $\ge 95$ |
| **SEO** | **100** | **100** | $\ge 95$ |

- **Cumulative Layout Shift (CLS)**: `0.00` (achieved via inline LQIP placeholders with calculated intrinsic aspect ratios).
- **First Contentful Paint (FCP)**: `< 0.8s`.
- **Largest Contentful Paint (LCP)**: `< 1.2s` (preloaded responsive WebP hero image).
- **Console Errors & Network Failures**: `0`.

---

## 4. Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/) + [React DOM 19](https://react.dev/) |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) (Strict Mode) |
| **Build & Dev Tool** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite` |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Image Pipeline** | Python 3 + Pillow (PebP multi-res + Base64 LQIP generation) |
| **QA Automation** | Puppeteer Core + Google Lighthouse |
| **Hosting & CDN** | [Netlify](https://www.netlify.com/) (Edge Network + `netlify.toml`) |

---

## 5. Project Directory Structure

```
AlisonFerazzini/
├── .github/
│   ├── ISSUE_TEMPLATE/       # Bug report and feature request templates
│   ├── workflows/
│   │   └── ci.yml            # Automated GitHub Actions build & typecheck CI
│   └── PULL_REQUEST_TEMPLATE.md
├── images/                   # Original high-resolution photo assets
├── public/
│   ├── images/
│   │   ├── logo/             # Cropped, trimmed, and transparent WebP logos
│   │   └── photos/           # 72 responsive WebP photos (520w, 960w, 1440w)
│   ├── _redirects            # Netlify SPA fallback rule
│   ├── favicon.ico
│   ├── favicon.png
│   ├── robots.txt            # Search engine crawl directives
│   └── sitemap.xml           # XML sitemap with canonical URLs
├── scripts/
│   ├── optimize-images.py    # Python Pillow script generating WebP & LQIP data
│   ├── run-lighthouse.mjs    # Automated Lighthouse Mobile & Desktop audit
│   └── run-qa-tests.mjs      # Cross-device Puppeteer test suite
├── src/
│   ├── components/
│   │   ├── icons/            # Custom SVG brand icons (InstagramIcon)
│   │   ├── About.tsx         # Alison's biography, credentials, and ethos
│   │   ├── ContactSection.tsx# Direct channels and interactive inquiry assistant
│   │   ├── Footer.tsx        # Navigation links, credits, and copyright
│   │   ├── Header.tsx        # Blur header and mobile navigation drawer
│   │   ├── Hero.tsx          # Editorial hero with Lake Garda photography
│   │   ├── Lightbox.tsx      # Accessible keyboard/touch photo modal
│   │   ├── MarqueePillars.tsx# Smooth infinite disciplines ticker
│   │   ├── Method.tsx        # 4-stage photography methodology
│   │   ├── Portfolio.tsx     # Dynamic masonry gallery with category filtering
│   │   └── Services.tsx      # 6 commercial photography services
│   ├── data/
│   │   ├── photos.json       # Metadata, LQIP base64, aspect ratios for all 24 photos
│   │   └── services.ts       # Structured service offerings data
│   ├── styles/
│   │   └── globals.css       # Global styles, fonts, and animation definitions
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces (Photo, Service, Category)
│   ├── App.tsx               # Root application component
│   └── main.tsx              # React 19 application entry point
├── .gitignore                # Production ignore rules
├── CODE_OF_CONDUCT.md        # Contributor Covenant v2.1
├── CONTRIBUTING.md            # Contribution guidelines & coding conventions
├── DEPLOYMENT.md             # Complete step-by-step GitHub & Netlify deployment guide
├── LICENSE                   # MIT License (software) + Creative Rights notice
├── netlify.toml              # Netlify build, SPA routing, and security headers config
├── package.json              # Project scripts and dependencies
├── README.it.md              # Italian technical documentation
├── README.md                 # Primary English project documentation
├── tsconfig.json             # TypeScript compiler configuration
└── vite.config.ts            # Vite configuration with Tailwind CSS plugin
```

---

## 6. Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **Python**: `3.10+` with `Pillow` (only if you intend to reprocess original images)

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/alison-ferazzini-photography.git

# Navigate into the project folder
cd alison-ferazzini-photography

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser. Hot Module Replacement (HMR) is enabled.

### Type Check & Production Build
```bash
# Type check TypeScript without emitting files
npm run typecheck

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 7. Automated Scripts & Tooling

| Command | Purpose |
| :--- | :--- |
| `npm run optimize-images` | Runs `scripts/optimize-images.py` to regenerate responsive WebP images and `photos.json` with base64 LQIP placeholders from `images/`. |
| `npm run test:qa` | Runs `scripts/run-qa-tests.mjs` with Puppeteer across desktop, tablet, and mobile viewports. |
| `npm run test:lighthouse` | Executes `scripts/run-lighthouse.mjs` to perform local headless Chrome Lighthouse audits. |

---

## 8. Netlify Deployment

This repository includes a battle-tested [`netlify.toml`](netlify.toml) pre-configured with:
- Automated builds via `npm run build` with Node 20.
- Single Page Application (SPA) 200 rewrite fallback (`/* -> /index.html`).
- Hardened HTTP security headers:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Long-term immutable caching (`max-age=31536000`) for hashed Vite assets in `/assets/`.

For complete step-by-step instructions on setting up GitHub and deploying to Netlify, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 9. SEO & Accessibility (a11y)

- **Semantic HTML5**: Native `<header>`, `<main>`, `<section>`, `<nav>`, `<article>`, and `<footer>` elements.
- **Search Engine Optimization**:
  - Full Open Graph metadata and Twitter Cards in [index.html](index.html).
  - Schema.org JSON-LD structured data (`ProfessionalService`) defining geographic area, services, and social links.
  - Search engine directives in [public/robots.txt](public/robots.txt) and canonical sitemap in [public/sitemap.xml](public/sitemap.xml).
- **Accessibility**:
  - WCAG AA compliant contrast ratios across all typography and interactive buttons.
  - Full keyboard navigability with visible focus rings.
  - Screen-reader labels (`aria-label`, `aria-expanded`, `aria-hidden`) on all interactive controls.
  - Respects user motion preferences (`@media (prefers-reduced-motion)`).

---

## 10. License & Copyright

- **Software & Source Code**: Released under the [MIT License](LICENSE).
- **Artistic Works & Photography**: All photographs, brand logos, and written portfolio descriptions are the exclusive intellectual property of **Alison Ferazzini**. All rights reserved. Unauthorized commercial use, scraping, or redistribution is strictly prohibited.

---

## Credits

- **Photographer & Content Creator**: [Alison Ferazzini](https://www.instagram.com/alisonferazzini.ph/)
- **Website Development & Engineering**: [Alessandro Barbato](https://github.com/alexbarbato)
