import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/farm/kit";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [
    { title: "Analytics — Kuku Ledger" },
    { name: "description", content: "Analytics for your poultry farm." },
    { property: "og:title", content: "Analytics — Kuku Ledger" },
    { property: "og:description", content: "Analytics for your poultry farm." },
  ]}),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" sub="This section is coming next." />
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Not built yet.</div>
    </>
  );
}
