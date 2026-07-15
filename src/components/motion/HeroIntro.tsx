"use client";

import { LazyMotion, MotionConfig, domAnimation, m } from "motion/react";
import { profile, contact } from "@/content/data";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { DownloadIcon, ArrowUpRightIcon } from "@/components/ui/icons";

/**
 * Hero left column with the orchestrated load-in. The h1 is never
 * opacity-hidden (it's the LCP element) — it rises via the CSS-only
 * `hero-rise` keyframe, which also runs pre-hydration. Everything secondary
 * staggers in with Motion springs after hydration. MotionConfig
 * reducedMotion="user" strips the translateY movement for reduced-motion
 * users (they get a plain non-moving fade, which is vestibular-safe).
 */

const list = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 26 },
  },
};

export function HeroIntro() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div variants={list} initial="hidden" animate="show">
          <m.p
            variants={item}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-crimson"
          >
            {profile.heroEyebrow}
          </m.p>

          <h1
            id="hero-heading"
            className="hero-rise font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl"
          >
            {profile.name}
          </h1>

          <m.p
            variants={item}
            className="mt-5 max-w-xl text-lg font-medium text-ink sm:text-xl"
          >
            {profile.roles.join("  ·  ")}
          </m.p>

          <m.ul variants={item} className="mt-6 flex flex-wrap gap-2">
            {profile.heroHighlights.map((h) => (
              <li
                key={h.text}
                className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-sm text-ink"
              >
                {h.text}
              </li>
            ))}
          </m.ul>

          <m.div
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-sm font-semibold text-paper transition-[background-color,transform] hover:bg-wine active:scale-[0.97]"
            >
              View Projects
              <ArrowUpRightIcon width={16} height={16} />
            </a>
            <a
              href={contact.resumeUrl}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-[color,border-color,transform] hover:border-crimson hover:text-crimson active:scale-[0.97]"
            >
              <DownloadIcon width={16} height={16} />
              Resume
            </a>
            <SocialLinks />
          </m.div>
        </m.div>
      </MotionConfig>
    </LazyMotion>
  );
}
