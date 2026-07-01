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
      <section className="px-5 pt-24 pb-32 sm:px-8 sm:pt-40 sm:pb-48">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-muted-foreground">Shop</p>
          <h1 className="mt-5 font-serif text-6xl font-light leading-[1.05] text-foreground sm:text-8xl">
            {cat.name}
          </h1>
          <p className="mt-8 text-base text-foreground/70">{cat.blurb}</p>

          <div className="mx-auto mt-16 max-w-md border-y border-border py-12">
            <p className="eyebrow text-muted-foreground">Coming Soon</p>
            <p className="mt-4 text-sm text-foreground/60">
              This collection is in production. Join our newsletter to be notified at first drop.
            </p>
            <Link
              to="/"
              className="eyebrow mt-10 inline-block border border-foreground px-8 py-3 text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Return to Shop
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
