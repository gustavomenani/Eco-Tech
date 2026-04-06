"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/types";

type SiteHeaderProps = {
  brand: string;
  nav: NavItem[];
};

export function SiteHeader({ brand, nav }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      document.body.dataset.mobileNavOpen = "true";
    } else {
      delete document.body.dataset.mobileNavOpen;
    }

    window.dispatchEvent(new Event("mobile-nav-toggle"));

    return () => {
      delete document.body.dataset.mobileNavOpen;
      window.dispatchEvent(new Event("mobile-nav-toggle"));
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-6">
      <div className="shell">
        <div
          ref={headerRef}
          className="glass-panel relative flex items-center justify-between gap-3 rounded-[24px] px-4 py-2.5 md:rounded-[28px] md:px-6 md:py-3"
        >
          <Link href="/" className="font-display text-[1.9rem] font-semibold leading-none tracking-tight text-emerald-700 md:text-2xl">
            {brand}
          </Link>

          <button
            type="button"
            className="inline-flex touch-manipulation items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm md:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Fechar menu principal" : "Abrir menu principal"}
            onClick={() => setOpen((current) => !current)}
          >
            <span>{open ? "Fechar" : "Menu"}</span>
            <span className="grid gap-1" aria-hidden="true">
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>

          {open ? (
            <button
              type="button"
              className="fixed inset-0 top-[4.75rem] z-40 bg-slate-950/8 backdrop-blur-[1px] md:hidden"
              aria-label="Fechar menu principal"
              onClick={() => setOpen(false)}
            />
          ) : null}

          <nav
            id="site-menu"
            className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-full z-50 mt-2 max-h-[calc(100svh-6rem)] flex-col gap-2 overflow-y-auto rounded-[24px] border border-slate-200 bg-white/96 p-3 shadow-2xl backdrop-blur md:static md:mt-0 md:flex md:max-h-none md:flex-row md:items-center md:gap-2 md:overflow-visible md:border-none md:bg-transparent md:p-0 md:shadow-none`}
            aria-label="Navegação principal"
          >
            {nav.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition hover:bg-emerald-50 hover:text-emerald-700 md:py-2 ${
                    isActive ? "bg-emerald-100 text-emerald-700" : "text-slate-700"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <nav
            className={`${open ? "hidden" : "flex"} absolute inset-x-0 top-full z-40 mt-2 gap-2 overflow-x-auto rounded-[22px] bg-white/90 px-3 py-2 shadow-lg backdrop-blur md:hidden`}
            aria-label="Atalhos principais"
          >
            {nav.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={`quick-${item.href}`}
                  href={item.href}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
