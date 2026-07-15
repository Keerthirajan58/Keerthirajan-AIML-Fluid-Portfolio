import { profile } from "@/content/data";
import { SocialLinks } from "./ui/SocialLinks";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/5 bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-base font-bold text-ink">
            {profile.name}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {profile.aboutHeadline} · {profile.location}
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:items-end">
          <SocialLinks />
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} {profile.name}. Built with Next.js &
            Tailwind.
          </p>
        </div>
      </div>
    </footer>
  );
}
