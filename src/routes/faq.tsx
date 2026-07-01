import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — TWOFOURSEVEN" },
      {
        name: "description",
        content:
          "Shipping, returns, payment and contact information for TWOFOURSEVEN.",
      },
    ],
  }),
  component: FaqPage,
});

type Item = { q: string; a: React.ReactNode };

const shipping: Item[] = [
  {
    q: "How long does delivery take?",
    a: "Delivery within Nigeria takes 24–72 hours. International orders arrive within 7–14 business days.",
  },
  {
    q: "Do you offer international shipping?",
    a: "Yes. We ship worldwide, including the UK, Canada, Ghana and beyond.",
  },
];

const returns: Item[] = [
  {
    q: "What is your return policy?",
    a: "Exchanges are accepted for sizing discrepancies only (too small or too large).",
  },
  {
    q: "How do I request a refund?",
    a: (
      <>
        Refund requests must be emailed to{" "}
        <a
          href="mailto:247.freeworld@gmail.com"
          className="underline underline-offset-4 hover:opacity-60"
        >
          247.freeworld@gmail.com
        </a>
        . Approved refunds are processed within four working days.
      </>
    ),
  },
];

const payment: Item[] = [
  {
    q: "Bank Transfer",
    a: (
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr]">
        <dt className="eyebrow text-muted-foreground">Bank</dt>
        <dd>Access Bank</dd>
        <dt className="eyebrow text-muted-foreground">Account Number</dt>
        <dd>8127106754</dd>
        <dt className="eyebrow text-muted-foreground">Account Name</dt>
        <dd>Ibrahim Lekan Osho</dd>
      </dl>
    ),
  },
  {
    q: "Card Payments",
    a: "Coming Soon. Secure card processing will be enabled shortly.",
  },
];

const contact: Item[] = [
  {
    q: "How can I contact customer support?",
    a: (
      <>
        Email us at{" "}
        <a
          href="mailto:247.freeworld@gmail.com"
          className="underline underline-offset-4 hover:opacity-60"
        >
          247.freeworld@gmail.com
        </a>
        .
      </>
    ),
  },
  {
    q: "Phone",
    a: (
      <a href="tel:+2348060063068" className="hover:opacity-60">
        0806 006 3068
      </a>
    ),
  },
  {
    q: "WhatsApp",
    a: (
      <a
        href="https://wa.me/2347046900261"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-60"
      >
        0704 690 0261
      </a>
    ),
  },
];

function Section({
  eyebrow,
  title,
  items,
  idPrefix,
}: {
  eyebrow: string;
  title: string;
  items: Item[];
  idPrefix: string;
}) {
  return (
    <section className="border-t border-border pt-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr] md:gap-16">
        <div>
          <p className="eyebrow text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl font-light text-foreground">
            {title}
          </h2>
        </div>
        <Accordion type="multiple" className="w-full">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`${idPrefix}-${i}`}>
              <AccordionTrigger className="eyebrow py-6 text-foreground">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-relaxed text-foreground/80">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FaqPage() {
  return (
    <PageLayout>
      <section className="px-5 pt-24 pb-16 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow text-muted-foreground">Help Centre</p>
          <h1 className="mt-5 font-serif text-6xl font-light leading-[1.05] text-foreground sm:text-7xl">
            FAQ
          </h1>
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-5 pb-24 sm:px-8 sm:pb-32">
        <Section
          eyebrow="01"
          title="Shipping Policy"
          items={shipping}
          idPrefix="ship"
        />
        <Section
          eyebrow="02"
          title="Returns & Refunds"
          items={returns}
          idPrefix="ret"
        />
        <Section
          eyebrow="03"
          title="Payment Information"
          items={payment}
          idPrefix="pay"
        />
        <Section
          eyebrow="04"
          title="Contact Details"
          items={contact}
          idPrefix="con"
        />
      </div>
    </PageLayout>
  );
}
