import { JsonLd } from "@/components/common/json-ld";
import { PageHero } from "@/components/common/page-hero";
import { SectionHeading } from "@/components/common/section-heading";
import { solucoesCards, solucoesDeepDive, solucoesSteps } from "@/content/page-content";
import { getResourcesByIds } from "@/lib/data";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata("/solucoes");

export default function SolucoesPage() {
  const [solutionsResource, momentoAmbientalVideo, tvSenadoVideo] = getResourcesByIds([
    "perspectivas-fatece",
    "momento-ambiental",
    "tv-senado"
  ]);

  return (
    <>
      <JsonLd data={buildPageJsonLd("/solucoes")} />

      <PageHero
        eyebrow="Soluções e atitudes"
        title="Como descartar corretamente e como qualquer pessoa pode ajudar."
        description="Reciclar, reutilizar, separar e doar são medidas simples que produzem efeito concreto. O EcoTech organiza essas ações de forma clara para apresentação escolar."
        imageSrc="/assets/eco-cycle.svg"
        imageAlt="Ilustração sobre reciclagem, reutilização e soluções sustentáveis"
      />

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="section-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Formas de descarte correto"
              title="Existem caminhos simples para evitar o descarte incorreto."
              description="O mais importante é nunca misturar eletrônicos com o lixo comum e sempre procurar o destino certo."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {solucoesCards.map((item) => (
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
              label="Como qualquer pessoa pode ajudar"
              title="Medidas simples já produzem efeito relevante."
              description="A mudança começa com hábitos simples dentro de casa e continua com separação, reaproveitamento e descarte consciente."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              {solucoesSteps.map((item, index) => (
                <article key={item.title} className="card-surface p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
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
              label="Antes e depois do descarte"
              title="O destino do resíduo muda completamente o resultado."
              description="A comparação abaixo ajuda a entender de forma visual como o descarte correto altera o impacto final."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-[30px] border border-rose-200 bg-rose-50 px-6 py-8">
                <span className="section-label text-rose-700">Antes</span>
                <h3 className="mt-4 font-display text-3xl font-semibold text-slate-950">
                  Lixo eletrônico no lixo comum
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O material fica misturado, atrapalha a reciclagem e pode causar contaminação no ambiente.
                </p>
              </article>

              <article className="rounded-[30px] border border-emerald-200 bg-emerald-50 px-6 py-8">
                <span className="section-label">Depois</span>
                <h3 className="mt-4 font-display text-3xl font-semibold text-slate-950">
                  Lixo eletrônico em ecopontos
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O resíduo é separado, tratado corretamente e pode ser encaminhado para reciclagem ou reaproveitamento.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6">
        <div className="shell">
          <div className="hero-panel space-y-8 px-6 py-8 md:px-10 md:py-10">
            <SectionHeading
              label="Soluções com mais profundidade"
              title="A coleta é só o começo: triagem, manutenção, reuso e doação também fazem parte da solução."
              description="Os materiais acadêmicos usados no projeto mostram que uma estratégia forte combina educação ambiental, logística reversa e aproveitamento responsável dos equipamentos."
            />

            <div className="grid gap-4 md:grid-cols-3">
              {solucoesDeepDive.map((item) => (
                <article key={item.title} className="card-surface p-6">
                  <h3 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>

            <div className="rounded-[28px] bg-slate-950 px-6 py-5 text-sm leading-7 text-slate-200">
              <strong className="text-white">TI Verde e educação:</strong> sustentabilidade em tecnologia depende tanto
              de sistemas de coleta quanto de mudança de hábito, formação crítica e redução do consumo descartável.
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="card-surface p-6">
                <span className="section-label">Solução aplicada</span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-slate-950">
                  Triagem, conserto e reuso aparecem como solução real
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O artigo da revista Perspectivas mostra que parte dos equipamentos pode ser separada, recuperada e
                  devolvida ao uso por meio de doação e aproveitamento social.
                </p>
                <a
                  href={solutionsResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex text-sm font-semibold text-emerald-700"
                >
                  Abrir artigo sobre triagem e reaproveitamento
                </a>
              </article>

              <article className="card-surface p-6">
                <span className="section-label">Política e consumo</span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-slate-950">
                  Os vídeos complementam a explicação com linguagem de apresentação
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O vídeo da TV Senado e o material do Momento Ambiental conectam indústria, legislação, hábitos de
                  consumo e conscientização em linguagem direta para o público escolar.
                </p>
                <div className="mt-5 flex flex-wrap gap-4">
                  <a
                    href={tvSenadoVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-emerald-700"
                  >
                    Abrir vídeo da TV Senado
                  </a>
                  <a
                    href={momentoAmbientalVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-emerald-700"
                  >
                    Abrir vídeo Momento Ambiental
                  </a>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
