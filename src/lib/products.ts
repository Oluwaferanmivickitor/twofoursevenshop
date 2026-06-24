import weDiffBlackAsset from "@/assets/we-different-black.asset.json";
import weDiffWhiteAsset from "@/assets/we-different-white.asset.json";
import moneyGangAsset from "@/assets/money-gang.asset.json";
import beanieAsset from "@/assets/beanie-247.asset.json";

export const NGN_TO_EUR = 1 / 1750;

export type ColorVariant = {
  name: string;
  swatch: string;
  image: string;
  inStock: boolean;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  priceNgn: number;
  image: string;
  sizes?: string[];
  colors?: ColorVariant[];
  inStock: boolean;
  description: string;
};

export const products: Product[] = [
  {
    slug: "we-different-tee",
    name: "WE DIFFERENT TEE",
    category: "T-Shirt",
    priceNgn: 100_000,
    image: weDiffBlackAsset.url,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", swatch: "#000000", image: weDiffBlackAsset.url, inStock: true },
      { name: "White", swatch: "#ffffff", image: weDiffWhiteAsset.url, inStock: true },
    ],
    inStock: true,
    description:
      "Heavyweight cotton tee with hand-finished 'WE DIFFERENT' graphic at the chest and the signature 247 drip emblem at the back.",
  },
  {
    slug: "money-gang-tee",
    name: "MONEY GANG TEE",
    category: "T-Shirt",
    priceNgn: 100_000,
    image: moneyGangAsset.url,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", swatch: "#000000", image: moneyGangAsset.url, inStock: true },
      { name: "White", swatch: "#ffffff", image: moneyGangAsset.url, inStock: false },
    ],
    inStock: true,
    description:
      "Oversized box-fit tee with archival 'MONEY GANG' portrait print and metallic foil typography.",
  },
  {
    slug: "247-beanie",
    name: "247 BEANIE",
    category: "Headwear",
    priceNgn: 45_000,
    image: beanieAsset.url,
    sizes: ["One Size"],
    inStock: true,
    description:
      "All-over camouflage knit beanie with embroidered 247 leaf motifs and a soft turn-up cuff.",
  },
];

export const newReleases = products.filter((p) => p.inStock);

// Demo out-of-stock item — re-uses MONEY GANG white colorway view.
export const outOfStock: Product[] = [
  {
    slug: "money-gang-tee-white",
    name: "MONEY GANG TEE — White",
    category: "T-Shirt",
    priceNgn: 100_000,
    image: moneyGangAsset.url,
    inStock: false,
    description: "Sold out — restock pending.",
  },
];

const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});
const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const formatNgn = (n: number) => ngn.format(n);
export const formatEur = (n: number) => eur.format(Math.round(n * NGN_TO_EUR));

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
