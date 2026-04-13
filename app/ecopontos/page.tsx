import { JsonLd } from "@/components/common/json-ld";
import { PageHero } from "@/components/common/page-hero";
import { SectionHeading } from "@/components/common/section-heading";
import { EcopointsExplorer } from "@/components/ecopoints/ecopoints-explorer";
import { getEcopointsDocument } from "@/lib/data";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata("/ecopontos");

export default function EcopontosPage() {
  const ecopointsDoc = getEcopointsDocument();
  const sources =
    ecopointsDoc.sources?.length > 0
      ? ecopointsDoc.sources
      : [{ name: ecopointsDoc.sourceName, url: ecopointsDoc.sourceUrl }];

  return (
    <>
      <JsonLd
        data={buildPageJsonLd("/ecopontos", {
          about: {
            "@type": "Place",
            name: ecopointsDoc.city
          }
        })}
      />

      <PageHero
        eyebrow="Aplicação prática do projeto"
        title="Ecopontos em Araçatuba e região"
        description="Esta página mostra onde a população pode levar resíduos eletrônicos em cidades da região, com busca, filtro e apoio visual por mapa."
        imageSrc="/assets/collection-point.svg"
        imageAlt="Ilustração de ponto de coleta e descarte consciente"
      />

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="section-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Veja onde descartar"
              title="Locais de descarte correto em Araçatuba e cidades vizinhas"
              description="Os cartões abaixo mostram cidade, endereço, materiais aceitos e links de localização. O objetivo é facilitar a consulta rápida pelo celular."
            />

            <div className="grid gap-4 md:grid-cols-3">
              <article className="card-surface p-5">
                <h3 className="font-display text-2xl font-semibold text-slate-950">Endereço</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Todos os pontos estão organizados para facilitar a localização durante a apresentação e o uso real.
                </p>
              </article>
              <article className="card-surface p-5">
                <h3 className="font-display text-2xl font-semibold text-slate-950">Materiais aceitos</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Os cartões indicam quais resíduos podem ser entregues em cada local, evitando deslocamentos inúteis.
                </p>
              </article>
              <article className="card-surface p-5">
                <h3 className="font-display text-2xl font-semibold text-slate-950">Mapa</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O mapa ajuda a visualizar os pontos da região e mantém a página útil mesmo em uma apresentação ao
                  vivo.
                </p>
              </article>
            </div>

            <div className="rounded-[28px] bg-amber-50 px-6 py-5 text-sm leading-7 text-amber-950">
              <strong>Observação importante:</strong> confirme o horário e os materiais aceitos antes de sair de casa.
            </div>

            <EcopointsExplorer points={ecopointsDoc.points} materials={ecopointsDoc.materialsCatalog} />

            <div className="space-y-2 text-sm leading-7 text-slate-500">
              <p>
                Dados de <strong>{ecopointsDoc.city}</strong> consultados em {ecopointsDoc.consultedAtDisplay}.
              </p>
              <p className="font-semibold text-slate-700">Fontes consultadas:</p>
              <ul className="list-disc space-y-1 pl-5">
                {sources.map((source) => (
                  <li key={`${source.name}-${source.url}`}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-700"
                    >
                      {source.name}
                    </a>
                    {source.note ? ` - ${source.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
