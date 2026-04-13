import { JsonLd } from "@/components/common/json-ld";
import { PageHero } from "@/components/common/page-hero";
import { SectionHeading } from "@/components/common/section-heading";
import { projetoCollection, projetoHighlights } from "@/content/page-content";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata("/projeto");

export default function ProjetoPage() {
  return (
    <>
      <JsonLd data={buildPageJsonLd("/projeto")} />

      <PageHero
        eyebrow="Estrutura do trabalho"
        title="O projeto EcoTech também possui uma demonstração física."
        description="Além do site, o trabalho apresenta materiais reais para demonstrar o problema e a solução de forma visual, objetiva e didática."
        imageSrc="/assets/hero-ewaste.svg"
        imageAlt="Ilustração sobre tecnologia, reciclagem e conscientização ambiental"
      />

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="section-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Parte física"
              title="A apresentação utiliza caixas com resíduos eletrônicos para reforçar a conscientização."
              description="A proposta é mostrar, de forma clara, como o descarte incorreto e a destinação adequada produzem resultados muito diferentes."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {projetoHighlights.map((item) => (
                <article key={item.title} className="card-surface p-6">
                  <h3 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="hero-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Materiais usados"
              title="A demonstração reúne exemplos de lixo eletrônico do dia a dia."
              description="Isso ajuda o público a reconhecer quais objetos exigem descarte correto e como eles aparecem na rotina."
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {projetoCollection.map((item) => (
                <article key={item.title} className="card-surface p-6">
                  <h3 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="section-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Objetivo da apresentação"
              title="A demonstração permite visualizar com clareza o problema e a solução."
              description="A parte física complementa a pesquisa e reforça a conscientização ambiental por meio de comparação direta e aprendizado prático."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="card-surface p-6">
                <h3 className="font-display text-2xl font-semibold text-slate-950">Comparação visual</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  As caixas mostram a diferença entre o descarte incorreto no lixo comum e o encaminhamento adequado
                  para os ecopontos.
                </p>
              </article>
              <article className="card-surface p-6">
                <h3 className="font-display text-2xl font-semibold text-slate-950">Aprendizado prático</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Ao ver os objetos reais, o público entende melhor quais materiais devem ser separados e como agir de
                  forma responsável.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
