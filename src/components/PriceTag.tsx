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
  const main = size === "lg" ? "text-base font-medium" : "text-[0.8rem] font-medium sm:text-sm";
  const sub = size === "lg" ? "text-sm" : "text-[0.7rem] sm:text-xs";

  return (
    <div className="flex flex-wrap items-baseline justify-center gap-2 sm:justify-start">
      <span className={`${main} ${soldOut ? "text-muted-foreground line-through" : "text-foreground"}`}>
        {formatNgn(sale)}
      </span>
      {discounted && !soldOut && (
        <span className={`${sub} text-muted-foreground line-through`}>{formatNgn(p.priceNgn)}</span>
      )}
      <span className={`${sub} text-muted-foreground`}>/ {formatEur(sale)}</span>
      {discounted && (
        <span className="border border-foreground px-1.5 py-0.5 text-[0.6rem] tracking-[0.15em] uppercase text-foreground">
          {p.discountPercent}% off
        </span>
      )}
    </div>
  );
}

export function StockNote({ p }: { p: Pick<Product, "stockQuantity" | "inStock"> }) {
  const note = stockNote(p);
  if (!note) return null;
  return <p className="mt-1 text-[0.7rem] tracking-wide text-muted-foreground">{note}</p>;
}
