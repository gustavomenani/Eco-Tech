"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="px-4 md:px-6">
      <div className="shell">
        <div className="hero-panel px-6 py-10 text-center md:px-10 md:py-14">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="eyebrow mx-auto">Erro inesperado</div>
            <h1 className="font-display text-4xl font-semibold text-slate-950 md:text-5xl">
              Algo saiu do esperado ao carregar esta parte do projeto.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Voce pode tentar novamente agora ou voltar para a pagina inicial do EcoTech.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => reset()} className="button-primary">
                Tentar novamente
              </button>
              <Link href="/" className="button-secondary">
                Voltar ao inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
