"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { contact as defaultContact, type ContactInfo } from "@/content/data";
import { ArrowUpRightIcon } from "./ui/icons";
import { BrandMark } from "./ui/BrandMark";
export function SiteHeader({
  contact = defaultContact,
}: {
  contact?: ContactInfo;
}) {
  const path = usePathname(),
    dialog = useRef<HTMLDialogElement>(null),
    toggle = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState("");
  const pending = useRef<{ id: string; until: number } | null>(null);
  useEffect(() => {
    if (path !== "/") return;
    let scheduled = false;
    const update = () => {
      scheduled = false;
      if (pending.current && performance.now() < pending.current.until) {
        setActive(pending.current.id);
        return;
      }
      pending.current = null;
      const y = window.scrollY + window.innerHeight * 0.28;
      let id = "";
      navigation.forEach((n) => {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= y)
          id = n.id;
      });
      setActive(id);
    };
    const scroll = () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, [path]);
  const close = () => {
    dialog.current?.close();
  };
  const choose = (id: string, timestamp: number) => {
    pending.current = { id, until: timestamp + 1000 };
    setActive(id);
    close();
  };
  return (
    <header className="site-header">
      <div className="header-pill">
        <Link href="/" className="wordmark" aria-label="KS. — Home">
          <BrandMark />
        </Link>
        <nav aria-label="Primary" className="desktop-nav">
          {navigation.map((n) => (
            <Link
              key={n.id}
              href={"/#" + n.id}
              onClick={(e) => choose(n.id, e.timeStamp)}
              aria-current={
                path === "/" && active === n.id ? "location" : undefined
              }
            >
              <span className="nav-window">
                <span className="nav-label" data-label={n.label}>
                  {n.label}
                </span>
              </span>
            </Link>
          ))}
        </nav>
        <a className="header-resume" href={contact.resumeUrl}>
          Résumé <ArrowUpRightIcon width={15} height={15} />
        </a>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-controls="mobile-menu"
          onClick={() => dialog.current?.showModal()}
        >
          <span />
          <span />
        </button>
        <noscript>
          <nav className="nojs-nav" aria-label="Mobile without JavaScript">
            {navigation.map((n) => (
              <a key={n.id} href={"/#" + n.id}>
                {n.label}
              </a>
            ))}
          </nav>
        </noscript>
      </div>
      <dialog
        ref={dialog}
        id="mobile-menu"
        data-lenis-prevent
        aria-label="Navigation menu"
        className="mobile-menu"
        onClose={() => toggle.current?.focus()}
      >
        <div className="menu-top">
          <span className="wordmark">
            <BrandMark />
          </span>
          <button
            className="icon-button"
            aria-label="Close menu"
            onClick={close}
          >
            ×
          </button>
        </div>
        <nav aria-label="Mobile">
          {navigation.map((n) => (
            <Link
              key={n.id}
              href={"/#" + n.id}
              onClick={(e) => choose(n.id, e.timeStamp)}
            >
              {n.label}
              <ArrowUpRightIcon />
            </Link>
          ))}
        </nav>
        <a
          href={contact.resumeUrl}
          onClick={close}
          className="button button-primary"
        >
          View résumé <ArrowUpRightIcon />
        </a>
      </dialog>
    </header>
  );
}
