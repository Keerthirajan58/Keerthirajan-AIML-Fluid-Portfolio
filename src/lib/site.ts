/**
 * Resolves the site's canonical base URL, used for metadataBase, the
 * sitemap, and robots.txt. The production domain isn't chosen yet (that's
 * Phase 6), so this falls back through: an explicit override (set this once
 * a custom domain exists) → Vercel's auto-injected deployment URL (available
 * the moment Phase 6 deploys, no code change needed) → localhost for dev.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
