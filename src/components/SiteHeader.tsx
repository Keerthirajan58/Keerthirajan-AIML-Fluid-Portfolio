"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { scrollToSection } from "@/lib/smoothScroll";
import { contact as defaultContact, type ContactInfo } from "@/content/data";
import { ArrowUpRightIcon } from "./ui/icons";
import { BrandMark } from "./ui/BrandMark";
import { ThemeToggle } from "./ThemeToggle";
export function SiteHeader({
  contact = defaultContact,
}: {
  contact?: ContactInfo;
}) {
  const path = usePathname(),
    dialog = useRef<HTMLDialogElement>(null),
    toggle = useRef<HTMLButtonElement>(null),
    nav = useRef<HTMLElement>(null),
    hovered = useRef<string | null>(null);
  const [active, setActive] = useState("");
  const pending = useRef<{ id: string; until: number } | null>(null);

  /* Liquid lens: a glass pill that springs under the hovered link and rests
     on the current section. Positioned with CSS variables, no re-renders. */
  const placeLens = useCallback(() => {
    const el = nav.current;
    if (!el) return;
    const id = hovered.current ?? (path === "/" ? active : "");
    const link = id
      ? el.querySelector<HTMLElement>(`a[data-section="${id}"]`)
      : null;
    if (!link) {
      el.style.setProperty("--lens-o", "0");
      return;
    }
    el.style.setProperty("--lens-x", `${link.offsetLeft}px`);
    el.style.setProperty("--lens-w", `${link.offsetWidth}px`);
    el.style.setProperty("--lens-o", "1");
    if (!el.dataset.ready)
      requestAnimationFrame(() => {
        el.dataset.ready = "true";
      });
  }, [active, path]);
  useEffect(placeLens, [placeLens]);
  useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !nav.current) return;
    const observer = new ResizeObserver(() => placeLens());
    observer.observe(nav.current);
    void document.fonts?.ready.then(() => placeLens());
    return () => observer.disconnect();
  }, [placeLens]);

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
  const choose = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    pending.current = { id, until: e.timeStamp + 1400 };
    setActive(id);
    const inMenu = !!dialog.current?.open;
    close();
    if (path !== "/" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (!document.getElementById(id)) return;
    // Glide instead of letting the router jump straight to the anchor.
    e.preventDefault();
    if (inMenu) requestAnimationFrame(() => scrollToSection(id));
    else scrollToSection(id);
  };
  return (
    <header className="site-header">
      <div className="header-pill">
        <Link href="/" className="wordmark" aria-label="KS. — Home">
          <BrandMark idPrefix="ks-head" />
        </Link>
        <nav
          aria-label="Primary"
          className="desktop-nav"
          ref={nav}
          onMouseLeave={() => {
            hovered.current = null;
            placeLens();
          }}
        >
          <span className="nav-lens" aria-hidden="true" />
          {navigation.map((n) => (
            <Link
              key={n.id}
              href={"/#" + n.id}
              data-section={n.id}
              onClick={(e) => choose(e, n.id)}
              onMouseEnter={() => {
                hovered.current = n.id;
                placeLens();
              }}
              onFocus={() => {
                hovered.current = n.id;
                placeLens();
              }}
              onBlur={() => {
                hovered.current = null;
                placeLens();
              }}
              aria-current={
                path === "/" && active === n.id ? "location" : undefined
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
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
            <BrandMark idPrefix="ks-menu" />
          </span>
          <div className="menu-actions">
            <ThemeToggle />
            <button
              className="icon-button"
              aria-label="Close menu"
              onClick={close}
            >
              ×
            </button>
          </div>
        </div>
        <nav aria-label="Mobile">
          {navigation.map((n) => (
            <Link
              key={n.id}
              href={"/#" + n.id}
              onClick={(e) => choose(e, n.id)}
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
