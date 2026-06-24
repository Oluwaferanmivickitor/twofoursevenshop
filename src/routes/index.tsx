import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { NewReleases } from "@/components/NewReleases";
import { TopBanner } from "@/components/TopBanner";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <TopBanner />
      <Header />
      <main>
        <HeroCarousel />
        <NewReleases />
      </main>
      <Footer />
    </div>
  );
}
