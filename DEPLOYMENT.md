# Deployment & Publishing Guide

This guide provides end-to-end instructions for initializing the Git repository, pushing the codebase to a public GitHub repository, and setting up automated Continuous Deployment on [Netlify](https://www.netlify.com/).

---

## Table of Contents
1. [Architecture & Deployment Overview](#1-architecture--deployment-overview)
2. [Step 1: Git Repository Initialization](#step-1-git-repository-initialization)
3. [Step 2: Publishing to GitHub (Public Repository)](#step-2-publishing-to-github-public-repository)
4. [Step 3: Continuous Deployment with Netlify](#step-3-continuous-deployment-with-netlify)
5. [Step 4: Custom Domain & SSL Configuration](#step-4-custom-domain--ssl-configuration)
6. [Step 5: Post-Deployment Verification Checklist](#step-5-post-deployment-verification-checklist)

---

## 1. Architecture & Deployment Overview

The website is architected as an ultra-fast, zero-runtime-server static web application:
- **Build Engine**: Vite 6 + TypeScript (`npm run build`)
- **Output Artifacts**: Static files in `dist/` (HTML, minified JavaScript, modular CSS, optimized WebP imagery)
- **Hosting Target**: Netlify Edge CDN with automated Git-triggered builds
- **Routing**: Single-Page Application (SPA) handled gracefully via `netlify.toml` and `public/_redirects`

---

## Step 1: Git Repository Initialization

Open your terminal in the root project directory (`/home/alex/Projects/AlisonFerazzini`):

```bash
# 1. Initialize local Git repository
git init -b main

# 2. Verify that untracked files match expectations (ignoring node_modules, dist, qa-screenshots)
git status

# 3. Stage all project files
git add .

# 4. Commit using Conventional Commits standard
git commit -m "feat: initial commit for Alison Ferazzini photography portfolio"
```

> [!NOTE]
> `.gitignore` is pre-configured to exclude build artifacts (`dist/`), test outputs (`qa-screenshots/`), and runtime dependencies (`node_modules/`). Only clean, production-ready source files and assets will be committed.

---

## Step 2: Publishing to GitHub (Public Repository)

### Option A: Via GitHub Web Interface (Recommended)
1. Navigate to [github.com/new](https://github.com/new).
2. Choose your repository name: `alison-ferazzini-photography` (or `alisonferazzini`).
3. Set the visibility to **Public**.
4. **Do not** initialize with a README, .gitignore, or license (these already exist locally).
5. Click **Create repository**.
6. Copy the remote URL and run in your terminal:
   ```bash
   # Add your GitHub remote
   git remote add origin https://github.com/<your-username>/alison-ferazzini-photography.git

   # Push the main branch
   git push -u origin main
   ```

### Option B: Via GitHub CLI (`gh`)
If you have the GitHub CLI authenticated:
```bash
gh repo create alison-ferazzini-photography --public --source=. --remote=origin --push
```

---

## Step 3: Continuous Deployment with Netlify

### Option A: Netlify Web Dashboard (Continuous Deployment)

1. **Log In to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com/) and sign in (using GitHub is recommended).

2. **Import Repository**:
   - Click **Add new site** > **Import an existing project**.
   - Select **GitHub** as your Git provider and authorize Netlify.
   - Search for and select `alison-ferazzini-photography`.

3. **Verify Build Settings**:
   Netlify automatically reads the committed [`netlify.toml`](netlify.toml) file. Confirm the following settings:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node.js version**: `20` (configured in `netlify.toml`)

4. **Deploy Site**:
   - Click **Deploy alison-ferazzini-photography**.
   - Netlify will clone the repository, run `npm run build`, and deploy the site across its global multi-cloud CDN within ~45 seconds.
   - Your site will receive a default URL (e.g., `https://creative-name-12345.netlify.app`).

---

### Option B: Netlify CLI (Direct / Manual Deployment)

If you prefer to deploy directly from the command line:

```bash
# 1. Install or run Netlify CLI
npx netlify login

# 2. Initialize and link site
npx netlify init

# 3. Deploy production build
npx netlify deploy --prod --dir=dist
```

---

## Step 4: Custom Domain & SSL Configuration

To link your official production domain (e.g., `alisonferazzini.it`):

### 1. Configure Domain in Netlify Dashboard
1. In your Netlify site dashboard, navigate to **Site configuration** > **Domain management**.
2. Click **Add custom domain**.
3. Enter `alisonferazzini.it` (or `www.alisonferazzini.it`) and click **Verify** > **Add domain**.

### 2. Configure DNS Records with your Registrar
At your DNS registrar (e.g., Aruba, Register.it, Cloudflare, Namecheap), add the standard Netlify DNS records:

| Record Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (apex domain) | `75.2.60.5` | Automatic / 3600 |
| **CNAME** | `www` | `<your-site-name>.netlify.app.` | Automatic / 3600 |

*Alternatively, you can delegate nameservers directly to Netlify DNS.*

### 3. Automatic SSL/TLS Certificate (HTTPS)
- Once DNS propagation takes effect (typically 5 to 30 minutes), Netlify automatically issues a free, managed Let's Encrypt SSL/TLS certificate.
- Navigate to **Site configuration** > **Domain management** > **HTTPS** and verify that "Certificate status" displays **Active**.
- Ensure **Force HTTPS** is toggled **ON**.

---

## Step 5: Post-Deployment Verification Checklist

After the first deployment completes, perform the following verification:

- [ ] **Home Page Load**: Visit your Netlify URL and verify that all photography, typography, and layout render immediately without layout shift.
- [ ] **SPA Direct URL & Refresh**: Reload the page on anchor targets (e.g., `/#portfolio`, `/#servizi`) to ensure `netlify.toml` SPA redirects return HTTP 200 without 404 errors.
- [ ] **Lightbox Gallery**: Click on any photo in the masonry grid, test keyboard arrow navigation (`←`, `→`), test `Esc` to close, and test swipe on touch devices.
- [ ] **Inquiry Assistant**: Test selecting different services and clicking "Invia Richiesta" to confirm the `mailto:` pre-fill works seamlessly with email clients.
- [ ] **HTTP Headers Audit**: Verify security headers (`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`) using [securityheaders.com](https://securityheaders.com/).
- [ ] **Lighthouse Production Benchmark**: Run Google Lighthouse in Chrome DevTools against your live production URL to confirm **100 / 100 / 100 / 100** scores.
