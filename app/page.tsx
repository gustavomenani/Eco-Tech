import Link from "next/link";
import { JsonLd } from "@/components/common/json-ld";
import { PageHero } from "@/components/common/page-hero";
import { SectionHeading } from "@/components/common/section-heading";
import { SiteQrPanel } from "@/components/common/site-qr-panel";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { homeMetrics, homeSections, homeStats, homeSteps } from "@/content/page-content";
import { getResourcesByIds, getResourcesDocument } from "@/lib/data";
import { buildPageJsonLd, buildPageMetadata, resolveSiteUrl } from "@/lib/site";

export const metadata = buildPageMetadata("/");

export default function HomePage() {
  const resources = getResourcesDocument();
  const spotlightResources = getResourcesByIds(resources.homeSpotlightIds);
  const featuredResources = getResourcesByIds(resources.homeResourceIds);
  const spotlightIds = new Set(resources.homeSpotlightIds);
  const secondaryFeaturedResources = featuredResources.filter((resource) => !spotlightIds.has(resource.id));
  const fallbackSiteUrl = resolveSiteUrl().toString();

  return (
    <>
      <JsonLd data={buildPageJsonLd("/")} />

      <PageHero
        eyebrow="Projeto escolar de conscientização ambiental"
        title="EcoTech: tecnologia consciente também cuida do planeta."
        description="O projeto EcoTech explica o que é lixo eletrônico, por que ele representa um problema ambiental e como a população pode agir. O site organiza o conteúdo para leitura rápida no celular e para uma apresentação mais consistente no contexto escolar."
        imageSrc="/assets/hero-ewaste.svg"
        imageAlt="Ilustração sobre reciclagem de eletrônicos, tecnologia e meio ambiente"
        actions={
          <>
            <Link href="/ecopontos" className="button-primary">
              Ver os ecopontos
            </Link>
            <Link href="/sobre" className="button-secondary">
              Entender o tema
            </Link>
          </>
        }
      />

      <SiteQrPanel fallbackUrl={fallbackSiteUrl} />

      <section className="px-4 md:px-6">
        <div className="shell stagger-grid grid gap-4 md:grid-cols-3">
          {homeMetrics.map((item) => (
            <article key={item.title} className="card-surface p-6">
              <h2 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="section-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Navegação do projeto"
              title="O conteúdo foi organizado em páginas para tornar a navegação clara, objetiva e funcional."
              description="Cada rota concentra uma parte do EcoTech com leitura direta para alunos, professores e visitantes que acessarem o QR code."
            />

            <div className="stagger-grid grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {homeSections.map((item) => (
                <article key={item.title} className="card-surface p-5">
                  <h3 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                  <Link href={item.href} className="mt-5 inline-flex text-sm font-semibold text-emerald-700">
                    Abrir página
                  </Link>
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
              label="Destaque visual"
              title="O lixo eletrônico é um problema real e crescente."
              description="Por isso, a conscientização precisa ser clara, visual e aplicável. O projeto combina estatística, orientação local e linguagem acessível."
            />

            <div className="stagger-grid grid gap-4 md:grid-cols-3">
              {homeStats.map((item) => (
                <article key={item.value} className="rounded-[28px] bg-slate-950 px-5 py-6 text-white shadow-xl">
                  <strong className="font-display text-4xl font-semibold">{item.value}</strong>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{item.text}</p>
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
              label="Como descartar"
              title="Em três passos, qualquer pessoa já consegue descartar de forma mais adequada."
              description="A proposta do EcoTech é transformar um tema técnico em uma ação simples, prática e aplicável à rotina."
            />

            <div className="stagger-grid grid gap-4 lg:grid-cols-3">
              {homeSteps.map((item, index) => (
                <article key={item.title} className="card-surface p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>

            <div className="card-surface motion-rise flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <strong className="font-display text-2xl font-semibold text-slate-950">
                  Quer transformar isso em ação agora?
                </strong>
                <p className="text-sm leading-7 text-slate-600">
                  Abra a página de ecopontos, filtre pelo material e identifique o ponto mais adequado para o seu
                  descarte.
                </p>
              </div>
              <Link href="/ecopontos" className="button-primary">
                Ir para os ecopontos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="section-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Materiais em destaque"
              title="Os artigos e vídeos compõem a base de referência da apresentação do projeto."
              description="Esses materiais sustentam o trabalho com base acadêmica, exemplos reais e linguagem acessível para explicar o tema em sala."
            />

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <article className="hero-panel space-y-6 px-6 py-6">
                <div className="eyebrow">Leitura principal</div>
                <h3 className="font-display text-3xl font-semibold text-slate-950">
                  Comece pelos artigos que oferecem maior sustentação acadêmica ao projeto.
                </h3>
                <p className="text-sm leading-7 text-slate-600">
                  Eles concentram os principais argumentos sobre impacto ambiental, logística reversa, triagem, reuso e
                  responsabilidade compartilhada.
                </p>
                <ResourceGrid resources={spotlightResources} context="home" dense />
              </article>

              <div className="grid gap-4">
                {secondaryFeaturedResources.map((resource) => (
                  <article key={resource.id} className="card-surface p-5">
                    <span className="section-label">{resource.home.badge}</span>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-slate-950">{resource.home.title}</h3>
                    <p className="mt-2 text-sm font-semibold text-sky-700">{resource.home.kicker}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{resource.home.description}</p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex text-sm font-semibold text-emerald-700"
                    >
                      {resource.cta}
                    </a>
                  </article>
                ))}
              </div>
            </div>

            <p className="text-sm leading-7 text-slate-500">
              Todos os materiais também estão organizados na página de{" "}
              <Link href="/fontes" className="font-semibold text-emerald-700">
                fontes e referências
              </Link>
              , com contexto sobre como cada um foi usado no projeto.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
