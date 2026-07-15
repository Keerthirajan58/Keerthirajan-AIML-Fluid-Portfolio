import { profile, contact } from "@/content/data";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { NodeClusterStatic } from "@/components/NodeClusterStatic";
import { DownloadIcon, ArrowUpRightIcon } from "@/components/ui/icons";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 md:grid-cols-[1.1fr_0.9fr]"
    >
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-crimson">
          {profile.heroEyebrow}
        </p>
        <h1
          id="hero-heading"
          className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl"
        >
          {profile.name}
        </h1>
        <p className="mt-5 max-w-xl text-lg font-medium text-ink sm:text-xl">
          {profile.roles.join("  ·  ")}
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {profile.heroHighlights.map((h) => (
            <li
              key={h.text}
              className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-sm text-ink"
            >
              {h.text}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-wine"
          >
            View Projects
            <ArrowUpRightIcon width={16} height={16} />
          </a>
          <a
            href={contact.resumeUrl}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-crimson hover:text-crimson"
          >
            <DownloadIcon width={16} height={16} />
            Resume
          </a>
          <SocialLinks />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-sm md:max-w-none">
        <NodeClusterStatic className="h-auto w-full" />
      </div>
    </section>
  );
}
