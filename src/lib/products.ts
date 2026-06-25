import weDiffBlackAsset from "@/assets/we-different-black.asset.json";
import weDiffWhiteAsset from "@/assets/we-different-white.asset.json";
import weDiffBlackPortrait from "@/assets/we-different-black-portrait.jpg.asset.json";
import weDiffWhiteLifestyle from "@/assets/we-different-white-lifestyle.jpg.asset.json";
import moneyGangAsset from "@/assets/money-gang.asset.json";
import moneyGangLifestyle from "@/assets/money-gang-lifestyle.jpg.asset.json";
import beanieAsset from "@/assets/beanie-247.asset.json";

export const NGN_TO_EUR = 1 / 1750;

export type ColorVariant = {
  name: string;
  swatch: string;
  images: string[];
  inStock: boolean;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  priceNgn: number;
  image: string;
  gallery?: string[];
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
    gallery: [weDiffBlackAsset.url, weDiffBlackPortrait.url],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Black",
        swatch: "#000000",
        images: [weDiffBlackAsset.url, weDiffBlackPortrait.url],
        inStock: true,
      },
      {
        name: "White",
        swatch: "#ffffff",
        images: [weDiffWhiteAsset.url, weDiffWhiteLifestyle.url],
        inStock: true,
      },
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
    gallery: [moneyGangAsset.url, moneyGangLifestyle.url],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Black",
        swatch: "#000000",
        images: [moneyGangAsset.url, moneyGangLifestyle.url],
        inStock: true,
      },
      {
        name: "White",
        swatch: "#ffffff",
        images: [moneyGangAsset.url],
        inStock: false,
      },
    ],
    inStock: true,
    description:
      "Oversized box-fit tee with archival 'MONEY GANG' portrait print and metallic foil typography.",
  },
];

// Available collection (in-stock products)
export const newReleases = products.filter((p) => p.inStock);

// Archive — sold out / unavailable
export const outOfStock: Product[] = [
  {
    slug: "247-beanie",
    name: "247 BEANIE",
    category: "Headwear",
    priceNgn: 45_000,
    image: beanieAsset.url,
    inStock: false,
    description: "All-over camouflage knit beanie with embroidered 247 leaf motifs.",
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
  return [...products, ...outOfStock].find((p) => p.slug === slug);
}
