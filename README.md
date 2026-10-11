# Keerthirajan Senthilkumar — Portfolio

Personal portfolio built with Next.js (App Router), TypeScript and Tailwind CSS v4. The "Clear Air" design uses a CSS light field behind white content sheets, Unbounded and Inter type, CSS scroll-driven animation, Lenis wheel smoothing on desktop, and Motion for one small hover effect. There is no WebGL. Webflow content has a validated local fallback; the Formspree contact form appears only when configured.


## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Factual content lives in `src/content/data.ts` and `src/content/nvc.ts`. See `.env.example` for optional integrations; the site works without credentials.

## Verification

```bash
npx playwright install chromium webkit
npm run verify
```

This runs TypeScript, ESLint, Vitest with enforced coverage, the production build, and Chromium/mobile WebKit browser tests. Port 3100 must be free: Playwright starts its own production server. On Linux CI, use `npx playwright install --with-deps chromium webkit`.

- Unit coverage: `coverage/index.html`. Browser evidence: `playwright-report/index.html` and `test-results/`. Both folders are generated and disposable.
- CI workflow: `.github/workflows/verify.yml` (not yet run remotely).


## Deployment

Vercel project `portfolio58` auto-deploys the `redesign` branch to https://portfolio-portfolio58.vercel.app. This branch (`immersive-redesign-v2`) is not deployed; cutting over is an explicit owner decision. `src/lib/site.ts`'s `getSiteUrl()` resolves the canonical domain from `VERCEL_PROJECT_PRODUCTION_URL`, or from `NEXT_PUBLIC_SITE_URL` once a custom domain is attached.

## Project structure

- `src/app/` — routes (home, `/projects/[slug]` case studies, sitemap, robots, OG image, icons) and `globals.css`, the only stylesheet
- `src/components/` — page sections, interactive islands, light field and motion
- `src/content/` — authoritative local content, validation, and Webflow field mapping
- `tests/` — unit/component and real-browser regression suites
