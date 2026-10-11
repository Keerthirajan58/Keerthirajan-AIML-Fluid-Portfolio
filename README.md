# Keerthirajan Senthilkumar — Portfolio

Personal portfolio built with Next.js (App Router), TypeScript, Tailwind CSS v4, Motion, GSAP/ScrollTrigger, Lenis, and Three.js/React Three Fiber. Webflow content has a validated local fallback. Taxi provides route-arrival animation without replacing Next routing. The optional Rive asset and live contact/CMS configuration remain setup-dependent.


## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Factual local content lives in `src/content/data.ts` and `src/content/nvc.ts`. See `.env.example` for optional integrations; the site works without credentials.

## Verification

```bash
npx playwright install chromium webkit
npm run verify
```

The complete command runs TypeScript, ESLint, Vitest with enforced coverage, the production build, and Chromium/mobile WebKit browser tests. Port 3100 must be free: Playwright starts its own production server. On Linux CI, use `npx playwright install --with-deps chromium webkit`.

- Unit coverage: `coverage/index.html`, `coverage/coverage-summary.json`, `coverage/lcov.info`.
- Browser evidence: `playwright-report/index.html`, `test-results/results.json`, and screenshots under `test-results/`.
- CI workflow: `.github/workflows/verify.yml`; it uploads reports, but has not been run remotely as part of this local work.


## Recovery and deployment safety

Work is isolated on `immersive-redesign-v2`, based on `4e986b1fe58bcf127c38282de9e9ac7499a8ae73` from `origin/redesign`. The failed uncommitted rewrite is preserved in the stash named `recovery: failed local redesign before immersive v2`. Do not apply it onto this branch. No push, deployment, merge, or cutover is part of verification. The production deployment and original static-site branch remain untouched.

`src/lib/site.ts`'s `getSiteUrl()` resolves the canonical domain for metadata/sitemap/OG images automatically via Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, or can be overridden by setting a `NEXT_PUBLIC_SITE_URL` environment variable (e.g. once a custom domain is attached).

## Project structure

- `src/app/` — routes (home page, `/projects/[slug]` case studies, sitemap/robots/OG image)
- `src/components/` — UI, page sections, and the motion/WebGL layer
- `src/content/` — authoritative local content, validation, and Webflow field mapping
- `tests/` — unit/component and real-browser regression suites
