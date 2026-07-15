"use client";

import { useState } from "react";
import Link from "next/link";
import { contact } from "@/content/data";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink"
          aria-label="Home — Keerthirajan Senthilkumar"
        >
          KS<span className="text-crimson">.</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={contact.resumeUrl}
            className="rounded-full bg-crimson px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-wine"
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

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Primary"
          className="border-t border-ink/5 bg-paper md:hidden"
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
                className="mt-2 mb-3 inline-flex rounded-full bg-crimson px-4 py-2 text-sm font-semibold text-paper"
                onClick={() => setOpen(false)}
              >
                Resume
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
