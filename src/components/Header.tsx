import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/twofourseven-logo.png.asset.json";

const navLinks: { label: string; to: string }[] = [
  { label: "Shop All", to: "/" },
  { label: "New Arrivals", to: "/" },
  { label: "About the Brand", to: "/about" },
  { label: "International Shipping", to: "/shipping" },
];

const shopCategories: { label: string; slug: string }[] = [
  { label: "Tees", slug: "tees" },
  { label: "T-Shirts", slug: "t-shirts" },
  { label: "Headwear", slug: "headwear" },
  { label: "Skirts", slug: "skirts" },
  { label: "Pants", slug: "pants" },
  { label: "Jorts", slug: "jorts" },
  { label: "Slides", slug: "slides" },
  { label: "Shoes", slug: "shoes" },
];

type Panel = null | "menu" | "search" | "cart";

export function Header() {
  const [panel, setPanel] = useState<Panel>(null);
  const close = () => setPanel(null);

  useEffect(() => {
    if (panel) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [panel]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur">
        <div className="grid w-full grid-cols-3 items-center">
          <div className="flex items-center gap-1 justify-self-start">
            <button
              aria-label="Open menu"
              onClick={() => setPanel("menu")}
              className="-ml-2 p-2 text-foreground transition-opacity hover:opacity-60"
            >
              <Menu strokeWidth={1.25} className="h-5 w-5" />
            </button>
            <button
              aria-label="Open search"
              onClick={() => setPanel("search")}
              className="p-2 text-foreground transition-opacity hover:opacity-60"
            >
              <Search strokeWidth={1.25} className="h-5 w-5" />
            </button>
          </div>

          <Link
            to="/"
            aria-label="TWOFOURSEVEN — Home"
            className="logo-link justify-self-center"
          >
            <img
              src={logoAsset.url}
              alt="TWOFOURSEVEN"
              className="w-auto max-w-full"
            />
          </Link>

          <div className="justify-self-end">
            <button
              aria-label="Open cart"
              onClick={() => setPanel("cart")}
              className="-mr-2 p-2 text-foreground transition-opacity hover:opacity-60"
            >
              <ShoppingBag strokeWidth={1.25} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu */}
      {panel === "menu" && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-300 bg-background">
          <PanelHeader onClose={close} label="Menu" />
          <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10 md:flex-row md:gap-24 md:py-24">
            <nav className="flex flex-col items-start gap-5 md:gap-6">
              <p className="eyebrow text-muted-foreground">Navigate</p>
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={close}
                  className="font-serif text-4xl font-light text-foreground transition-opacity hover:opacity-60 sm:text-5xl"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <nav className="flex flex-col items-start gap-4">
              <p className="eyebrow text-muted-foreground">Shop</p>
              {shopCategories.map((c) => (
                <Link
                  key={c.slug}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  onClick={close}
                  className="font-serif text-2xl font-light text-foreground transition-opacity hover:opacity-60 sm:text-3xl"
                >
                  {c.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {panel === "search" && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200 bg-background">
          <PanelHeader onClose={close} label="Search" />
          <div className="px-5 pt-10 sm:px-8 sm:pt-16">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto max-w-3xl"
            >
              <label htmlFor="search-q" className="eyebrow text-muted-foreground">
                What are you looking for?
              </label>
              <div className="mt-4 flex items-center border-b border-foreground/40 focus-within:border-foreground">
                <Search strokeWidth={1.25} className="h-5 w-5 text-muted-foreground" />
                <input
                  id="search-q"
                  type="search"
                  autoFocus
                  placeholder="Search overcoats, shirts, trousers…"
                  className="w-full bg-transparent px-3 py-3 font-serif text-2xl font-light text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-3xl"
                />
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Press Esc to close.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Slide-out cart */}
      {panel === "cart" && (
        <>
          <div
            onClick={close}
            className="fixed inset-0 z-50 animate-in fade-in duration-200 bg-foreground/30"
          />
          <aside
            role="dialog"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background animate-in slide-in-from-right duration-300"
          >
            <PanelHeader onClose={close} label="Cart (0)" />
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <ShoppingBag strokeWidth={1} className="h-8 w-8 text-muted-foreground" />
              <p className="eyebrow mt-6 text-muted-foreground">Your bag is empty</p>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Discover considered tailoring and refined essentials.
              </p>
              <button
                onClick={close}
                className="eyebrow mt-8 border border-foreground px-6 py-3 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Continue Shopping
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function PanelHeader({ onClose, label }: { onClose: () => void; label: string }) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-border px-5 sm:h-16 sm:px-8">
      <p className="eyebrow text-foreground">{label}</p>
      <button
        aria-label="Close"
        onClick={onClose}
        className="-mr-2 p-2 text-foreground transition-opacity hover:opacity-60"
      >
        <X strokeWidth={1.25} className="h-5 w-5" />
      </button>
    </div>
  );
}

