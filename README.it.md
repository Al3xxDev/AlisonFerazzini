# Alison Ferazzini Photography — Sito Portfolio Ufficiale

Sito web portfolio d'autore e piattaforma di contatto per **Alison Ferazzini**, fotografa professionista e content creator specializzata in eventi musicali, matrimoni, celebrazioni private, food & beverage e content creation per social media tra il **Lago di Garda**, **Bergamo** e **Brescia**.

*English documentation is available in [README.md](README.md).*

---

## 1. Identità Visiva e Direzione Creativa

- **Concept**: *Minimalismo elegante + fotografia immersiva + energia editoriale contemporanea*.
- **Palette Colori**:
  - Superfici: Avorio caldo e bianco sporco (`#FAF7F2`, `#FFFFFF`).
  - Contrasti & Tipografia: Nero morbido e antracite (`#181615`, `#22201E`, `#5A544F`).
  - Accenti: Rosa cipria e blush delicato (`#E6B5CB`, `#D48EA8`, `#9A496B` per contrasto WCAG AA), derivato dal dettaglio della fotocamera nel logo originale.
  - Toni naturali e vibranti delle fotografie reali come protagonisti assoluti.
- **Tipografia**:
  - *Cormorant Garamond*: serif editoriale raffinato per titoli e accenti d'impatto.
  - *Plus Jakarta Sans*: sans-serif contemporaneo, geometrico e ad altissima leggibilità per testi, navigazione e UI.
- **Integrazione del Logo**:
  - File originale in `images/logo.jpg` preservato intatto.
  - Derivato web ottimizzato ritagliando i margini vuoti originali (da 542×542 a 455×153) in versione trasparente (`logo-transparent.webp`), versione con fondo naturale (`logo-trimmed.webp`) e versione per sfondi scuri (`logo-white.webp`).

---

## 2. Struttura dei Contenuti & Funzionalità

1. **Header & Navigazione**:
   - Header trasparente con effetto blur al passaggio dello scroll (`glass-header`).
   - Logo originale responsive.
   - Menu desktop con link a Portfolio, Servizi, Chi Sono, Metodo, Contatti.
   - Drawer mobile touch-friendly con gestione del focus e blocco scorrimento.
2. **Hero Section**:
   - Titolo editoriale: *"Racconto momenti. Custodisco emozioni."*
   - Sguardo contemporaneo, territorio (*Lago di Garda · Bergamo · Brescia*), credenziali (*Accademia di Fotografia, Milano*).
   - Composizione asimmetrica con fotografia al tramonto sul Lago di Garda (`weareiconico-scenico-tramonto-persone.jpg`), badge flottante DJ set in basso a sinistra e spazio negativo superiore pulito ed essenziale, mantenendo la fotografia come punto focale primario.
3. **Marquee Pillars (Ticker Continuo)**:
   - Nastro editoriale a scorrimento orizzontale automatico in loop infinito tramite CSS fluido (`animate-marquee`).
   - Assenza totale di barre di scorrimento, tracciati visibili o indicatori trascinabili.
   - Spaziatura geometrica uniforme, pausa su hover e supporto completo a `prefers-reduced-motion` per l'accessibilità.
4. **Portfolio Curato & Lightbox**:
   - 24 fotografie autentiche del patrimonio di Alison.
   - Filtri interattivi per categoria:
     - *Tutti i Lavori* (24)
     - *DJ Set & Nightlife* (3)
     - *Eventi & Lago* (5)
     - *Food & Drink* (4)
     - *Matrimoni & Cerimonie* (6)
     - *Privati & Brand* (6)
   - Layout masonry responsivo senza alterazione dei rapporti d'aspetto nativi.
   - **Lightbox accessibile**: supporto a tastiera (Escape, frecce sinistra/destra), touch swipe su mobile, focus trap, blocco scroll body e pulsante rapido per richiedere un servizio affine.
5. **I 6 Servizi Professionali**:
   1. *DJ Set — Day & Night* (Takeover Night)
   2. *Eventi Privati & Aziendali* (Compleanni, Proud of Me Milan)
   3. *Food & Drink Photography* (Yume Sushi Fusion, AperiPirlo)
   4. *Cerimonie & Matrimoni* (Reportage spontaneo, brindisi sposi, taglio torta)
   5. *Video Recap per Social Media* (Formato verticale 9:16 per Reels/TikTok)
   6. *Gestione Pagine Social per Bar & Ristoranti* (Strategia visiva e contenuti continuativi)
6. **Chi Sono (Biografia di Alison)**:
   - Presentazione biografica fedele: formazione all'accademia di Milano, passione per l'energia degli eventi e momenti autentici, cura del dettaglio e approccio sartoriale.
7. **Metodo di Lavoro**:
   - 4 fasi concrete: Ascolto & Allineamento, Presenza Discreta, Post-produzione Fedele, Consegna & Supporto.
8. **Contatti & Assistente Interattivo**:
   - Canali diretti: Email (`alisonferazzini.photo@gmail.com`) e Instagram (`https://www.instagram.com/alisonferazzini.ph/`).
   - Assistente di composizione richiesta: consente al cliente di selezionare il servizio e la zona, generando un'email con oggetto e corpo precompilati oppure copiando il testo pronto per un DM Instagram. Nessun backend fittizio.
9. **Footer**:
   - Logo in versione chiara, link rapidi, territorio, avvisi legali conformi ai dati verificati, pulsante torna su.

---

## 3. Ottimizzazione Immagini & Performance

- **Pipeline di Elaborazione** (`scripts/optimize-images.py`):
  - Preservazione assoluta degli asset originali in `images/`.
  - Generazione di derivati WebP responsive per ogni foto (1440w, 960w, 520w) con compressione visivamente lossless (80-84% quality).
  - Generazione di LQIP (Low Quality Image Placeholders) in base64 integrati nei dati JSON per rendering istantaneo a zero CLS (Cumulative Layout Shift).
  - Preload per Hero e Logo trasparente.

---

## 4. Risultati dei Test QA & Audit Lighthouse

### Audit Lighthouse (Misurato con Google Chrome headless)

| Categoria | Mobile (390×844) | Desktop (1440×900) | Obiettivo Brief |
|---|---|---|---|
| **Performance** | **100** | **100** | $\ge 90$ |
| **Accessibility** | **100** | **100** | $\ge 95$ |
| **Best Practices** | **100** | **100** | $\ge 95$ |
| **SEO** | **100** | **100** | $\ge 95$ |

### Test Funzionali e Responsive Eseguiti (`scripts/run-qa-tests.mjs`):
1. **Desktop 1440×900**: rendering completo, verifica H1, caricamento logo, link mailto e Instagram verificati.
2. **Filtri Portfolio**: test del filtro "Food & Drink" (4 elementi) e ripristino "Tutti" (24 elementi).
3. **Lightbox**: apertura, navigazione tastiera (ArrowRight), chiusura con Escape, focus management.
4. **Tablet 768×1024**: verifica layout e proporzioni.
5. **Mobile 390×844**: apertura e chiusura del menu di navigazione, assenza di collisioni.
6. **Mobile compatto 320×640**: verifica overflow orizzontale (**0 overflow** rilevati).
7. **Assistente Richiesta**: test di selezione servizio e aggiornamento dinamico del link mailto.
8. **Console ed Errori di Rete**: **0 errori console, 0 richieste fallite**.

Gli screenshot dei test visivi sono archiviati in `qa-screenshots/`.

---

## 5. Struttura del Progetto

```
AlisonFerazzini/
├── images/                   # Asset originali preservati intatti (24 foto + logo.jpg)
├── public/
│   ├── images/
│   │   ├── logo/             # Derivati web del logo (trasparente, trimmed, white, webp)
│   │   └── photos/           # 72 derivati WebP responsive (520w, 960w, 1440w)
│   ├── favicon.ico
│   ├── favicon.png
│   ├── robots.txt
│   └── sitemap.xml
├── qa-screenshots/           # Screenshot acquisiti durante i test QA automatici
├── scripts/
│   ├── optimize-images.py    # Pipeline Python PIL per derivati e metadati JSON
│   ├── run-qa-tests.mjs      # Test funzionali, navigazione e responsive con Puppeteer
│   └── run-lighthouse.mjs    # Audit Lighthouse Mobile e Desktop
├── src/
│   ├── components/
│   │   ├── icons/            # Icone SVG personalizzate (InstagramIcon)
│   │   ├── About.tsx         # Presentazione e biografia di Alison
│   │   ├── ContactSection.tsx# Contatti diretti e compositore richiesta
│   │   ├── Footer.tsx        # Footer e credenziali
│   │   ├── Header.tsx        # Header e drawer mobile
│   │   ├── Hero.tsx          # Sezione hero d'impatto editoriale
│   │   ├── Lightbox.tsx      # Modal visualizzazione ingrandita
│   │   ├── MarqueePillars.tsx# Nastro discipline
│   │   ├── Method.tsx        # Fasi del metodo fotografico
│   │   ├── Portfolio.tsx     # Galleria con filtri interattivi
│   │   └── Services.tsx      # I 6 servizi comunicati
│   ├── data/
│   │   ├── photos.json       # Catalogo strutturato delle 24 foto
│   │   └── services.ts       # Schede descrittive dei 6 servizi
│   ├── styles/
│   │   └── globals.css       # Stili globali, variabili, font e reduced-motion
│   ├── types/
│   │   └── index.ts          # Definizioni TypeScript
│   ├── App.tsx               # Root component dell'applicazione
│   └── main.tsx              # Entry point React 19
├── dist/                     # Build di produzione pronta per la pubblicazione
├── index.html                # Template HTML con SEO, Schema.org e OpenGraph
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 6. Come Avviare ed Eseguire il Progetto

### Avvio in modalità sviluppo:
```bash
npm run dev
```
Il server di sviluppo locale sarà attivo su `http://localhost:3000`.

### Esecuzione della build di produzione:
```bash
npm run build
```
Genera la build ottimizzata e statica nella cartella `dist/`.

### Anteprima della build locale:
```bash
npm run preview
```

### Ri-esecuzione dell'ottimizzazione immagini:
```bash
npm run optimize-images
```

### Esecuzione della suite di test QA automatizzati:
```bash
node scripts/run-qa-tests.mjs
```

### Esecuzione dell'audit Lighthouse:
```bash
node scripts/run-lighthouse.mjs
```
