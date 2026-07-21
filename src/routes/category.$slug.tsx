import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { formatEur, formatNgn, type Product } from "@/lib/products";
import { listProducts } from "@/lib/products.functions";

const CATEGORIES: Record<string, { name: string; blurb: string; aliases: string[] }> = {
  tees: {
    name: "Tees",
    blurb: "Heavyweight cotton, considered cuts.",
    aliases: ["tees", "tee", "t-shirt", "t-shirts", "tshirt", "tshirts"],
  },
  "t-shirts": {
    name: "T-Shirts",
    blurb: "Everyday silhouettes, refined.",
    aliases: ["tees", "tee", "t-shirt", "t-shirts", "tshirt", "tshirts"],
  },
  headwear: {
    name: "Headwear",
    blurb: "Camouflage knits and crowning pieces.",
    aliases: ["headwear", "hats", "beanie", "beanies", "cap", "caps"],
  },
  skirts: { name: "Skirts", blurb: "Tailored silhouettes for the season ahead.", aliases: ["skirt", "skirts"] },
  pants: { name: "Pants", blurb: "Trousers cut with intention.", aliases: ["pants", "trousers", "shorts"] },
  jorts: { name: "Jorts", blurb: "Denim, cropped — the 247 way.", aliases: ["jorts"] },
  jackets: { name: "Jackets", blurb: "Outerwear built for the long walk home.", aliases: ["jacket", "jackets", "outerwear"] },
  slides: { name: "Slides", blurb: "Footwear arriving with the next drop.", aliases: ["slides"] },
  shoes: { name: "Shoes", blurb: "Footwear arriving with the next drop.", aliases: ["shoes", "sneakers", "footwear"] },
};

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const cat = CATEGORIES[params.slug];
    if (!cat) throw notFound();
    const all = await listProducts();
    const products = all.filter((p) =>
      cat.aliases.includes(p.category.trim().toLowerCase()),
    );
    return { cat, products };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.cat.name ?? "Category"} — TWOFOURSEVEN` },
      {
        name: "description",
        content: loaderData?.cat.blurb ?? "TWOFOURSEVEN ready-to-wear category.",
      },
    ],
  }),
  component: CategoryPage,
  errorComponent: ({ error }) => (
    <PageLayout>
      <div className="px-5 py-32 text-center text-sm text-muted-foreground sm:px-8">{error.message}</div>
    </PageLayout>
  ),
  notFoundComponent: () => (
    <PageLayout>
      <div className="px-5 py-32 text-center sm:px-8">
        <h1 className="font-serif text-4xl font-light">Category not found</h1>
      </div>
    </PageLayout>
  ),
});

function Card({ p }: { p: Product }) {
  const soldOut = !p.inStock;
  const inner = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full max-w-full object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] ${
            soldOut ? "opacity-70" : ""
          }`}
        />
        {soldOut && (
          <span className="eyebrow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-foreground bg-background/90 px-4 py-2 text-[0.65rem] tracking-[0.25em]">
            Sold Out
          </span>
        )}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-sm font-normal tracking-wide text-foreground">{p.name}</h3>
        <p className="mt-1 text-xs">
          <span className={soldOut ? "text-muted-foreground line-through" : "text-foreground"}>
            {formatNgn(p.priceNgn)}
          </span>
          <span className="ml-2 text-muted-foreground">/ {formatEur(p.priceNgn)}</span>
        </p>
      </div>
    </>
  );
  if (soldOut) return <div className="group cursor-not-allowed">{inner}</div>;
  return (
    <Link to="/product/$slug" params={{ slug: p.slug }} className="group block">
      {inner}
    </Link>
  );
}

function CategoryPage() {
  const { cat, products } = Route.useLoaderData();
  const hasProducts = products.length > 0;

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
        <div className="mx-auto max-w-6xl">
          {hasProducts ? (
            <div className="grid grid-cols-2 gap-5 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p: Product) => (
                <Card key={p.slug} p={p} />
              ))}
            </div>
          ) : (
            <>
              <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[#f4f2ee] px-6 py-24 shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:min-h-[70vh] sm:py-40">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.35]"
                  style={{
                    backgroundImage:
                      "radial-gradient(1200px 600px at 30% 20%, rgba(0,0,0,0.06), transparent 60%), radial-gradient(900px 500px at 70% 80%, rgba(0,0,0,0.05), transparent 60%)",
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
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
