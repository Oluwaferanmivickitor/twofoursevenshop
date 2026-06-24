import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

// NGN -> EUR static reference rate. Adjust when a live rate is wired up.
const NGN_TO_EUR = 1 / 1750;

const products = [
  { id: "01", name: "Tailored Wool Overcoat", image: p1, priceNgn: 1_250_000 },
  { id: "02", name: "Silk Crepe Shirt", image: p2, priceNgn: 480_000 },
  { id: "03", name: "Wide-Leg Crepe Trouser", image: p3, priceNgn: 520_000 },
  { id: "04", name: "Cashmere Crewneck", image: p4, priceNgn: 680_000 },
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

export function ProductGrid() {
  return (
    <section
      aria-labelledby="collection-heading"
      className="px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mb-10 flex items-end justify-between sm:mb-16">
        <div>
          <p className="eyebrow text-muted-foreground">Autumn — Winter</p>
          <h2
            id="collection-heading"
            className="mt-3 font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl"
          >
            The Collection
          </h2>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
        {products.map((p) => (
          <li key={p.id} className="group">
            <a href="#" className="block">
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={900}
                  height={1200}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 space-y-1.5">
                <h3 className="text-[0.8rem] font-normal tracking-wide text-foreground sm:text-sm">
                  {p.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.8rem] font-medium text-foreground sm:text-sm">
                    {ngn.format(p.priceNgn)}
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground sm:text-xs">
                    / {eur.format(Math.round(p.priceNgn * NGN_TO_EUR))}
                  </span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
