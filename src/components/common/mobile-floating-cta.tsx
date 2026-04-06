"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileFloatingCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = () => {
      const root = document.documentElement;
      const nearFooter = window.scrollY + window.innerHeight >= root.scrollHeight - 180;
      const navOpen = document.body.dataset.mobileNavOpen === "true";
      const threshold = pathname === "/ecopontos" ? 1800 : 280;
      setVisible(window.scrollY > threshold && !nearFooter && !navOpen);
    };

    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });
    window.addEventListener("resize", syncVisibility);
    window.addEventListener("mobile-nav-toggle", syncVisibility);

    return () => {
      window.removeEventListener("scroll", syncVisibility);
      window.removeEventListener("resize", syncVisibility);
      window.removeEventListener("mobile-nav-toggle", syncVisibility);
    };
  }, [pathname]);

  if (!visible) {
    return null;
  }

  const isEcopointsPage = pathname === "/ecopontos";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 pb-[env(safe-area-inset-bottom)] md:hidden">
      {isEcopointsPage ? (
        <button
          type="button"
          className="pointer-events-auto inline-flex min-h-12 items-center justify-center rounded-full border border-white/70 bg-white/92 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Voltar ao topo
        </button>
      ) : (
        <Link
          href="/ecopontos"
          className="pointer-events-auto inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#10b981,#2563eb)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_48px_rgba(37,99,235,0.28)]"
        >
          Ver ecopontos
        </Link>
      )}
    </div>
  );
}
