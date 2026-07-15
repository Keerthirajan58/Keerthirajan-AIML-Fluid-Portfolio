"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react";
import { contact } from "@/content/data";

const NAV_LINKS = [
  { id: "about", href: "/#about", label: "About" },
  { id: "experience", href: "/#experience", label: "Experience" },
  { id: "projects", href: "/#projects", label: "Projects" },
  { id: "skills", href: "/#skills", label: "Skills" },
  { id: "contact", href: "/#contact", label: "Contact" },
];

/** Marks the nav link of the section currently crossing the upper third of the viewport. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const sections = NAV_LINKS.map((l) =>
      document.getElementById(l.id),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A thin horizontal band ~1/4 down the viewport: exactly one section
      // crosses it at a time, so "last to intersect" is the active one.
      { rootMargin: "-25% 0px -70% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [enabled]);

  return enabled ? active : null;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const active = useActiveSection(pathname === "/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <header
          className={`sticky top-0 z-50 border-b bg-paper/85 backdrop-blur-md transition-shadow ${
            scrolled ? "border-ink/10 shadow-[0_1px_12px_rgba(23,19,19,0.06)]" : "border-ink/5"
          }`}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight text-ink"
              aria-label="Home — Keerthirajan Senthilkumar"
            >
              KS<span className="text-crimson">.</span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => {
                const isActive = active === link.id;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative text-sm transition-colors hover:text-ink ${
                      isActive ? "font-semibold text-ink" : "text-ink-muted"
                    }`}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-crimson transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </Link>
                );
              })}
              <a
                href={contact.resumeUrl}
                className="rounded-full bg-crimson px-4 py-2 text-sm font-semibold text-paper transition-[background-color,transform] hover:bg-wine active:scale-[0.97]"
              >
                Resume
              </a>
            </nav>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-ink md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {open ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <m.nav
                id="mobile-menu"
                aria-label="Primary"
                className="overflow-hidden border-t border-ink/5 bg-paper md:hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <ul className="mx-auto flex w-full max-w-6xl flex-col px-5 py-2 sm:px-8">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block py-3 text-base text-ink-muted transition-colors hover:text-ink"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <a
                      href={contact.resumeUrl}
                      className="mb-3 mt-2 inline-flex rounded-full bg-crimson px-4 py-2 text-sm font-semibold text-paper"
                      onClick={() => setOpen(false)}
                    >
                      Resume
                    </a>
                  </li>
                </ul>
              </m.nav>
            )}
          </AnimatePresence>
        </header>
      </MotionConfig>
    </LazyMotion>
  );
}
