# Contributing Guidelines

Thank you for your interest in contributing to the **Alison Ferazzini Photography** portfolio website! We welcome contributions that improve code quality, performance, responsiveness, and accessibility.

---

## Code of Conduct

Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) in all project interactions.

---

## Development Workflow

### 1. Prerequisites
- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **Python**: `3.10+` with Pillow (optional, only needed if executing `scripts/optimize-images.py`)

### 2. Fork & Clone
1. Fork the repository to your own GitHub account.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/alison-ferazzini-photography.git
   cd alison-ferazzini-photography
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```

### 3. Installation & Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The local server runs at `http://localhost:3000`.

### 4. Quality Verification
Before submitting a pull request, ensure all checks pass:
```bash
# Verify TypeScript types
npm run typecheck

# Verify production build
npm run build

# Preview production build locally
npm run preview
```

---

## Git & Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature or user-facing enhancement
- `fix:` A bug fix
- `docs:` Documentation updates only
- `style:` Formatting or UI styling changes that do not alter logic
- `refactor:` Code restructuring without changing behavior
- `perf:` Performance optimizations
- `chore:` Build scripts, dependency updates, configuration tweaks

Example:
```bash
git commit -m "feat(portfolio): add category badge animation on filter change"
```

---

## Asset & Photography Guidelines

> [!IMPORTANT]
> All photography assets in `/images/` and `/public/images/` are the proprietary artistic work of **Alison Ferazzini**. Do not replace, delete, or re-license these assets without explicit permission.

---

## Pull Request Process

1. Push your branch to GitHub:
   ```bash
   git push origin feature/my-new-feature
   ```
2. Open a Pull Request against the `main` branch.
3. Fill out the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
4. Automated GitHub Actions CI will run type checking and production build verification.
5. Once reviewed and approved, your PR will be merged!
