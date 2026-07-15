# Keerthirajan Senthilkumar — Portfolio

Personal portfolio built with Next.js (App Router), TypeScript, Tailwind CSS v4, Motion, GSAP/ScrollTrigger, Lenis, and React Three Fiber.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Real content lives in `src/content/data.ts`.

Other scripts: `npm run build`, `npm run typecheck`, `npm run lint`, `npm run format`.

## Deployment

The live site is deployed on Vercel from the `redesign` branch (`npm run build` auto-runs on every push to `redesign`). The `main` branch still separately serves the original legacy site via GitHub Pages — `redesign` will be merged into `main` in a later, explicit cutover once the new site has been fully reviewed.

`src/lib/site.ts`'s `getSiteUrl()` resolves the canonical domain for metadata/sitemap/OG images automatically via Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, or can be overridden by setting a `NEXT_PUBLIC_SITE_URL` environment variable (e.g. once a custom domain is attached).

## Project structure

- `src/app/` — routes (home page, `/projects/[slug]` case studies, sitemap/robots/OG image)
- `src/components/` — UI, page sections, and the motion/WebGL layer
- `src/content/data.ts` — all real content (profile, experience, projects, etc.)
