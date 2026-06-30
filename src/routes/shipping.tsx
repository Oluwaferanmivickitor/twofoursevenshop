import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — TWOFOURSEVEN" },
      {
        name: "description",
        content:
          "Delivery within 24–72 hours within Nigeria. International orders: 7–14 business days.",
      },
    ],
  }),
  component: () => (
    <PageLayout>
      <PolicyPage
        eyebrow="Policy"
        title="Shipping"
        sections={[
          {
            heading: "Within Nigeria",
            body: "Delivery within 24–72 hours within Nigeria.",
          },
          {
            heading: "International Orders",
            body: "For international orders, please allow 7–14 business days for delivery.",
          },
          {
            heading: "Worldwide Availability",
            body: "We currently ship to the UK, Canada, Ghana, and more. For any destination not listed at checkout, contact us at 247.freeworld@gmail.com.",
          },
        ]}
      />
    </PageLayout>
  ),
});
