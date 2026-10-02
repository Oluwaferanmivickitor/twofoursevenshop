import { formatEur, formatNgn, hasDiscount, salePriceNgn, stockNote, type Product } from "@/lib/products";

type P = Pick<Product, "priceNgn" | "discountPercent">;

export function PriceTag({
  p,
  soldOut = false,
  size = "sm",
}: {
  p: P;
  soldOut?: boolean;
  size?: "sm" | "lg";
}) {
  const sale = salePriceNgn(p);
  const discounted = hasDiscount(p);
  const main = size === "lg" ? "text-lg font-medium" : "text-sm font-medium sm:text-base";
  const sub = size === "lg" ? "text-sm" : "text-[0.7rem] sm:text-xs";

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`${main} ${soldOut ? "text-muted-foreground line-through" : "text-foreground"}`}>
        {formatNgn(sale)}
      </span>
      {discounted && !soldOut && (
        <span className={`${sub} text-muted-foreground line-through`}>{formatNgn(p.priceNgn)}</span>
      )}
      <span className={`${sub} text-muted-foreground`}>{formatEur(sale)}</span>
    </div>
  );
}

export function ProductImageStatus({
  p,
}: {
  p: Pick<Product, "discountPercent" | "inStock">;
}) {
  return (
    <>
      {hasDiscount(p) && (
        <span className="eyebrow absolute left-3 top-3 z-10 bg-foreground px-2.5 py-2 text-[0.58rem] text-background sm:left-4 sm:top-4">
          {p.discountPercent}% off
        </span>
      )}
      <span
        aria-label={p.inStock ? "In stock" : "Out of stock"}
        title={p.inStock ? "In stock" : "Out of stock"}
        className={`absolute right-3 top-3 z-10 h-3 w-3 rounded-full shadow-status sm:right-4 sm:top-4 ${
          p.inStock ? "bg-stock-available" : "bg-stock-unavailable"
        }`}
      />
    </>
  );
}

export function ProductCardDetails({ p }: { p: Product }) {
  const note = stockNote(p);
  return (
    <div className="mt-4 text-left">
      <h3 className="text-sm font-medium leading-snug text-foreground sm:text-base">{p.name}</h3>
      <div className="mt-2">
        <PriceTag p={p} soldOut={!p.inStock} />
      </div>
      <p className="mt-2 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
        {p.inStock ? note ?? "In stock" : "Out of stock"}
      </p>
    </div>
  );
}

export function StockNote({ p }: { p: Pick<Product, "stockQuantity" | "inStock"> }) {
  const note = stockNote(p);
  if (!note) return null;
  return <p className="mt-1 text-[0.7rem] tracking-wide text-muted-foreground">{note}</p>;
}
