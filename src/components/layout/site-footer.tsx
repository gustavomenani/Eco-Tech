import Link from "next/link";
import type { NavItem } from "@/lib/types";

type SiteFooterProps = {
  brand: string;
  description: string;
  note: string;
  nav: NavItem[];
};

export function SiteFooter({ brand, description, note, nav }: SiteFooterProps) {
  const footerCtaByHref: Record<string, string> = {
    "/sobre": "Conheca a iniciativa",
    "/solucoes": "Como descartar melhor",
    "/projeto": "Ver o projeto completo",
    "/ecopontos": "Encontrar ecopontos",
    "/fontes": "Abrir fontes e referencias"
  };

  return (
    <footer className="px-4 pb-8 md:px-6">
      <div className="shell">
        <div className="section-panel grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-8">
          <div className="space-y-3">
            <strong className="font-display text-2xl font-semibold text-slate-950">{brand}</strong>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">{description}</p>
            <p className="text-sm font-medium text-slate-500">{note}</p>
          </div>

          <nav className="grid grid-cols-2 gap-3 md:justify-self-end" aria-label="Navegação do rodapé">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={footerCtaByHref[item.href] ?? `Abrir ${item.label.toLowerCase()} pelo rodape`}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700"
              >
                {footerCtaByHref[item.href] ?? item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
