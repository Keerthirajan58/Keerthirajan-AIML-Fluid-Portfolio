# Keerthirajan Senthilkumar · Portfolio

Personal portfolio of an AI/ML and software engineer, built with Next.js (App Router), TypeScript and Tailwind CSS v4.

The design, "Clear Air", puts solid, light cards over a soft light field that re-lights as you scroll, with a remembered light/dark switch. The hero line types itself out like a model generating text, and each word shows illustrative next-token candidates on hover. Scroll choreography is pure CSS (scroll-driven animations); Lenis smooths the desktop wheel and Motion drives one small hover effect. There is no canvas or WebGL.

## Quick start

```bash
npm ci
npm run dev        # http://localhost:3000
```

The site needs no credentials. Optional settings are in `.env.example`.

## Project structure

```
src/
  app/                 Routes: home, /projects/[slug], sitemap, robots, share image, icons
  content/             Everything the site says (see "Adding content")
    projects/          One file per project; index.ts sets their order
  components/
    sections/<id>/     One folder per home section (hero, about, experience, …)
    case-study/        The project page and its gallery
    layout/            Header, footer, theme switch, training monitor
    background/        The living light field
    motion/            Wheel smoothing, anchor glides, route arrival
    ui/                Shared pieces: section wrapper, icons, lenses, cards
  lib/                 Logic with no UI: selectors, layout maths, validation
    content/           Schema, repository with local fallback, optional CMS mapping
    server/            Server-only helpers (reading image files)
  styles/              globals.css imports ordered partials (tokens, sections, …)
  assets/fonts/        Self-hosted Unbounded and Inter
public/                Résumé, photos, logos and project images
tests/
  unit/                Vitest: content, lib, components, routes, repo structure, safety
  e2e/                 Playwright: real browsers against the production build
  support/             Builders for synthetic test content
```

Dependencies only point one way: `content` → `lib` → `components` → `app`. Tests enforce this, along with the other rules in this README.

## Adding content

Every kind of content is data in `src/content/`. Add an entry and the site renders it everywhere it belongs: cards, filters, skill evidence, timelines, routes, the sitemap and so on. You never need to touch components, styles or routes. The shapes are documented in `src/content/types.ts`, and TypeScript checks every entry as you type.

After any change, run `npm test`. It validates all content (required fields, safe links, existing image files, unique slugs, valid filters) and renders every section with it.

### A project

1. Copy any file in `src/content/projects/`, for example `moodbites.ts`, to `<slug>.ts`. The slug is lowercase words joined by hyphens.
2. Fill in `title`, `badge` (the small category), `description`, `tags` and `filters`. Filters are ids from `src/content/filters.ts`.
3. Optional: `links` (`github`, `devpost`, `blog`), `achievement` (the award ribbon), and `notes` (the "Project notes" dialog, built from `{ meta }`, `{ text }` and `{ bullets }` blocks).
4. List it in `src/content/projects/index.ts`. Its position there is its position in the work grid.

**Card image.** A project with a case study uses its gallery cover. Any other project shows its tags until you add `public/images/projects/<slug>/cover.jpg` (or `.png`/`.webp`); the card picks the image up automatically. Landscape at about 16:11 (for example 1600 × 1100 px) works best.

**Case study page.** Add a `caseStudy` with a `focus`, a `timeline`, optional `tech`, a `gallery` (`cover` plus ordered `slides` under `/images/projects/<slug>/`) and `sections` (each with a `heading` and any of `body`, `bullets`, `metrics` or `media`). The page at `/projects/<slug>` is generated at build time and added to the sitemap.

**A follow-up chapter.** Give a project a `chapter` (`of`: the original's slug, plus its `badge`, `label`, `teaser` and `back` text) and a case study. It then appears as a link from the original's card and page instead of as a card of its own. The BarterBrAIn startup chapter (`barterbrain-nvc.ts`) is an example.

### Experience, education and the rest

| To add                                 | Edit                | Notes                                                                                                                                                                              |
| -------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A role                                 | `experience.ts`     | Newest first. `logo` is `{ src: "/images/brands/…" }`, an `{ icon }`, or omitted for a briefcase. Tools named in the bullets are bolded automatically and count as skill evidence. |
| A degree                               | `education.ts`      | `logo` is a `{ monogram }` or an `{ src, alt }` emblem; `tint` picks the card's two corner colours. `award`, `activities`, `notes` and `coursework` are optional.                  |
| A skill or skill area                  | `skills.ts`         | A new area gets its own colour and tab. A bubble's size comes from how many roles and projects mention the skill.                                                                  |
| A certification                        | `certifications.ts` | Put the issuer logo in `public/images/brands/certs/`; its size is read from the file. Without a logo the card shows the issuer's initials.                                         |
| A publication                          | `publications.ts`   | `title`, `venue` and `date` (for example "May 2023").                                                                                                                              |
| A recommendation                       | `testimonials.ts`   | Add the photo under `public/images/testimonials/`.                                                                                                                                 |
| A social link                          | `contact.ts`        | Networks with an icon: LinkedIn, GitHub and LeetCode. A new network needs its icon in `components/ui/SocialLinks.tsx`.                                                             |
| A work filter                          | `filters.ts`        | A chip only appears once a project uses it.                                                                                                                                        |
| Hero, About and SEO text               | `profile.ts`        | Includes the tab title, meta description, hero facts and About highlights.                                                                                                         |
| The typed hero line                    | `heroTokens.ts`     | The tokens must spell out `heroSentence`; the next-token candidates are illustrative.                                                                                              |
| Section titles, order and header links | `site.ts`           | Order, header links (`nav`) and training-monitor names (`epoch`) all follow this list.                                                                                             |

Icons and colours named in content (`icon`, `tone`, `tint`) come from fixed lists in `src/content/options.ts`. Each one maps to an icon component or a stylesheet colour.

Sections hide themselves when they have nothing to show; for example, with no recommendations the Recommendations section is left out.

## Contact form

"Say hello" opens a form that posts to the portfolio's Formspree form (`FORMSPREE_FORM_ID` in `src/lib/contact.ts`; set `NEXT_PUBLIC_FORMSPREE_FORM_ID` to override it). Without a valid form ID, the form drafts the message in the visitor's email app instead. The test suites never send a real message: browser tests block every request to Formspree.

## Optional CMS (Webflow)

The site can read its content from Webflow instead of `src/content/`. Set `WEBFLOW_API_TOKEN` (a read-only token, server side only) and `WEBFLOW_COLLECTIONS` (JSON mapping `settings`, `experience`, `education`, `projects`, `sections`, `skills`, `certifications`, `publications` and `testimonials` to collection ids). The CMS snapshot is validated as a whole; any outage, invalid entry or case study without a built page falls back to the local content. Visual choices a CMS can't express well (icons, tints, chip colours) come from the matching local entry. The field mapping is in `src/lib/content/webflow.ts`.

## Environment variables

| Variable                                   | Where            | Purpose                                                                                      |
| ------------------------------------------ | ---------------- | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                     | optional         | Canonical URL once a custom domain exists. Otherwise Vercel's stable production URL is used. |
| `NEXT_PUBLIC_FORMSPREE_FORM_ID`            | optional         | Overrides the built-in Formspree form.                                                       |
| `WEBFLOW_API_TOKEN`, `WEBFLOW_COLLECTIONS` | optional, server | Turn on the Webflow source.                                                                  |

Never commit real tokens. `.env*` files are ignored by git except `.env.example`.

## Quality checks

```bash
npx playwright install chromium webkit   # once
npm run verify
```

`verify` runs TypeScript, ESLint, the Vitest suite with a 99% coverage gate on statements, branches, functions and lines, the production build, and the Playwright suite in desktop Chromium and mobile WebKit. Port 3100 must be free. Other commands: `npm test`, `npm run test:coverage`, `npm run test:e2e`, `npm run lint`, `npm run typecheck` and `npm run format`.

The unit suite covers more than features:

- **Content integrity:** every fact, file and link the content refers to.
- **Extensibility:** synthetic projects, roles, degrees, skills, credentials and recommendations must validate and render everywhere.
- **Structure:** folder conventions, no dead modules, one-way dependencies, no server code in client components, no unused public files.
- **Safety:** no secrets or personal data in source, environment variables only where intended, safe external links, and the security headers.

`.github/workflows/verify.yml` runs the type check, lint, unit tests with coverage, the build and a production dependency audit on every push to `main` and on pull requests. The browser suite runs there on demand ("Run workflow").

## Security

Every response carries a content security policy that blocks framing, plugins, `<base>` hijacking and form posts anywhere but this site and Formspree. Responses also carry `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and HSTS, and omit `X-Powered-By`. The headers are defined in `src/lib/security.ts`. Remote images are allowed only over https from the CMS CDN.

## Deployment

The site deploys on Vercel as a standard Next.js project with no extra configuration. `getSiteUrl()` in `src/lib/site.ts` resolves the canonical URL used by metadata, the sitemap and robots.txt. It prefers `NEXT_PUBLIC_SITE_URL`, then Vercel's stable production URL.

## Credits

Fonts are under the SIL Open Font License; license files are in `src/assets/fonts/`. For brand marks and logos, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
