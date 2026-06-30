type Section = { heading: string; body: string };

export function PolicyPage({
  eyebrow,
  title,
  sections,
}: {
  eyebrow: string;
  title: string;
  sections: Section[];
}) {
  return (
    <>
      <section className="px-5 pt-24 pb-10 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-7xl">
            {title}
          </h1>
        </div>
      </section>
      <section className="px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="mx-auto max-w-4xl divide-y divide-border border-y border-border">
          {sections.map((s) => (
            <article
              key={s.heading}
              className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[240px_1fr] md:gap-12"
            >
              <h2 className="font-serif text-2xl font-light text-foreground">
                {s.heading}
              </h2>
              <p className="max-w-prose text-base leading-relaxed text-foreground/80">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
