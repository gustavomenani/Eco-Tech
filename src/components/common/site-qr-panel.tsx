"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type SiteQrPanelProps = {
  fallbackUrl: string;
};

export function SiteQrPanel({ fallbackUrl }: SiteQrPanelProps) {
  const [pageUrl, setPageUrl] = useState(fallbackUrl);
  const [qrSvg, setQrSvg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const currentUrl = window.location.href;

    setPageUrl(currentUrl);

    QRCode.toString(currentUrl, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
      color: {
        dark: "#0f172a",
        light: "#0000"
      }
    })
      .then((svg) => {
        if (!isMounted) {
          return;
        }

        setQrSvg(svg.replace("<svg ", '<svg class="h-full w-full" '));
      })
      .catch(() => {
        if (isMounted) {
          setQrSvg(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="px-4 md:px-6">
      <div className="shell">
        <div className="hero-panel grid gap-6 overflow-hidden px-6 py-8 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-10">
          <div className="space-y-4">
            <div className="eyebrow">Acesso rapido</div>
            <div className="space-y-3">
              <h2 className="font-display text-4xl font-semibold leading-tight text-slate-950">
                Escaneie o QR code e abra o EcoTech no celular.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                O QR code usa o endereco atual da pagina. Quando o site estiver aberto em um link publicado e valido,
                a camera leva direto para esta mesma experiencia no celular.
              </p>
            </div>

            <div className="card-surface space-y-3 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Link detectado</p>
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-sm font-semibold leading-6 text-sky-700"
              >
                {pageUrl}
              </a>
              <p className="text-sm leading-6 text-slate-500">
                Se preferir, toque no link acima para abrir em outra aba e testar o endereco manualmente.
              </p>
            </div>
          </div>

          <div className="card-surface flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="w-full max-w-[240px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-lg">
              {qrSvg ? (
                <div aria-label="QR code do site" dangerouslySetInnerHTML={{ __html: qrSvg }} />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-[20px] bg-slate-100 p-6 text-sm leading-6 text-slate-500">
                  Gerando QR code...
                </div>
              )}
            </div>

            <p className="max-w-xs text-sm leading-6 text-slate-600">
              Aponte a camera para o codigo e abra o site sem digitar o endereco.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
