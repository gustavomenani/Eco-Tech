import Image from "next/image";
import type { ResourceItem } from "@/lib/types";

type ResourceGridProps = {
  resources: ResourceItem[];
  context: "home" | "sources";
  dense?: boolean;
};

export function ResourceGrid({ resources, context, dense = false }: ResourceGridProps) {
  return (
    <div className={`stagger-grid grid gap-4 md:gap-6 ${dense ? "md:grid-cols-2" : "lg:grid-cols-2 xl:grid-cols-4"}`}>
      {resources.map((resource) => {
        const content = resource[context];

        return (
          <article
            key={resource.id}
            className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_72px_rgba(15,23,42,0.12)]"
          >
            <div className="relative overflow-hidden border-b border-slate-100 bg-slate-50">
              <Image
                src={`/${resource.media.src}`}
                alt={resource.media.alt}
                width={resource.media.width}
                height={resource.media.height}
                className="h-auto w-full transition duration-300 group-hover:scale-[1.02]"
              />
              <span className="absolute left-3 top-3 rounded-full bg-slate-950/85 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white md:left-4 md:top-4 md:text-xs md:tracking-[0.18em]">
                {resource.media.label}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
              <div className="space-y-2.5 md:space-y-3">
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {content.badge}
                </span>
                <h3 className="font-display text-xl font-semibold leading-[1.08] text-balance text-slate-950 md:text-2xl md:leading-tight">{content.title}</h3>
                <p className="text-sm font-semibold leading-6 text-sky-700">{content.kicker}</p>
                {content.description ? <p className="text-sm leading-7 text-pretty text-slate-600">{content.description}</p> : null}
              </div>

              <div className="mt-auto">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary inline-flex w-full sm:w-auto"
                >
                  {resource.cta}
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
