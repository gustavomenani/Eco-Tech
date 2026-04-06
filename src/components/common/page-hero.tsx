import Image from "next/image";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  actions?: React.ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  imageWidth = 640,
  imageHeight = 520,
  actions
}: PageHeroProps) {
  return (
    <section className="px-3 pt-3 md:px-6 md:pt-6">
      <div className="shell">
        <div className="hero-panel motion-rise grid items-center gap-8 overflow-hidden px-5 py-6 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:px-10 md:py-12">
          <div className="space-y-5 md:space-y-6">
            <div className="eyebrow">{eyebrow}</div>
            <div className="space-y-3 md:space-y-4">
              <h1 className="font-display text-[2.6rem] font-semibold leading-[0.95] text-balance text-slate-950 md:text-6xl md:leading-tight">
                {title}
              </h1>
              <p className="max-w-2xl text-[1.02rem] leading-7 text-pretty text-slate-600 md:text-lg md:leading-8">{description}</p>
            </div>
            {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">{actions}</div> : null}
          </div>

          <div className="hero-visual relative">
            <div className="absolute inset-0 -translate-x-4 translate-y-4 rounded-[36px] bg-emerald-200/45 blur-3xl" />
            <div className="relative rounded-[28px] border border-white/70 bg-white/70 p-3 shadow-2xl md:rounded-[36px] md:p-4">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={imageWidth}
                height={imageHeight}
                className="h-auto w-full rounded-[28px]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
