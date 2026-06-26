import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { newReleases, outOfStock, formatNgn, formatEur, type Product } from "@/lib/products";

const allProducts: Product[] = [...newReleases, ...outOfStock];

const findProduct = (slug: string) => allProducts.find((p) => p.slug === slug);
const beanieProduct = findProduct("247-beanie");
const weDifferentProduct = findProduct("we-different-tee");
const moneyGangProduct = findProduct("money-gang-tee");

function PriceLine({ p, soldOut }: { p: Product; soldOut: boolean }) {
  return (
    <div className="mt-4 space-y-1.5">
      <h3 className="text-[0.8rem] font-normal tracking-wide text-foreground sm:text-sm">
        {p.name}
      </h3>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-[0.8rem] font-medium sm:text-sm ${
            soldOut ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {formatNgn(p.priceNgn)}
        </span>
        <span className="text-[0.7rem] text-muted-foreground sm:text-xs">
          / ~{formatEur(p.priceNgn)}
        </span>
      </div>
    </div>
  );
}

function ShopCard({
  p,
  fill = false,
}: {
  p: Product;
  fill?: boolean;
}) {
  const soldOut = !p.inStock;
  const imageWrapClass = fill
    ? "relative h-full min-h-0 flex-1 overflow-hidden bg-secondary"
    : "relative aspect-[3/4] overflow-hidden bg-secondary";

  const inner = (
    <div className="flex h-full flex-col">
      <div className={imageWrapClass}>
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] ${
            soldOut ? "opacity-70" : ""
          }`}
        />
        {soldOut && (
          <>
            <div className="absolute inset-0 bg-background/10" />
            <span className="eyebrow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-foreground bg-background/90 px-4 py-2 text-[0.65rem] tracking-[0.25em] text-foreground">
              Sold Out
            </span>
          </>
        )}
      </div>
      <PriceLine p={p} soldOut={soldOut} />
    </div>
  );

  if (soldOut) {
    return <div className="group h-full cursor-not-allowed">{inner}</div>;
  }
  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className="group block h-full"
    >
      {inner}
    </Link>
  );
}

function ProductCard({ p, soldOut = false }: { p: Product; soldOut?: boolean }) {
  const inner = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] ${
            soldOut ? "opacity-70" : ""
          }`}
        />
        {soldOut && (
          <>
            <div className="absolute inset-0 bg-background/10" />
            <span className="eyebrow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-foreground bg-background/90 px-4 py-2 text-[0.65rem] tracking-[0.25em] text-foreground">
              Sold Out
            </span>
          </>
        )}
      </div>
      <div className="mt-4 space-y-1.5">
        <h3 className="text-[0.8rem] font-normal tracking-wide text-foreground sm:text-sm">
          {p.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-[0.8rem] font-medium sm:text-sm ${
              soldOut ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
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

function HorizontalRail({
  items,
  soldOut = false,
  idPrefix,
}: {
  items: Product[];
  soldOut?: boolean;
  idPrefix: string;
}) {
  const railRef = useRef<HTMLUListElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("li");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={railRef}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:gap-6 sm:px-8"
      >
        {items.map((p) => (
          <li
            key={`${idPrefix}-${p.slug}`}
            className="w-[64%] shrink-0 snap-start sm:w-[40%] lg:w-[24%]"
          >
            <ProductCard p={p} soldOut={soldOut} />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="grid h-10 w-10 place-items-center border border-border text-foreground transition-colors hover:border-foreground"
        >
          <ChevronLeft strokeWidth={1.25} className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="grid h-10 w-10 place-items-center border border-border text-foreground transition-colors hover:border-foreground"
        >
          <ChevronRight strokeWidth={1.25} className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function NewReleases() {
  return (
    <>
      {/* Shop — static 3-column grid */}
      <section id="shop" aria-labelledby="shop-heading" className="border-t border-border">
        <div className="px-5 pt-16 sm:px-8 sm:pt-24">
          <p className="eyebrow text-muted-foreground">Shop</p>
          <h2
            id="shop-heading"
            className="mt-3 font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl"
          >
            All Pieces
          </h2>
        </div>

        <div className="px-5 pt-10 pb-16 sm:px-8 sm:pt-14 sm:pb-24">
          <div className="grid grid-cols-2 items-stretch gap-4 sm:gap-6 lg:gap-8">
            {/* Left — large dominant item */}
            <div className="h-full">
              {beanieProduct && <ShopCard p={beanieProduct} fill />}
            </div>
            {/* Right — two stacked items */}
            <div className="flex h-full flex-col gap-4 sm:gap-6 lg:gap-8">
              {weDifferentProduct && (
                <div className="flex-1">
                  <ShopCard p={weDifferentProduct} />
                </div>
              )}
              {moneyGangProduct && (
                <div className="flex-1">
                  <ShopCard p={moneyGangProduct} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* New Releases — horizontal scroll */}
      <section
        aria-labelledby="new-releases-heading"
        className="border-t border-border px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mb-10 sm:mb-14">
          <p className="eyebrow text-muted-foreground">Drop 01 — Available Now</p>
          <h2
            id="new-releases-heading"
            className="mt-3 font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl"
          >
            New Releases
          </h2>
        </div>
        <HorizontalRail items={newReleases} idPrefix="nr" />
      </section>

      {/* Out of Stock — horizontal scroll */}
      {outOfStock.length > 0 && (
        <section
          aria-labelledby="oos-heading"
          className="border-t border-border bg-secondary/40 px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="mb-10 sm:mb-14">
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
          <HorizontalRail items={outOfStock} soldOut idPrefix="oos" />
        </section>
      )}

      {/* Featured Collection — placeholder */}
      <section
        aria-labelledby="featured-heading"
        className="border-t border-border px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mb-10 sm:mb-14">
          <p className="eyebrow text-muted-foreground">Editorial</p>
          <h2
            id="featured-heading"
            className="mt-3 font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl"
          >
            Featured Collection
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Campaign imagery coming soon.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="aspect-[4/5] w-full border border-dashed border-border bg-secondary/40"
            />
          ))}
        </div>
      </section>
    </>
  );
}
