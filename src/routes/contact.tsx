import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — TWOFOURSEVEN" },
      {
        name: "description",
        content:
          "Contact TWOFOURSEVEN. Based in Lagos, Nigeria. Email 247.freeworld@gmail.com.",
      },
    ],
  }),
  component: ContactPage,
});

const channels = [
  { label: "Location", value: "Lagos, Nigeria" },
  { label: "Customer Support", value: "247.freeworld@gmail.com", href: "mailto:247.freeworld@gmail.com" },
  { label: "Phone", value: "0806 006 3068", href: "tel:+2348060063068" },
  { label: "WhatsApp", value: "0806 006 3068", href: "https://wa.me/2348060063068" },
];

function ContactPage() {
  return (
    <PageLayout>
      <section className="px-5 pt-24 pb-16 sm:px-8 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-muted-foreground">Contact</p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-7xl">
            We are listening.
          </h1>

          <dl className="mt-16 divide-y divide-border border-y border-border">
            {channels.map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-2 py-8 text-center">
                <dt className="eyebrow text-muted-foreground">{c.label}</dt>
                <dd className="font-serif text-2xl font-light text-foreground sm:text-3xl">
                  {c.href ? (
                    <a href={c.href} className="transition-opacity hover:opacity-60">
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </PageLayout>
  );
}
