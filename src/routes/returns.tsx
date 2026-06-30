import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds — TWOFOURSEVEN" },
      {
        name: "description",
        content:
          "Exchanges accepted for sizing discrepancies. Refunds processed within four working days.",
      },
    ],
  }),
  component: () => (
    <PageLayout>
      <PolicyPage
        eyebrow="Policy"
        title="Returns & Refunds"
        sections={[
          {
            heading: "Exchanges",
            body: "Exchanges are accepted for sizing discrepancies (too small or too large).",
          },
          {
            heading: "Refund Requests",
            body: "Refund requests must be filed via email to 247.freeworld@gmail.com.",
          },
          {
            heading: "Processing Time",
            body: "Approved refunds are processed within four working days.",
          },
        ]}
      />
    </PageLayout>
  ),
});
