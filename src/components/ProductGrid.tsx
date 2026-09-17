import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// NGN -> EUR static reference rate. Adjust when a live rate is wired up.
const NGN_TO_EUR = 1 / 1750;

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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

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

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading collection...</div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No pieces found in database.</div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
          {products.map((p) => {
            const priceNgn = p.price_ngn;
            const priceEur = Math.round(priceNgn * NGN_TO_EUR);

            return (
              <li key={p.id || p.slug} className="group">
                <a href={`#`} className="block">
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
                    <h3 className="text-[0.8rem] font-normal tracking-wide text-foreground sm:text-sm uppercase">
                      {p.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[0.8rem] font-medium text-foreground sm:text-sm">
                        {ngn.format(priceNgn)}
                      </span>
                      <span className="text-[0.7rem] text-muted-foreground sm:text-xs">
                        / {eur.format(priceEur)}
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
