export const NGN_TO_EUR = 1 / 1575.5;

export type ColorVariant = {
  name: string;
  swatch: string;
  images: string[];
  inStock: boolean;
};

export type Product = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  priceNgn: number;
  image: string;
  gallery?: string[];
  sizes?: string[];
  colors?: ColorVariant[];
  inStock: boolean;
  discountPercent?: number;
  stockQuantity?: number;
  isArchived?: boolean;
  sortOrder?: number;
  description: string;
};

const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});
const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export const formatNgn = (n: number) => ngn.format(n);
export const formatEur = (n: number) => eur.format(n * NGN_TO_EUR);

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_ngn: number;
  description: string;
  image: string;
  gallery: unknown;
  sizes: unknown;
  colors: unknown;
  in_stock: boolean;
  discount_percent: number;
  stock_quantity: number;
  is_archived: boolean;
  sort_order: number;
};

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function asColorArray(v: unknown): ColorVariant[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const o = c as Record<string, unknown>;
      return {
        name: typeof o.name === "string" ? o.name : "",
        swatch: typeof o.swatch === "string" ? o.swatch : "#000000",
        images: asStringArray(o.images),
        inStock: typeof o.inStock === "boolean" ? o.inStock : true,
      };
    })
    .filter((c): c is ColorVariant => c !== null && c.name.length > 0);
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    priceNgn: row.price_ngn,
    description: row.description,
    image: row.image,
    gallery: asStringArray(row.gallery),
    sizes: asStringArray(row.sizes),
    colors: asColorArray(row.colors),
    inStock: row.in_stock,
    discountPercent: row.discount_percent ?? 0,
    stockQuantity: row.stock_quantity ?? 0,
    isArchived: row.is_archived,
    sortOrder: row.sort_order,
  };
}

/** Price after the admin-set percentage discount. */
export const salePriceNgn = (p: Pick<Product, "priceNgn" | "discountPercent">) =>
  p.discountPercent && p.discountPercent > 0
    ? Math.round((p.priceNgn * (100 - p.discountPercent)) / 100)
    : p.priceNgn;

export const hasDiscount = (p: Pick<Product, "discountPercent">) =>
  !!p.discountPercent && p.discountPercent > 0;

/** "Only 3 left" style note, or null when it shouldn't be shown. */
export function stockNote(p: Pick<Product, "stockQuantity" | "inStock">) {
  if (!p.inStock) return null;
  const q = p.stockQuantity ?? 0;
  if (q <= 0) return null;
  if (q <= 5) return `Only ${q} left`;
  return `${q} in stock`;
}
