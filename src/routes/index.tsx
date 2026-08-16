import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { NewReleases } from "@/components/NewReleases";
import { TopBanner } from "@/components/TopBanner";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { listProducts } from "@/lib/products.functions";

export const Route = createFileRoute("/")({
  loader: () => listProducts(),
  head: () => ({
    meta: [
      { title: "TWOFOURSEVEN" },
      { name: "description", content: "TWOFOURSEVEN" },
      { property: "og:title", content: "TWOFOURSEVEN" },

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
      <WhatsAppButton />
    </div>
  );
}
