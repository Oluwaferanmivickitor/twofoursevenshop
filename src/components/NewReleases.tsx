import { Link } from "@tanstack/react-router";
import { newReleases, outOfStock, formatNgn, formatEur, type Product } from "@/lib/products";

function ProductCard({ p, soldOut = false }: { p: Product; soldOut?: boolean }) {
  const inner = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] ${
            soldOut ? "opacity-60 grayscale" : ""
          }`}
        />
        {soldOut && (
          <span className="eyebrow absolute left-3 top-3 bg-background px-2 py-1 text-[0.6rem] text-foreground">
            Sold Out
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1.5">
        <h3 className="text-[0.8rem] font-normal tracking-wide text-foreground sm:text-sm">
          {p.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-[0.8rem] font-medium sm:text-sm ${soldOut ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {formatNgn(p.priceNgn)}
          </span>
          <span className="text-[0.7rem] text-muted-foreground sm:text-xs">
            / ~{formatEur(p.priceNgn)}
          </span>
        </div>
      </div>
    </>
  );

  if (soldOut) {
    return <div className="group cursor-not-allowed">{inner}</div>;
  }

  return (
    <Link to="/product/$slug" params={{ slug: p.slug }} className="group block">
      {inner}
    </Link>
  );
}

export function NewReleases() {
  return (
    <>
      <section
        aria-labelledby="new-releases-heading"
        className="px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mb-10 flex items-end justify-between sm:mb-16">
          <div>
            <p className="eyebrow text-muted-foreground">Drop 01 — Available Now</p>
            <h2
              id="new-releases-heading"
              className="mt-3 font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl"
            >
              New Releases
            </h2>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
          {newReleases.map((p) => (
            <li key={p.slug}>
              <ProductCard p={p} />
            </li>
          ))}
        </ul>
      </section>

      {outOfStock.length > 0 && (
        <section
          aria-labelledby="oos-heading"
          className="border-t border-border bg-secondary/40 px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="mb-10 flex items-end justify-between sm:mb-16">
            <div>
              <p className="eyebrow text-muted-foreground">Archive</p>
              <h2
                id="oos-heading"
                className="mt-3 font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl"
              >
                Out of Stock
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Previously released. Join the waitlist to be notified of restocks.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
            {outOfStock.map((p) => (
              <li key={p.slug}>
                <ProductCard p={p} soldOut />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
