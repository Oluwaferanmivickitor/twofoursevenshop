import { useEffect, useState } from "react";
import { ChevronDown, Menu, Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/twofourseven-logo.png.asset.json";
import { useCart } from "@/lib/cart";
import { formatEur, formatNgn } from "@/lib/products";

const navLinks: { label: string; to: string }[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

const shopCategories: { label: string; slug: string }[] = [
  { label: "Tees", slug: "tees" },
  { label: "T-Shirts", slug: "t-shirts" },
  { label: "Headwear", slug: "headwear" },
  { label: "Skirts", slug: "skirts" },
  { label: "Pants", slug: "pants" },
  { label: "Jorts", slug: "jorts" },
  { label: "Jackets", slug: "jackets" },
  { label: "Slides", slug: "slides" },
  { label: "Shoes", slug: "shoes" },
];

type Panel = null | "menu" | "search" | "cart";

export function Header() {
  const [panel, setPanel] = useState<Panel>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const { items, count, subtotalNgn, updateQty, removeItem } = useCart();
  const close = () => setPanel(null);

  useEffect(() => {
    const onOpen = () => setPanel("cart");
    window.addEventListener("cart:open", onOpen);
    return () => window.removeEventListener("cart:open", onOpen);
  }, []);

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
              aria-label={`Open cart (${count})`}
              onClick={() => setPanel("cart")}
              className="relative -mr-2 p-2 text-foreground transition-opacity hover:opacity-60"
            >
              <ShoppingBag strokeWidth={1.25} className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu */}
      {panel === "menu" && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-300 bg-background">
          <PanelHeader onClose={close} label="Menu" />
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-24">
            <p className="eyebrow text-muted-foreground">Navigate</p>

            <Link
              to="/"
              onClick={close}
              className="font-serif text-4xl font-light text-foreground transition-opacity hover:opacity-60 sm:text-5xl"
            >
              Home
            </Link>

            {/* Nested Shop */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                aria-expanded={shopOpen}
                onClick={() => setShopOpen((v) => !v)}
                className="flex items-center gap-3 font-serif text-4xl font-light text-foreground transition-opacity hover:opacity-60 sm:text-5xl"
              >
                Shop
                <ChevronDown
                  strokeWidth={1.25}
                  className={`h-5 w-5 transition-transform ${shopOpen ? "rotate-180" : ""}`}
                />
              </button>
              {shopOpen && (
                <div className="flex flex-col items-center gap-3 pb-4 pt-2 animate-in fade-in duration-200">
                  <Link
                    to="/shop"
                    onClick={close}
                    className="eyebrow text-muted-foreground hover:text-foreground"
                  >
                    View All
                  </Link>
                  {shopCategories.map((c) => (
                    <Link
                      key={c.slug}
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      onClick={close}
                      className="font-serif text-xl font-light text-foreground transition-opacity hover:opacity-60 sm:text-2xl"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.slice(1).map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={close}
                className="font-serif text-4xl font-light text-foreground transition-opacity hover:opacity-60 sm:text-5xl"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search overlay */}
      {panel === "search" && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200 bg-background">
          <PanelHeader onClose={close} label="Search" />
          <div className="px-5 pt-10 sm:px-8 sm:pt-16">
            <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-3xl">
              <label htmlFor="search-q" className="eyebrow text-muted-foreground">
                What are you looking for?
              </label>
              <div className="mt-4 flex items-center border-b border-foreground/40 focus-within:border-foreground">
                <Search strokeWidth={1.25} className="h-5 w-5 text-muted-foreground" />
                <input
                  id="search-q"
                  type="search"
                  autoFocus
                  placeholder="Search tees, headwear, jackets…"
                  className="w-full bg-transparent px-3 py-3 font-serif text-2xl font-light text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-3xl"
                />
              </div>
              <p className="mt-6 text-xs text-muted-foreground">Press Esc to close.</p>
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
            <PanelHeader onClose={close} label={`Cart (${count})`} />

            {items.length === 0 ? (
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
            ) : (
              <>
                <ul className="flex-1 divide-y divide-border overflow-y-auto">
                  {items.map((it) => (
                    <li key={it.id} className="flex gap-4 p-5">
                      <div className="h-24 w-20 shrink-0 overflow-hidden bg-secondary">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">{it.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {[it.color, it.size].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <button
                            aria-label="Remove"
                            onClick={() => removeItem(it.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X strokeWidth={1.25} className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-end justify-between">
                          <div className="flex items-center border border-border">
                            <button
                              aria-label="Decrease"
                              onClick={() => updateQty(it.id, it.quantity - 1)}
                              className="grid h-8 w-8 place-items-center hover:bg-secondary"
                            >
                              <Minus strokeWidth={1.25} className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs">{it.quantity}</span>
                            <button
                              aria-label="Increase"
                              onClick={() => updateQty(it.id, it.quantity + 1)}
                              className="grid h-8 w-8 place-items-center hover:bg-secondary"
                            >
                              <Plus strokeWidth={1.25} className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {formatNgn(it.priceNgn * it.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-border p-5">
                  <div className="flex items-baseline justify-between">
                    <p className="eyebrow text-muted-foreground">Subtotal</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatNgn(subtotalNgn)}{" "}
                      <span className="text-muted-foreground">/ {formatEur(subtotalNgn)}</span>
                    </p>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={close}
                    className="eyebrow mt-4 block border border-foreground bg-foreground py-4 text-center text-background transition-opacity hover:opacity-80"
                  >
                    Checkout
                  </Link>
                  <button
                    onClick={close}
                    className="mt-3 block w-full text-center text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
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
