type SectionHeadingProps = {
  label: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({ label, title, description, align = "left" }: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";

  return (
    <div className={`space-y-3 md:space-y-4 ${alignment}`}>
      <p className="section-label">{label}</p>
      <h2 className="font-display text-[1.95rem] font-semibold leading-[1.03] text-balance text-slate-950 md:text-5xl md:leading-tight">{title}</h2>
      <p className="text-[1.02rem] leading-7 text-pretty text-slate-600 md:text-lg md:leading-8">{description}</p>
    </div>
  );
}
