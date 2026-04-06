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
          className="glass-panel motion-rise relative flex items-center justify-between gap-3 rounded-[26px] px-4 py-3 md:rounded-[28px] md:px-6 md:py-3"
        >
          <Link href="/" className="font-display text-[1.9rem] font-semibold leading-none tracking-tight text-emerald-700 md:text-2xl">
            {brand}
          </Link>

          <button
            type="button"
            className="inline-flex touch-manipulation items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.1)] md:hidden"
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
            className={`absolute right-0 top-[calc(100%+0.85rem)] z-50 flex w-[min(100vw-1.5rem,21rem)] origin-top-right flex-col gap-2 rounded-[28px] border border-white/75 bg-white/96 p-3 shadow-[0_26px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:static md:top-auto md:w-auto md:origin-center md:flex-row md:items-center md:gap-2 md:border-none md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0 md:transition-none ${
              open
                ? "visible translate-y-0 scale-100 opacity-100 pointer-events-auto"
                : "invisible -translate-y-2 scale-[0.98] opacity-0 pointer-events-none md:visible md:translate-y-0 md:scale-100 md:opacity-100 md:pointer-events-auto"
            }`}
            aria-label="Navegação principal"
          >
            {nav.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition hover:bg-emerald-50 hover:text-emerald-700 md:rounded-full md:py-2 ${
                    isActive ? "bg-emerald-100 text-emerald-700 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]" : "text-slate-700"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setOpen(false)}
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
