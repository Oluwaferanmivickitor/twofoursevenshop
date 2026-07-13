import { Link } from "@tanstack/react-router";
import { newReleases, outOfStock, formatNgn, formatEur, type Product } from "@/lib/products";

type ShopTile = {
  key: string;
  product: Product;
  displayName: string;
  image: string;
  colorParam?: string;
};

const findProduct = (slug: string) =>
  [...newReleases, ...outOfStock].find((p) => p.slug === slug);

const weDifferent = findProduct("we-different-tee");
const moneyGangBlack = findProduct("money-gang-tee");
const moneyGangWhite = findProduct("money-gang-white-tee");

// Exactly four curated tiles on the homepage. Everything else lives on /shop.
const shopTiles: ShopTile[] = [
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

export function NewReleases() {
  return (
    <section id="shop" aria-labelledby="shop-heading" className="border-t border-border">
      <div className="px-5 pt-16 text-center sm:px-8 sm:pt-24">
        <p className="eyebrow text-muted-foreground">The Collection</p>
        <h2
          id="shop-heading"
          className="mt-3 font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl"
        >
          Featured Pieces
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          Four selections from the current release. Browse the full catalogue in the shop.
        </p>
      </div>

      <div className="px-5 pt-10 pb-10 sm:px-8 sm:pt-14 sm:pb-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
          {shopTiles.map((tile) => (
            <Link
              key={tile.key}
              to="/product/$slug"
              params={{ slug: tile.product.slug }}
              search={tile.colorParam ? { color: tile.colorParam } : undefined}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src={tile.image}
                  alt={tile.displayName}
                  loading="lazy"
                  className="h-full w-full max-w-full object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 space-y-1.5 text-center">
                <h3 className="text-[0.8rem] font-normal tracking-wide text-foreground sm:text-sm">
                  {tile.displayName}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-[0.8rem] font-medium text-foreground sm:text-sm">
                    {formatNgn(tile.product.priceNgn)}
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground sm:text-xs">
                    / {formatEur(tile.product.priceNgn)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 flex justify-center pb-6">
          <Link
            to="/shop"
            className="eyebrow border border-foreground px-8 py-4 text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Explore The Shop
          </Link>
        </div>
      </div>
    </section>
  );
}
