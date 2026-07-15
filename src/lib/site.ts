/**
 * Resolves the site's canonical base URL, used for metadataBase, the
 * sitemap, and robots.txt. Falls back through:
 *   1. An explicit override (set this once a custom domain exists)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's *stable* production alias
 *      (e.g. portfolio-portfolio58.vercel.app). Deliberately NOT VERCEL_URL:
 *      that one is unique per deployment and changes on every single build,
 *      which would make the sitemap/OG/robots URLs go stale immediately
 *      after each redeploy. Verified against Vercel's own docs — this is
 *      exactly the variable they recommend for "links that point to
 *      production such as OG-image URLs," and it's set even on preview
 *      deployments.
 *   3. VERCEL_URL as a last-resort fallback (e.g. a deployment where system
 *      env vars are enabled but production URL somehow isn't set).
 *   4. localhost for local dev.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
