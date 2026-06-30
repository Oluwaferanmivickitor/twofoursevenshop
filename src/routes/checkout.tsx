import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — TWOFOURSEVEN" },
      { name: "description", content: "Payment information and bank transfer details." },
    ],
  }),
  component: CheckoutPage,
});

const bank = [
  { label: "Bank", value: "Access Bank" },
  { label: "Account Number", value: "8127106754" },
  { label: "Account Name", value: "Ibrahim Lekan Osho" },
];

function CheckoutPage() {
  return (
    <PageLayout>
      <section className="px-5 pt-24 pb-24 sm:px-8 sm:pt-32 sm:pb-32">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-muted-foreground">Checkout</p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-7xl">
            Payment.
          </h1>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            {/* Bank Transfer */}
            <div className="border-t border-foreground pt-8">
              <p className="eyebrow text-muted-foreground">Method 01</p>
              <h2 className="mt-3 font-serif text-3xl font-light text-foreground">
                Bank Transfer
              </h2>
              <dl className="mt-8 divide-y divide-border border-y border-border">
                {bank.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center justify-between py-4"
                  >
                    <dt className="eyebrow text-muted-foreground">{b.label}</dt>
                    <dd className="text-sm text-foreground sm:text-base">{b.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-8 text-sm leading-relaxed text-foreground/70">
                After transfer, forward proof of payment to{" "}
                <a
                  href="mailto:247.freeworld@gmail.com"
                  className="underline underline-offset-4 hover:opacity-60"
                >
                  247.freeworld@gmail.com
                </a>{" "}
                with your order details.
              </p>
            </div>

            {/* Card Payments */}
            <div className="border-t border-foreground/30 pt-8">
              <p className="eyebrow text-muted-foreground">Method 02</p>
              <h2 className="mt-3 font-serif text-3xl font-light text-foreground/60">
                Card Payments
              </h2>
              <div className="mt-8 flex aspect-[3/2] flex-col items-center justify-center border border-dashed border-border bg-secondary/40 text-center">
                <p className="eyebrow text-muted-foreground">Coming Soon</p>
                <p className="mt-3 max-w-xs px-6 text-sm text-foreground/60">
                  Secure card processing will be enabled shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
