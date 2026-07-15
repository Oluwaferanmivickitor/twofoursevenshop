import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { formatEur, formatNgn, type Product } from "@/lib/products";
import { listProducts } from "@/lib/products.functions";

export const Route = createFileRoute("/shop")({
  loader: () => listProducts(),
  head: () => ({
    meta: [
      { title: "Shop — TWOFOURSEVEN" },
      {
        name: "description",
        content: "Shop the full TWOFOURSEVEN collection — tees, headwear, and more.",
      },
      { property: "og:title", content: "Shop — TWOFOURSEVEN" },
      {
        property: "og:description",
        content: "Shop the full TWOFOURSEVEN collection — tees, headwear, and more.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Not found.</div>
  ),
  component: ShopPage,
});

const categories: { label: string; slug: string }[] = [
  { label: "Tees", slug: "tees" },
  { label: "T-Shirts", slug: "t-shirts" },
  { label: "Headwear", slug: "headwear" },
  { label: "Skirts", slug: "skirts" },
  { label: "Pants", slug: "pants" },
  { label: "Jorts", slug: "jorts" },
  { label: "Jackets", slug: "jackets" },
  { label: "Slides", slug: "slides" },
  { label: "Shoes", slug: "shoes" },
];

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

function ShopPage() {
  const all = Route.useLoaderData();
  return (
    <PageLayout>
      <section className="px-5 pt-24 pb-10 text-center sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-muted-foreground">Shop</p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-7xl">
            The Collection
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Considered pieces released in limited quantities. Browse by category or explore
            every available piece below.
          </p>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="eyebrow border border-border px-4 py-2 text-foreground transition-colors hover:border-foreground"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="eyebrow text-muted-foreground">All Pieces</p>
            <h2 className="mt-3 font-serif text-3xl font-light text-foreground sm:text-4xl">
              Available Now
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
            {all.map((p: Product) => (
              <Card key={p.slug} p={p} />
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
