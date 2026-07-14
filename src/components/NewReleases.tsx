import { Link } from "@tanstack/react-router";
import { newReleases, outOfStock, formatNgn, formatEur, type Product } from "@/lib/products";

type ShopTile = {
  key: string;
  product: Product;
  displayName: string;
  image: string;
  colorParam?: string;
  soldOut?: boolean;
};

const findProduct = (slug: string) =>
  [...newReleases, ...outOfStock].find((p) => p.slug === slug);

const weDifferent = findProduct("we-different-tee");
const moneyGangBlack = findProduct("money-gang-tee");
const moneyGangWhite = findProduct("money-gang-white-tee");

// --- New Releases: latest drops (max 4) ---
const newReleaseTiles: ShopTile[] = [
  weDifferent && {
    key: "wd-black",
    product: weDifferent,
    displayName: "WE DIFFERENT TEE — BLACK",
    image: weDifferent.colors?.[0]?.images[0] ?? weDifferent.image,
    colorParam: "Black",
  },
  weDifferent && {
    key: "wd-white",
    product: weDifferent,
    displayName: "WE DIFFERENT TEE — WHITE",
    image: weDifferent.colors?.[1]?.images[0] ?? weDifferent.image,
    colorParam: "White",
  },
  moneyGangBlack && {
    key: "mg-black",
    product: moneyGangBlack,
    displayName: "MONEY GANG TEE — BLACK",
    image: moneyGangBlack.image,
  },
  moneyGangWhite && {
    key: "mg-white",
    product: moneyGangWhite,
    displayName: "MONEY GANG TEE — WHITE",
    image: moneyGangWhite.image,
  },
].filter(Boolean) as ShopTile[];

// --- Featured Collection: editorial picks (max 4) ---
const featuredTiles: ShopTile[] = [
  moneyGangWhite && {
    key: "feat-mg-white",
    product: moneyGangWhite,
    displayName: "MONEY GANG — IVORY",
    image: moneyGangWhite.gallery?.[1] ?? moneyGangWhite.image,
  },
  weDifferent && {
    key: "feat-wd-back",
    product: weDifferent,
    displayName: "WE DIFFERENT — REVERSE",
    image: weDifferent.colors?.[0]?.images[1] ?? weDifferent.image,
    colorParam: "Black",
  },
  moneyGangBlack && {
    key: "feat-mg-back",
    product: moneyGangBlack,
    displayName: "MONEY GANG — 247 STAR",
    image: moneyGangBlack.gallery?.[1] ?? moneyGangBlack.image,
  },
  weDifferent && {
    key: "feat-wd-white-back",
    product: weDifferent,
    displayName: "WE DIFFERENT — IVORY REVERSE",
    image: weDifferent.colors?.[1]?.images[1] ?? weDifferent.image,
    colorParam: "White",
  },
].filter(Boolean) as ShopTile[];

// --- Out of Stock / Archive (max 4) ---
const outOfStockTiles: ShopTile[] = outOfStock.slice(0, 4).map((p) => ({
  key: `oos-${p.slug}`,
  product: p,
  displayName: p.name,
  image: p.image,
  soldOut: true,
}));

type SectionProps = {
  id: string;
  eyebrow: string;
  heading: string;
  copy: string;
  tiles: ShopTile[];
  ctaLabel?: string;
  border?: boolean;
};

function TileGrid({ tiles }: { tiles: ShopTile[] }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
      {tiles.map((tile) => {
        const inner = (
          <>
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
              <img
                src={tile.image}
                alt={tile.displayName}
                loading="lazy"
                className={`h-full w-full max-w-full object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] ${
                  tile.soldOut ? "opacity-70" : ""
                }`}
              />
              {tile.soldOut && (
                <span className="eyebrow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-foreground bg-background/90 px-4 py-2 text-[0.65rem] tracking-[0.25em]">
                  Sold Out
                </span>
              )}
            </div>
            <div className="mt-4 space-y-1.5 text-center">
              <h3 className="text-[0.8rem] font-normal tracking-wide text-foreground sm:text-sm">
                {tile.displayName}
              </h3>
              <div className="flex items-baseline justify-center gap-2">
                <span
                  className={`text-[0.8rem] font-medium sm:text-sm ${
                    tile.soldOut ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {formatNgn(tile.product.priceNgn)}
                </span>
                <span className="text-[0.7rem] text-muted-foreground sm:text-xs">
                  / {formatEur(tile.product.priceNgn)}
                </span>
              </div>
            </div>
          </>
        );
        if (tile.soldOut) {
          return (
            <div key={tile.key} className="group cursor-not-allowed">
              {inner}
            </div>
          );
        }
        return (
          <Link
            key={tile.key}
            to="/product/$slug"
            params={{ slug: tile.product.slug }}
            search={tile.colorParam ? { color: tile.colorParam } : undefined}
            className="group block"
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

function Section({ id, eyebrow, heading, copy, tiles, ctaLabel = "View All", border }: SectionProps) {
  if (tiles.length === 0) return null;
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={border ? "border-t border-border" : undefined}
    >
      <div className="px-5 pt-16 text-center sm:px-8 sm:pt-24">
        <p className="eyebrow text-muted-foreground">{eyebrow}</p>
        <h2
          id={`${id}-heading`}
          className="mt-3 font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl"
        >
          {heading}
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {copy}
        </p>
      </div>

      <div className="px-5 pt-10 pb-16 sm:px-8 sm:pt-14 sm:pb-20">
        <TileGrid tiles={tiles} />

        <div className="mt-14 flex justify-center">
          <Link
            to="/shop"
            className="eyebrow border border-foreground px-8 py-4 text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function NewReleases() {
  return (
    <>
      <Section
        id="new-releases"
        eyebrow="Just Landed"
        heading="New Releases"
        copy="The latest drop from the current season. Limited quantities, considered pieces."
        tiles={newReleaseTiles}
        ctaLabel="Shop New Releases"
        border
      />

      <Section
        id="featured"
        eyebrow="Editor's Selection"
        heading="Featured Collection"
        copy="A curated look at signature pieces and archival details from the current release."
        tiles={featuredTiles}
        ctaLabel="Explore The Shop"
        border
      />

      <Section
        id="archive"
        eyebrow="The Archive"
        heading="Out of Stock"
        copy="Past releases that have sold through. Join the waitlist for future restocks."
        tiles={outOfStockTiles}
        ctaLabel="View Archive"
        border
      />
    </>
  );
}
