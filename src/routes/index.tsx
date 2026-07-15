import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { NewReleases } from "@/components/NewReleases";
import { TopBanner } from "@/components/TopBanner";
import { Footer } from "@/components/Footer";
import { listProducts } from "@/lib/products.functions";

export const Route = createFileRoute("/")({
  loader: () => listProducts(),
  head: () => ({
    meta: [
      { title: "TWOFOURSEVEN — Premium Ready-to-Wear" },
      {
        name: "description",
        content:
          "TWOFOURSEVEN — a high-fashion ready-to-wear label. Considered tailoring and refined essentials, made for the everyday.",
      },
      { property: "og:title", content: "TWOFOURSEVEN — Premium Ready-to-Wear" },
      {
        property: "og:description",
        content:
          "TWOFOURSEVEN — a high-fashion ready-to-wear label. Considered tailoring and refined essentials, made for the everyday.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Not found.</div>
  ),
  component: Index,
});

function Index() {
  const products = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <TopBanner />
      <Header />
      <main>
        <HeroCarousel />
        <NewReleases products={products} />
      </main>
      <Footer />
    </div>
  );
}
