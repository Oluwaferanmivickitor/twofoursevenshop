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
    a: "Domestic orders within Nigeria are delivered in 24–72 hours from dispatch. International orders arrive within 7–14 business days, depending on destination and customs clearance.",
  },
  {
    q: "Where do you ship from and to?",
    a: "All orders are dispatched from our atelier in Lagos, Nigeria. We currently ship worldwide, with an established network across the UK, Canada, Ghana, the United States, and most of Europe.",
  },
  {
    q: "How much is shipping?",
    a: "A flat-rate shipping fee of ₦3,000 is applied to all domestic orders. International shipping is calculated at checkout based on the destination and total weight of your parcel.",
  },
  {
    q: "Will I receive a tracking number?",
    a: "Yes. Once your order is dispatched you will receive an email with your courier and tracking reference so you can follow your parcel to its destination.",
  },
  {
    q: "Do I need to pay customs or duties?",
    a: "International customers are responsible for any customs duties, taxes or import fees levied by their local authorities upon delivery. These charges are not included in the order total.",
  },
  {
    q: "What happens if my order is delayed or lost?",
    a: (
      <>
        Please contact us at{" "}
        <a href="mailto:247.freeworld@gmail.com" className="underline underline-offset-4 hover:opacity-60">
          247.freeworld@gmail.com
        </a>{" "}
        with your order reference and we will open a trace with the courier and update you within 48 hours.
      </>
    ),
  },
];

const returns: Item[] = [
  {
    q: "What is your return policy?",
    a: "Exchanges are accepted for sizing discrepancies only (too small or too large). Items must be unworn, unwashed and returned in their original condition with all tags attached within 7 days of delivery.",
  },
  {
    q: "How do I request a return or exchange?",
    a: (
      <>
        Email{" "}
        <a href="mailto:247.freeworld@gmail.com" className="underline underline-offset-4 hover:opacity-60">
          247.freeworld@gmail.com
        </a>{" "}
        within 7 days of receiving your order, quoting your order reference and reason for return. Our team will respond with a return authorisation and instructions.
      </>
    ),
  },
  {
    q: "How do I request a refund?",
    a: "Refund requests must be made in writing by email. Approved refunds are processed within four working days to the original payment method. Please allow additional time for your bank to reflect the credit.",
  },
  {
    q: "Are there items that cannot be returned?",
    a: "For hygiene reasons, headwear, undergarments and items marked as final sale cannot be returned or exchanged. Made-to-order and personalised pieces are also non-returnable.",
  },
  {
    q: "Who covers the return shipping cost?",
    a: "Return shipping is the responsibility of the customer, unless the item received is faulty or was sent in error, in which case we will cover the cost of return.",
  },
];

const payment: Item[] = [
  {
    q: "What payment methods do you accept?",
    a: "We currently accept Bank Transfer to our Access Bank account. Card processing (Visa, Mastercard, Verve) will be enabled shortly.",
  },
  {
    q: "Bank Transfer details",
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
    q: "Is my payment secure?",
    a: "Yes. All transactions are handled through trusted, encrypted financial channels. TWOFOURSEVEN does not store your card details on our servers. Bank Transfer payments are verified manually via receipt upload before your order is fulfilled.",
  },
  {
    q: "Why do I need to upload a payment receipt?",
    a: "Uploading your transfer receipt at checkout allows our team to verify your payment quickly and dispatch your order without delay. Orders without an uploaded receipt cannot be confirmed.",
  },
  {
    q: "Do you offer instalment or pay-later options?",
    a: "Not at this time. All orders must be paid in full at checkout.",
  },
  {
    q: "Which currencies do you accept?",
    a: "All orders are billed in Nigerian Naira (₦). Prices are displayed alongside an approximate Euro (€) conversion for reference; final settlement is in Naira.",
  },
];

const sizing: Item[] = [
  {
    q: "How do your pieces fit?",
    a: "Our tees and jerseys are cut for a relaxed, contemporary silhouette. If you are between sizes or prefer an oversized fit, we recommend sizing up.",
  },
  {
    q: "Where can I find a size guide?",
    a: "A detailed size guide is available on each product page. If you require additional measurements, contact us before placing your order and we will assist you personally.",
  },
  {
    q: "Do you offer made-to-measure?",
    a: "Selected pieces can be produced to bespoke measurements on request. Please email us to discuss timelines and pricing.",
  },
  {
    q: "How should I care for my garments?",
    a: "To preserve print and fabric integrity, we recommend cold machine wash inside out, no bleach, and line drying in shade. Iron on the reverse at low temperature.",
  },
];

const orders: Item[] = [
  {
    q: "Can I modify or cancel my order?",
    a: "Orders can be modified or cancelled within 2 hours of purchase, provided they have not entered production or dispatch. Contact us immediately by email or WhatsApp.",
  },
  {
    q: "I haven't received an order confirmation — what should I do?",
    a: "Please check your spam folder first. If you still cannot locate a confirmation, email us with the name and address used at checkout and we will resend it.",
  },
  {
    q: "Do you restock sold-out items?",
    a: "Certain core styles are restocked periodically. Drops and collections are produced in limited quantities and typically do not return once sold out.",
  },
];

const contact: Item[] = [
  {
    q: "Email",
    a: (
      <a href="mailto:247.freeworld@gmail.com" className="underline underline-offset-4 hover:opacity-60">
        247.freeworld@gmail.com
      </a>
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
  {
    q: "Atelier",
    a: "Lagos, Nigeria. Visits by appointment only.",
  },
  {
    q: "Response times",
    a: "Our team responds to customer enquiries within 24 hours, Monday to Saturday.",
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
