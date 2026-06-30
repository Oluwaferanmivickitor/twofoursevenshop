import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";
import { Footer } from "@/components/Footer";
import { ProductGallery } from "@/components/ProductGallery";
import { getProduct, formatNgn, formatEur, type ColorVariant } from "@/lib/products";

export const Route = createFileRoute("/product/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    color: typeof search.color === "string" ? search.color : undefined,
  }),
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: p
        ? [
            { title: `${p.name} — TWOFOURSEVEN` },
            { name: "description", content: p.description },
            { property: "og:title", content: `${p.name} — TWOFOURSEVEN` },
            { property: "og:description", content: p.description },
            { property: "og:image", content: p.image },
            { name: "twitter:image", content: p.image },
          ]
        : [],
    };
  },
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p className="eyebrow text-muted-foreground">Not Found</p>
      <Link to="/" className="mt-4 inline-block underline">Return home</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { color: colorParam } = Route.useSearch();
  const initialColorIdx = Math.max(
    0,
    product.colors?.findIndex(
      (c: ColorVariant) => c.name.toLowerCase() === (colorParam ?? "").toLowerCase(),
    ) ?? 0,
  );
  const [colorIdx, setColorIdx] = useState(initialColorIdx);
  const [size, setSize] = useState<string | null>(null);

  const activeColor = product.colors?.[colorIdx];
  // Combine every variant's imagery into a single swipable stream so customers
  // see every view of every color without toggling.
  const galleryImages =
    product.colors && product.colors.length > 0
      ? product.colors.flatMap((c: ColorVariant) => c.images)
      : product.gallery ?? [product.image];

  return (
    <div className="min-h-screen bg-background">
      <TopBanner />
      <Header />
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <ProductGallery
          images={galleryImages}
          alt={`${product.name}${activeColor ? ` — ${activeColor.name}` : ""}`}
        />

        <div className="flex flex-col">
          <p className="eyebrow text-muted-foreground">{product.category}</p>
          <h1 className="mt-3 font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-base font-medium text-foreground">
              {formatNgn(product.priceNgn)}
            </span>
            <span className="text-sm text-muted-foreground">
            / {formatEur(product.priceNgn)}
            </span>
          </div>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {product.colors && product.colors.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-foreground">
                  Color — <span className="text-muted-foreground">{activeColor?.name}</span>
                </p>
              </div>
              <div className="mt-3 flex gap-3">
                {product.colors.map((c: ColorVariant, i: number) => {
                  const disabled = !c.inStock;
                  return (
                    <button
                      key={c.name}
                      onClick={() => !disabled && setColorIdx(i)}
                      disabled={disabled}
                      aria-label={`${c.name}${disabled ? " — sold out" : ""}`}
                      className={`relative h-9 w-9 rounded-full border transition ${
                        i === colorIdx ? "border-foreground" : "border-border"
                      } ${disabled ? "cursor-not-allowed opacity-40" : "hover:border-foreground"}`}
                      style={{ backgroundColor: c.swatch }}
                    >
                      {disabled && (
                        <span className="absolute inset-x-0 top-1/2 block h-px -rotate-45 bg-foreground/70" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-foreground">Size</p>
                <a href="#size-guide" className="text-xs underline text-muted-foreground hover:text-foreground">
                  Sizing Guide
                </a>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2 sm:max-w-sm">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`border py-3 text-xs tracking-wider transition ${
                      size === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className="eyebrow mt-10 border border-foreground bg-foreground px-6 py-4 text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!!product.sizes && !size}
          >
            {product.sizes && !size ? "Select a Size" : "Add to Bag"}
          </button>

          <p className="mt-6 text-xs text-muted-foreground">
            Worldwide shipping. Duties calculated at checkout.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
