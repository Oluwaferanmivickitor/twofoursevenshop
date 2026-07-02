import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

const CATEGORIES: Record<string, { name: string; blurb: string }> = {
  tees: { name: "Tees", blurb: "Heavyweight cotton, considered cuts." },
  "t-shirts": { name: "T-Shirts", blurb: "Everyday silhouettes, refined." },
  headwear: { name: "Headwear", blurb: "Camouflage knits and crowning pieces." },
  skirts: { name: "Skirts", blurb: "Tailored silhouettes for the season ahead." },
  pants: { name: "Pants", blurb: "Trousers cut with intention." },
  jorts: { name: "Jorts", blurb: "Denim, cropped — the 247 way." },
  jackets: { name: "Jackets", blurb: "Outerwear built for the long walk home." },
  slides: { name: "Slides", blurb: "Footwear arriving with the next drop." },
  shoes: { name: "Shoes", blurb: "Footwear arriving with the next drop." },
};

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES[params.slug];
    if (!cat) throw notFound();
    return cat;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Category"} — TWOFOURSEVEN` },
      {
        name: "description",
        content: loaderData?.blurb ?? "TWOFOURSEVEN ready-to-wear category.",
      },
    ],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <PageLayout>
      <div className="px-5 py-32 text-center sm:px-8">
        <h1 className="font-serif text-4xl font-light">Category not found</h1>
      </div>
    </PageLayout>
  ),
});

function CategoryPage() {
  const cat = Route.useLoaderData();
  return (
    <PageLayout>
      <section className="px-5 pt-24 pb-16 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow text-muted-foreground">Collection</p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-7xl">
            {cat.name}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm text-foreground/60">{cat.blurb}</p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="mx-auto max-w-5xl">
          <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[#f4f2ee] px-6 py-24 shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:min-h-[70vh] sm:py-40">
            {/* Paper texture wash */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(1200px 600px at 30% 20%, rgba(0,0,0,0.06), transparent 60%), radial-gradient(900px 500px at 70% 80%, rgba(0,0,0,0.05), transparent 60%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.06), transparent)",
              }}
            />
            <div className="relative text-center">
              <h2 className="font-sans text-5xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-7xl md:text-8xl">
                Under
                <br />
                Production
              </h2>
              <p className="mx-auto mt-10 max-w-sm text-xs uppercase tracking-[0.3em] text-black/60">
                The {cat.name} collection is in atelier. Join the waitlist to be notified at first drop.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <Link
              to="/shop"
              className="eyebrow border border-foreground px-8 py-3 text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Explore Available Pieces
            </Link>
            <Link to="/" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
