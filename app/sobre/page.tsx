import Image from "next/image";
import { JsonLd } from "@/components/common/json-ld";
import { PageHero } from "@/components/common/page-hero";
import { SectionHeading } from "@/components/common/section-heading";
import { sobreAcademicStats, sobreCards, sobreImpacts, sobreNotes } from "@/content/page-content";
import { getResourcesByIds } from "@/lib/data";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata("/sobre");

export default function SobrePage() {
  const [impactResource, socialResource] = getResourcesByIds(["oswaldo-cruz", "perspectivas-fatece"]);

  return (
    <>
      <JsonLd data={buildPageJsonLd("/sobre")} />

      <PageHero
        eyebrow="Sobre o tema"
        title="O que é lixo eletrônico e por que ele preocupa?"
        description="Compreender o problema é o primeiro passo para rever hábitos, reduzir riscos e proteger o meio ambiente."
        imageSrc="/assets/hero-ewaste.svg"
        imageAlt="Ilustração sobre equipamentos eletrônicos e reciclagem"
      />

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="section-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="O que é lixo eletrônico"
              title="É todo aparelho ou acessório eletrônico que chegou ao fim do seu uso."
              description="Isso inclui materiais pequenos e grandes do cotidiano, desde pilhas até computadores."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {sobreCards.map((item) => (
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
              label="Impactos"
              title="O descarte incorreto prejudica o ambiente, a água e a saúde."
              description="Quando resíduos eletrônicos são jogados em terrenos, rios ou lixo comum, eles podem liberar substâncias tóxicas e desperdiçar materiais valiosos."
            />

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="space-y-4">
                <div className="card-surface p-6">
                  <h3 className="font-display text-3xl font-semibold text-slate-950">
                    O problema não é só visual. Ele também é químico, econômico e social.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Além da poluição direta, o descarte incorreto impede reciclagem, reaproveitamento e logística
                    reversa, agravando o impacto ambiental.
                  </p>
                </div>
                <div className="card-surface p-4">
                  <Image
                    src="/assets/collection-point.svg"
                    alt="Ilustração sobre descarte inadequado e impacto ambiental"
                    width={600}
                    height={460}
                    className="h-auto w-full rounded-[24px]"
                  />
                </div>
              </article>

              <div className="grid gap-4">
                {sobreImpacts.map((item) => (
                  <article key={item.title} className="card-surface p-6">
                    <h3 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="section-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Base acadêmica"
              title="Os estudos usados no projeto mostram que o problema é amplo, mensurável e atual."
              description="Além da poluição visível, a literatura destaca baixa destinação correta, alto potencial de reciclagem desperdiçado e riscos químicos relevantes."
            />

            <div className="grid gap-4 md:grid-cols-3">
              {sobreAcademicStats.map((item) => (
                <article key={item.value} className="card-surface p-6">
                  <strong className="font-display text-4xl font-semibold text-slate-950">{item.value}</strong>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>

            <div className="rounded-[28px] bg-slate-950 px-6 py-5 text-sm leading-7 text-slate-200">
              <strong className="text-white">O alerta principal dos artigos:</strong> metais pesados, gases, PVC,
              retardantes de chama e outros componentes podem atingir solo, água, ar e saúde humana quando o descarte
              é feito de maneira incorreta.
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="card-surface p-6">
                <span className="section-label">Artigo-base 01</span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-slate-950">
                  Revisão usada para sustentar os impactos ambientais
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O material da Revista Acadêmica Oswaldo Cruz reforça a relação entre lixo eletrônico, contaminação
                  por componentes tóxicos e necessidade de logística reversa.
                </p>
                <a
                  href={impactResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex text-sm font-semibold text-emerald-700"
                >
                  Abrir artigo da Revista Acadêmica Oswaldo Cruz
                </a>
              </article>

              <article className="card-surface p-6">
                <span className="section-label">Artigo-base 02</span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-slate-950">
                  Estudo que amplia a leitura social e educativa do tema
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O artigo da revista Perspectivas em Ciências Tecnológicas reforça que o problema também envolve
                  informação, educação, triagem e participação da sociedade.
                </p>
                <a
                  href={socialResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex text-sm font-semibold text-emerald-700"
                >
                  Abrir artigo da revista Perspectivas
                </a>
              </article>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {sobreNotes.map((item) => (
                <article key={item.title} className="card-surface p-6">
                  <h3 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
