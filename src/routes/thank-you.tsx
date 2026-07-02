import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/thank-you")({
  validateSearch: (s: Record<string, unknown>) => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Thank You — TWOFOURSEVEN" },
      { name: "description", content: "Your order has been received and is under review." },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const { ref } = Route.useSearch();
  return (
    <PageLayout>
      <section className="px-5 pt-24 pb-32 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-muted-foreground">Order Received</p>
          <h1 className="mt-6 font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-7xl">
            Thank you.
          </h1>
          <p className="mt-8 text-sm leading-relaxed text-foreground/70 sm:text-base">
            Your order{ref ? <> — <span className="font-mono">{ref}</span></> : null} and payment receipt have been received.
            Our team will verify your transfer and confirm your shipment within 24 hours.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            For questions, contact{" "}
            <a href="mailto:247.freeworld@gmail.com" className="underline underline-offset-4">
              247.freeworld@gmail.com
            </a>
            .
          </p>
          <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/shop"
              className="eyebrow border border-foreground bg-foreground px-8 py-4 text-background transition-opacity hover:opacity-80"
            >
              Continue Shopping
            </Link>
            <Link to="/" className="eyebrow underline underline-offset-4">
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
