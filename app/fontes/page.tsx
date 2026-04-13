import { JsonLd } from "@/components/common/json-ld";
import { PageHero } from "@/components/common/page-hero";
import { SectionHeading } from "@/components/common/section-heading";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { fontesConclusion, fontesProjectInfo } from "@/content/page-content";
import { getEcopointsDocument, getResourcesByIds, getResourcesDocument } from "@/lib/data";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata("/fontes");

function normalizeUrl(url: string) {
  return url.trim().toLowerCase();
}

export default function FontesPage() {
  const resources = getResourcesDocument();
  const ecopointsDoc = getEcopointsDocument();
  const featuredResources = getResourcesByIds(resources.sourcesFeaturedIds);
  const videoResources = getResourcesByIds(resources.sourcesVideoIds);
  const ecopointsSourcePanels = ecopointsDoc.sources.map((source) => ({
    title: source.name,
    description: source.note || "Fonte consultada para os dados locais de descarte e ecopontos.",
    url: source.url,
    cta: "Abrir fonte"
  }));
  const uniqueSourcePanels = [...resources.sourcePanels, ...ecopointsSourcePanels].filter((panel, index, panels) => {
    const normalizedUrl = normalizeUrl(panel.url);
    return panels.findIndex((item) => normalizeUrl(item.url) === normalizedUrl) === index;
  });

  return (
    <>
      <JsonLd data={buildPageJsonLd("/fontes")} />

      <PageHero
        eyebrow="Conclusão do projeto"
        title="EcoTech: informação, prática e conscientização ambiental."
        description="Esta página reúne a mensagem final do projeto, a identificação do grupo e as fontes usadas na pesquisa, incluindo artigos acadêmicos e vídeos de apoio."
        imageSrc="/assets/eco-cycle.svg"
        imageAlt="Ilustração sobre pesquisa, organização de dados e sustentabilidade"
      />

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="hero-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Conclusão"
              title="O descarte correto de lixo eletrônico depende de informação e atitude."
              description="O EcoTech mostra que pequenas ações podem ajudar a proteger a natureza, evitar poluição e orientar a comunidade escolar."
            />

            <div className="grid gap-4 md:grid-cols-3">
              {fontesConclusion.map((item) => (
                <article key={item.title} className="card-surface p-6">
                  <h3 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {fontesProjectInfo.map((item) => (
                <article key={item.label} className="card-surface p-5">
                  <strong className="section-label">{item.label}</strong>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{item.value}</p>
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
              label="Fontes usadas"
              title="As informações foram organizadas a partir de fontes públicas, acadêmicas e audiovisuais."
              description="As fontes reforçam a credibilidade do trabalho e ajudam a conectar estatísticas, legislação, educação ambiental e exemplos práticos."
            />

            <ResourceGrid resources={featuredResources} context="sources" dense />

            <div className="grid gap-4 lg:grid-cols-2">
              {uniqueSourcePanels.map((panel) => (
                <article key={panel.url} className="card-surface p-6">
                  <h3 className="font-display text-2xl font-semibold text-slate-950">{panel.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{panel.description}</p>
                  <a
                    href={panel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex text-sm font-semibold text-emerald-700"
                  >
                    {panel.cta}
                  </a>
                </article>
              ))}
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="section-label">Vídeos de apoio</p>
                <h3 className="font-display text-3xl font-semibold text-slate-950">
                  Os vídeos complementam a leitura com linguagem mais direta e acessível.
                </h3>
                <p className="text-sm leading-7 text-slate-600">
                  Além dos artigos e relatórios, o projeto também indica materiais em vídeo para ampliar a compreensão
                  do tema.
                </p>
              </div>

              <ResourceGrid resources={videoResources} context="sources" dense />
            </div>

            <p className="text-sm leading-7 text-slate-500">
              Materiais acadêmicos e audiovisuais consultados em {resources.consultedAtDisplay}; dados locais de
              ecopontos consultados em {ecopointsDoc.consultedAtDisplay}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
