# Deploy Voice Lens to GitHub Pages

This guide walks you through deploying Voice Lens to GitHub Pages with automatic CI/CD.

---

## Quick Start (3 Steps)

### 1. Create GitHub Repository

```bash
# From the project root
cd C:/Users/abhis/gold/apex/pollinations-quests/quest-19180-llm-voice

# Initialize git (if not already)
git init
git add .
git commit -m "feat: Voice Lens - Pollinations Quest #19180

- Local-first style analysis with 7 deterministic analyzers
- Pollinations OAuth 2.0 PKCE (S256) + BYOP support
- Premium UI with Motion.dev + shadcn/ui patterns
- 71 unit tests + E2E tests with mocked APIs
- Privacy-first: tokens in sessionStorage only"
```

### 2. Push to GitHub

```bash
# Create repo on GitHub first (github.com/new), then:
git remote add origin https://github.com/YOUR_USERNAME/voice-lens.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. **Source**: "GitHub Actions" (not "Deploy from branch")
3. Save

That's it! The workflow will:
- Run on every push to `main`
- Execute tests + lint + build
- Deploy to `https://YOUR_USERNAME.github.io/voice-lens/`

---

## Detailed Setup

### Repository Settings

After pushing, configure these in your GitHub repo:

| Setting | Value |
|---------|-------|
| **Pages Source** | GitHub Actions |
| **Branch Protection** | Optional: Require status checks (build, test, lint) |
| **Environments** | `github-pages` (auto-created by workflow) |

### Custom Domain (Optional)

1. Add `CNAME` file to `public/`:
   ```
   voice-lens.yourdomain.com
   ```
2. In repo Settings → Pages → Custom domain: enter your domain
3. Add DNS `CNAME` record pointing to `YOUR_USERNAME.github.io`

### Environment Variables (If Needed)

The workflow uses these automatically:
- `GITHUB_PAGES=true` — Sets correct base path
- `GITHUB_REPO_NAME` — From `${{ github.event.repository.name }}`

No secrets required for basic deployment.

---

## How It Works

### Build Configuration (`vite.config.ts`)

```typescript
base: process.env.GITHUB_PAGES ? `/${process.env.GITHUB_REPO_NAME || 'voice-lens'}/` : '/',
```

- **Local dev** (`pnpm dev`): Base = `/` → `http://localhost:5173/`
- **GitHub Pages** (`GITHUB_PAGES=true`): Base = `/voice-lens/` → `https://user.github.io/voice-lens/`

### SPA Routing Fix (`public/404.html`)

GitHub Pages doesn't support client-side routing natively. The `404.html` trick:
1. User visits `https://user.github.io/voice-lens/some-route`
2. GitHub serves `404.html` (since route doesn't exist on server)
3. Script redirects to `/?redirect=some-route`
4. App reads `redirect` param and navigates internally

### Workflow (`.github/workflows/deploy.yml`)

```yaml
jobs:
  build:
    - Checkout code
    - Setup Node 20 + pnpm cache
    - Install deps
    - Run tests (pnpm test)
    - Run lint (pnpm lint)
    - Build (pnpm build)
    - Upload dist/ as artifact
  
  deploy:
    - Deploy artifact to GitHub Pages
```

---

## Verification Checklist

After first deployment, verify:

- [ ] Site loads at `https://YOUR_USERNAME.github.io/voice-lens/`
- [ ] No console errors (check DevTools)
- [ ] Editor works — type text, click "Analyze Style"
- [ ] Findings appear in right panel
- [ ] "Connect Pollen" button visible in header
- [ ] Dark/light mode respects system preference
- [ ] Animations smooth (Motion.dev)
- [ ] Responsive on mobile (test 375px width)

---

## Troubleshooting

### Build Fails in CI But Passes Locally

```bash
# Ensure lockfile is committed
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
git push
```

### Styles Not Loading (404 on CSS/JS)

Check `vite.config.ts` base path matches repo name:
```typescript
// If repo is "my-voice-app", not "voice-lens":
base: process.env.GITHUB_PAGES ? '/my-voice-app/' : '/',
```

### OAuth Redirect Fails on GitHub Pages

Pollinations OAuth requires HTTPS redirect URI. For GitHub Pages:
1. In Pollinations app settings, add redirect URI:
   `https://YOUR_USERNAME.github.io/voice-lens/`
2. Or use a custom domain with HTTPS

### 404 on Refresh (SPA Routing)

The `404.html` handles this. If still broken:
1. Verify `public/404.html` exists in deployed site
2. Check `sessionStorage` isn't blocked (private browsing)

---

## Local Preview of Production Build

```bash
# Build with GitHub Pages base
GITHUB_PAGES=true GITHUB_REPO_NAME=voice-lens pnpm build

# Preview locally
pnpm preview
# Opens at http://localhost:4173/voice-lens/
```

---

## Alternative: Deploy to Vercel/Netlify (Easier)

If GitHub Pages feels complex:

### Vercel
```bash
npm i -g vercel
vercel --prod
```
Auto-detects Vite + React, zero config.

### Netlify
```bash
# Build command: pnpm build
# Publish directory: dist
# Add environment variable: VITE_BASE=/
```

Both provide:
- Automatic HTTPS
- Custom domains
- Preview deployments on PRs
- Edge caching

---

## Files Added for GitHub Pages

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `vite.config.ts` (updated) | Dynamic base path |
| `public/404.html` | SPA routing fix |
| `DEPLOY_GITHUB_PAGES.md` | This guide |

---

## Next Steps

1. **Push to GitHub** using commands above
2. **Enable Pages** in repo Settings
3. **Watch Actions tab** for first deployment
4. **Visit your live site** 
5. **Share the URL** for Quest submission!

The deployed site will be identical to local — local-first analysis works offline, Pollen connection works with HTTPS.