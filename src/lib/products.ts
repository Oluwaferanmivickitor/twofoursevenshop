import wdBlackFront from "@/assets/wd-black-front.jpg.asset.json";
import wdBlackBack from "@/assets/wd-black-back.jpg.asset.json";
import wdWhiteFront from "@/assets/wd-white-front.jpg.asset.json";
import wdWhiteBack from "@/assets/wd-white-back.jpg.asset.json";
import mgFront from "@/assets/mg-front.jpg.asset.json";
import mgBack from "@/assets/mg-back.jpg.asset.json";
import mgWhiteFront from "@/assets/mg-white-front.jpg.asset.json";
import mgWhiteBack from "@/assets/mg-white-back.jpg.asset.json";
import abnormalFront from "@/assets/abnormal-wd-front.jpg.asset.json";
import abnormalBack from "@/assets/abnormal-wd-back.jpg.asset.json";
import beanie from "@/assets/beanie.jpg.asset.json";

export const NGN_TO_EUR = 1 / 1575.5;

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
    priceNgn: 125_000,
    image: wdBlackFront.url,
    gallery: [wdBlackFront.url, wdBlackBack.url, wdWhiteFront.url, wdWhiteBack.url],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Black",
        swatch: "#000000",
        images: [wdBlackFront.url, wdBlackBack.url],
        inStock: true,
      },
      {
        name: "White",
        swatch: "#ffffff",
        images: [wdWhiteFront.url, wdWhiteBack.url],
        inStock: true,
      },
    ],
    inStock: true,
    description:
      "Heavyweight cotton tee with the signature 'WE DIFFERENT' chest graphic and the 247 drip emblem at the back. Available in Black and White.",
  },
  {
    slug: "money-gang-tee",
    name: "MONEY GANG TEE",
    category: "T-Shirt",
    priceNgn: 150_000,
    image: mgFront.url,
    gallery: [mgFront.url, mgBack.url, mgWhiteFront.url, mgWhiteBack.url],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Black",
        swatch: "#000000",
        images: [mgFront.url, mgBack.url],
        inStock: true,
      },
      {
        name: "White",
        swatch: "#ffffff",
        images: [mgWhiteFront.url, mgWhiteBack.url],
        inStock: true,
      },
    ],
    inStock: true,
    description:
      "Oversized box-fit tee with archival 'MONEY GANG' portrait print on the chest and the metallic gold 247 star at the back. Available in Black and White.",
  },
  {
    slug: "abnormal-we-different-tee",
    name: "ABNORMAL WE DIFFERENT TEE",
    category: "T-Shirt",
    priceNgn: 80_000,

    image: abnormalFront.url,
    gallery: [abnormalFront.url, abnormalBack.url],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      {
        name: "Black",
        swatch: "#000000",
        images: [abnormalFront.url, abnormalBack.url],
        inStock: true,
      },
    ],
    inStock: true,
    description:
      "Statement graphic tee — bold '247 · I'm not weird, we just different · R&W' chest print with the hand-painted 'WE DIFFERENT' back hit. Cut heavyweight in classic black.",
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
    priceNgn: 99_900,
    image: beanie.url,
    gallery: [beanie.url],
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
  maximumFractionDigits: 2,
});

export const formatNgn = (n: number) => ngn.format(n);
export const formatEur = (n: number) => eur.format(n * NGN_TO_EUR);

export function getProduct(slug: string): Product | undefined {
  return [...products, ...outOfStock].find((p) => p.slug === slug);
}
