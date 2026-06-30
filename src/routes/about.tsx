import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The 247 Narrative — TWOFOURSEVEN" },
      {
        name: "description",
        content:
          "The 247 Narrative — a philosophy of differentiation, the meaning of 247, and the power of scarcity.",
      },
      { property: "og:title", content: "The 247 Narrative — TWOFOURSEVEN" },
      {
        property: "og:description",
        content:
          "True luxury is defined by distinction. Read the philosophy behind 247.",
      },
    ],
  }),
  component: AboutPage,
});

const sections = [
  {
    eyebrow: "I.",
    title: "The Philosophy of Differentiation",
    body: "True luxury is defined by distinction, not ubiquity. At 247, we reject the noise of passing trends. We design with intent, crafting pieces that are impossible to overlook. Our work is not for the masses; it is for those who prize originality over convenience.",
  },
  {
    eyebrow: "II.",
    title: "The Meaning of 247",
    body: "We operate under a simple, relentless premise: constant availability for the craft. 247 is the intersection of unwavering dedication and non-stop artistic output. It is our commitment to being always on.",
  },
  {
    eyebrow: "III.",
    title: "The Power of Scarcity",
    body: "We do not seek to be worn by everyone. We create for the few who recognize the value of the unique, while inviting the many to aspire to the standard we set. For 247, scarcity is not a marketing tactic; it is our identity. We build for those who prefer to stand apart, not blend in.",
  },
];

function AboutPage() {
  return (
    <PageLayout>
      <section className="px-5 pt-24 pb-10 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-muted-foreground">About the Brand</p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-7xl">
            The 247 Narrative
          </h1>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="mx-auto max-w-4xl divide-y divide-border">
          {sections.map((s) => (
            <article
              key={s.title}
              className="grid grid-cols-1 gap-6 py-12 md:grid-cols-[80px_1fr] md:gap-12 md:py-16"
            >
              <p className="eyebrow text-muted-foreground">{s.eyebrow}</p>
              <div>
                <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl">
                  {s.title}
                </h2>
                <p className="mt-6 max-w-prose text-base leading-relaxed text-foreground/80 sm:text-lg">
                  {s.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
