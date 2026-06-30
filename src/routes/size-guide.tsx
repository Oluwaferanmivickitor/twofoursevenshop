import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size Guide — TWOFOURSEVEN" },
      { name: "description", content: "Sizing measurements for TWOFOURSEVEN ready-to-wear." },
    ],
  }),
  component: SizeGuidePage,
});

const rows = [
  { size: "S", chest: "94–99", length: "70" },
  { size: "M", chest: "100–105", length: "72" },
  { size: "L", chest: "106–111", length: "74" },
  { size: "XL", chest: "112–117", length: "76" },
  { size: "XXL", chest: "118–123", length: "78" },
];

function SizeGuidePage() {
  return (
    <PageLayout>
      <section className="px-5 pt-24 pb-24 sm:px-8 sm:pt-32 sm:pb-32">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-muted-foreground">Sizing</p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-7xl">
            Size Guide
          </h1>
          <p className="mt-8 max-w-prose text-base leading-relaxed text-foreground/80">
            All measurements are in centimetres. For exchanges, please refer to our Returns policy.
          </p>

          <div className="mt-14 border-y border-border">
            <div className="grid grid-cols-3 border-b border-border py-4">
              <p className="eyebrow text-muted-foreground">Size</p>
              <p className="eyebrow text-muted-foreground">Chest</p>
              <p className="eyebrow text-muted-foreground">Length</p>
            </div>
            {rows.map((r) => (
              <div key={r.size} className="grid grid-cols-3 border-b border-border py-5 last:border-b-0">
                <p className="font-serif text-xl text-foreground">{r.size}</p>
                <p className="text-sm text-foreground/80">{r.chest}</p>
                <p className="text-sm text-foreground/80">{r.length}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
